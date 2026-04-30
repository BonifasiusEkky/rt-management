<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Pengeluaran;
use Illuminate\Http\Request;

class PengeluaranController extends Controller
{
    public function index(Request $request, \App\Services\PengeluaranService $service)
    {
        $tab = $request->query('tab', 'selesai');
        $periode = $request->query('periode', now()->format('Y-m'));
        
        if ($tab === 'pending' && $periode <= now()->format('Y-m')) {
            $service->generateForMonth($periode);
        }

        $query = Pengeluaran::query()
            ->where('status', $tab === 'pending' ? 'pending' : 'selesai');
            
        if ($periode) {
            $date = \Carbon\Carbon::parse($periode)->startOfMonth()->toDateString();
            $query->where(function($q) use ($date) {
                $q->whereDate('periode_bulan', $date)
                  ->orWhere(function($q2) use ($date) {
                      $q2->whereNull('periode_bulan')
                         ->whereMonth('tanggal', \Carbon\Carbon::parse($date)->month)
                         ->whereYear('tanggal', \Carbon\Carbon::parse($date)->year);
                  });
            });
        }

        return response()->json([
            'data' => $query->latest()->paginate(20)
        ]);
    }

    public function verify(Pengeluaran $pengeluaran)
    {
        if ($pengeluaran->status !== 'pending') {
            return response()->json(['message' => 'Pengeluaran ini sudah diverifikasi atau bukan pengeluaran rutin.'], 422);
        }

        $saldoSaatIni = $this->getSaldoSaatIni();

        if ($saldoSaatIni < $pengeluaran->nominal) {
            return response()->json([
                'message' => 'Saldo saat ini (' . number_format($saldoSaatIni, 0, ',', '.') . ') tidak cukup untuk melakukan pengeluaran ini sebesar ' . number_format($pengeluaran->nominal, 0, ',', '.') . '.',
            ], 422);
        }

        $pengeluaran->update([
            'status' => 'selesai',
            'tanggal' => now()->toDateString(),
        ]);

        return response()->json([
            'message' => 'Pengeluaran rutin berhasil diverifikasi.',
            'data' => $pengeluaran
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kategori' => 'required|string',
            'nominal' => 'required|numeric',
            'tanggal' => 'required|date',
            'berulang' => 'required|boolean',
            'deskripsi' => 'nullable|string',
        ]);

        $saldoSaatIni = $this->getSaldoSaatIni();

        if ($saldoSaatIni < $validated['nominal']) {
            return response()->json([
                'message' => 'Saldo saat ini (' . number_format($saldoSaatIni, 0, ',', '.') . ') tidak cukup untuk mencatat pengeluaran ini sebesar ' . number_format($validated['nominal'], 0, ',', '.') . '.',
            ], 422);
        }

        $validated['status'] = 'selesai'; // Manual entry always selesai
        $pengeluaran = Pengeluaran::create($validated);

        return response()->json(['data' => $pengeluaran], 201);
    }

    private function getSaldoSaatIni()
    {
        $saldoAwal = (float) \App\Models\Pengaturan::where('key', 'saldo_awal')->value('value') ?? 0;
        $totalPemasukan = \App\Models\Pembayaran::sum('jumlah_bayar');
        $totalPengeluaran = \App\Models\Pengeluaran::where('status', 'selesai')->sum('nominal');
        
        return $saldoAwal + $totalPemasukan - $totalPengeluaran;
    }

    public function update(Request $request, Pengeluaran $pengeluaran)
    {
        $validated = $request->validate([
            'kategori' => 'sometimes|required|string',
            'nominal' => 'sometimes|required|numeric',
            'tanggal' => 'sometimes|required|date',
            'berulang' => 'sometimes|required|boolean',
            'deskripsi' => 'nullable|string',
        ]);

        $pengeluaran->update($validated);

        return response()->json(['data' => $pengeluaran]);
    }

    public function destroy(Pengeluaran $pengeluaran)
    {
        $pengeluaran->delete();
        return response()->json(['message' => 'Pengeluaran dihapus']);
    }
}
