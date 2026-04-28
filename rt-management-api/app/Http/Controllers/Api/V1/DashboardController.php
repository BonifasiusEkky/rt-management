<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Penghuni;
use App\Models\Rumah;
use App\Models\Pembayaran;
use App\Models\Pengeluaran;
use App\Models\Pengaturan;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $now = Carbon::now();
        
        // Stats
        $totalWarga = Penghuni::where('is_archived', false)->count();
        $totalRumah = Rumah::count();
        $rumahTerisi = Rumah::has('penghunianAktif')->count();
        
        $pemasukanBulanIni = Pembayaran::whereMonth('tanggal_bayar', $now->month)
            ->whereYear('tanggal_bayar', $now->year)
            ->sum('jumlah_bayar');
            
        $pengeluaranBulanIni = Pengeluaran::whereMonth('tanggal', $now->month)
            ->whereYear('tanggal', $now->year)
            ->sum('nominal');

        $saldoAwal = (float) Pengaturan::where('key', 'saldo_awal')->value('value') ?? 0;
        $totalPemasukan = Pembayaran::sum('jumlah_bayar');
        $totalPengeluaran = Pengeluaran::sum('nominal');
        $saldoSaatIni = $saldoAwal + $totalPemasukan - $totalPengeluaran;

        // Chart Data (Last 6 Months)
        $chartData = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            
            $in = Pembayaran::whereMonth('tanggal_bayar', $month->month)
                ->whereYear('tanggal_bayar', $month->year)
                ->sum('jumlah_bayar');
                
            $out = Pengeluaran::whereMonth('tanggal', $month->month)
                ->whereYear('tanggal', $month->year)
                ->sum('nominal');
                
            $chartData[] = [
                'name' => $month->format('M'),
                'pemasukan' => (int) $in,
                'pengeluaran' => (int) $out,
            ];
        }

        return response()->json([
            'stats' => [
                'total_warga' => $totalWarga,
                'okupansi' => round(($rumahTerisi / $totalRumah) * 100, 1),
                'pemasukan_bulan_ini' => (int) $pemasukanBulanIni,
                'pengeluaran_bulan_ini' => (int) $pengeluaranBulanIni,
                'saldo_saat_ini' => (int) $saldoSaatIni,
            ],
            'chart' => $chartData,
            'recent_pembayaran' => Pembayaran::with('tagihans.penghunian.penghuni')->latest()->take(5)->get()
        ]);
    }
}
