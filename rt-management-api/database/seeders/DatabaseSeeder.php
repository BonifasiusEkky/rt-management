<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create 20 Rumah (A1-A10, B1-B10)
        $rumahs = [];
        $bloks = ['A', 'B'];
        foreach ($bloks as $blok) {
            for ($i = 1; $i <= 10; $i++) {
                $rumahs[] = \App\Models\Rumah::create([
                    'nomor_rumah' => (string) $i,
                    'blok' => $blok,
                ]);
            }
        }

        // 2. Create Tagihan Tetap (Satpam + Kebersihan)
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

        // 3. Create 20 Penghuni (15 tetap + 5 kontrak)
        $penghuniTetap = [];
        $namaListTetap = [
            'Budi Santoso', 'Siti Nurhaliza', 'Ahmad Wijaya', 'Rina Margaretta',
            'Dedi Gunawan', 'Lina Susanto', 'Hendra Pratama', 'Maya Kusuma',
            'Rinto Harahap', 'Suhana Berlian', 'Joko Supriyanto', 'Endang Sulistyo',
            'Bambang Hartono', 'Ratna Dewi', 'Suresh Kumar',
        ];
        foreach ($namaListTetap as $i => $nama) {
            $penghuniTetap[] = \App\Models\Penghuni::create([
                'nama_lengkap' => $nama,
                'status' => 'tetap',
                'no_telepon' => '0812' . str_pad($i + 1, 8, '0', STR_PAD_LEFT),
                'sudah_menikah' => $i % 3 !== 0 ? true : false,
                'is_archived' => false,
                'catatan' => null,
            ]);
        }

        $penghuniKontrak = [];
        $namaListKontrak = [
            'Tommy Suherman', 'Cindy Lim', 'Kevin Wijaya', 'Diana Santoso', 'Eko Prasetyo',
        ];
        foreach ($namaListKontrak as $i => $nama) {
            $penghuniKontrak[] = \App\Models\Penghuni::create([
                'nama_lengkap' => $nama,
                'status' => 'kontrak',
                'no_telepon' => '0898' . str_pad($i + 1, 8, '0', STR_PAD_LEFT),
                'sudah_menikah' => $i % 2 === 0 ? true : false,
                'is_archived' => false,
                'catatan' => null,
            ]);
        }

        // 4. Create Penghunians: 15 tetap aktif + 5 kontrak (2-3 aktif, 2-3 kosong)
        $penghunians = [];
        $tanggalMasuk = Carbon::create(2023, 1, 1);

        // 15 tetap di rumah A1-A10 & B1-B5
        for ($i = 0; $i < 15; $i++) {
            $penghunians[] = \App\Models\Penghunian::create([
                'rumah_id' => $rumahs[$i]->id,
                'penghuni_id' => $penghuniTetap[$i]->id,
                'tanggal_masuk' => $tanggalMasuk->copy(),
                'tanggal_keluar' => null,
                'aktif' => true,
            ]);
        }

        // 5 kontrak di B6-B10: 2 aktif, 3 sudah keluar
        for ($i = 0; $i < 5; $i++) {
            if ($i < 2) {
                // 2 kontrak aktif
                $penghunians[] = \App\Models\Penghunian::create([
                    'rumah_id' => $rumahs[15 + $i]->id,
                    'penghuni_id' => $penghuniKontrak[$i]->id,
                    'tanggal_masuk' => $tanggalMasuk->copy()->addMonths($i),
                    'tanggal_keluar' => null,
                    'aktif' => true,
                ]);
            } else {
                // 3 kontrak sudah keluar
                $penghunians[] = \App\Models\Penghunian::create([
                    'rumah_id' => $rumahs[15 + $i]->id,
                    'penghuni_id' => $penghuniKontrak[$i]->id,
                    'tanggal_masuk' => $tanggalMasuk->copy()->subMonths(3),
                    'tanggal_keluar' => $tanggalMasuk->copy()->subMonths(1),
                    'aktif' => false,
                ]);
            }
        }

        // 5. Create Tagihans for history (Jan-Mar 2026)
        $tagihanList = [];
        for ($m = 1; $m <= 3; $m++) {
            $periode = Carbon::create(2026, $m, 1)->toDateString();
            foreach ($penghunians as $idx => $penghunian) {
                if ($penghunian->aktif) {
                    $tagihanList[] = \App\Models\Tagihan::create([
                        'penghunian_id' => $penghunian->id,
                        'jenis' => 'satpam',
                        'nominal' => 100000,
                        'periode_bulan' => $periode,
                        'status' => 'lunas',
                        'jatuh_tempo' => Carbon::create(2026, $m, 10)->toDateString(),
                    ]);
                    $tagihanList[] = \App\Models\Tagihan::create([
                        'penghunian_id' => $penghunian->id,
                        'jenis' => 'kebersihan',
                        'nominal' => 15000,
                        'periode_bulan' => $periode,
                        'status' => 'lunas',
                        'jatuh_tempo' => Carbon::create(2026, $m, 10)->toDateString(),
                    ]);
                }
            }
        }

        // 6. Create Pembayarans for historical tagihans
        foreach ($tagihanList as $tagihan) {
            $pembayaran = \App\Models\Pembayaran::create([
                'jumlah_bayar' => $tagihan->nominal,
                'tanggal_bayar' => Carbon::parse($tagihan->periode_bulan)->addDays(rand(1, 10))->toDateString(),
                'periode_dibayar' => 1,
                'metode' => rand(0, 1) ? 'transfer' : 'tunai',
                'catatan' => 'Pembayaran rutin ' . $tagihan->jenis,
                'dikonfirmasi_oleh' => 'admin@rt.local',
            ]);
            $pembayaran->tagihans()->attach($tagihan->id);
        }

        // 7. Create Pengeluarans for history (Jan-Mar 2026)
        $templates = [
            ['nama' => 'Gaji Satpam', 'nominal' => 1000000],
            ['nama' => 'Listrik Pos Satpam', 'nominal' => 150000],
        ];

        for ($m = 1; $m <= 3; $m++) {
            $periode = Carbon::create(2026, $m, 1)->toDateString();
            foreach ($templates as $item) {
                \App\Models\Pengeluaran::create([
                    'kategori' => $item['nama'],
                    'nominal' => $item['nominal'],
                    'tanggal' => Carbon::create(2026, $m, 5)->toDateString(),
                    'berulang' => true,
                    'status' => 'selesai',
                    'periode_bulan' => $periode,
                    'deskripsi' => 'Pengeluaran rutin bulanan',
                ]);
            }
        }

        // 8. Pengeluaran Tetap (Recurring Templates for dynamic generation)
        \App\Models\PengeluaranTetap::create([
            'nama' => 'Gaji Satpam',
            'nominal' => 1000000,
            'aktif' => true,
        ]);
        \App\Models\PengeluaranTetap::create([
            'nama' => 'Listrik Pos Satpam',
            'nominal' => 150000,
            'aktif' => true,
        ]);

        // 9. Pengaturan (Opening Balance & Nama RT)
        \App\Models\Pengaturan::create([
            'key' => 'saldo_awal',
            'value' => '1000000', // Set to 1 million
        ]);
        \App\Models\Pengaturan::create([
            'key' => 'nama_perumahan',
            'value' => 'Elite Residence',
        ]);

        // 9. Default Admin User
        \App\Models\User::create([
            'name' => 'Ketua RT',
            'email' => 'admin@rt.local',
            'password' => bcrypt('password'),
        ]);
    }
}
