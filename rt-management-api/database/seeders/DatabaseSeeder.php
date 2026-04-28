<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Rumah (20 unit: A1-A10, B1-B10)
        $bloks = ['A', 'B'];
        foreach ($bloks as $blok) {
            for ($i = 1; $i <= 10; $i++) {
                \App\Models\Rumah::create([
                    'nomor_rumah' => (string) $i,
                    'blok' => $blok,
                ]);
            }
        }

        // 2. Tagihan Tetap
        \App\Models\TagihanTetap::create([
            'nama' => 'Satpam',
            'nominal' => 100000,
            'periode' => 'bulanan',
            'aktif' => true,
        ]);
        \App\Models\TagihanTetap::create([
            'nama' => 'Kebersihan',
            'nominal' => 15000,
            'periode' => 'bulanan',
            'aktif' => true,
        ]);

        // 3. Pengaturan (Opening Balance & Nama RT)
        \App\Models\Pengaturan::create([
            'key' => 'saldo_awal',
            'value' => '5000000',
        ]);
        \App\Models\Pengaturan::create([
            'key' => 'nama_perumahan',
            'value' => 'Elite Residence',
        ]);

        // 4. Default Admin User (untuk tahap Auth nanti)
        \App\Models\User::create([
            'name' => 'Ketua RT',
            'email' => 'admin@rt.local',
            'password' => bcrypt('password'),
        ]);
    }
}
