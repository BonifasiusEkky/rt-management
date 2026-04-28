<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TagihanStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'penghunian_id' => [
                'required',
                Rule::exists('penghunians', 'id')->where(fn ($q) => $q->where('aktif', true)),
            ],
            'jenis' => 'required|in:custom',
            'nominal' => 'required|integer|min:1000',
            'periode_bulan' => 'required|date_format:Y-m',
            'jatuh_tempo' => 'required|date|after_or_equal:today',
            'keterangan' => 'required|string|max:255',
        ];
    }
}
