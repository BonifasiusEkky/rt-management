<?php

namespace App\Services;

use App\Models\Pengeluaran;
use App\Models\PengeluaranTetap;
use Carbon\Carbon;

class PengeluaranService
{
    public function generateForMonth($month = null)
    {
        $periode = $month ? Carbon::parse($month)->startOfMonth() : Carbon::now()->startOfMonth();
        $tarifTetap = PengeluaranTetap::where('aktif', true)->get();
        
        $count = 0;

        foreach ($tarifTetap as $tarif) {
            // Check if already generated for this month
            $exists = Pengeluaran::where('kategori', $tarif->nama)
                ->whereDate('periode_bulan', $periode->toDateString())
                ->exists();

            if (!$exists) {
                Pengeluaran::create([
                    'kategori' => $tarif->nama,
                    'nominal' => $tarif->nominal,
                    'tanggal' => $periode->copy()->addDays(4)->toDateString(), // Default to 5th of month
                    'berulang' => true,
                    'status' => 'pending',
                    'periode_bulan' => $periode->toDateString(),
                    'deskripsi' => 'Biaya operasional rutin bulanan',
                ]);
                $count++;
            }
        }

        return $count;
    }
}
