<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Default route
Route::get('/', function () {
    return view('welcome');
});

// Register API
Route::post('/register', [AuthController::class, 'register']);

// Login API
Route::post('/login', [AuthController::class, 'login']);