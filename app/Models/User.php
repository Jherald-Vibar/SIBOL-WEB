<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
class User extends Authenticatable
{

    use HasApiTokens, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'cp_number'];

    protected $hidden = [
        'password',
    ];

     protected function casts(): array
    {
        return [

            'password' => 'hashed',
        ];
    }
}
