<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Penghunian extends Model
{
    use HasFactory;

    protected $table = 'penghunians';
    protected $guarded = [];

    public function rumah()
    {
        return $this->belongsTo(Rumah::class);
    }

    public function penghuni()
    {
        return $this->belongsTo(Penghuni::class);
    }

    public function tagihans()
    {
        return $this->hasMany(Tagihan::class);
    }
}
