<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Pengeluaran;
use Illuminate\Http\Request;

class PengeluaranController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => Pengeluaran::latest()->paginate(20)
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

        $pengeluaran = Pengeluaran::create($validated);

        return response()->json(['data' => $pengeluaran], 201);
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
