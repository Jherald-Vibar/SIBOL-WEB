<?php

namespace App\Http\Controllers;

use App\Models\Crop;
use App\Models\CropProfile;
use App\Models\DetectionResults;
use App\Models\Esp;
use App\Models\Notification;
use App\Models\SensorData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Barryvdh\DomPDF\Facade\Pdf;
use Cloudinary\Cloudinary;
use Illuminate\Support\Facades\Log;


class IotController extends Controller
{
    private function getCloudinaryInstance()
    {
        return new Cloudinary([
            'cloud' => [
                'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                'api_key'    => env('CLOUDINARY_API_KEY'),
                'api_secret' => env('CLOUDINARY_API_SECRET'),
            ],
            'url' => [
                'secure' => true
            ]
        ]);
    }

    public function getEspData(Request $request)
{
    try {
        $validated = $request->validate([
            'esp_api_key'             => 'required|string',
            'soil_temperature'        => 'nullable|numeric',
            'air_temperature'         => 'nullable|numeric',
            'air_humidity'            => 'nullable|numeric',
            'image'                   => 'nullable|string',
            'soil_moisture'           => 'nullable|numeric',
            'ph'                      => 'nullable|numeric',
            'electrical_conductivity' => 'nullable|numeric',
            'nitrogen'                => 'nullable|numeric',
            'phosphorus'              => 'nullable|numeric',
            'potassium'               => 'nullable|numeric',
        ]);

        // ── 1. Find ESP and eager load everything we need in ONE query ──
        $esp = Esp::with(['crop.cropProfile', 'user'])
            ->where('serial_number', $validated['esp_api_key'])
            ->first();

        if (!$esp) {
            return response()->json([
                'status'  => 'error',
                'message' => 'ESP device not found.',
            ], 404);
        }

        // ── 2. Check if ESP is claimed ──
        if (!$esp->crop_id || !$esp->crop) {
            return response()->json([
                'status'  => 'unclaimed',
                'message' => 'ESP has no crop assigned yet. Please claim it from the app.',
            ], 202);
        }

        $crop        = $esp->crop;
        $cropProfile = $crop->cropProfile;

        // ── 3. Update ESP status ──
        $esp->update([
            'status'       => 'active',
            'last_seen_at' => now(),
        ]);

        // ── 4. Handle image upload + YOLO ──
        $imageUrl            = null;
        $yoloDetectionResult = null;
        $detectionImageUrl   = null;

        if ($request->has('image') && !empty($request->image)) {
            try {
                $originalImageBase64 = $request->image;
                $image               = $request->image;

                Log::info('Image processing: Raw payload received.', [
                    'raw_length'  => strlen($image),
                    'starts_with' => substr($image, 0, 30),
                    'ends_with'   => substr($image, -30),
                ]);

                // Strip data URI prefix for Cloudinary
                if (strpos($image, 'data:image') !== false) {
                    $image = substr($image, strpos($image, ',') + 1);
                }

                $imageData = base64_decode($image);

                if ($imageData === false || empty($imageData)) {
                    throw new \Exception('Base64 decoding resulted in empty or corrupted data.');
                }

                $tempFile = tempnam(sys_get_temp_dir(), 'esp_image_');
                file_put_contents($tempFile, $imageData);

                if (file_exists($tempFile) && filesize($tempFile) === 0) {
                    unlink($tempFile);
                    throw new \Exception('Decoded image data resulted in an empty file (zero bytes).');
                }

                Log::info('Temp file created.', [
                    'path' => $tempFile,
                    'size' => filesize($tempFile),
                ]);

                // Cloudinary credentials
                $cloudName = env('CLOUDINARY_CLOUD_NAME');
                $apiKey    = env('CLOUDINARY_API_KEY');
                $apiSecret = env('CLOUDINARY_API_SECRET');

                if (!$cloudName || !$apiKey || !$apiSecret) {
                    if (file_exists($tempFile)) unlink($tempFile);
                    throw new \Exception('Cloudinary credentials not configured.');
                }

                $timestamp = time();
                $publicId  = 'esp_' . $esp->id . '_' . $timestamp;
                $folder    = 'esp_sensor_images';

                $params = ['folder' => $folder, 'public_id' => $publicId, 'timestamp' => $timestamp];
                ksort($params);

                $sigString = '';
                foreach ($params as $key => $value) {
                    $sigString .= $key . '=' . $value . '&';
                }
                $signature = sha1(rtrim($sigString, '&') . $apiSecret);

                // Upload to Cloudinary
                $ch = curl_init();
                curl_setopt_array($ch, [
                    CURLOPT_URL        => "https://api.cloudinary.com/v1_1/{$cloudName}/image/upload",
                    CURLOPT_POST       => true,
                    CURLOPT_POSTFIELDS => [
                        'file'      => new \CURLFile($tempFile),
                        'api_key'   => $apiKey,
                        'timestamp' => $timestamp,
                        'signature' => $signature,
                        'folder'    => $folder,
                        'public_id' => $publicId,
                    ],
                    CURLOPT_RETURNTRANSFER => true,
                ]);

                $response = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);

                if (file_exists($tempFile)) unlink($tempFile);

                if ($httpCode !== 200) {
                    throw new \Exception('Cloudinary upload failed: ' . $response);
                }

                $result   = json_decode($response, true);
                $imageUrl = $result['secure_url'];

                Log::info('Cloudinary upload successful.', ['url' => $imageUrl]);

                // ── YOLO Detection ──
                try {
                    $yoloServiceUrl = env('YOLO_SERVICE_URL', 'http://localhost:5000');

                    $yoloCh = curl_init();
                    curl_setopt_array($yoloCh, [
                        CURLOPT_URL            => $yoloServiceUrl . '/detect?save_image=true',
                        CURLOPT_POST           => true,
                        CURLOPT_POSTFIELDS     => json_encode(['image' => $originalImageBase64]),
                        CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'Accept: application/json'],
                        CURLOPT_RETURNTRANSFER => true,
                        CURLOPT_TIMEOUT        => 60,
                        CURLOPT_CONNECTTIMEOUT => 30,
                    ]);

                    $yoloResponse = curl_exec($yoloCh);
                    $yoloHttpCode = curl_getinfo($yoloCh, CURLINFO_HTTP_CODE);
                    $yoloError    = curl_error($yoloCh);
                    curl_close($yoloCh);

                    if ($yoloHttpCode === 200 && $yoloResponse) {
                        $yoloDetectionResult = json_decode($yoloResponse, true);

                        if (json_last_error() !== JSON_ERROR_NONE) {
                            Log::error('YOLO JSON decode failed.', ['error' => json_last_error_msg()]);
                            $yoloDetectionResult = null;
                        } else {
                            Log::info('YOLO detection successful.', [
                                'detections'  => $yoloDetectionResult['total_detections'] ?? 0,
                                'image_saved' => $yoloDetectionResult['image_saved'] ?? false,
                            ]);
                        }
                    } else {
                        Log::error('YOLO detection failed.', [
                            'http_code' => $yoloHttpCode,
                            'error'     => $yoloError,
                        ]);
                    }
                } catch (\Exception $yoloEx) {
                    Log::error('YOLO service error.', ['error' => $yoloEx->getMessage()]);
                }

            } catch (\Exception $imageError) {
                Log::error('Image upload failed.', ['error' => $imageError->getMessage()]);
                $imageUrl = null;
            }
        }

        // ── 5. Save Sensor Data ──
        $sensorData = SensorData::create([
            'esp_id'                  => $esp->id,
            'crop_id'                 => $crop->id,       // ← directly from $esp->crop_id
            'soil_temperature'        => $validated['soil_temperature'] ?? null,
            'air_temperature'         => $validated['air_temperature'] ?? null,
            'air_humidity'            => $validated['air_humidity'] ?? null,
            'soil_moisture'           => $validated['soil_moisture'] ?? null,
            'ph'                      => $validated['ph'] ?? null,
            'electrical_conductivity' => $validated['electrical_conductivity'] ?? null,
            'nitrogen'                => $validated['nitrogen'] ?? null,
            'phosphorus'              => $validated['phosphorus'] ?? null,
            'potassium'               => $validated['potassium'] ?? null,
        ]);

        // ── 6. Notifications ──
        if ($cropProfile) {
            $notificationService = new \App\Services\NotificationService();
            $notificationService->processSensorNotifications($sensorData, $esp, $cropProfile);
        }

        // ── 7. Save YOLO Detection Results ──
        if (
            $yoloDetectionResult &&
            !empty($yoloDetectionResult['success']) &&
            !empty($yoloDetectionResult['detections'])
        ) {
            $detectionImageUrl   = $yoloDetectionResult['image_url'] ?? $imageUrl;
            $notificationService = $notificationService ?? new \App\Services\NotificationService();

            foreach ($yoloDetectionResult['detections'] as $detection) {
                $recommendations = $detection['recommendations'] ?? [];

                DetectionResults::create([
                    'sensor_data_id' => $sensorData->id,
                    'crop_id'        => $crop->id,
                    'esp_id'         => $esp->id,
                    'detected_class' => $detection['class'] ?? 'unknown',
                    'confidence'     => $detection['confidence'] ?? 0,
                    'image_url'      => $detectionImageUrl,
                    'recommendations' => json_encode($recommendations['recommendations'] ?? []),
                    'harvest_tips'    => json_encode($recommendations['harvest_tips'] ?? []),
                ]);

                if (isset($detection['class']) && $esp->user) {
                    $notificationService->createDiseaseDetectionNotification(
                        $esp->user,
                        $detection['class'],
                        $detection['confidence'] ?? 0,
                        $crop->name
                    );
                }
            }

            Log::info('Saved YOLO detection results.', [
                'total_saved'    => count($yoloDetectionResult['detections']),
                'sensor_data_id' => $sensorData->id,
            ]);
        }

        // ── 8. Update crop image ──
        if ($imageUrl) {
            $crop->update(['image' => $imageUrl]);
        }

        // ── 9. Broadcast ──
        broadcast(new \App\Events\SensorDataReceived(
            sensorData: $sensorData,
            gardenId: $esp->garden_id
        ));

        return response()->json([
            'status'               => 'success',
            'message'              => 'Data saved successfully.',
            'data'                 => $sensorData,
            'original_image_url'   => $imageUrl,
            'detection_image_url'  => $detectionImageUrl ?? null,
            'yolo_detection'       => $yoloDetectionResult,
        ], 200);

    } catch (\Exception $e) {
        Log::error('ESP data error.', [
            'message' => $e->getMessage(),
            'file'    => $e->getFile(),
            'line'    => $e->getLine(),
        ]);

        return response()->json([
            'status'  => 'error',
            'message' => $e->getMessage(),
        ], 500);
    }
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

    // Get all ESP devices for this user
    $espIds = Esp::where("user_id", $user->id)->pluck('id');

    if ($espIds->isEmpty()) {
        return response()->json([
            'data' => [],
            'message' => 'No ESP device found for this user'
        ], 200);
    }

    $selectedDay = sprintf('%04d-%02d-%02d', $year, $month, $day);

    $data = SensorData::whereIn("esp_id", $espIds)
        ->with('crop')
        ->whereDate('created_at', $selectedDay)
        ->orderBy('created_at', 'asc')
        ->get();

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
                Log::error('User not authenticated');
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            Log::info("User {$user->id} requesting report for {$year}-{$month}");

            $esp = Esp::where("user_id", $user->id)->first();

            if (!$esp) {
                Log::error("No ESP found for user {$user->id}");
                return response()->json([
                    'message' => 'No ESP device found for this user'
                ], 404);
            }

            Log::info("ESP found: {$esp->id}");

            $data = SensorData::with('crop')
                ->where("esp_id", $esp->id)
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->whereNotNull('crop_id')
                ->orderBy('created_at', 'asc')
                ->get();

            Log::info("Found {$data->count()} sensor records");

            if ($data->isEmpty()) {
                return response()->json([
                    'message' => 'No data available for this month'
                ], 404);
            }

            $firstRecord = $data->first();
            Log::info("First record crop: " . ($firstRecord->crop ? $firstRecord->crop->name : 'NULL'));

            $dataPerCrop = $data->groupBy('crop_id');
            $cropsData = [];

            foreach ($dataPerCrop as $cropId => $cropData) {
                Log::info("Processing crop_id: {$cropId}");

                // Get crop from relationship
                $crop = $cropData->first()->crop;

                if (!$crop) {
                    Log::warning("Crop not found for crop_id: {$cropId}");
                    continue;
                }

                $cropName = $crop->name;
                Log::info("Crop name: {$cropName}");

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

            Log::info("Crops data prepared: " . count($cropsData) . " crops");

            if (empty($cropsData)) {
                return response()->json([
                    'message' => 'No valid crop data found for this month'
                ], 404);
            }

            $monthName = date('F Y', strtotime("$year-$month-01"));

            Log::info("Generating PDF...");

            $pdf = Pdf::loadView('reports.monthly', [
                'user' => $user,
                'esp' => $esp,
                'cropsData' => $cropsData,
                'monthName' => $monthName,
                'year' => $year,
                'month' => $month
            ]);

            $pdf->setPaper('a4', 'landscape');

            Log::info("PDF generated successfully");

            return $pdf->download("Monthly_Report_{$monthName}_All_Crops.pdf");

        } catch (\Exception $e) {
            Log::error('Monthly Report Error: ' . $e->getMessage());
            Log::error('File: ' . $e->getFile());
            Log::error('Line: ' . $e->getLine());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'message' => 'Error generating report',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }
}
