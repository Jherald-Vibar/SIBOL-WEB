<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Crop extends Model
{
    protected $fillable = [
        'user_id',
        'garden_id',
        'crop_profile_id',
        'name',
        'variety',
        'image',
        'planted_at'
    ];

    protected $casts = [
        'planted_at' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function garden()
    {
        return $this->belongsTo(Garden::class);
    }

    public function CropProfile()
    {
        return $this->belongsTo(CropProfile::class, 'crop_profile_id');
    }
}
