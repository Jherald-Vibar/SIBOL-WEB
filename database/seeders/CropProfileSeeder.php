<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CropProfile;

class CropProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create Mustasa profile
        CropProfile::create([
            'name' => 'Mustasa',
            'soil_temp_min' => 18,
            'soil_temp_max' => 25,
            'soil_moisture_min' => 60,
            'soil_moisture_max' => 75,
            'electrical_conductivity_min' => 0,
            'electrical_conductivity_max' => 2.0,
            'ph_min' => 6.0,
            'ph_max' => 7.5,
            'nitrogen_min' => 120,
            'nitrogen_max' => 180,
            'phosphorus_min' => 40,
            'phosphorus_max' => 60,
            'potassium_min' => 80,
            'potassium_max' => 100,
            'air_temperature_min' => 15,
            'air_temperature_max' => 25,
            'air_humidity_min' => 60,
            'air_humidity_max' => 75,
        ]);

        // Create Pechay profile
        CropProfile::create([
            'name' => 'Pechay',
            'soil_temp_min' => 16,
            'soil_temp_max' => 24,
            'soil_moisture_min' => 60,
            'soil_moisture_max' => 80,
            'electrical_conductivity_min' => 0,
            'electrical_conductivity_max' => 2.0,
            'ph_min' => 5.5,
            'ph_max' => 6.5,
            'nitrogen_min' => 100,
            'nitrogen_max' => 150,
            'phosphorus_min' => 40,
            'phosphorus_max' => 50,
            'potassium_min' => 60,
            'potassium_max' => 90,
            'air_temperature_min' => 18,
            'air_temperature_max' => 28,
            'air_humidity_min' => 65,
            'air_humidity_max' => 85,
        ]);

    }
}
