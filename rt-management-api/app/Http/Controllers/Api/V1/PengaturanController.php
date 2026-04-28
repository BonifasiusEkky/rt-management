<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Pengaturan;
use App\Models\TagihanTetap;
use Illuminate\Http\Request;

class PengaturanController extends Controller
{
    public function index()
    {
        return response()->json([
            'settings' => Pengaturan::all()->pluck('value', 'key'),
            'tarifs' => TagihanTetap::all()
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
}
