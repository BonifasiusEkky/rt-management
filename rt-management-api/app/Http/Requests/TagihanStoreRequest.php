<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TagihanStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mode' => 'required|in:semua,pilih',
            'penghunian_id' => 'required_if:mode,pilih|nullable|exists:penghunians,id',
            'total_nominal' => 'required_if:mode,semua|nullable|integer|min:1000',
            'nominal' => 'required_if:mode,pilih|nullable|integer|min:1000',
            'periode_bulan' => 'required|date_format:Y-m',
            'jatuh_tempo' => 'required|date|after_or_equal:today',
            'keterangan' => 'required|string|max:255',
        ];
    }
}
