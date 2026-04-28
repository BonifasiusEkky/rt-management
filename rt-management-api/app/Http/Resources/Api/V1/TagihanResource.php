<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TagihanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'penghunian_id' => $this->penghunian_id,
            'jenis' => $this->jenis,
            'nominal' => $this->nominal,
            'periode_bulan' => $this->periode_bulan,
            'status' => $this->status,
            'jatuh_tempo' => $this->jatuh_tempo,
            'keterangan' => $this->keterangan,
            'penghunian' => new PenghunianResource($this->whenLoaded('penghunian')),
        ];
    }
}
