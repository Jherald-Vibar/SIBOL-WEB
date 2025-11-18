<?php

namespace App\Http\Controllers;

use App\Models\Crop;
use App\Models\Esp;
use App\Models\SensorData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Barryvdh\DomPDF\Facade\Pdf;

class IotController extends Controller
{
    public function getEspData(Request $request)
    {
    try {
        $validated = $request->validate([
            'esp_api_key' => 'required|string',
            'crop_name' => 'required|string',
            'soil_temperature' => 'nullable|numeric',
            'air_temperature'  => 'nullable|numeric',
            'air_humidity'     => 'nullable|numeric',
            'image' => 'nullable|string',
            'soil_moisture'    => 'nullable|numeric',
            'ph'               => 'nullable|numeric',
            'electrical_conductivity' => 'nullable|numeric',
            'nitrogen'         => 'nullable|numeric',
            'phosphorus'       => 'nullable|numeric',
            'potassium'        => 'nullable|numeric',
        ]);

        $esp = Esp::where('serial_number', $validated['esp_api_key'])->first();

        if (!$esp) {
            return response()->json([
                'status' => 'error',
                'message' => 'ESP device not found'
            ], 404);
        }

        $cropExist = Crop::where('name', $validated['crop_name'])->first();

        if(!$cropExist) {
          return response()->json([
            "message" => "NO CROPS FOR NOW!"
          ], 404);
        }


        $imagePath = null;

        if ($request->has('image') && !empty($request->image)) {
            $image = $request->image;

            if (strpos($image, 'data:image') !== false) {
                $image = substr($image, strpos($image, ',') + 1);
            }

            $imageData = base64_decode($image);

            $filename = 'esp_' . $esp->id . '_' . time() . '.jpg';
            $path = public_path('sensor_images');

            if (!file_exists($path)) {
                mkdir($path, 0777, true);
            }

            file_put_contents($path . '/' . $filename, $imageData);
            $imagePath = $filename;
        }



        $sensorData = SensorData::create([
            'esp_id' => $esp->id,
            'crop_id' => $cropExist->id,
            'soil_temperature' => $validated['soil_temperature'] ?? null,
            'air_temperature'  => $validated['air_temperature'] ?? null,
            'air_humidity'     => $validated['air_humidity'] ?? null,
            'soil_moisture'    => $validated['soil_moisture'] ?? null,
            'ph'               => $validated['ph'] ?? null,
            'electrical_conductivity' => $validated['electrical_conductivity'] ?? null,
            'nitrogen'         => $validated['nitrogen'] ?? null,
            'phosphorus'       => $validated['phosphorus'] ?? null,
            'potassium'        => $validated['potassium'] ?? null,
        ]);

        $cropExist->update([
          "image" => $imagePath,
        ]);

        $esp->update([
          "status" => "active"
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Data saved successfully',
            'data' => $sensorData
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
}


      public function fetchEspData()
    {
        $espData = SensorData::all();
        return response()->json(['data' => $espData], 200);
    }


    public function getAirHumidity(Request $request) {
        $user = $request->user();
        $esp = Esp::where("user_id", $user->id)->first();

        if (!$esp) {
            return response()->json([
                'data' => [],
                'message' => 'No ESP device found for this user'
            ], 200);
        }

        $data = SensorData::where('esp_id', $esp->id)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get(['esp_id', 'air_temperature', 'air_humidity', 'created_at']);

        $data = $data->map(function($item) {
            return [
                'time' => $item->created_at->format('H:i'),
                'temp' => round($item->air_temperature, 1),
                'humidity' => round($item->air_humidity, 0),
            ];
        })->reverse()->values();

        return response()->json($data);
    }

    public function getDataByDay(Request $request, $year, $month, $day) {
        $user = $request->user();
        $esp = Esp::where("user_id", $user->id)->first();

        if (!$esp) { return response()->json([ 'data' => [], 'message' => 'No ESP device found for this user' ], 200); }

        $selectedDay = sprintf('%04d-%02d-%02d', $year, $month, $day);

        $data = SensorData::where("esp_id", $esp->id)->with('crop')->whereDate('created_at', $selectedDay)
        ->orderBy('created_at', 'asc')
        ->take(5)->get();

          return response()->json([
            'data' => $data,
            'count' => $data->count(),
            'date' => $selectedDay
        ], 200);
    }

    public function downloadMonthlyReport(Request $request, $year, $month) {
    try {
        $user = $request->user();

        if (!$user) {
            \Log::error('User not authenticated');
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        \Log::info("User {$user->id} requesting report for {$year}-{$month}");

        $esp = Esp::where("user_id", $user->id)->first();

        if (!$esp) {
            \Log::error("No ESP found for user {$user->id}");
            return response()->json([
                'message' => 'No ESP device found for this user'
            ], 404);
        }

        \Log::info("ESP found: {$esp->id}");

        $data = SensorData::with('crop')
            ->where("esp_id", $esp->id)
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->whereNotNull('crop_id')
            ->orderBy('created_at', 'asc')
            ->get();

        \Log::info("Found {$data->count()} sensor records");

        if ($data->isEmpty()) {
            return response()->json([
                'message' => 'No data available for this month'
            ], 404);
        }

        $firstRecord = $data->first();
        \Log::info("First record crop: " . ($firstRecord->crop ? $firstRecord->crop->name : 'NULL'));

        $dataPerCrop = $data->groupBy('crop_id');
        $cropsData = [];

        foreach ($dataPerCrop as $cropId => $cropData) {
            \Log::info("Processing crop_id: {$cropId}");

            // Get crop from relationship
            $crop = $cropData->first()->crop;

            if (!$crop) {
                \Log::warning("Crop not found for crop_id: {$cropId}");
                continue;
            }

            $cropName = $crop->name;
            \Log::info("Crop name: {$cropName}");

            $groupedByDay = $cropData->groupBy(function($item) {
                return date('Y-m-d', strtotime($item->created_at));
            });

            $dailyAverages = $groupedByDay->map(function($dayData, $date) {
                return [
                    'date' => date('M d, Y', strtotime($date)),
                    'avg_soil_temp' => round($dayData->avg('soil_temperature') ?? 0, 2),
                    'avg_air_temp' => round($dayData->avg('air_temperature') ?? 0, 2),
                    'avg_humidity' => round($dayData->avg('air_humidity') ?? 0, 2),
                    'avg_moisture' => round($dayData->avg('soil_moisture') ?? 0, 2),
                    'avg_ph' => round($dayData->avg('ph') ?? 0, 2),
                    'avg_ec' => round($dayData->avg('electrical_conductivity') ?? 0, 2),
                    'avg_n' => round($dayData->avg('nitrogen') ?? 0, 2),
                    'avg_p' => round($dayData->avg('phosphorus') ?? 0, 2),
                    'avg_k' => round($dayData->avg('potassium') ?? 0, 2),
                    'readings_count' => $dayData->count(),
                ];
            })->values();

            $cropsData[$cropName] = [
                'daily_data' => $dailyAverages,
                'summary' => [
                    'total_readings' => $cropData->count(),
                    'days_with_data' => $groupedByDay->count(),
                    'avg_soil_temp' => round($cropData->avg('soil_temperature') ?? 0, 2),
                    'avg_air_temp' => round($cropData->avg('air_temperature') ?? 0, 2),
                    'avg_humidity' => round($cropData->avg('air_humidity') ?? 0, 2),
                    'avg_moisture' => round($cropData->avg('soil_moisture') ?? 0, 2),
                    'avg_ph' => round($cropData->avg('ph') ?? 0, 2),
                    'avg_ec' => round($cropData->avg('electrical_conductivity') ?? 0, 2),
                    'avg_n' => round($cropData->avg('nitrogen') ?? 0, 2),
                    'avg_p' => round($cropData->avg('phosphorus') ?? 0, 2),
                    'avg_k' => round($cropData->avg('potassium') ?? 0, 2),
                ]
            ];
        }

        \Log::info("Crops data prepared: " . count($cropsData) . " crops");

        if (empty($cropsData)) {
            return response()->json([
                'message' => 'No valid crop data found for this month'
            ], 404);
        }

        $monthName = date('F Y', strtotime("$year-$month-01"));

        \Log::info("Generating PDF...");

        $pdf = Pdf::loadView('reports.monthly', [
            'user' => $user,
            'esp' => $esp,
            'cropsData' => $cropsData,
            'monthName' => $monthName,
            'year' => $year,
            'month' => $month
        ]);

        $pdf->setPaper('a4', 'landscape');

        \Log::info("PDF generated successfully");

        return $pdf->download("Monthly_Report_{$monthName}_All_Crops.pdf");

    } catch (\Exception $e) {
        \Log::error('Monthly Report Error: ' . $e->getMessage());
        \Log::error('File: ' . $e->getFile());
        \Log::error('Line: ' . $e->getLine());
        \Log::error('Stack trace: ' . $e->getTraceAsString());

        return response()->json([
            'message' => 'Error generating report',
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ], 500);
    }
}

}
