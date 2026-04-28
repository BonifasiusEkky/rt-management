<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RumahResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nomor_rumah' => $this->nomor_rumah,
            'blok' => $this->blok,
            'label' => $this->blok . $this->nomor_rumah,
            'penghunian_aktif' => new PenghunianResource($this->whenLoaded('penghunianAktif')),
        ];
    }
}
