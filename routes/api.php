<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ShipmentController;
use App\Http\Controllers\TrackingController;
use App\Http\Controllers\TruckController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/dashboard', [DashboardController::class, 'stats']);

    Route::apiResource('trucks', TruckController::class);
    Route::apiResource('users', UserController::class);
    
    // Role-based user routes
    Route::get('/customers', [UserController::class, 'index'])->defaults('role', 'customer');
    Route::get('/drivers', [UserController::class, 'index'])->defaults('role', 'driver');
    
    Route::apiResource('invoices', InvoiceController::class);

    Route::apiResource('shipments', ShipmentController::class)->except('destroy', 'update');
    Route::patch('/shipments/{shipment}/status', [ShipmentController::class, 'updateStatus']);

    Route::prefix('tracking')->group(function () {
        Route::post('/update', [TrackingController::class, 'update']);
        Route::get('/all', [TrackingController::class, 'allPositions']);
        Route::get('/{truckId}/history', [TrackingController::class, 'history']);
    });
});

