<?php

namespace App\Console\Commands;

use App\Services\TagihanService;
use Illuminate\Console\Command;

class GenerateTagihanBulanan extends Command
{
    protected $signature = 'tagihan:generate {month?}';
    protected $description = 'Generate tagihan bulanan untuk semua penghunian aktif';

    public function handle(TagihanService $tagihanService)
    {
        $month = $this->argument('month');
        $this->info("Memulai generate tagihan untuk periode: " . ($month ?? 'Bulan Berjalan'));
        
        $count = $tagihanService->generateForMonth($month);
        
        $this->info("Selesai! Berhasil membuat {$count} tagihan baru.");
    }
}
