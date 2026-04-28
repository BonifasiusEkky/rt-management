<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\PenghuniResource;
use App\Models\Penghuni;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PenghuniController extends Controller
{
    public function index(Request $request)
    {
        $query = Penghuni::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('is_archived')) {
            $query->where('is_archived', $request->boolean('is_archived'));
        } else {
            $query->where('is_archived', false);
        }

        if ($request->has('search')) {
            $query->where('nama_lengkap', 'like', '%' . $request->search . '%');
        }

        $penghunis = $query->latest()->paginate($request->get('per_page', 10));

        return PenghuniResource::collection($penghunis);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'status' => 'required|in:tetap,kontrak',
            'no_telepon' => 'required|string|max:20',
            'sudah_menikah' => 'required|boolean',
            'catatan' => 'nullable|string',
            'foto_ktp' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('foto_ktp')) {
            $path = $request->file('foto_ktp')->store('ktp', 'public');
            $validated['foto_ktp_path'] = $path;
        }

        $penghuni = Penghuni::create($validated);

        return new PenghuniResource($penghuni);
    }

    public function show(Penghuni $penghuni)
    {
        return new PenghuniResource($penghuni);
    }

    public function update(Request $request, Penghuni $penghuni)
    {
        $validated = $request->validate([
            'nama_lengkap' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|in:tetap,kontrak',
            'no_telepon' => 'sometimes|required|string|max:20',
            'sudah_menikah' => 'sometimes|required|boolean',
            'catatan' => 'nullable|string',
            'foto_ktp' => 'nullable|image|max:2048',
            'is_archived' => 'sometimes|boolean',
        ]);

        if ($request->hasFile('foto_ktp')) {
            // Hapus foto lama jika ada
            if ($penghuni->foto_ktp_path) {
                Storage::disk('public')->delete($penghuni->foto_ktp_path);
            }
            $path = $request->file('foto_ktp')->store('ktp', 'public');
            $validated['foto_ktp_path'] = $path;
        }

        $penghuni->update($validated);

        return new PenghuniResource($penghuni);
    }

    public function destroy(Penghuni $penghuni)
    {
        // Soft delete (archive)
        $penghuni->update(['is_archived' => true]);

        return response()->json([
            'message' => 'Penghuni berhasil diarsipkan'
        ]);
    }

    public function riwayat(Penghuni $penghuni)
    {
        $riwayat = $penghuni->penghunians()->with('rumah')->latest()->get();
        return response()->json([
            'data' => $riwayat
        ]);
    }
}
