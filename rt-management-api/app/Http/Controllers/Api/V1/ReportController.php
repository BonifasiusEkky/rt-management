<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use App\Models\Pengeluaran;
use App\Models\Pengaturan;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'periode' => 'nullable|date_format:Y-m',
        ]);

        $periode = $validated['periode'] ?? now()->format('Y-m');
        $date = Carbon::createFromFormat('Y-m', $periode);
        
        $month = $date->month;
        $year = $date->year;

        // Pemasukan
        $pemasukan = Pembayaran::with('tagihans.penghunian.penghuni', 'tagihans.penghunian.rumah')
            ->whereMonth('tanggal_bayar', $month)
            ->whereYear('tanggal_bayar', $year)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'tanggal' => $p->tanggal_bayar,
                    'keterangan' => 'Pembayaran iuran ' . $p->tagihans->map(fn($t) => $t->jenis)->unique()->implode(', '),
                    'warga' => $p->tagihans->first()?->penghunian?->penghuni?->nama_lengkap ?? '-',
                    'rumah' => $p->tagihans->first()?->penghunian?->rumah?->nomor_rumah ?? '-',
                    'nominal' => (int) $p->jumlah_bayar,
                    'tipe' => 'pemasukan'
                ];
            });

        // Pengeluaran
        $pengeluaran = Pengeluaran::whereMonth('tanggal', $month)
            ->whereYear('tanggal', $year)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'tanggal' => $p->tanggal,
                    'keterangan' => $p->keterangan,
                    'kategori' => $p->kategori,
                    'nominal' => (int) $p->nominal,
                    'tipe' => 'pengeluaran'
                ];
            });

        // Saldo
        $saldoAwal = (float) Pengaturan::where('key', 'saldo_awal')->value('value') ?? 0;
        
        // Total sebelum bulan ini
        $totalPemasukanSebelum = Pembayaran::where('tanggal_bayar', '<', $date->startOfMonth()->toDateString())->sum('jumlah_bayar');
        $totalPengeluaranSebelum = Pengeluaran::where('tanggal', '<', $date->startOfMonth()->toDateString())->sum('nominal');
        
        $saldoAwalBulan = $saldoAwal + $totalPemasukanSebelum - $totalPengeluaranSebelum;
        
        $totalPemasukanBulanIni = $pemasukan->sum('nominal');
        $totalPengeluaranBulanIni = $pengeluaran->sum('nominal');
        
        $saldoAkhirBulan = $saldoAwalBulan + $totalPemasukanBulanIni - $totalPengeluaranBulanIni;

        return response()->json([
            'periode' => $periode,
            'summary' => [
                'saldo_awal' => (int) $saldoAwalBulan,
                'total_pemasukan' => (int) $totalPemasukanBulanIni,
                'total_pengeluaran' => (int) $totalPengeluaranBulanIni,
                'saldo_akhir' => (int) $saldoAkhirBulan,
            ],
            'details' => $pemasukan->concat($pengeluaran)->sortBy('tanggal')->values()
        ]);
    }
}
