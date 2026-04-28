<?php

namespace App\Services;

use App\Models\Penghunian;
use App\Models\Tagihan;
use App\Models\TagihanTetap;
use Carbon\Carbon;

class TagihanService
{
    public function generateForMonth($month = null)
    {
        $periode = $month ? Carbon::parse($month)->startOfMonth() : Carbon::now()->startOfMonth();
        $tarifTetap = TagihanTetap::where('aktif', true)->get();
        $penghunianAktif = Penghunian::where('aktif', true)->get();
        
        $count = 0;

        foreach ($penghunianAktif as $penghunian) {
            foreach ($tarifTetap as $tarif) {
                // Cek apakah sudah ada tagihan untuk periode ini
                $exists = Tagihan::where('penghunian_id', $penghunian->id)
                    ->where('jenis', strtolower($tarif->nama))
                    ->where('periode_bulan', $periode->format('Y-m-d'))
                    ->exists();

                if (!$exists) {
                    Tagihan::create([
                        'penghunian_id' => $penghunian->id,
                        'jenis' => strtolower($tarif->nama),
                        'nominal' => $tarif->nominal,
                        'periode_bulan' => $periode->format('Y-m-d'),
                        'status' => 'menunggu',
                        'jatuh_tempo' => $periode->copy()->addDays(10)->format('Y-m-d'), // Jatuh tempo tanggal 10
                        'keterangan' => "Tagihan rutin {$tarif->nama} periode " . $periode->format('F Y'),
                    ]);
                    $count++;
                }
            }
        }

        return $count;
    }
}
