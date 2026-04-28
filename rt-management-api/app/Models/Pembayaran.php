<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pembayaran extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function tagihans()
    {
        return $this->belongsToMany(Tagihan::class, 'pembayaran_tagihan');
    }
}
