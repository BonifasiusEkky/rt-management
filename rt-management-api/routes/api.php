<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\PenghuniController;
use App\Http\Controllers\Api\V1\RumahController;

Route::prefix('v1')->group(function () {
    Route::get('/ping', function () {
        return response()->json(['message' => 'pong']);
    });

    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        Route::apiResource('penghuni', PenghuniController::class);
        Route::get('penghuni/{penghuni}/riwayat', [PenghuniController::class, 'riwayat']);

        Route::get('rumah', [RumahController::class, 'index']);
        Route::get('rumah/{rumah}', [RumahController::class, 'show']);
        Route::post('rumah/{rumah}/assign', [RumahController::class, 'assign']);
        Route::post('rumah/{rumah}/kosongkan', [RumahController::class, 'kosongkan']);
    });
});
