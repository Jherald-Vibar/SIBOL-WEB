<?php

namespace App\Services;

use App\Models\Crop;
use App\Models\Notification;
use App\Models\User;
use App\Models\SensorData;
use App\Models\Esp;
use App\Models\Garden;
use App\Models\CropProfile;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Check sensor data and create notifications based on thresholds
     */
    public function processSensorNotifications(SensorData $sensorData, Esp $esp, ?CropProfile $cropProfile = null): void
    {
        $user = $esp->user;

        if (!$user) {
            Log::warning('ESP device has no associated user', ['esp_id' => $esp->id]);
            return;
        }

        // Check soil moisture
        if ($sensorData->soil_moisture !== null) {
            $this->checkSoilMoisture($sensorData, $user, $esp, $cropProfile);
        }

        // Check pH levels
        if ($sensorData->ph !== null) {
            $this->checkPH($sensorData, $user, $esp, $cropProfile);
        }

        // Check air temperature
        if ($sensorData->air_temperature !== null) {
            $this->checkAirTemperature($sensorData, $user, $esp, $cropProfile);
        }

        // Check soil temperature
        if ($sensorData->soil_temperature !== null) {
            $this->checkSoilTemperature($sensorData, $user, $esp, $cropProfile);
        }

        // Check air humidity
        if ($sensorData->air_humidity !== null) {
            $this->checkAirHumidity($sensorData, $user, $esp, $cropProfile);
        }

        // Check electrical conductivity
        if ($sensorData->electrical_conductivity !== null) {
            $this->checkElectricalConductivity($sensorData, $user, $esp, $cropProfile);
        }

        // Check NPK levels
        $this->checkNPKLevels($sensorData, $user, $esp, $cropProfile);
    }

    /**
     * Create notification for disease detection
     */
    public function createDiseaseDetectionNotification(
        User $user,
        string $detectedClass,
        float $confidence,
        string $cropName
    ): void {
        $priority = $confidence > 0.8 ? 'high' : 'normal';

        Notification::create([
            'user_id' => $user->id,
            'type' => 'disease_detection',
            'title' => 'Disease Detection Alert',
            'description' => "Potential {$detectedClass} detected in {$cropName} with " .
                           number_format($confidence * 100, 1) . "% confidence",
            'is_read' => false,
            'priority' => $priority,
            'metadata' => [
                'detected_class' => $detectedClass,
                'confidence' => $confidence,
                'crop_name' => $cropName,
            ],
        ]);
    }

    /**
     * Create notification for irrigation completion
     */
    public function createIrrigationNotification(User $user, Esp $esp): void
    {
        Notification::create([
            'user_id' => $user->id,
            'type' => 'irrigation',
            'title' => 'Irrigation Complete',
            'description' => "Automated irrigation cycle completed successfully for {$esp->name}",
            'is_read' => false,
            'priority' => 'normal',
            'metadata' => [
                'esp_id' => $esp->id,
                'esp_name' => $esp->name,
            ],
        ]);
    }

    /**
     * Create system update notification
     */
    public function createSystemNotification(User $user, string $title, string $description): void
    {
        Notification::create([
            'user_id' => $user->id,
            'type' => 'system',
            'title' => $title,
            'description' => $description,
            'is_read' => false,
            'priority' => 'normal',
            'metadata' => [],
        ]);
    }

    // Private helper methods

    private function checkSoilMoisture(SensorData $sensorData, User $user, Esp $esp, ?CropProfile $cropProfile): void
    {
        $moisture = $sensorData->soil_moisture;

        // Get thresholds from crop profile or use defaults
        $minMoisture = $cropProfile->soil_moisture_min ?? 30;
        $maxMoisture = $cropProfile->soil_moisture_max ?? 80;
        $criticalThreshold = $minMoisture * 0.5; // Critical is 50% of minimum
        $cropName = $cropProfile->name ?? 'garden';

        // Check for recent similar notifications to prevent spam
        $recentAlert = Notification::where('user_id', $user->id)
            ->where('type', 'soil_moisture')
            ->where('metadata->esp_id', $esp->id)
            ->where('created_at', '>', now()->subHour())
            ->exists();

        if ($recentAlert) {
            return; // Don't spam notifications
        }

        // Critical moisture (very low)
        if ($moisture < $criticalThreshold) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'soil_moisture',
                'title' => 'Critical: Soil Moisture',
                'description' => "URGENT: {$cropName} soil moisture critically low at {$moisture}%. Immediate irrigation needed! (Min: {$minMoisture}%)",
                'is_read' => false,
                'priority' => 'critical',
                'metadata' => [
                    'esp_id' => $esp->id,
                    'sensor_data_id' => $sensorData->id,
                    'moisture_level' => $moisture,
                    'threshold' => $criticalThreshold,
                    'crop_profile_id' => $cropProfile->id ?? null,
                ],
            ]);
        }
        // Low moisture threshold
        elseif ($moisture < $minMoisture) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'soil_moisture',
                'title' => 'Soil Moisture Alert',
                'description' => "Your {$cropName}'s soil moisture is below optimal level at {$moisture}% (recommended: {$minMoisture}-{$maxMoisture}%)",
                'is_read' => false,
                'priority' => 'high',
                'metadata' => [
                    'esp_id' => $esp->id,
                    'sensor_data_id' => $sensorData->id,
                    'moisture_level' => $moisture,
                    'min_threshold' => $minMoisture,
                    'max_threshold' => $maxMoisture,
                    'crop_profile_id' => $cropProfile->id ?? null,
                ],
            ]);
        }
        // High moisture threshold
        elseif ($moisture > $maxMoisture) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'soil_moisture',
                'title' => 'High Soil Moisture Alert',
                'description' => "Your {$cropName}'s soil moisture is too high at {$moisture}% (recommended: {$minMoisture}-{$maxMoisture}%). Risk of root rot.",
                'is_read' => false,
                'priority' => 'normal',
                'metadata' => [
                    'esp_id' => $esp->id,
                    'sensor_data_id' => $sensorData->id,
                    'moisture_level' => $moisture,
                    'min_threshold' => $minMoisture,
                    'max_threshold' => $maxMoisture,
                    'crop_profile_id' => $cropProfile->id ?? null,
                ],
            ]);
        }
    }

    private function checkPH(SensorData $sensorData, User $user, Esp $esp, ?CropProfile $cropProfile): void
    {
        $ph = $sensorData->ph;

        // Get pH range from crop profile or use defaults
        $minPH = $cropProfile->ph_min ?? 6.0;
        $maxPH = $cropProfile->ph_max ?? 7.5;
        $cropName = $cropProfile->name ?? 'crops';

        // Check for recent similar notifications
        $recentAlert = Notification::where('user_id', $user->id)
            ->where('type', 'ph_alert')
            ->where('metadata->esp_id', $esp->id)
            ->where('created_at', '>', now()->subHours(2))
            ->exists();

        if ($recentAlert) {
            return;
        }

        if ($ph < $minPH || $ph > $maxPH) {
            $status = $ph < $minPH ? 'too acidic' : 'too alkaline';
            $priority = ($ph < $minPH - 1 || $ph > $maxPH + 1) ? 'high' : 'normal';

            Notification::create([
                'user_id' => $user->id,
                'type' => 'ph_alert',
                'title' => 'Soil pH Alert',
                'description' => "Soil pH is {$status} at {$ph} for {$cropName}. Optimal range is {$minPH}-{$maxPH}",
                'is_read' => false,
                'priority' => $priority,
                'metadata' => [
                    'esp_id' => $esp->id,
                    'sensor_data_id' => $sensorData->id,
                    'ph_level' => $ph,
                    'optimal_min' => $minPH,
                    'optimal_max' => $maxPH,
                    'crop_profile_id' => $cropProfile->id ?? null,
                ],
            ]);
        }
    }

    private function checkAirTemperature(SensorData $sensorData, User $user, Esp $esp, ?CropProfile $cropProfile): void
    {
        $temp = $sensorData->air_temperature;

        // Get temperature range from crop profile or use defaults
        $minTemp = $cropProfile->air_temperature_min ?? 10;
        $maxTemp = $cropProfile->air_temperature_max ?? 35;
        $cropName = $cropProfile->name ?? 'crops';

        // Check for recent similar notifications
        $recentAlert = Notification::where('user_id', $user->id)
            ->where('type', 'air_temperature')
            ->where('metadata->esp_id', $esp->id)
            ->where('created_at', '>', now()->subHour())
            ->exists();

        if ($recentAlert) {
            return;
        }

        // High temperature alert
        if ($temp > $maxTemp) {
            $priority = $temp > ($maxTemp + 5) ? 'critical' : 'high';

            Notification::create([
                'user_id' => $user->id,
                'type' => 'air_temperature',
                'title' => 'High Air Temperature Alert',
                'description' => "Air temperature is extremely high at {$temp}°C for {$cropName} (max: {$maxTemp}°C). Consider providing shade or cooling.",
                'is_read' => false,
                'priority' => $priority,
                'metadata' => [
                    'esp_id' => $esp->id,
                    'sensor_data_id' => $sensorData->id,
                    'temperature' => $temp,
                    'min_threshold' => $minTemp,
                    'max_threshold' => $maxTemp,
                    'crop_profile_id' => $cropProfile->id ?? null,
                ],
            ]);
        }
        // Low temperature alert
        elseif ($temp < $minTemp) {
            $priority = $temp < ($minTemp - 5) ? 'critical' : 'high';

            Notification::create([
                'user_id' => $user->id,
                'type' => 'air_temperature',
                'title' => 'Low Air Temperature Alert',
                'description' => "Air temperature is very low at {$temp}°C for {$cropName} (min: {$minTemp}°C). Risk of frost damage.",
                'is_read' => false,
                'priority' => $priority,
                'metadata' => [
                    'esp_id' => $esp->id,
                    'sensor_data_id' => $sensorData->id,
                    'temperature' => $temp,
                    'min_threshold' => $minTemp,
                    'max_threshold' => $maxTemp,
                    'crop_profile_id' => $cropProfile->id ?? null,
                ],
            ]);
        }
    }

    private function checkSoilTemperature(SensorData $sensorData, User $user, Esp $esp, ?CropProfile $cropProfile): void
    {
        $temp = $sensorData->soil_temperature;

        // Get temperature range from crop profile or use defaults
        $minTemp = $cropProfile->soil_temp_min ?? 15;
        $maxTemp = $cropProfile->soil_temp_max ?? 30;
        $cropName = $cropProfile->name ?? 'crops';

        // Check for recent similar notifications
        $recentAlert = Notification::where('user_id', $user->id)
            ->where('type', 'soil_temperature')
            ->where('metadata->esp_id', $esp->id)
            ->where('created_at', '>', now()->subHours(2))
            ->exists();

        if ($recentAlert) {
            return;
        }

        if ($temp > $maxTemp) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'soil_temperature',
                'title' => 'High Soil Temperature Alert',
                'description' => "Soil temperature is high at {$temp}°C for {$cropName} (max: {$maxTemp}°C). May affect root growth.",
                'is_read' => false,
                'priority' => 'normal',
                'metadata' => [
                    'esp_id' => $esp->id,
                    'sensor_data_id' => $sensorData->id,
                    'temperature' => $temp,
                    'min_threshold' => $minTemp,
                    'max_threshold' => $maxTemp,
                    'crop_profile_id' => $cropProfile->id ?? null,
                ],
            ]);
        } elseif ($temp < $minTemp) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'soil_temperature',
                'title' => 'Low Soil Temperature Alert',
                'description' => "Soil temperature is low at {$temp}°C for {$cropName} (min: {$minTemp}°C). May slow growth.",
                'is_read' => false,
                'priority' => 'normal',
                'metadata' => [
                    'esp_id' => $esp->id,
                    'sensor_data_id' => $sensorData->id,
                    'temperature' => $temp,
                    'min_threshold' => $minTemp,
                    'max_threshold' => $maxTemp,
                    'crop_profile_id' => $cropProfile->id ?? null,
                ],
            ]);
        }
    }

    private function checkAirHumidity(SensorData $sensorData, User $user, Esp $esp, ?CropProfile $cropProfile): void
    {
        $humidity = $sensorData->air_humidity;

        // Get humidity range from crop profile or use defaults
        $minHumidity = $cropProfile->air_humidity_min ?? 40;
        $maxHumidity = $cropProfile->air_humidity_max ?? 70;
        $cropName = $cropProfile->name ?? 'crops';

        // Check for recent similar notifications
        $recentAlert = Notification::where('user_id', $user->id)
            ->where('type', 'air_humidity')
            ->where('metadata->esp_id', $esp->id)
            ->where('created_at', '>', now()->subHours(2))
            ->exists();

        if ($recentAlert) {
            return;
        }

        if ($humidity > $maxHumidity) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'air_humidity',
                'title' => 'High Humidity Alert',
                'description' => "Air humidity is high at {$humidity}% for {$cropName} (max: {$maxHumidity}%). Risk of fungal diseases.",
                'is_read' => false,
                'priority' => 'normal',
                'metadata' => [
                    'esp_id' => $esp->id,
                    'sensor_data_id' => $sensorData->id,
                    'humidity' => $humidity,
                    'min_threshold' => $minHumidity,
                    'max_threshold' => $maxHumidity,
                    'crop_profile_id' => $cropProfile->id ?? null,
                ],
            ]);
        } elseif ($humidity < $minHumidity) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'air_humidity',
                'title' => 'Low Humidity Alert',
                'description' => "Air humidity is low at {$humidity}% for {$cropName} (min: {$minHumidity}%). Plants may experience water stress.",
                'is_read' => false,
                'priority' => 'normal',
                'metadata' => [
                    'esp_id' => $esp->id,
                    'sensor_data_id' => $sensorData->id,
                    'humidity' => $humidity,
                    'min_threshold' => $minHumidity,
                    'max_threshold' => $maxHumidity,
                    'crop_profile_id' => $cropProfile->id ?? null,
                ],
            ]);
        }
    }

    private function checkElectricalConductivity(SensorData $sensorData, User $user, Esp $esp, ?CropProfile $cropProfile): void
    {
        $ec = $sensorData->electrical_conductivity;

        // Get EC range from crop profile or use defaults
        $minEC = $cropProfile->electrical_conductivity_min ?? 0.5;
        $maxEC = $cropProfile->electrical_conductivity_max ?? 2.0;
        $cropName = $cropProfile->name ?? 'crops';

        // Check for recent similar notifications
        $recentAlert = Notification::where('user_id', $user->id)
            ->where('type', 'electrical_conductivity')
            ->where('metadata->esp_id', $esp->id)
            ->where('created_at', '>', now()->subHours(6))
            ->exists();

        if ($recentAlert) {
            return;
        }

        if ($ec > $maxEC) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'electrical_conductivity',
                'title' => 'High Salinity Alert',
                'description' => "Electrical conductivity is high at {$ec} mS/cm for {$cropName} (max: {$maxEC} mS/cm). Soil may have excessive salts.",
                'is_read' => false,
                'priority' => 'normal',
                'metadata' => [
                    'esp_id' => $esp->id,
                    'sensor_data_id' => $sensorData->id,
                    'ec_level' => $ec,
                    'min_threshold' => $minEC,
                    'max_threshold' => $maxEC,
                    'crop_profile_id' => $cropProfile->id ?? null,
                ],
            ]);
        } elseif ($ec < $minEC) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'electrical_conductivity',
                'title' => 'Low Nutrient Content Alert',
                'description' => "Electrical conductivity is low at {$ec} mS/cm for {$cropName} (min: {$minEC} mS/cm). Soil may need fertilization.",
                'is_read' => false,
                'priority' => 'normal',
                'metadata' => [
                    'esp_id' => $esp->id,
                    'sensor_data_id' => $sensorData->id,
                    'ec_level' => $ec,
                    'min_threshold' => $minEC,
                    'max_threshold' => $maxEC,
                    'crop_profile_id' => $cropProfile->id ?? null,
                ],
            ]);
        }
    }

    private function checkNPKLevels(SensorData $sensorData, User $user, Esp $esp, ?CropProfile $cropProfile): void
    {
        $alerts = [];

        // Get NPK thresholds from crop profile or use defaults
        $minNitrogen = $cropProfile->nitrogen_min ?? 20;
        $maxNitrogen = $cropProfile->nitrogen_max ?? 200;
        $minPhosphorus = $cropProfile->phosphorus_min ?? 10;
        $maxPhosphorus = $cropProfile->phosphorus_max ?? 100;
        $minPotassium = $cropProfile->potassium_min ?? 50;
        $maxPotassium = $cropProfile->potassium_max ?? 300;

        // Check for recent similar notifications
        $recentAlert = Notification::where('user_id', $user->id)
            ->where('type', 'nutrient_alert')
            ->where('metadata->esp_id', $esp->id)
            ->where('created_at', '>', now()->subHours(6))
            ->exists();

        if ($recentAlert) {
            return;
        }

        // Check Nitrogen (N)
        if ($sensorData->nitrogen !== null) {
            if ($sensorData->nitrogen < $minNitrogen) {
                $alerts[] = "Nitrogen (N): {$sensorData->nitrogen} ppm - LOW (min: {$minNitrogen} ppm)";
            } elseif ($sensorData->nitrogen > $maxNitrogen) {
                $alerts[] = "Nitrogen (N): {$sensorData->nitrogen} ppm - HIGH (max: {$maxNitrogen} ppm)";
            }
        }

        // Check Phosphorus (P)
        if ($sensorData->phosphorus !== null) {
            if ($sensorData->phosphorus < $minPhosphorus) {
                $alerts[] = "Phosphorus (P): {$sensorData->phosphorus} ppm - LOW (min: {$minPhosphorus} ppm)";
            } elseif ($sensorData->phosphorus > $maxPhosphorus) {
                $alerts[] = "Phosphorus (P): {$sensorData->phosphorus} ppm - HIGH (max: {$maxPhosphorus} ppm)";
            }
        }

        // Check Potassium (K)
        if ($sensorData->potassium !== null) {
            if ($sensorData->potassium < $minPotassium) {
                $alerts[] = "Potassium (K): {$sensorData->potassium} ppm - LOW (min: {$minPotassium} ppm)";
            } elseif ($sensorData->potassium > $maxPotassium) {
                $alerts[] = "Potassium (K): {$sensorData->potassium} ppm - HIGH (max: {$maxPotassium} ppm)";
            }
        }

        if (!empty($alerts)) {
            $cropName = $cropProfile->name ?? 'crops';
            $description = "Nutrient level alerts for {$cropName}: " . implode(", ", $alerts);

            Notification::create([
                'user_id' => $user->id,
                'type' => 'nutrient_alert',
                'title' => 'Nutrient Level Alert',
                'description' => $description,
                'is_read' => false,
                'priority' => 'normal',
                'metadata' => [
                    'esp_id' => $esp->id,
                    'sensor_data_id' => $sensorData->id,
                    'nitrogen' => $sensorData->nitrogen,
                    'phosphorus' => $sensorData->phosphorus,
                    'potassium' => $sensorData->potassium,
                    'crop_profile_id' => $cropProfile->id ?? null,
                ],
            ]);
        }
    }

    public function checkCrop(Crop $crop, User $user, Garden $garden): void
    {
        $cropExists = Crop::where('garden_id', $garden->id)
                        ->where('name', $crop->name)
                        ->where('id', '!=', $crop->id)
                        ->exists();

        if (!$cropExists) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'Crop Alert',
                'title' => 'New Crop Added',
                'description' => $crop->name . " added in your Garden",
                'is_read' => false,
                'priority' => 'normal',
                'metadata' => [
                    'crop_id' => $crop->id,
                    'garden_id' => $garden->id,
                    'crop_type' => $crop->type,
                ],
            ]);
        }
    }

    public function addGarden(Garden $garden, User $user): void
    {
        Notification::create([
            'user_id' => $user->id,
            'type' => 'Garden Alert',
            'title' => 'New Garden Added',
            'description' => $garden->name . " added in your Account",
            'is_read' => false,
            'priority' => 'normal',
            'metadata' => [
                'garden_id' => $garden->id,
                'location' => $garden->location,
            ],
        ]);
    }

    public function deleteCrop(Garden $garden, User $user, Crop $crop): void
    {
        Notification::create([
            'user_id' => $user->id,
            'type' => 'Crop Alert',
            'title' => 'Crop Deleted',
            'description' => $crop->name . " deleted from your Garden",
            'is_read' => false,
            'priority' => 'normal',
            'metadata' => [
                'garden_id' => $garden->id,
                'crop_name' => $crop->name,
                'variety' => $crop->variety,
            ],
        ]);
    }

    public function deleteGarden(Garden $garden, User $user): void
    {
        Notification::create([
            'user_id' => $user->id,
            'type' => 'Garden Alert',
            'title' => 'Garden Deleted',
            'description' => $garden->name . " deleted from your Account",
            'is_read' => false,
            'priority' => 'normal',
            'metadata' => [
                'garden_id' => $garden->id,
                'garden_name' => $garden->name,
            ],
        ]);
    }
}
