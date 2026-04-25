<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SensorData extends Model
{
    protected $fillable = [
        'esp_id',
        'crop_id',
        'soil_moisture',
        'soil_temperature',
        'electrical_conductivity',
        'ph',
        'nitrogen',
        'phosphorus',
        'potassium',
        'air_temperature',
        'air_humidity',
    ];

    public function crop()
    {
        return $this->belongsTo(Crop::class);
    }

    public function esp()
    {
        return $this->belongsTo(Esp::class, 'esp_id');
    }

}
