<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Mass assignable fields
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'department',
        'session',
        'address',
        'status',
        'profile_photo',
    ];

    /**
     * Hidden fields (API response-এ দেখাবে না)
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Casts (data type control)
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function results(): HasMany
    {
        return $this->hasMany(Result::class, 'student_id');
    }

    public function fees(): HasMany
    {
        return $this->hasMany(Fee::class, 'student_id');
    }

    public function createdNotices(): HasMany
    {
        return $this->hasMany(Notice::class, 'created_by');
    }
}
