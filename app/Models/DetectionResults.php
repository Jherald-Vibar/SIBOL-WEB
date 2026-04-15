<?php

namespace App\Models;

use App\Events\DetectionUpdated;
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

    // Add this boot method to auto-broadcast
    protected static function booted()
    {
        static::created(function ($detection) {
            // Get the crop and garden info
            $crop = $detection->crop;

            if ($crop && $crop->garden) {
                // Get recent detections for this crop
                $recentDetections = DetectionResults::where('crop_id', $crop->id)
                    ->orderBy('created_at', 'desc')
                    ->limit(10)
                    ->get()
                    ->map(function($d) {
                        return [
                            'detected_class' => $d->detected_class,
                            'confidence' => $d->confidence,
                            'image_url' => $d->image_url,
                            'created_at' => $d->created_at->toISOString(),
                        ];
                    });

                // Broadcast the update with crop_id
                broadcast(new DetectionUpdated(
                    $crop->garden->id,
                    $crop->id,           // Pass the crop_id here
                    $crop->name,
                    [
                        'results' => $recentDetections,
                        'image_url' => $detection->image_url,
                    ]
                ));
            }
        });
    }

    // Relationships
    public function sensorData()
    {
        return $this->belongsTo(SensorData::class, 'sensor_data_id');
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
}
