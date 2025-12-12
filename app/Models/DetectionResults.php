<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetectionResults extends Model
{
    use HasFactory;

    protected $fillable = [
        'sensor_data_id',
        'crop_id',
        'esp_id',
        'detected_class',
        'confidence',
        'image_url',
        'recommendations',
        'harvest_tips',
    ];

    protected $casts = [
        'recommendations' => 'array',
        'harvest_tips' => 'array',
        'confidence' => 'float',
    ];

    // Relationships
    public function sensorData()
    {
        return $this->belongsTo(SensorData::class, 'sensor_id');
    }

    public function crop()
    {
        return $this->belongsTo(Crop::class, 'crop_id');
    }

    public function esp()
    {
        return $this->belongsTo(Esp::class);
    }

    // Helper methods
    public function isHealthy()
    {
        return str_contains(strtolower($this->detected_class), 'healthy');
    }

    public function isLeafSpot()
    {
        return str_contains(strtolower($this->detected_class), 'leaf_spot');
    }

    public function isYellowLeaf()
    {
        return str_contains(strtolower($this->detected_class), 'yellow_leaf');
    }

    public function getConditionLabel()
    {
        if ($this->isHealthy()) {
            return 'Healthy';
        } elseif ($this->isLeafSpot()) {
            return 'Leaf Spot Disease';
        } elseif ($this->isYellowLeaf()) {
            return 'Yellow Leaf / Nutrient Deficiency';
        }
        return 'Unknown';
    }

     public function detectionResults()
    {
        return $this->hasMany(DetectionResults::class);
    }
}
