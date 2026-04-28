<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PenghuniResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama_lengkap' => $this->nama_lengkap,
            'foto_ktp_url' => $this->foto_ktp_path ? Storage::url($this->foto_ktp_path) : null,
            'status' => $this->status,
            'no_telepon' => $this->no_telepon,
            'sudah_menikah' => (bool) $this->sudah_menikah,
            'is_archived' => (bool) $this->is_archived,
            'catatan' => $this->catatan,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
