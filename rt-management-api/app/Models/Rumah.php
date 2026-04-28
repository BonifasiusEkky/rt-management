<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rumah extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function penghunians()
    {
        return $this->hasMany(Penghunian::class);
    }

    public function penghunianAktif()
    {
        return $this->hasOne(Penghunian::class)->where('aktif', true)->with('penghuni');
    }
}
