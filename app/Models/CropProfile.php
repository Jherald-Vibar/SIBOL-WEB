<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CropProfile extends Model
{
     protected $fillable = [
        'crop_id',
        'soil_moisture_min', 'soil_moisture_max',
        'soil_temperature_min', 'soil_temperature_max',
        'electrical_conductivity_min', 'electrical_conductivity_max',
        'ph_min', 'ph_max',
        'nitrogen_min', 'nitrogen_max',
        'phosphorus_min', 'phosphorus_max',
        'potassium_min', 'potassium_max',
        'air_temperature_min', 'air_temperature_max',
        'air_humidity_min', 'air_humidity_max',
    ];

    public function crop()
    {
        return $this->belongsTo(Crop::class);
    }
}
