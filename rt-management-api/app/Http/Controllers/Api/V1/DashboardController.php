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

        // Chart Data (Full Calendar Year)
        $chartData = [];
        for ($m = 1; $m <= 12; $m++) {
            $month = Carbon::create($now->year, $m, 1);
            
            $in = Pembayaran::whereMonth('tanggal_bayar', $m)
                ->whereYear('tanggal_bayar', $now->year)
                ->sum('jumlah_bayar');
                
            $out = Pengeluaran::whereMonth('tanggal', $m)
                ->whereYear('tanggal', $now->year)
                ->sum('nominal');
                
            $chartData[] = [
                'name' => $month->format('M'),
                'pemasukan' => (int) $in,
                'pengeluaran' => (int) $out,
            ];
        }

        // Recent Activity (Combined Payments & Expenses)
        $recentPembayaran = Pembayaran::with('tagihans.penghunian.penghuni')
            ->orderBy('tanggal_bayar', 'desc')
            ->orderBy('id', 'desc')
            ->take(10)
            ->get()
            ->map(function($p) {
                $jenis = $p->tagihans->map(fn($t) => $t->jenis)->unique()->implode(', ');
                return [
                    'id' => 'p-' . $p->id,
                    'tipe' => 'pemasukan',
                    'tanggal' => $p->tanggal_bayar,
                    'keterangan' => 'Pembayaran iuran ' . ($jenis ?: 'Umum'),
                    'nama' => $p->tagihans->first()?->penghunian->penghuni->nama_lengkap ?? 'Warga',
                    'nominal' => (int) $p->jumlah_bayar,
                    'raw_id' => $p->id
                ];
            });

        $recentPengeluaran = Pengeluaran::orderBy('tanggal', 'desc')
            ->orderBy('id', 'desc')
            ->take(10)
            ->get()
            ->map(function($p) {
                return [
                    'id' => 'e-' . $p->id,
                    'tipe' => 'pengeluaran',
                    'tanggal' => $p->tanggal,
                    'keterangan' => $p->keterangan,
                    'nama' => 'Operational',
                    'nominal' => (int) $p->nominal,
                    'raw_id' => $p->id
                ];
            });

        $recentActivity = $recentPembayaran->concat($recentPengeluaran)
            ->sort(function($a, $b) {
                if ($a['tanggal'] === $b['tanggal']) {
                    return $b['raw_id'] <=> $a['raw_id'];
                }
                return $b['tanggal'] <=> $a['tanggal'];
            })
            ->take(8)
            ->values();

        return response()->json([
            'stats' => [
                'total_warga' => $totalWarga,
                'okupansi' => round(($rumahTerisi / $totalRumah) * 100, 1),
                'pemasukan_bulan_ini' => (int) $pemasukanBulanIni,
                'pengeluaran_bulan_ini' => (int) $pengeluaranBulanIni,
                'saldo_saat_ini' => (int) $saldoSaatIni,
            ],
            'chart' => $chartData,
            'recent_activity' => $recentActivity
        ]);
    }
}
