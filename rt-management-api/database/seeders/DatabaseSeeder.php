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

        // 5. Create Tagihans (April & May 2026, satpam + kebersihan untuk yang aktif)
        $tagihanList = [];
        $periodeApril = Carbon::create(2026, 4, 1)->toDateString();
        $periodeMay = Carbon::create(2026, 5, 1)->toDateString();
        
        foreach ($penghunians as $idx => $penghunian) {
            if ($penghunian->aktif) {
                // April - Most paid, some late
                $statusApril = $idx < 14 ? 'lunas' : 'menunggu';
                
                $tagihanList[] = \App\Models\Tagihan::create([
                    'penghunian_id' => $penghunian->id,
                    'jenis' => 'satpam',
                    'nominal' => 100000,
                    'periode_bulan' => $periodeApril,
                    'status' => $statusApril,
                    'jatuh_tempo' => Carbon::create(2026, 4, 10)->toDateString(),
                    'keterangan' => null,
                ]);

                $tagihanList[] = \App\Models\Tagihan::create([
                    'penghunian_id' => $penghunian->id,
                    'jenis' => 'kebersihan',
                    'nominal' => 15000,
                    'periode_bulan' => $periodeApril,
                    'status' => $statusApril,
                    'jatuh_tempo' => Carbon::create(2026, 4, 10)->toDateString(),
                    'keterangan' => null,
                ]);

                // May - All unpaid (menunggu)
                $tagihanList[] = \App\Models\Tagihan::create([
                    'penghunian_id' => $penghunian->id,
                    'jenis' => 'satpam',
                    'nominal' => 100000,
                    'periode_bulan' => $periodeMay,
                    'status' => 'menunggu',
                    'jatuh_tempo' => Carbon::create(2026, 5, 10)->toDateString(),
                    'keterangan' => null,
                ]);

                $tagihanList[] = \App\Models\Tagihan::create([
                    'penghunian_id' => $penghunian->id,
                    'jenis' => 'kebersihan',
                    'nominal' => 15000,
                    'periode_bulan' => $periodeMay,
                    'status' => 'menunggu',
                    'jatuh_tempo' => Carbon::create(2026, 5, 10)->toDateString(),
                    'keterangan' => null,
                ]);
            }
        }

        // 6. Create Pembayarans (linked to April lunas tagihans)
        $paidTagihans = array_filter($tagihanList, fn($t) => $t->status === 'lunas');
        $groupedByPenghunian = collect($paidTagihans)->groupBy('penghunian_id');
        
        foreach ($groupedByPenghunian as $penghunianId => $tagihanPerPenghunian) {
            $periodeGroups = collect($tagihanPerPenghunian)->groupBy('periode_bulan');
            foreach ($periodeGroups as $periode => $tagihanPerPeriode) {
                if (count($tagihanPerPeriode) > 0) {
                    $totalNominal = $tagihanPerPeriode->sum('nominal');
                    $pembayaran = \App\Models\Pembayaran::create([
                        'jumlah_bayar' => $totalNominal,
                        'tanggal_bayar' => Carbon::parse($periode)->addDays(5)->toDateString(),
                        'periode_dibayar' => 1,
                        'metode' => 'transfer',
                        'catatan' => 'Pembayaran April',
                        'dikonfirmasi_oleh' => 'admin@rt.local',
                    ]);
                    foreach ($tagihanPerPeriode as $tagihan) {
                        $pembayaran->tagihans()->attach($tagihan->id);
                    }
                }
            }
        }

        // 7. Create Pengeluarans (various expenses)
        $pengeluaranKategori = [
            ['kategori' => 'Gaji Satpam', 'nominal' => 1000000, 'berulang' => true, 'deskripsi' => 'Gaji bulanan satpam'],
            ['kategori' => 'Listrik Pos Satpam', 'nominal' => 150000, 'berulang' => true, 'deskripsi' => 'Biaya token listrik pos satpam'],
            ['kategori' => 'Pemeliharaan Taman', 'nominal' => 300000, 'berulang' => true, 'deskripsi' => 'Pemeliharaan & penyiraman taman'],
        ];

        foreach ($pengeluaranKategori as $item) {
            for ($month = 2; $month <= 4; $month++) {
                \App\Models\Pengeluaran::create([
                    'kategori' => $item['kategori'],
                    'nominal' => $item['nominal'],
                    'tanggal' => Carbon::create(2026, $month, 5)->toDateString(),
                    'berulang' => $item['berulang'],
                    'deskripsi' => $item['deskripsi'],
                ]);
            }
        }

        // 8. Pengaturan (Opening Balance & Nama RT)
        \App\Models\Pengaturan::create([
            'key' => 'saldo_awal',
            'value' => '15000000', // Positive cash flow
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
