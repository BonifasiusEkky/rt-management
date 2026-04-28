<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\PembayaranResource;
use App\Models\Pembayaran;
use App\Models\Tagihan;
use App\Models\TagihanTetap;
use App\Models\Penghunian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PembayaranController extends Controller
{
    public function index()
    {
        $pembayarans = Pembayaran::with('tagihans.penghunian.penghuni', 'tagihans.penghunian.rumah')
            ->latest()
            ->paginate(15);
            
        return PembayaranResource::collection($pembayarans);
    }

    public function store(Request $request)
    {
        $request->validate([
            'penghunian_id' => 'required|exists:penghunians,id',
            'jenis_tagihan' => 'required|array', // e.g. ['satpam', 'kebersihan']
            'periode_bulan' => 'required|integer|min:1|max:12', // bayar berapa bulan
            'metode' => 'required|in:tunai,transfer',
            'tanggal_bayar' => 'required|date',
            'catatan' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request) {
            $penghunian = Penghunian::findOrFail($request->penghunian_id);
            $totalBayar = 0;
            $tagihanIds = [];

            foreach ($request->jenis_tagihan as $jenis) {
                $tarif = TagihanTetap::where('nama', 'like', $jenis)->first();
                $nominal = $tarif ? $tarif->nominal : 0;
                
                $startPeriode = Carbon::now()->startOfMonth();

                for ($i = 0; $i < $request->periode_bulan; $i++) {
                    $periodeCurrent = $startPeriode->copy()->addMonths($i);
                    
                    // Cari tagihan eksisting
                    $tagihan = Tagihan::where('penghunian_id', $penghunian->id)
                        ->where('jenis', strtolower($jenis))
                        ->where('periode_bulan', $periodeCurrent->format('Y-m-d'))
                        ->first();

                    if ($tagihan) {
                        if ($tagihan->status === 'menunggu') {
                            $tagihan->update(['status' => 'lunas']);
                            $totalBayar += $tagihan->nominal;
                            $tagihanIds[] = $tagihan->id;
                        }
                        // Jika sudah lunas, skip (sudah dibayar sebelumnya)
                    } else {
                        // Buat tagihan baru langsung lunas (bayar di muka)
                        $newTagihan = Tagihan::create([
                            'penghunian_id' => $penghunian->id,
                            'jenis' => strtolower($jenis),
                            'nominal' => $nominal,
                            'periode_bulan' => $periodeCurrent->format('Y-m-d'),
                            'status' => 'lunas',
                            'jatuh_tempo' => $periodeCurrent->copy()->addDays(10)->format('Y-m-d'),
                            'keterangan' => "Bayar di muka: {$jenis} periode " . $periodeCurrent->format('F Y'),
                        ]);
                        $totalBayar += $newTagihan->nominal;
                        $tagihanIds[] = $newTagihan->id;
                    }
                }
            }

            if (empty($tagihanIds)) {
                return response()->json(['message' => 'Tidak ada tagihan yang perlu dibayar untuk periode ini.'], 422);
            }

            $pembayaran = Pembayaran::create([
                'jumlah_bayar' => $totalBayar,
                'tanggal_bayar' => $request->tanggal_bayar,
                'periode_dibayar' => $request->periode_bulan,
                'metode' => $request->metode,
                'catatan' => $request->catatan,
                'dikonfirmasi_oleh' => $request->user()->name,
            ]);

            $pembayaran->tagihans()->attach($tagihanIds);

            return new PembayaranResource($pembayaran->load('tagihans'));
        });
    }

    public function show(Pembayaran $pembayaran)
    {
        return new PembayaranResource($pembayaran->load('tagihans.penghunian.penghuni'));
    }
}
