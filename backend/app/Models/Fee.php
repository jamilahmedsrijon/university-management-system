<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Fee extends Model
{
    protected $fillable = [
        'student_id',
        'semester',
        'amount',
        'status',
        'payment_method'
    ];
}