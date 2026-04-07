<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
class User extends Authenticatable
{

    use HasApiTokens, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'cp_number', 'google_id', 'image'];

    protected $hidden = [
        'password',
    ];

    public function gardens()
    {
        return $this->hasMany(Garden::class);
    }

    public function notifications() {
        return $this->hasMany(Notification::class);
    }

     protected function casts(): array
    {
        return [

            'password' => 'hashed',
        ];
    }
}
