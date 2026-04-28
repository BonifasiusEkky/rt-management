<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tagihans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('penghunian_id')->constrained('penghunians');
            $table->enum('jenis', ['satpam', 'kebersihan', 'custom']);
            $table->decimal('nominal', 15, 2);
            $table->date('periode_bulan'); // Format YYYY-MM-01
            $table->enum('status', ['menunggu', 'lunas']);
            $table->date('jatuh_tempo');
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tagihans');
    }
};
