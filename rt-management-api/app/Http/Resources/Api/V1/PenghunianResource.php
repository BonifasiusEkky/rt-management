<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Api\V1\TagihanResource;

class PenghunianResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'rumah_id' => $this->rumah_id,
            'penghuni_id' => $this->penghuni_id,
            'tanggal_masuk' => $this->tanggal_masuk,
            'tanggal_keluar' => $this->tanggal_keluar,
            'aktif' => (bool) $this->aktif,
            'penghuni' => new PenghuniResource($this->whenLoaded('penghuni')),
            'rumah' => new RumahResource($this->whenLoaded('rumah')),
            'tagihans' => TagihanResource::collection($this->whenLoaded('tagihans')),
        ];
    }
}
