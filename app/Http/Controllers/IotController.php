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

    /*public function getEspData(Request $request)
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

        $imageUrl = null;

        if ($request->has('image') && !empty($request->image)) {
            try {
                $image = $request->image;

                if (strpos($image, 'data:image') !== false) {
                    $image = substr($image, strpos($image, ',') + 1);
                }

                $imageData = base64_decode($image);

                // Use system temp directory (works on Railway)
                $tempFile = tempnam(sys_get_temp_dir(), 'esp_image_');
                file_put_contents($tempFile, $imageData);

                Log::info('Temp file created', ['path' => $tempFile]);

                // Upload to Cloudinary
                $cloudName = env('CLOUDINARY_CLOUD_NAME');
                $apiKey = env('CLOUDINARY_API_KEY');
                $apiSecret = env('CLOUDINARY_API_SECRET');

                if (!$cloudName || !$apiKey || !$apiSecret) {
                    throw new \Exception('Cloudinary credentials not configured');
                }

                $timestamp = time();
                $publicId = 'esp_' . $esp->id . '_' . $timestamp;
                $folder = 'esp_sensor_images';

                // Create signature
                $params = [
                    'timestamp' => $timestamp,
                    'folder' => $folder,
                    'public_id' => $publicId
                ];

                ksort($params);
                $signature = '';
                foreach ($params as $key => $value) {
                    $signature .= $key . '=' . $value . '&';
                }
                $signature = rtrim($signature, '&') . $apiSecret;
                $signature = sha1($signature);

                // Upload via cURL
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, "https://api.cloudinary.com/v1_1/{$cloudName}/image/upload");
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, [
                    'file' => new \CURLFile($tempFile),
                    'api_key' => $apiKey,
                    'timestamp' => $timestamp,
                    'signature' => $signature,
                    'folder' => $folder,
                    'public_id' => $publicId
                ]);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

                $response = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);

                // Delete temp file
                if (file_exists($tempFile)) {
                    unlink($tempFile);
                }

                if ($httpCode == 200) {
                    $result = json_decode($response, true);
                    $imageUrl = $result['secure_url'];
                    Log::info('Cloudinary upload successful', ['url' => $imageUrl]);
                } else {
                    throw new \Exception('Cloudinary upload failed: ' . $response);
                }

            } catch (\Exception $imageError) {
                Log::error('Image upload failed', ['error' => $imageError->getMessage()]);
                // On Railway, we can't fall back to local storage
                $imageUrl = null;
            }
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

        if ($imageUrl) {
            $cropExist->update([
                "image" => $imageUrl,
            ]);
        }

        $esp->update([
            "status" => "active"
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Data saved successfully',
            'data' => $sensorData,
            'image_url' => $imageUrl
        ], 200);

    } catch (\Exception $e) {
        Log::error('ESP data error', [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]);

        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
}*/




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

        $cropExist = Crop::where('garden_id', $esp->garden_id)
            ->where('name', $validated['crop_name'])
            ->first();

        if(!$cropExist) {
            return response()->json([
                "message" => "NO CROPS FOR NOW!"
            ], 404);
        }

        $imageUrl = null;
        $yoloDetectionResult = null;

        if ($request->has('image') && !empty($request->image)) {
            try {
                // ✅ IMPORTANT: Keep the original image for YOLO
                $originalImageBase64 = $request->image;

                $image = $request->image;
                $rawImageLength = strlen($image);

                Log::info('Image processing: Raw payload received.', [
                    'raw_length' => $rawImageLength,
                    'starts_with' => substr($image, 0, 30),
                    'ends_with' => substr($image, -30)
                ]);

                // Remove prefix for Cloudinary upload
                if (strpos($image, 'data:image') !== false) {
                    $image = substr($image, strpos($image, ',') + 1);
                }

                Log::info('Image processing: Prefix removed for Cloudinary.', [
                    'processed_length' => strlen($image)
                ]);

                $imageData = base64_decode($image);

                if ($imageData === false || empty($imageData)) {
                    Log::error('Base64 Decoding Failed or resulted in empty data.', [
                        'base64_string_length' => strlen($image),
                        'decoded_data_type' => gettype($imageData),
                        'decoded_data_size' => $imageData === false ? 'FALSE' : strlen($imageData)
                    ]);
                    throw new \Exception('Base64 decoding resulted in empty or corrupted data.');
                }

                $tempFile = tempnam(sys_get_temp_dir(), 'esp_image_');
                file_put_contents($tempFile, $imageData);

                if (file_exists($tempFile) && filesize($tempFile) === 0) {
                    Log::error('Temp file created but is empty.', [
                        'base64_string_length' => strlen($image)
                    ]);
                    unlink($tempFile);
                    throw new \Exception('Decoded image data resulted in an empty file (zero bytes).');
                }

                Log::info('Temp file created and has content.', [
                    'path' => $tempFile,
                    'size' => filesize($tempFile)
                ]);

                // Cloudinary Upload
                $cloudName = env('CLOUDINARY_CLOUD_NAME');
                $apiKey = env('CLOUDINARY_API_KEY');
                $apiSecret = env('CLOUDINARY_API_SECRET');

                if (!$cloudName || !$apiKey || !$apiSecret) {
                    if (file_exists($tempFile)) {
                        unlink($tempFile);
                    }
                    throw new \Exception('Cloudinary credentials not configured');
                }

                $timestamp = time();
                $publicId = 'esp_' . $esp->id . '_' . $timestamp;
                $folder = 'esp_sensor_images';

                $params = [
                    'timestamp' => $timestamp,
                    'folder' => $folder,
                    'public_id' => $publicId
                ];

                ksort($params);
                $signature = '';
                foreach ($params as $key => $value) {
                    $signature .= $key . '=' . $value . '&';
                }
                $signature = rtrim($signature, '&') . $apiSecret;
                $signature = sha1($signature);

                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, "https://api.cloudinary.com/v1_1/{$cloudName}/image/upload");
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, [
                    'file' => new \CURLFile($tempFile),
                    'api_key' => $apiKey,
                    'timestamp' => $timestamp,
                    'signature' => $signature,
                    'folder' => $folder,
                    'public_id' => $publicId
                ]);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

                $response = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);

                if (file_exists($tempFile)) {
                    unlink($tempFile);
                }

                if ($httpCode == 200) {
                    $result = json_decode($response, true);
                    $imageUrl = $result['secure_url'];
                    Log::info('Cloudinary upload successful', ['url' => $imageUrl]);

                    // ✅ YOLO Detection - Send ORIGINAL base64 with prefix AND request to save image
                    try {
                        $yoloServiceUrl = env('YOLO_SERVICE_URL', 'http://localhost:5000');

                        Log::info('Calling YOLO service', [
                            'url' => $yoloServiceUrl . '/detect?save_image=true',
                            'image_length' => strlen($originalImageBase64),
                            'has_prefix' => strpos($originalImageBase64, 'data:image') !== false
                        ]);

                        $yoloCh = curl_init();
                        curl_setopt($yoloCh, CURLOPT_URL, $yoloServiceUrl . '/detect?save_image=true');  // ✅ Save image with boxes
                        curl_setopt($yoloCh, CURLOPT_POST, true);
                        curl_setopt($yoloCh, CURLOPT_POSTFIELDS, json_encode([
                            'image' => $originalImageBase64  // ✅ Send original with prefix
                        ]));
                        curl_setopt($yoloCh, CURLOPT_HTTPHEADER, [
                            'Content-Type: application/json',
                            'Accept: application/json'
                        ]);
                        curl_setopt($yoloCh, CURLOPT_RETURNTRANSFER, true);
                        curl_setopt($yoloCh, CURLOPT_TIMEOUT, 60);  // Increased timeout
                        curl_setopt($yoloCh, CURLOPT_CONNECTTIMEOUT, 30);

                        $yoloResponse = curl_exec($yoloCh);
                        $yoloHttpCode = curl_getinfo($yoloCh, CURLINFO_HTTP_CODE);
                        $yoloError = curl_error($yoloCh);

                        // Get detailed curl info
                        $curlInfo = curl_getinfo($yoloCh);
                        curl_close($yoloCh);

                        Log::info('YOLO service response', [
                            'http_code' => $yoloHttpCode,
                            'response_length' => strlen($yoloResponse ?? ''),
                            'curl_error' => $yoloError,
                            'total_time' => $curlInfo['total_time'] ?? null,
                            'connect_time' => $curlInfo['connect_time'] ?? null
                        ]);

                        if ($yoloHttpCode == 200 && $yoloResponse) {
                            $yoloDetectionResult = json_decode($yoloResponse, true);

                            if (json_last_error() !== JSON_ERROR_NONE) {
                                Log::error('YOLO response JSON decode failed', [
                                    'json_error' => json_last_error_msg(),
                                    'response' => substr($yoloResponse, 0, 500)
                                ]);
                            } else {
                                Log::info('YOLO detection successful', [
                                    'success' => $yoloDetectionResult['success'] ?? false,
                                    'detections' => $yoloDetectionResult['total_detections'] ?? 0,
                                    'image_saved' => $yoloDetectionResult['image_saved'] ?? false,
                                    'cloudinary_url' => $yoloDetectionResult['image_url'] ?? null
                                ]);
                            }
                        } else {
                            Log::error('YOLO detection failed', [
                                'http_code' => $yoloHttpCode,
                                'error' => $yoloError,
                                'response' => substr($yoloResponse ?? '', 0, 500)
                            ]);
                        }
                    } catch (\Exception $yoloError) {
                        Log::error('YOLO service error', [
                            'error' => $yoloError->getMessage(),
                            'trace' => $yoloError->getTraceAsString()
                        ]);
                    }
                } else {
                    throw new \Exception('Cloudinary upload failed: ' . $response);
                }

            } catch (\Exception $imageError) {
                Log::error('Image upload failed', [
                    'error' => $imageError->getMessage(),
                    'trace' => $imageError->getTraceAsString()
                ]);
                $imageUrl = null;
            }
        }

        // Save Sensor Data
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

        $cropUser = Crop::where('id', $sensorData->crop_id)->first();
        $cropProfile = CropProfile::where("id", $cropUser->crop_profile_id)->first();

        $notificationService = new \App\Services\NotificationService();
        $notificationService->processSensorNotifications($sensorData, $esp, $cropProfile);

        // Save YOLO Detection Results
        if ($yoloDetectionResult && isset($yoloDetectionResult['success']) && $yoloDetectionResult['success'] && !empty($yoloDetectionResult['detections'])) {

            // ✅ Get the image URL with bounding boxes from YOLO response
            $detectionImageUrl = $yoloDetectionResult['image_url'] ?? $imageUrl;  // Fallback to original if not available

            Log::info('Saving detection results', [
                'original_image' => $imageUrl,
                'detection_image' => $detectionImageUrl,
                'has_bounding_boxes' => isset($yoloDetectionResult['image_url'])
            ]);

            foreach ($yoloDetectionResult['detections'] as $detection) {
                $recommendations = $detection['recommendations'] ?? [];

                DetectionResults::create([
                    'sensor_data_id' => $sensorData->id,
                    'crop_id' => $cropExist->id,
                    'esp_id' => $esp->id,
                    'detected_class' => $detection['class'] ?? 'unknown',
                    'confidence' => $detection['confidence'] ?? 0,
                    'image_url' => $detectionImageUrl,  // ✅ Now saves image WITH bounding boxes
                    'recommendations' => json_encode($recommendations['recommendations'] ?? []),
                    'harvest_tips' => json_encode($recommendations['harvest_tips'] ?? []),
                ]);

                if (isset($detection['class'])) {
                    $notificationService->createDiseaseDetectionNotification(
                        $esp->user,
                        $detection['class'],
                        $detection['confidence'] ?? 0,
                        $cropExist->name
                    );
                }
            }

            Log::info('Saved detection results', [
                'total_saved' => count($yoloDetectionResult['detections']),
                'sensor_data_id' => $sensorData->id,
                'image_url_type' => $detectionImageUrl === $imageUrl ? 'original' : 'with_bounding_boxes'
            ]);
        } else {
            Log::warning('No YOLO detections to save', [
                'yolo_result_exists' => !is_null($yoloDetectionResult),
                'has_success_key' => isset($yoloDetectionResult['success']),
                'success_value' => $yoloDetectionResult['success'] ?? null,
                'has_detections' => !empty($yoloDetectionResult['detections'] ?? [])
            ]);
        }

        // Update crop image - keep original image
        if ($imageUrl) {
            $cropExist->update(['image' => $imageUrl]);
        }

        // Update ESP status
        $esp->update(['status' => 'active']);

        return response()->json([
            'status' => 'success',
            'message' => 'Data saved successfully',
            'data' => $sensorData,
            'original_image_url' => $imageUrl,  // ✅ Original image
            'detection_image_url' => $detectionImageUrl ?? null,  // ✅ Image with bounding boxes
            'yolo_detection' => $yoloDetectionResult
        ], 200);

    } catch (\Exception $e) {
        Log::error('ESP data error', [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
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
