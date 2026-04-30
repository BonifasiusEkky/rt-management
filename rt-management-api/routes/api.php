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
use App\Http\Controllers\Api\V1\PembayaranController;
use App\Http\Controllers\Api\V1\PengeluaranController;
use App\Http\Controllers\Api\V1\PengaturanController;
use App\Http\Controllers\Api\V1\DashboardController;

Route::prefix('v1')->group(function () {
    Route::get('/ping', function () {
        return response()->json(['message' => 'pong']);
    });

    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        Route::apiResource('penghuni', PenghuniController::class);
        Route::get('penghuni/{penghuni}/riwayat', [PenghuniController::class, 'riwayat']);
        Route::post('penghuni/{penghuni}/unarchive', [PenghuniController::class, 'unarchive']);

        Route::apiResource('rumah', RumahController::class);
        Route::post('rumah/{rumah}/assign', [RumahController::class, 'assign']);
        Route::post('rumah/{rumah}/kosongkan', [RumahController::class, 'kosongkan']);


        // Tagihan endpoints
        Route::get('tagihan', [\App\Http\Controllers\Api\V1\TagihanController::class, 'index']);
        Route::post('tagihan', [\App\Http\Controllers\Api\V1\TagihanController::class, 'store']);
        Route::post('tagihan/verify', [\App\Http\Controllers\Api\V1\TagihanController::class, 'verify']);

        Route::post('tagihan/generate', function (\App\Services\TagihanService $service) {
            $count = $service->generateForMonth();
            return response()->json(['message' => "Berhasil membuat {$count} tagihan baru."]);
        });

        Route::apiResource('pembayaran', PembayaranController::class);
        Route::apiResource('pengeluaran', PengeluaranController::class);
        Route::post('pengeluaran/{pengeluaran}/verify', [PengeluaranController::class, 'verify']);

        Route::get('pengaturan', [PengaturanController::class, 'index']);
        Route::put('pengaturan', [PengaturanController::class, 'updateSettings']);
        Route::put('tagihan-tetap/{tagihanTetap}', [PengaturanController::class, 'updateTarif']);
        Route::put('pengeluaran-tetap/{pengeluaranTetap}', [PengaturanController::class, 'updatePengeluaranTetap']);
        Route::post('pengeluaran-tetap', [PengaturanController::class, 'storePengeluaranTetap']);
        Route::delete('pengeluaran-tetap/{pengeluaranTetap}', [PengaturanController::class, 'destroyPengeluaranTetap']);

        Route::get('report', [\App\Http\Controllers\Api\V1\ReportController::class, 'index']);
    });
});
