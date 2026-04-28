<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\RumahResource;
use App\Http\Resources\Api\V1\PenghunianResource;
use App\Models\Rumah;
use App\Models\Penghunian;
use App\Models\Penghuni;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RumahController extends Controller
{
    public function index()
    {
        $rumahs = Rumah::with('penghunianAktif')->get();
        return RumahResource::collection($rumahs);
    }

    public function show(Rumah $rumah)
    {
        $rumah->load(['penghunianAktif', 'penghunians.penghuni']);
        return new RumahResource($rumah);
    }

    public function assign(Request $request, Rumah $rumah)
    {
        $request->validate([
            'penghuni_id' => 'required|exists:penghuni,id',
            'tanggal_masuk' => 'required|date',
        ]);

        return DB::transaction(function () use ($request, $rumah) {
            // 1. Kosongkan penghuni aktif jika ada
            $rumah->penghunianAktif()->update([
                'aktif' => false,
                'tanggal_keluar' => $request->tanggal_masuk,
            ]);

            // 2. Buat penghunian baru
            $penghunian = Penghunian::create([
                'rumah_id' => $rumah->id,
                'penghuni_id' => $request->penghuni_id,
                'tanggal_masuk' => $request->tanggal_masuk,
                'aktif' => true,
            ]);

            return new PenghunianResource($penghunian);
        });
    }

    public function kosongkan(Request $request, Rumah $rumah)
    {
        $request->validate([
            'tanggal_keluar' => 'required|date',
        ]);

        $rumah->penghunianAktif()->update([
            'aktif' => false,
            'tanggal_keluar' => $request->tanggal_keluar,
        ]);

        return response()->json(['message' => 'Rumah telah dikosongkan']);
    }
}
