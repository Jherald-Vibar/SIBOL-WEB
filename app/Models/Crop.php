<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Crop extends Model
{
    protected $fillable = ['garden_id', 'name', 'variety', 'planted_at'];

    public function garden()
    {
        return $this->belongsTo(Garden::class);
    }

    public function sensorData()
    {
        return $this->hasMany(SensorData::class);
    }

    public function profile()
    {
        return $this->hasOne(CropProfile::class);
    }
}
