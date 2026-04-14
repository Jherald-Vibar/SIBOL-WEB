<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CropProfile;

class CropProfileSeeder extends Seeder
{
    public function run()
    {
        // Create Mustasa profile
        CropProfile::create([
            'name'                        => 'Mustasa',
            'soil_temp_min'               => 18,
            'soil_temp_max'               => 25,
            'soil_moisture_min'           => 60,
            'soil_moisture_max'           => 75,
            'electrical_conductivity_min' => 0,
            'electrical_conductivity_max' => 2.0,
            'ph_min'                      => 6.0,
            'ph_max'                      => 7.5,
            'nitrogen_min'                => 120,
            'nitrogen_max'                => 180,
            'phosphorus_min'              => 40,
            'phosphorus_max'              => 60,
            'potassium_min'               => 80,
            'potassium_max'               => 100,
            'air_temperature_min'         => 15,
            'air_temperature_max'         => 25,
            'air_humidity_min'            => 60,
            'air_humidity_max'            => 75,
        ]);

        // Create Pechay profile
        CropProfile::create([
            'name'                        => 'Pechay',
            'soil_temp_min'               => 16,
            'soil_temp_max'               => 24,
            'soil_moisture_min'           => 60,
            'soil_moisture_max'           => 80,
            'electrical_conductivity_min' => 0,
            'electrical_conductivity_max' => 2.0,
            'ph_min'                      => 5.5,
            'ph_max'                      => 6.5,
            'nitrogen_min'                => 100,
            'nitrogen_max'                => 150,
            'phosphorus_min'              => 40,
            'phosphorus_max'              => 50,
            'potassium_min'               => 60,
            'potassium_max'               => 90,
            'air_temperature_min'         => 18,
            'air_temperature_max'         => 28,
            'air_humidity_min'            => 65,
            'air_humidity_max'            => 85,
        ]);

        // ✅ Average Plant fallback profile
        // Based on general agronomic averages for common leafy/vegetable crops
        // Sources: FAO crop guides, university extension services
        CropProfile::firstOrCreate(
            ['name' => 'Average Plant'],
            [
                // Soil Temperature: Most crops grow well between 18-28°C
                'soil_temp_min'               => 18,
                'soil_temp_max'               => 28,

                // Soil Moisture: General optimal range for most vegetables 50-70%
                'soil_moisture_min'           => 50,
                'soil_moisture_max'           => 70,

                // EC: Most crops tolerate 0.8-2.5 mS/cm
                'electrical_conductivity_min' => 0.8,
                'electrical_conductivity_max' => 2.5,

                // pH: Most crops prefer slightly acidic to neutral 6.0-7.0
                'ph_min'                      => 6.0,
                'ph_max'                      => 7.0,

                // NPK: General vegetable crop averages (mg/kg)
                // Nitrogen: moderate feeder average
                'nitrogen_min'                => 80,
                'nitrogen_max'                => 150,

                // Phosphorus: general average for vegetables
                'phosphorus_min'              => 30,
                'phosphorus_max'              => 60,

                // Potassium: general average for vegetables
                'potassium_min'               => 60,
                'potassium_max'               => 100,

                // Air Temperature: tropical/subtropical average 20-30°C
                'air_temperature_min'         => 20,
                'air_temperature_max'         => 30,

                // Air Humidity: general optimal range for most crops
                'air_humidity_min'            => 50,
                'air_humidity_max'            => 80,
            ]
        );
    }
}
