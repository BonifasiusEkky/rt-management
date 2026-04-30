<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Pengaturan;
use App\Models\TagihanTetap;
use App\Models\PengeluaranTetap;
use Illuminate\Http\Request;

class PengaturanController extends Controller
{
    public function index()
    {
        return response()->json([
            'settings' => Pengaturan::all()->pluck('value', 'key'),
            'tarifs' => TagihanTetap::all(),
            'pengeluaran_tetap' => PengeluaranTetap::all()
        ]);
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($validated['settings'] as $key => $value) {
            Pengaturan::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return response()->json(['message' => 'Pengaturan diperbarui']);
    }

    public function updateTarif(Request $request, TagihanTetap $tagihanTetap)
    {
        $validated = $request->validate([
            'nominal' => 'required|numeric',
            'aktif' => 'required|boolean',
        ]);

        $tagihanTetap->update($validated);

        return response()->json(['message' => 'Tarif diperbarui']);
    }

    public function updatePengeluaranTetap(Request $request, PengeluaranTetap $pengeluaranTetap)
    {
        $validated = $request->validate([
            'nama' => 'sometimes|required|string',
            'nominal' => 'sometimes|required|numeric',
            'aktif' => 'sometimes|required|boolean',
        ]);

        $pengeluaranTetap->update($validated);

        return response()->json(['message' => 'Pengeluaran rutin diperbarui']);
    }

    public function storePengeluaranTetap(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string',
            'nominal' => 'required|numeric',
            'aktif' => 'required|boolean',
        ]);

        $item = PengeluaranTetap::create($validated);

        return response()->json([
            'message' => 'Pengeluaran rutin baru ditambahkan',
            'data' => $item
        ], 201);
    }

    public function destroyPengeluaranTetap(PengeluaranTetap $pengeluaranTetap)
    {
        $pengeluaranTetap->delete();
        return response()->json(['message' => 'Pengeluaran rutin dihapus']);
    }
}
