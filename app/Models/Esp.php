<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Esp extends Model
{
    protected $fillable = [
        'crop_id', 'garden_id', 'serial_number','user_id','status','last_seen_at'
    ];

    public function crop() {
        return $this->belongsTo(Crop::class);
    }

    public function sensorData() {
        return $this->hasMany(SensorData::class);
    }

    public function user() {
      return $this->belongsTo(User::class);
    }
}
