<?php

namespace Tests\Feature;

use App\Models\Penghuni;
use App\Models\Penghunian;
use App\Models\Rumah;
use App\Models\Tagihan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TagihanApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_tagihan_index_requires_authentication(): void
    {
        $this->getJson('/api/v1/tagihan')->assertStatus(401);
    }

    public function test_tagihan_index_aktif_shows_partial_and_hides_fully_paid(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $periode = now()->format('Y-m');
        $periodeDate = Carbon::createFromFormat('Y-m', $periode)->startOfMonth()->toDateString();

        $penghunianPartial = $this->createPenghunian();
        Tagihan::create([
            'penghunian_id' => $penghunianPartial->id,
            'jenis' => 'satpam',
            'nominal' => 15000,
            'periode_bulan' => $periodeDate,
            'status' => 'lunas',
            'jatuh_tempo' => now()->addDays(7)->toDateString(),
            'keterangan' => null,
        ]);
        Tagihan::create([
            'penghunian_id' => $penghunianPartial->id,
            'jenis' => 'kebersihan',
            'nominal' => 20000,
            'periode_bulan' => $periodeDate,
            'status' => 'menunggu',
            'jatuh_tempo' => now()->addDays(7)->toDateString(),
            'keterangan' => null,
        ]);

        $penghunianLunas = $this->createPenghunian();
        Tagihan::create([
            'penghunian_id' => $penghunianLunas->id,
            'jenis' => 'satpam',
            'nominal' => 15000,
            'periode_bulan' => $periodeDate,
            'status' => 'lunas',
            'jatuh_tempo' => now()->addDays(7)->toDateString(),
            'keterangan' => null,
        ]);
        Tagihan::create([
            'penghunian_id' => $penghunianLunas->id,
            'jenis' => 'kebersihan',
            'nominal' => 20000,
            'periode_bulan' => $periodeDate,
            'status' => 'lunas',
            'jatuh_tempo' => now()->addDays(7)->toDateString(),
            'keterangan' => null,
        ]);

        $res = $this->getJson('/api/v1/tagihan?tab=aktif&periode=' . $periode)
            ->assertOk()
            ->assertJsonStructure([
                'data',
                'meta' => ['periode', 'total_tagihan', 'total_terkumpul', 'progress_persen'],
            ]);

        $ids = collect($res->json('data'))->pluck('penghunian_id')->all();
        $this->assertContains($penghunianPartial->id, $ids);
        $this->assertNotContains($penghunianLunas->id, $ids);

        $row = collect($res->json('data'))->firstWhere('penghunian_id', $penghunianPartial->id);
        $this->assertSame('sebagian', $row['status_keseluruhan']);
        $this->assertStringContainsString('Satpam dibayar', (string) $row['keterangan']);
        $this->assertStringContainsString('Kebersihan menunggu', (string) $row['keterangan']);
    }

    public function test_tagihan_index_lunas_only_shows_fully_paid(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $periode = now()->format('Y-m');
        $periodeDate = Carbon::createFromFormat('Y-m', $periode)->startOfMonth()->toDateString();

        $penghunianPartial = $this->createPenghunian();
        Tagihan::create([
            'penghunian_id' => $penghunianPartial->id,
            'jenis' => 'satpam',
            'nominal' => 15000,
            'periode_bulan' => $periodeDate,
            'status' => 'menunggu',
            'jatuh_tempo' => now()->addDays(7)->toDateString(),
            'keterangan' => null,
        ]);

        $penghunianLunas = $this->createPenghunian();
        Tagihan::create([
            'penghunian_id' => $penghunianLunas->id,
            'jenis' => 'satpam',
            'nominal' => 15000,
            'periode_bulan' => $periodeDate,
            'status' => 'lunas',
            'jatuh_tempo' => now()->addDays(7)->toDateString(),
            'keterangan' => null,
        ]);

        $res = $this->getJson('/api/v1/tagihan?tab=lunas&periode=' . $periode)
            ->assertOk();

        $ids = collect($res->json('data'))->pluck('penghunian_id')->all();
        $this->assertContains($penghunianLunas->id, $ids);
        $this->assertNotContains($penghunianPartial->id, $ids);

        $row = collect($res->json('data'))->firstWhere('penghunian_id', $penghunianLunas->id);
        $this->assertSame('lunas', $row['status_keseluruhan']);
    }

    public function test_tagihan_index_history_returns_only_selected_period_paid(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $periode = now()->subMonthNoOverflow()->format('Y-m');
        $periodeDate = Carbon::createFromFormat('Y-m', $periode)->startOfMonth()->toDateString();

        $penghunian = $this->createPenghunian();
        Tagihan::create([
            'penghunian_id' => $penghunian->id,
            'jenis' => 'satpam',
            'nominal' => 15000,
            'periode_bulan' => $periodeDate,
            'status' => 'lunas',
            'jatuh_tempo' => now()->addDays(7)->toDateString(),
            'keterangan' => null,
        ]);

        Tagihan::create([
            'penghunian_id' => $penghunian->id,
            'jenis' => 'kebersihan',
            'nominal' => 20000,
            'periode_bulan' => now()->subMonthsNoOverflow(2)->startOfMonth()->toDateString(),
            'status' => 'lunas',
            'jatuh_tempo' => now()->addDays(7)->toDateString(),
            'keterangan' => null,
        ]);

        $res = $this->getJson('/api/v1/tagihan?tab=history&periode=' . $periode)
            ->assertOk();

        $ids = collect($res->json('data'))->pluck('penghunian_id')->all();
        $this->assertContains($penghunian->id, $ids);

        $row = collect($res->json('data'))->firstWhere('penghunian_id', $penghunian->id);
        $this->assertSame('lunas', $row['status_keseluruhan']);
        $this->assertCount(1, $row['tagihan']);
    }

    public function test_tagihan_store_creates_custom_bill_for_active_penghunian(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $penghunian = $this->createPenghunian(['aktif' => true]);
        $periode = now()->format('Y-m');

        $payload = [
            'penghunian_id' => $penghunian->id,
            'jenis' => 'custom',
            'nominal' => 10000,
            'periode_bulan' => $periode,
            'jatuh_tempo' => now()->addDay()->toDateString(),
            'keterangan' => 'Iuran tambahan',
        ];

        $this->postJson('/api/v1/tagihan', $payload)
            ->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'penghunian_id', 'jenis', 'nominal', 'periode_bulan', 'status', 'jatuh_tempo', 'keterangan']]);

        $this->assertDatabaseHas('tagihans', [
            'penghunian_id' => $penghunian->id,
            'jenis' => 'custom',
            'status' => 'menunggu',
            'periode_bulan' => Carbon::createFromFormat('Y-m', $periode)->startOfMonth()->toDateString(),
            'keterangan' => 'Iuran tambahan',
        ]);
    }

    public function test_tagihan_store_rejects_inactive_penghunian(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $penghunian = $this->createPenghunian(['aktif' => false]);

        $payload = [
            'penghunian_id' => $penghunian->id,
            'jenis' => 'custom',
            'nominal' => 10000,
            'periode_bulan' => now()->format('Y-m'),
            'jatuh_tempo' => now()->addDay()->toDateString(),
            'keterangan' => 'Iuran tambahan',
        ];

        $this->postJson('/api/v1/tagihan', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['penghunian_id']);
    }

    private function createPenghunian(array $overrides = []): Penghunian
    {
        $rumah = Rumah::create([
            'nomor_rumah' => '01',
            'blok' => 'A',
        ]);

        $penghuni = Penghuni::create([
            'nama_lengkap' => 'Budi',
            'status' => 'tetap',
            'no_telepon' => '081234567890',
            'sudah_menikah' => false,
            'is_archived' => false,
            'catatan' => null,
        ]);

        return Penghunian::create(array_merge([
            'rumah_id' => $rumah->id,
            'penghuni_id' => $penghuni->id,
            'tanggal_masuk' => now()->subDays(10)->toDateString(),
            'tanggal_keluar' => null,
            'aktif' => true,
        ], $overrides));
    }
}
