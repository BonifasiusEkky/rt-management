<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\TagihanStoreRequest;
use App\Models\Tagihan;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class TagihanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, \App\Services\TagihanService $tagihanService)
    {
        $validated = $request->validate([
            'tab' => 'nullable|in:aktif,tunggakan,lunas,history',
            'periode' => 'nullable|date_format:Y-m',
        ]);

        $periode = $validated['periode'] ?? now()->format('Y-m');
        $tab = $validated['tab'] ?? 'aktif';

        $periodeStart = Carbon::createFromFormat('Y-m', $periode)->startOfMonth();
        $periodeDate = $periodeStart->toDateString();

        // Auto-generate for requested month if it's not in the future
        if ($tab === 'aktif' && $periode <= now()->format('Y-m')) {
            $tagihanService->generateForMonth($periode);
        }

        $query = Tagihan::query()->with(['penghunian.penghuni', 'penghunian.rumah']);

        switch ($tab) {
            case 'aktif':
                $query
                    ->whereDate('periode_bulan', $periodeDate);
                break;

            case 'tunggakan':
                $query
                    ->whereDate('periode_bulan', '<', $periodeDate)
                    ->where('status', 'menunggu');
                break;

            case 'lunas':
                $query
                    ->whereDate('periode_bulan', $periodeDate);
                break;

            case 'history':
                $query
                    ->whereDate('periode_bulan', $periodeDate)
                    ->where('status', 'lunas');
                break;
        }

        $tagihans = $query->get();

        /** @var Collection<int, Collection<int, Tagihan>> $grouped */
        $grouped = $tagihans->groupBy(function ($tagihan) {
            return $tagihan->penghunian_id . '_' . ($tagihan->jenis === 'custom' ? 'custom' : 'tetap');
        });

        $penghunianIds = $tagihans->pluck('penghunian_id')->unique()->values()->all();

        $tunggakanBulanMap = collect();
        if (!empty($penghunianIds) && in_array($tab, ['aktif', 'lunas'], true)) {
            $tunggakanBulanMap = Tagihan::query()
                ->selectRaw("penghunian_id, CASE WHEN jenis = 'custom' THEN 'custom' ELSE 'tetap' END as kelompok_jenis, COUNT(DISTINCT periode_bulan) as bulan_tunggakan")
                ->whereIn('penghunian_id', $penghunianIds)
                ->whereDate('periode_bulan', '<', $periodeDate)
                ->where('status', 'menunggu')
                ->groupBy('penghunian_id', \Illuminate\Support\Facades\DB::raw("CASE WHEN jenis = 'custom' THEN 'custom' ELSE 'tetap' END"))
                ->get()
                ->keyBy(function ($item) {
                    return $item->penghunian_id . '_' . $item->kelompok_jenis;
                });
        }

        $data = $grouped->map(function (Collection $items, $groupKey) use ($tab, $tunggakanBulanMap, $periodeDate) {
            /** @var Tagihan $first */
            $first = $items->first();

            $penghunian = $first->penghunian;
            $rumah = $penghunian?->rumah;
            $penghuni = $penghunian?->penghuni;
            $isCustom = str_ends_with($groupKey, '_custom');

            $totalNominal = (int) round((float) $items->sum('nominal'));

            $tagihanArr = $items
                ->map(fn (Tagihan $t) => [
                    'id' => $t->id,
                    'jenis' => $t->jenis,
                    'nominal' => (int) round((float) $t->nominal),
                    'status' => $t->status,
                ])
                ->values();

            $uniqueStatuses = $items->pluck('status')->unique()->values();

            $statusKeseluruhan = 'menunggu';
            if ($tab === 'tunggakan') {
                $statusKeseluruhan = 'tunggakan';
            } else {
                $bulanTunggakan = (int) ($tunggakanBulanMap[$groupKey]->bulan_tunggakan ?? 0);
                if ($bulanTunggakan > 0) {
                    $statusKeseluruhan = 'tunggakan';
                } elseif ($uniqueStatuses->count() === 1) {
                    $statusKeseluruhan = (string) $uniqueStatuses->first();
                } else {
                    $statusKeseluruhan = 'sebagian';
                }
            }

            $keterangan = null;
            if ($isCustom) {
                // Combine all custom descriptions
                $keterangan = $items->pluck('keterangan')->filter()->unique()->implode(' + ');
                if (empty($keterangan)) {
                    $keterangan = 'Tagihan Custom';
                }
                
                if ($statusKeseluruhan === 'tunggakan') {
                    $bulanTunggakan = 0;
                    if ($tab === 'tunggakan') {
                        $bulanTunggakan = (int) $items->pluck('periode_bulan')->map(fn ($d) => Carbon::parse($d)->format('Y-m'))
                            ->unique()
                            ->count();
                    } else {
                        $bulanTunggakan = (int) ($tunggakanBulanMap[$groupKey]->bulan_tunggakan ?? 0);
                    }
                    if ($bulanTunggakan > 0) {
                        $keterangan = "Tunggakan {$bulanTunggakan} bln - " . $keterangan;
                    } else {
                        $keterangan = "Tunggakan - " . $keterangan;
                    }
                }
            } else {
                if ($statusKeseluruhan === 'tunggakan') {
                    $bulanTunggakan = 0;
                    if ($tab === 'tunggakan') {
                        $bulanTunggakan = (int) $items->pluck('periode_bulan')->map(fn ($d) => Carbon::parse($d)->format('Y-m'))
                            ->unique()
                            ->count();
                    } else {
                        $bulanTunggakan = (int) ($tunggakanBulanMap[$groupKey]->bulan_tunggakan ?? 0);
                    }
                    $keterangan = $bulanTunggakan > 0 ? "Tunggakan {$bulanTunggakan} bulan" : 'Tunggakan';
                } elseif ($uniqueStatuses->count() === 1) {
                    $jenisLabels = $items->pluck('jenis')->unique()->values()->map(function (string $jenis) {
                        return match ($jenis) {
                            'satpam' => 'Satpam',
                            'kebersihan' => 'Kebersihan',
                            default => ucfirst($jenis),
                        };
                    });
                    $keterangan = $jenisLabels->implode(' + ');
                } else {
                    $parts = $items->groupBy('jenis')->map(function (Collection $byJenis, string $jenis) {
                        $label = match ($jenis) {
                            'satpam' => 'Satpam',
                            'kebersihan' => 'Kebersihan',
                            default => ucfirst($jenis),
                        };

                        $statuses = $byJenis->pluck('status')->unique()->values();
                        if ($statuses->count() === 1) {
                            $s = (string) $statuses->first();
                            return $s === 'lunas' ? "{$label} dibayar" : "{$label} menunggu";
                        }

                        return "{$label} sebagian";
                    })->values();
                    $keterangan = $parts->implode(', ');
                }
            }

            return [
                'penghunian_id' => (int) $first->penghunian_id,
                'is_custom' => $isCustom,
                'rumah' => $rumah ? [
                    'nomor_rumah' => $rumah->nomor_rumah,
                    'blok' => $rumah->blok,
                ] : null,
                'penghuni' => $penghuni ? [
                    'nama_lengkap' => $penghuni->nama_lengkap,
                ] : null,
                'tagihan' => $tagihanArr,
                'total_nominal' => $totalNominal,
                'status_keseluruhan' => $statusKeseluruhan,
                'keterangan' => $keterangan,
            ];
        });

        if ($tab === 'aktif') {
            $data = $data->filter(fn (array $row) => $row['status_keseluruhan'] !== 'lunas');
        } elseif ($tab === 'lunas') {
            $data = $data->filter(fn (array $row) => $row['status_keseluruhan'] === 'lunas');
        }

        $data = $data->values();

        $totalTagihan = (int) round((float) Tagihan::query()->whereDate('periode_bulan', $periodeDate)->sum('nominal'));
        $totalTerkumpul = (int) round((float) Tagihan::query()
            ->whereDate('periode_bulan', $periodeDate)
            ->where('status', 'lunas')
            ->sum('nominal'));
        $progressPersen = $totalTagihan > 0 ? (int) round(($totalTerkumpul / $totalTagihan) * 100) : 0;

        return response()->json([
            'data' => $data,
            'meta' => [
                'periode' => $periode,
                'total_tagihan' => $totalTagihan,
                'total_terkumpul' => $totalTerkumpul,
                'progress_persen' => $progressPersen,
            ],
        ]);
    }

    /**
     * Store custom tagihan — supports two modes:
     * - 'semua': distributes total across all occupied houses
     * - 'pilih': creates for a single specific house
     */
    public function store(TagihanStoreRequest $request)
    {
        $validated = $request->validated();
        $mode = $validated['mode'];
        $periodeStart = Carbon::createFromFormat('Y-m', $validated['periode_bulan'])->startOfMonth();
        $jatuhTempo = Carbon::parse($validated['jatuh_tempo'])->toDateString();

        if ($mode === 'semua') {
            $penghunianAktif = \App\Models\Penghunian::where('aktif', true)->get();

            if ($penghunianAktif->isEmpty()) {
                return response()->json([
                    'message' => 'Tidak ada rumah yang terisi saat ini.'
                ], 422);
            }

            $totalNominal = (int) $validated['total_nominal'];
            $count = $penghunianAktif->count();
            $nominalPerRumah = (int) floor($totalNominal / $count);

            foreach ($penghunianAktif as $penghunian) {
                Tagihan::create([
                    'penghunian_id' => $penghunian->id,
                    'jenis' => 'custom',
                    'nominal' => $nominalPerRumah,
                    'periode_bulan' => $periodeStart->toDateString(),
                    'status' => 'menunggu',
                    'jatuh_tempo' => $jatuhTempo,
                    'keterangan' => $validated['keterangan'],
                ]);
            }

            return response()->json([
                'message' => "Tagihan custom berhasil dibuat untuk {$count} rumah (Rp " . number_format($nominalPerRumah, 0, ',', '.') . "/rumah)",
            ], 201);
        }

        // mode === 'pilih'
        Tagihan::create([
            'penghunian_id' => $validated['penghunian_id'],
            'jenis' => 'custom',
            'nominal' => (int) $validated['nominal'],
            'periode_bulan' => $periodeStart->toDateString(),
            'status' => 'menunggu',
            'jatuh_tempo' => $jatuhTempo,
            'keterangan' => $validated['keterangan'],
        ]);

        return response()->json([
            'message' => 'Tagihan custom berhasil dibuat untuk 1 rumah',
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    public function verify(Request $request)
    {
        $validated = $request->validate([
            'penghunian_id' => 'required|exists:penghunians,id',
            'periode_bulan' => 'required|date_format:Y-m',
        ]);

        $periodeStart = Carbon::createFromFormat('Y-m', $validated['periode_bulan'])->startOfMonth();

        $isCustom = $request->boolean('is_custom');

        return \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $periodeStart, $request, $isCustom) {
            $query = Tagihan::where('penghunian_id', $validated['penghunian_id'])
                ->whereDate('periode_bulan', $periodeStart->toDateString())
                ->where('status', 'menunggu');

            if ($isCustom) {
                $query->where('jenis', 'custom');
            } else {
                $query->where('jenis', '!=', 'custom');
            }

            $tagihans = $query->get();

            if ($tagihans->isEmpty()) {
                return response()->json(['message' => 'Tidak ada tagihan yang perlu diverifikasi.'], 422);
            }

            $totalNominal = $tagihans->sum('nominal');

            $pembayaran = \App\Models\Pembayaran::create([
                'jumlah_bayar' => $totalNominal,
                'tanggal_bayar' => now()->toDateString(),
                'periode_dibayar' => 1,
                'metode' => 'tunai',
                'catatan' => 'Diverifikasi oleh Admin dari menu Tagihan',
                'dikonfirmasi_oleh' => $request->user()?->name ?? 'Admin',
            ]);

            foreach ($tagihans as $tagihan) {
                $tagihan->update(['status' => 'lunas']);
                $pembayaran->tagihans()->attach($tagihan->id);
            }

            return response()->json([
                'message' => "Berhasil memverifikasi tagihan senilai Rp " . number_format($totalNominal, 0, ',', '.'),
            ]);
        });
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
