<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tagihan extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function penghunian()
    {
        return $this->belongsTo(Penghunian::class);
    }

    public function pembayarans()
    {
        return $this->belongsToMany(Pembayaran::class, 'pembayaran_tagihan');
    }
}
