<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PembayaranResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'jumlah_bayar' => $this->jumlah_bayar,
            'tanggal_bayar' => $this->tanggal_bayar,
            'periode_dibayar' => $this->periode_dibayar,
            'metode' => $this->metode,
            'catatan' => $this->catatan,
            'dikonfirmasi_oleh' => $this->dikonfirmasi_oleh,
            'tagihans' => TagihanResource::collection($this->whenLoaded('tagihans')),
            'created_at' => $this->created_at,
        ];
    }
}
