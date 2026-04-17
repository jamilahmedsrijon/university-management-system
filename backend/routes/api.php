<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\FeeController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {

    // Teacher routes
    Route::middleware(['role:teacher'])->group(function () {

        // Result management
        Route::post('/results', [ResultController::class, 'store']);
        Route::put('/results/{id}', [ResultController::class, 'update']);

        // Fee management
        Route::post('/fees/create/{studentId}', [FeeController::class, 'createFee']);
    });

    // Student routes
    Route::middleware(['role:student'])->group(function () {

        // Result
        Route::get('/my-results', [ResultController::class, 'myResults']);

        // Fee
        Route::get('/my-fee', [FeeController::class, 'myFee']);
        Route::post('/pay-fee/{id}', [FeeController::class, 'payFee']);

        // Receipt PDF
        Route::get('/receipt/{id}', [FeeController::class, 'downloadReceipt']);

        // Admit Card PDF
        Route::get('/admit-card', [FeeController::class, 'downloadAdmitCard']);
    });

});