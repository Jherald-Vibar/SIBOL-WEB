<?php

namespace App\Services;

use App\Models\Crop;
use App\Models\Notification;
use App\Models\User;
use App\Models\SensorData;
use App\Models\Esp;
use App\Models\Garden;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Check sensor data and create notifications based on thresholds
     */
    public function processSensorNotifications(SensorData $sensorData, Esp $esp): void
    {
        $user = $esp->user;

        if (!$user) {
            Log::warning('ESP device has no associated user', ['esp_id' => $esp->id]);
            return;
        }

        // Check soil moisture
        if ($sensorData->soil_moisture !== null) {
            $this->checkSoilMoisture($sensorData, $user, $esp);
        }

        // Check pH levels
        if ($sensorData->ph !== null) {
            $this->checkPH($sensorData, $user, $esp);
        }

        // Check temperature
        if ($sensorData->air_temperature !== null) {
            $this->checkTemperature($sensorData, $user, $esp);
        }

        // Check NPK levels
        $this->checkNPKLevels($sensorData, $user, $esp);
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

    private function checkSoilMoisture(SensorData $sensorData, User $user, Esp $esp): void
    {
        $moisture = $sensorData->soil_moisture;

        // Low moisture threshold (below 30%)
        if ($moisture < 30) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'soil_moisture',
                'title' => 'Soil Moisture Alert',
                'description' => "Your garden's soil moisture is below optimal level at {$moisture}%",
                'is_read' => false,
                'priority' => 'high',
                'metadata' => [
                    'esp_id' => $esp->id,
                    'sensor_data_id' => $sensorData->id,
                    'moisture_level' => $moisture,
                    'threshold' => 30,
                ],
            ]);
        }

        // Very low moisture (below 15%) - critical
        if ($moisture < 15) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'soil_moisture',
                'title' => 'Critical: Soil Moisture',
                'description' => "URGENT: Soil moisture critically low at {$moisture}%. Immediate irrigation needed!",
                'is_read' => false,
                'priority' => 'critical',
                'metadata' => [
                    'esp_id' => $esp->id,
                    'sensor_data_id' => $sensorData->id,
                    'moisture_level' => $moisture,
                    'threshold' => 15,
                ],
            ]);
        }
    }

    private function checkPH(SensorData $sensorData, User $user, Esp $esp): void
    {
        $ph = $sensorData->ph;

        // Optimal pH range is typically 6.0-7.5 for most crops
        if ($ph < 5.5 || $ph > 8.0) {
            $status = $ph < 5.5 ? 'too acidic' : 'too alkaline';

            Notification::create([
                'user_id' => $user->id,
                'type' => 'ph_alert',
                'title' => 'Soil pH Alert',
                'description' => "Soil pH is {$status} at {$ph}. Optimal range is 6.0-7.5",
                'is_read' => false,
                'priority' => 'normal',
                'metadata' => [
                    'esp_id' => $esp->id,
                    'sensor_data_id' => $sensorData->id,
                    'ph_level' => $ph,
                    'optimal_min' => 6.0,
                    'optimal_max' => 7.5,
                ],
            ]);
        }
    }

    private function checkTemperature(SensorData $sensorData, User $user, Esp $esp): void
    {
        $temp = $sensorData->air_temperature;

        // Extreme temperature alerts
        if ($temp > 40) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'temperature',
                'title' => 'High Temperature Alert',
                'description' => "Air temperature is extremely high at {$temp}°C. Consider providing shade.",
                'is_read' => false,
                'priority' => 'high',
                'metadata' => [
                    'esp_id' => $esp->id,
                    'sensor_data_id' => $sensorData->id,
                    'temperature' => $temp,
                ],
            ]);
        } elseif ($temp < 5) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'temperature',
                'title' => 'Low Temperature Alert',
                'description' => "Air temperature is very low at {$temp}°C. Risk of frost damage.",
                'is_read' => false,
                'priority' => 'high',
                'metadata' => [
                    'esp_id' => $esp->id,
                    'sensor_data_id' => $sensorData->id,
                    'temperature' => $temp,
                ],
            ]);
        }
    }

    private function checkNPKLevels(SensorData $sensorData, User $user, Esp $esp): void
    {
        $alerts = [];

        // Check Nitrogen (N) - optimal range varies but let's say 20-50 ppm
        if ($sensorData->nitrogen !== null && $sensorData->nitrogen < 20) {
            $alerts[] = "Nitrogen (N): {$sensorData->nitrogen} ppm";
        }

        // Check Phosphorus (P) - optimal range 10-30 ppm
        if ($sensorData->phosphorus !== null && $sensorData->phosphorus < 10) {
            $alerts[] = "Phosphorus (P): {$sensorData->phosphorus} ppm";
        }

        // Check Potassium (K) - optimal range 50-200 ppm
        if ($sensorData->potassium !== null && $sensorData->potassium < 50) {
            $alerts[] = "Potassium (K): {$sensorData->potassium} ppm";
        }

        if (!empty($alerts)) {
            $description = "Low nutrient levels detected: " . implode(", ", $alerts) . ". Consider fertilizing.";

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
                ],
            ]);
        }
    }

    public function checkCrop(Crop $crop, User $user, Garden $garden) {

      $cropExists = Crop::where('garden_id', $garden->id)
                      ->where('name', $crop->name)
                      ->where('id', '!=', $crop->id)
                      ->exists();

      if(!$cropExists) {
        Notification::create([
        'user_id' => $user->id,
              'type' => 'Crop Alert',
              'title' => 'New Crop Added',
              'description' => $crop->name , "Added in your Garden ",
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

    public function addGarden(Garden $garden, User $user) {

         Notification::create([
        'user_id' => $user->id,
              'type' => 'Garden Alert',
              'title' => 'New Garden Added',
              'description' => $garden->name , "Added in your Account ",
              'is_read' => false,
              'priority' => 'normal',
              'metadata' => [
                  'garden_id' => $garden->id,
                  'location' => $garden->location,
              ],
        ]);
    }


    public function deleteCrop(Garden $garden, User $user, Crop $crop) {
        Notification::create([
        'user_id' => $user->id,
              'type' => 'Crop Alert',
              'title' => 'Crop Deleted',
              'description' => $crop->name , "Deleted in your Garden ",
              'is_read' => false,
              'priority' => 'normal',
              'metadata' => [
                  'garden_id' => $garden->id,
                  'crop_name' => $crop->name,
                  'variety' => $crop->variety,
              ],
        ]);
    }

    public function deleteGarden(Garden $garden, User $user) {
      Notification::create([
        'user_id' => $user->id,
              'type' => 'Garden Alert',
              'title' => 'Garden Deleted',
              'description' => $garden->name , "Deleted in your Account ",
              'is_read' => false,
              'priority' => 'normal',
              'metadata' => [
                  'garden_id' => $garden->id,
                  'garden_name' => $garden->name,
              ],
        ]);
    }
}
