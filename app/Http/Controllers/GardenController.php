<?php

namespace App\Http\Controllers;

use App\Models\Crop;
use App\Models\CropProfile;
use App\Models\Esp;
use App\Models\Garden;
use App\Models\SensorData;
use App\Services\NotificationService;
use Cloudinary\Cloudinary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class GardenController extends Controller
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

    public function addGarden(Request $request) {
        $user = $request->user();
        $validator = Validator::make($request->all(), [
            'garden_name' => 'required',
            'location' => 'required',
        ]);

        if($validator->fails()) {
            return response()->json([
                'message' => $validator->errors(),
                'status' => 'Failed',
            ], 422);
        }

        $validated = $validator->validated();

        try {
            $garden = Garden::create([
                'user_id' => $user->id,
                'name' => $validated['garden_name'],
                'location' => $validated['location'],
            ]);

            $notificationService = new NotificationService();
            $notificationService->addGarden($garden, $user);


            return response()->json([
                "message" => "Garden Successfully Created!",
                "status" => "Success!",
                "garden" => $garden,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                "message" => $e->getMessage(),
                "status" => "Failed"
            ], 500);
        }
    }

    public function getLocation(Request $request) {
        $user = $request->user();

        $locations = $user->gardens()->pluck('location');

        return response()->json([
        'locations' => $locations
        ], 200);
    }

    public function getGardenData(Request $request) {
        $user = $request->user();

        $gardenData = $user->gardens()->get();

        return response()->json($gardenData);
    }

    public function addCrop(Request $request, $gardenId)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'variety' => 'required|string|max:255',
            'planted_date' => 'required|date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $validated = $validator->validated();

            // Check if crop exists in CropProfile
            $existInCropProfile = CropProfile::where("name", $validated["name"])->first();

            if (!$existInCropProfile) {
                return response()->json([
                    "message" => "Can't add because it doesn't exist in Crop Profile",
                ], 422);
            }

            // Handle image upload
            $imageUrl = null;
            if ($request->hasFile('image')) {
                try {
                    Log::info('Starting Cloudinary upload for addCrop');

                    $uploadedFile = $request->file('image');

                    if (!$uploadedFile->isValid()) {
                        throw new \Exception('Uploaded file is not valid');
                    }

                    Log::info('File details', [
                        'name' => $uploadedFile->getClientOriginalName(),
                        'size' => $uploadedFile->getSize(),
                        'mime' => $uploadedFile->getMimeType()
                    ]);

                    // Get Cloudinary instance
                    $cloudinary = $this->getCloudinaryInstance();

                    // Upload to Cloudinary
                    $result = $cloudinary->uploadApi()->upload(
                        $uploadedFile->getRealPath(),
                        [
                            'folder' => 'crops_images',
                            'public_id' => 'crop_' . time() . '_' . uniqid(),
                        ]
                    );

                    $imageUrl = $result['secure_url'];

                    Log::info('Cloudinary upload successful', [
                        'url' => $imageUrl,
                        'public_id' => $result['public_id']
                    ]);

                } catch (\Exception $e) {
                    Log::error('Cloudinary upload failed', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);

                    return response()->json([
                        'message' => 'Failed to upload image to Cloudinary',
                        'error' => $e->getMessage()
                    ], 500);
                }
            }

            // Create crop
            $crop = Crop::create([
                'user_id' => $user->id,
                'garden_id' => $gardenId,
                'crop_profile_id' => $existInCropProfile->id,
                'name' => $validated['name'],
                'variety' => $validated['variety'],
                'image' => $imageUrl,
                'planted_at' => $validated['planted_date']
            ]);

            $garden = Garden::find($gardenId);

            $notificationService = new \App\Services\NotificationService();
            $notificationService->checkCrop($crop, $user, $garden);

            Log::info('Crop created successfully', ['crop_id' => $crop->id]);

            return response()->json([
                'message' => 'Crop created successfully',
                'data' => $crop,
            ], 201);

        } catch (\Exception $e) {
            Log::error('Failed to create crop', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to create crop',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getCropData(Request $request, $garden_id) {
        $crops = Crop::where('garden_id', $garden_id)->get();

        return response()->json([
            'message' => 'Success',
            'data' => $crops,
        ], 201);
    }

    public function generateEsp(Request $request, $gardenId) {
        $user = $request->user();
        $random = rand(10000, 99999);
        $espName = "ESP-" . $random . "-" . $user->name;

        $garden = Garden::where('id', $gardenId)
        ->where('user_id', $user->id)
        ->first();

        if (!$garden) {
            return response()->json([
                "success" => false,
                "message" => "Garden not found or you don't have permission to access it"
            ], 404);
        }

        $existingEsp = Esp::where('garden_id', $gardenId)->first();

        if ($existingEsp) {
            return response()->json([
                "success" => false,
                "message" => "1 ESP per Garden! This garden already has a device."
            ], 400);
        }
        try {
            $esp = Esp::create([
                "crop_id" => null,
                "user_id" => $user->id,
                "garden_id" => $garden->id,
                "serial_number" => $espName,
                "status" => "inactive",
            ]);

            return response()->json([
                "status" => "Success",
                "data" => $esp,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                "message" => $e->getMessage(),
            ], 500);
        }
    }

    public function getEsp(Request $request, $gardenId) {
        $user = $request->user();

        $esp = Esp::where("garden_id", $gardenId)->where("user_id", $user->id)->first();

        return response()->json([
            "message" => "Success",
            "data" => $esp,
        ]);
    }

    public function getCrops(Request $request) {
        $user = $request->user();

        $crops = Crop::where('user_id', $user->id)->get();

        return response()->json([
            "message" => "Success!",
            "data" => $crops,
        ], 200);
    }

    public function addAdminCrop(Request $request)
    {
         $validated = $request->validate([
        'name' => 'required|string',
        'soil_temp_min' => 'nullable|numeric',
        'soil_temp_max' => 'nullable|numeric',
        'soil_moisture_min' => 'nullable|numeric',
        'soil_moisture_max' => 'nullable|numeric',
        'electrical_conductivity_min' => 'nullable|numeric',
        'electrical_conductivity_max' => 'nullable|numeric',
        'ph_min' => 'nullable|numeric',
        'ph_max' => 'nullable|numeric',
        'nitrogen_min' => 'nullable|numeric',
        'nitrogen_max' => 'nullable|numeric',
        'phosphorus_min' => 'nullable|numeric',
        'phosphorus_max' => 'nullable|numeric',
        'potassium_min' => 'nullable|numeric',
        'potassium_max' => 'nullable|numeric',
        'air_temperature_min' => 'nullable|numeric',
        'air_temperature_max' => 'nullable|numeric',
        'air_humidity_min' => 'nullable|numeric',
        'air_humidity_max' => 'nullable|numeric',
    ]);

    $cropProfile = CropProfile::create($validated);

    return response()->json([
        'message' => 'Crop Profile created successfully!',
        'data' => $cropProfile
    ], 201);

    }

    public function showCropsProfile() {
  $crops = CropProfile::all();

  return response()->json([
    "message" => "Success!",  // Changed from "status"
    "data" => $crops,
  ], 200);  // Changed from 201 to 200 (GET requests typically return 200)
}
    public function getUserCropProfile(Request $request) {
      $user = $request->user();

      $crops = Crop::with('cropProfile')->where('user_id', $user->id)->get();

      $cropProfiles = $crops->map(function($crop) {
          if (!$crop->cropProfile) {
              return null;
          }

          $profile = $crop->cropProfile;

          return [

              'name' => $profile->name ?? $crop->name ?? 'Unknown',
              'temperature' => $profile->air_temperature_min && $profile->air_temperature_max
                  ? "{$profile->air_temperature_min}-{$profile->air_temperature_max}°C"
                  : 'N/A',
              'humidity' => $profile->air_humidity_min && $profile->air_humidity_max
                  ? "{$profile->air_humidity_min}-{$profile->air_humidity_max}%"
                  : 'N/A',
              'soilPH' => $profile->ph_min && $profile->ph_max
                  ? "{$profile->ph_min}-{$profile->ph_max}"
                  : 'N/A',
              'ec' => $profile->electrical_conductivity_min && $profile->electrical_conductivity_max
                  ? "{$profile->electrical_conductivity_min}-{$profile->electrical_conductivity_max}"
                  : 'N/A',
              'npk' => $profile->nitrogen_min && $profile->phosphorus_min && $profile->potassium_min
                  ? "{$profile->nitrogen_min}-{$profile->phosphorus_min}-{$profile->potassium_min}"
                  : 'N/A',
          ];
      })->filter()->values();

      return response()->json($cropProfiles, 200);
  }

  public function getSensorDataCrop(Request $request, $garden_id, $crop) {
    $user = $request->user();

    $cropSensor = Crop::with('cropProfile')
        ->where('user_id', $user->id)
        ->where('garden_id', $garden_id)
        ->where('name', $crop)
        ->first();

    if (!$cropSensor) {
        return response()->json([
            'success' => false,
            'message' => 'Crop not found'
        ], 404);
    }

    $latestData = SensorData::with('crop')
        ->where('crop_id', $cropSensor->id)
        ->orderBy('created_at', 'desc')
        ->first();

    $allData = SensorData::where('crop_id', $cropSensor->id)
        ->orderBy('created_at', 'desc')
        ->limit(50)
        ->get();

    $alerts = [];
    $profile = $cropSensor->cropProfile;

    if ($latestData && $profile) {
        if ($latestData->soil_moisture < $profile->soil_moisture_min) {
            $alerts[] = [
                'type' => 'soil_moisture',
                'message' => "Low soil moisture detected ({$latestData->soil_moisture}%). Optimal range: {$profile->soil_moisture_min}-{$profile->soil_moisture_max}%. Consider watering.",
                'severity' => 'high',
                'current_value' => $latestData->soil_moisture,
                'expected_range' => "{$profile->soil_moisture_min}-{$profile->soil_moisture_max}",
                'timestamp' => now()
            ];
        } elseif ($latestData->soil_moisture > $profile->soil_moisture_max) {
            $alerts[] = [
                'type' => 'soil_moisture',
                'message' => "High soil moisture detected ({$latestData->soil_moisture}%). Optimal range: {$profile->soil_moisture_min}-{$profile->soil_moisture_max}%. Check for overwatering.",
                'severity' => 'medium',
                'current_value' => $latestData->soil_moisture,
                'expected_range' => "{$profile->soil_moisture_min}-{$profile->soil_moisture_max}",
                'timestamp' => now()
            ];
        }

        // pH Alert
        if ($latestData->ph < $profile->ph_min || $latestData->ph > $profile->ph_max) {
            $alerts[] = [
                'type' => 'ph',
                'message' => "Soil pH ({$latestData->ph}) is outside optimal range ({$profile->ph_min}-{$profile->ph_max}).",
                'severity' => 'high',
                'current_value' => $latestData->ph,
                'expected_range' => "{$profile->ph_min}-{$profile->ph_max}",
                'timestamp' => now()
            ];
        }

        // Soil Temperature Alert
        if ($latestData->soil_temperature < $profile->soil_temp_min) {
            $alerts[] = [
                'type' => 'soil_temperature',
                'message' => "Low soil temperature detected ({$latestData->soil_temperature}°C). Optimal range: {$profile->soil_temp_min}-{$profile->soil_temp_max}°C.",
                'severity' => 'medium',
                'current_value' => $latestData->soil_temperature,
                'expected_range' => "{$profile->soil_temp_min}-{$profile->soil_temp_max}",
                'timestamp' => now()
            ];
        } elseif ($latestData->soil_temperature > $profile->soil_temp_max) {
            $alerts[] = [
                'type' => 'soil_temperature',
                'message' => "High soil temperature detected ({$latestData->soil_temperature}°C). Optimal range: {$profile->soil_temp_min}-{$profile->soil_temp_max}°C.",
                'severity' => 'high',
                'current_value' => $latestData->soil_temperature,
                'expected_range' => "{$profile->soil_temp_min}-{$profile->soil_temp_max}",
                'timestamp' => now()
            ];
        }

        // Nitrogen Alert
        if ($latestData->nitrogen < $profile->nitrogen_min) {
            $alerts[] = [
                'type' => 'nitrogen',
                'message' => "Low nitrogen levels ({$latestData->nitrogen}). Optimal range: {$profile->nitrogen_min}-{$profile->nitrogen_max}. Nitrogen fertilizer recommended.",
                'severity' => 'high',
                'current_value' => $latestData->nitrogen,
                'expected_range' => "{$profile->nitrogen_min}-{$profile->nitrogen_max}",
                'timestamp' => now()
            ];
        } elseif ($latestData->nitrogen > $profile->nitrogen_max) {
            $alerts[] = [
                'type' => 'nitrogen',
                'message' => "High nitrogen levels ({$latestData->nitrogen}). Optimal range: {$profile->nitrogen_min}-{$profile->nitrogen_max}.",
                'severity' => 'medium',
                'current_value' => $latestData->nitrogen,
                'expected_range' => "{$profile->nitrogen_min}-{$profile->nitrogen_max}",
                'timestamp' => now()
            ];
        }

        // Phosphorus Alert
        if ($latestData->phosphorus < $profile->phosphorus_min) {
            $alerts[] = [
                'type' => 'phosphorus',
                'message' => "Low phosphorus levels ({$latestData->phosphorus}). Optimal range: {$profile->phosphorus_min}-{$profile->phosphorus_max}. Phosphorus fertilizer recommended.",
                'severity' => 'high',
                'current_value' => $latestData->phosphorus,
                'expected_range' => "{$profile->phosphorus_min}-{$profile->phosphorus_max}",
                'timestamp' => now()
            ];
        } elseif ($latestData->phosphorus > $profile->phosphorus_max) {
            $alerts[] = [
                'type' => 'phosphorus',
                'message' => "High phosphorus levels ({$latestData->phosphorus}). Optimal range: {$profile->phosphorus_min}-{$profile->phosphorus_max}.",
                'severity' => 'medium',
                'current_value' => $latestData->phosphorus,
                'expected_range' => "{$profile->phosphorus_min}-{$profile->phosphorus_max}",
                'timestamp' => now()
            ];
        }

        // Potassium Alert
        if ($latestData->potassium < $profile->potassium_min) {
            $alerts[] = [
                'type' => 'potassium',
                'message' => "Low potassium levels ({$latestData->potassium}). Optimal range: {$profile->potassium_min}-{$profile->potassium_max}. Potassium fertilizer recommended.",
                'severity' => 'high',
                'current_value' => $latestData->potassium,
                'expected_range' => "{$profile->potassium_min}-{$profile->potassium_max}",
                'timestamp' => now()
            ];
        } elseif ($latestData->potassium > $profile->potassium_max) {
            $alerts[] = [
                'type' => 'potassium',
                'message' => "High potassium levels ({$latestData->potassium}). Optimal range: {$profile->potassium_min}-{$profile->potassium_max}.",
                'severity' => 'medium',
                'current_value' => $latestData->potassium,
                'expected_range' => "{$profile->potassium_min}-{$profile->potassium_max}",
                'timestamp' => now()
            ];
        }

        // Electrical Conductivity Alert
        if (isset($latestData->electrical_conductivity)) {
            if ($latestData->electrical_conductivity < $profile->electrical_conductivity_min) {
                $alerts[] = [
                    'type' => 'electrical_conductivity',
                    'message' => "Low electrical conductivity ({$latestData->electrical_conductivity}). Optimal range: {$profile->electrical_conductivity_min}-{$profile->electrical_conductivity_max}.",
                    'severity' => 'medium',
                    'current_value' => $latestData->electrical_conductivity,
                    'expected_range' => "{$profile->electrical_conductivity_min}-{$profile->electrical_conductivity_max}",
                    'timestamp' => now()
                ];
            } elseif ($latestData->electrical_conductivity > $profile->electrical_conductivity_max) {
                $alerts[] = [
                    'type' => 'electrical_conductivity',
                    'message' => "High electrical conductivity ({$latestData->electrical_conductivity}). Optimal range: {$profile->electrical_conductivity_min}-{$profile->electrical_conductivity_max}.",
                    'severity' => 'medium',
                    'current_value' => $latestData->electrical_conductivity,
                    'expected_range' => "{$profile->electrical_conductivity_min}-{$profile->electrical_conductivity_max}",
                    'timestamp' => now()
                ];
            }
        }

        // Air Temperature Alert
        if (isset($latestData->air_temperature)) {
            if ($latestData->air_temperature < $profile->air_temperature_min) {
                $alerts[] = [
                    'type' => 'air_temperature',
                    'message' => "Low air temperature ({$latestData->air_temperature}°C). Optimal range: {$profile->air_temperature_min}-{$profile->air_temperature_max}°C.",
                    'severity' => 'medium',
                    'current_value' => $latestData->air_temperature,
                    'expected_range' => "{$profile->air_temperature_min}-{$profile->air_temperature_max}",
                    'timestamp' => now()
                ];
            } elseif ($latestData->air_temperature > $profile->air_temperature_max) {
                $alerts[] = [
                    'type' => 'air_temperature',
                    'message' => "High air temperature ({$latestData->air_temperature}°C). Optimal range: {$profile->air_temperature_min}-{$profile->air_temperature_max}°C.",
                    'severity' => 'high',
                    'current_value' => $latestData->air_temperature,
                    'expected_range' => "{$profile->air_temperature_min}-{$profile->air_temperature_max}",
                    'timestamp' => now()
                ];
            }
        }

        // Air Humidity Alert
        if (isset($latestData->air_humidity)) {
            if ($latestData->air_humidity < $profile->air_humidity_min) {
                $alerts[] = [
                    'type' => 'air_humidity',
                    'message' => "Low air humidity ({$latestData->air_humidity}%). Optimal range: {$profile->air_humidity_min}-{$profile->air_humidity_max}%.",
                    'severity' => 'medium',
                    'current_value' => $latestData->air_humidity,
                    'expected_range' => "{$profile->air_humidity_min}-{$profile->air_humidity_max}",
                    'timestamp' => now()
                ];
            } elseif ($latestData->air_humidity > $profile->air_humidity_max) {
                $alerts[] = [
                    'type' => 'air_humidity',
                    'message' => "High air humidity ({$latestData->air_humidity}%). Optimal range: {$profile->air_humidity_min}-{$profile->air_humidity_max}%.",
                    'severity' => 'medium',
                    'current_value' => $latestData->air_humidity,
                    'expected_range' => "{$profile->air_humidity_min}-{$profile->air_humidity_max}",
                    'timestamp' => now()
                ];
            }
        }
    }

    return response()->json([
        'success' => true,
        'data' => [
            'crop' => $cropSensor,
            'crop_profile' => $profile,
            'latest' => $latestData,
            'history' => $allData,
            'alerts' => $alerts
        ]
    ], 200);
}

    public function userGardenDelete(Request $request, $garden_id) {
      $user = $request->user();

      $garden = Garden::where('user_id', $user->id)->find($garden_id);

      if (!$garden) {
          return response()->json([
              'message' => 'Garden not found or you do not have permission to delete it'
          ], 404);
      }

      $garden->delete();

      $notificationService = new NotificationService();
      $notificationService->deleteGarden($garden, $user);

      return response()->json([
          'message' => 'Garden deleted successfully'
      ], 200);

    }

    public function updateCrop(Request $request, $crop_id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'variety' => 'required|string|max:255',
            'planted_date' => 'required|date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();

            $crop = Crop::whereHas('garden', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })->find($crop_id);

            if (!$crop) {
                return response()->json([
                    'message' => 'Crop not found or unauthorized'
                ], 404);
            }

            // Handle image upload
            if ($request->hasFile('image')) {
                try {
                    Log::info('Starting Cloudinary upload for updateCrop');

                    $uploadedFile = $request->file('image');

                    if (!$uploadedFile->isValid()) {
                        throw new \Exception('Uploaded file is not valid');
                    }

                    // Get Cloudinary instance
                    $cloudinary = $this->getCloudinaryInstance();

                    // Upload to Cloudinary
                    $result = $cloudinary->uploadApi()->upload(
                        $uploadedFile->getRealPath(),
                        [
                            'folder' => 'crops_images',
                            'public_id' => 'crop_' . time() . '_' . uniqid(),
                        ]
                    );

                    $crop->image = $result['secure_url'];

                    Log::info('Cloudinary upload successful for update', [
                        'url' => $crop->image
                    ]);

                } catch (\Exception $e) {
                    Log::error('Cloudinary upload failed during update', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);

                    return response()->json([
                        'message' => 'Failed to upload image',
                        'error' => $e->getMessage()
                    ], 500);
                }
            }

            $crop->name = $request->name;
            $crop->variety = $request->variety;
            $crop->planted_at = $request->planted_date;
            $crop->save();

            Log::info('Crop updated successfully', ['crop_id' => $crop_id]);

            return response()->json([
                'message' => 'Crop updated successfully',
                'data' => $crop
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to update crop', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to update crop',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteCrop(Request $request, $crop_id)
    {
        try {
            $user = $request->user();

            $crop = Crop::whereHas('garden', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })->find($crop_id);

            if (!$crop) {
                return response()->json([
                    'message' => 'Crop not found or unauthorized'
                ], 404);
            }

            $cropName = $crop->name;
            $garden = $crop->garden;

            $crop->delete();

            $notificationService = new NotificationService();
            $notificationService->deleteCrop($garden, $user, $crop);

            Log::info('Crop deleted successfully', ['crop_id' => $crop_id]);

            return response()->json([
                'message' => 'Crop deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to delete crop', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'Failed to delete crop',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateAdminCrop(Request $request, $id)
    {
        $crop = CropProfile::find($id);

        if (!$crop) {
            return response()->json([
                'success' => false,
                'message' => 'Crop not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:crops,name,' . $id,
            'soil_temp_min' => 'required|numeric',
            'soil_temp_max' => 'required|numeric|gte:soil_temp_min',
            'soil_moisture_min' => 'required|numeric|min:0|max:100',
            'soil_moisture_max' => 'required|numeric|gte:soil_moisture_min|max:100',
            'ph_min' => 'required|numeric|min:0|max:14',
            'ph_max' => 'required|numeric|gte:ph_min|max:14',
            'electrical_conductivity_min' => 'required|numeric|min:0',
            'electrical_conductivity_max' => 'required|numeric|gte:electrical_conductivity_min',
            'nitrogen_min' => 'required|numeric|min:0',
            'nitrogen_max' => 'required|numeric|gte:nitrogen_min',
            'phosphorus_min' => 'required|numeric|min:0',
            'phosphorus_max' => 'required|numeric|gte:phosphorus_min',
            'potassium_min' => 'required|numeric|min:0',
            'potassium_max' => 'required|numeric|gte:potassium_min',
            'air_temperature_min' => 'required|numeric',
            'air_temperature_max' => 'required|numeric|gte:air_temperature_min',
            'air_humidity_min' => 'required|numeric|min:0|max:100',
            'air_humidity_max' => 'required|numeric|gte:air_humidity_min|max:100',
        ], [
            'name.unique' => 'This crop name is already taken',
            '*.gte' => 'Maximum value must be greater than or equal to minimum value',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $crop->update([
                'name' => $request->name,
                'soil_temp_min' => $request->soil_temp_min,
                'soil_temp_max' => $request->soil_temp_max,
                'soil_moisture_min' => $request->soil_moisture_min,
                'soil_moisture_max' => $request->soil_moisture_max,
                'ph_min' => $request->ph_min,
                'ph_max' => $request->ph_max,
                'electrical_conductivity_min' => $request->electrical_conductivity_min,
                'electrical_conductivity_max' => $request->electrical_conductivity_max,
                'nitrogen_min' => $request->nitrogen_min,
                'nitrogen_max' => $request->nitrogen_max,
                'phosphorus_min' => $request->phosphorus_min,
                'phosphorus_max' => $request->phosphorus_max,
                'potassium_min' => $request->potassium_min,
                'potassium_max' => $request->potassium_max,
                'air_temperature_min' => $request->air_temperature_min,
                'air_temperature_max' => $request->air_temperature_max,
                'air_humidity_min' => $request->air_humidity_min,
                'air_humidity_max' => $request->air_humidity_max,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Crop updated successfully',
                'data' => $crop
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update crop',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteAdminCrop($id)
    {
        try {
            $crop = CropProfile::find($id);

            if (!$crop) {
                return response()->json([
                    'success' => false,
                    'message' => 'Crop not found'
                ], 404);
            }

            $crop->delete();

            return response()->json([
                'success' => true,
                'message' => "Crop '{$crop->name}' deleted successfully"
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete crop',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
