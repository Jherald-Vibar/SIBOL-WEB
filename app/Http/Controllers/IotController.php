<?php

namespace App\Http\Controllers;

use App\Models\Esp;
use App\Models\SensorData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class IotController extends Controller
{
    public function getEspData(Request $request)
{
    try {
        $validated = $request->validate([
            'esp_id' => 'required|string',
            'soil_temperature' => 'nullable|numeric',
            'air_temperature'  => 'nullable|numeric',
            'air_humidity'     => 'nullable|numeric',
            'soil_moisture'    => 'nullable|numeric',
            'ph'               => 'nullable|numeric',
            'electrical_conductivity' => 'nullable|numeric',
            'nitrogen'         => 'nullable|numeric',
            'phosphorus'       => 'nullable|numeric',
            'potassium'        => 'nullable|numeric',
        ]);


        $esp = Esp::updateOrCreate(
            ['serial_number' => $validated['esp_id']],
            [
                'status' => 'online',
                'last_seen_at' => now(),
                'user_id' => $request->user()?->id
            ]
        );

        // Save sensor data
        $sensorData = SensorData::create([
            'esp_id' => $esp->id,
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

        return response()->json([
            'status' => 'success',
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
        $data = SensorData::orderBy('created_at', 'desc')
            ->take(7)
            ->get(['esp_id', 'air_temperature as temp', 'air_humidity as humidity', 'created_at']);

        $firstReading = $data->first();
        if ($firstReading) {
            $esp = Esp::find($firstReading->esp_id);
            if ($esp) {
                $esp->update([
                    'user_id' => $request->user()?->id
                ]);
            }
        }

        $data = $data->map(function($item, $index) {
            return [
                'name' => 'Reading ' . ($index + 1),
                'temp' => round($item->temp, 1),
                'humidity' => round($item->humidity, 0),
            ];
        })->reverse()->values();

        return response()->json($data);
    }

        public function getDataByDay(Request $request, $year, $month, $day) {

            $selectedDay = sprintf('%04d-%02d-%02d', $year, $month, $day);

            $data = SensorData::whereDate('created_at', $selectedDay)
            ->orderBy('created_at', 'asc')
            ->take(5)->get();

             return response()->json([
                'data' => $data,
                'count' => $data->count(),
                'date' => $selectedDay
            ], 200);
        }

}
