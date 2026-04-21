<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NoticeController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\FeeController;
use App\Http\Controllers\TeacherController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Register
Route::post('/register', [AuthController::class, 'register']);

// Login
Route::post('/login', [AuthController::class, 'login']);


/*
|--------------------------------------------------------------------------
| Protected Routes (Sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->group(function () {

    // Profile
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/profile', [AuthController::class, 'updateProfile']);

    // Notices for all authenticated users
    Route::get('/notices', [NoticeController::class, 'index']);

    /*
    |--------------------------------------------------------------------------
    | Teacher Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:teacher'])->group(function () {

        // Teacher dashboard summary
        Route::get('/teacher/dashboard-summary', [DashboardController::class, 'teacherSummary']);

        // View all students
        Route::get('/teacher/students', [TeacherController::class, 'students']);

        // Create result
        Route::post('/results', [ResultController::class, 'store']);

        // Update result
        Route::put('/results/{id}', [ResultController::class, 'update']);

        // Manage notices
        Route::post('/notices', [NoticeController::class, 'store']);
        Route::put('/notices/{notice}', [NoticeController::class, 'update']);
        Route::delete('/notices/{notice}', [NoticeController::class, 'destroy']);

        // Create fee for student
        Route::post('/fees/create/{studentId}', [FeeController::class, 'createFee']);

        // Update existing fee
        Route::put('/fees/{id}', [FeeController::class, 'updateFee']);
    });


    /*
    |--------------------------------------------------------------------------
    | Student Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:student'])->group(function () {

        // Student dashboard summary
        Route::get('/student/dashboard-summary', [DashboardController::class, 'studentSummary']);

        // View own results
        Route::get('/my-results', [ResultController::class, 'myResults']);

        // View own fee
        Route::get('/my-fee', [FeeController::class, 'myFee']);

        // View admit card info
        Route::get('/admit-card-info', [FeeController::class, 'admitCardInfo']);

        // Pay fee
        Route::post('/pay-fee/{id}', [FeeController::class, 'payFee']);

        // Download receipt PDF
        Route::get('/receipt/{id}', [FeeController::class, 'downloadReceipt']);

        // Download admit card
        Route::get('/admit-card', [FeeController::class, 'downloadAdmitCard']);
    });

});
