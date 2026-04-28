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
    public function index(Request $request)
    {
        $validated = $request->validate([
            'tab' => 'nullable|in:aktif,tunggakan,lunas,history',
            'periode' => 'nullable|date_format:Y-m',
        ]);

        $periode = $validated['periode'] ?? now()->format('Y-m');
        $tab = $validated['tab'] ?? 'aktif';

        $periodeStart = Carbon::createFromFormat('Y-m', $periode)->startOfMonth();
        $periodeDate = $periodeStart->toDateString();

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
        $grouped = $tagihans->groupBy('penghunian_id');

        $penghunianIds = $grouped->keys()->values()->all();

        $tunggakanBulanMap = collect();
        if (!empty($penghunianIds) && in_array($tab, ['aktif', 'lunas'], true)) {
            $tunggakanBulanMap = Tagihan::query()
                ->selectRaw('penghunian_id, COUNT(DISTINCT periode_bulan) as bulan_tunggakan')
                ->whereIn('penghunian_id', $penghunianIds)
                ->whereDate('periode_bulan', '<', $periodeDate)
                ->where('status', 'menunggu')
                ->groupBy('penghunian_id')
                ->pluck('bulan_tunggakan', 'penghunian_id');
        }

        $data = $grouped->map(function (Collection $items, $penghunianId) use ($tab, $tunggakanBulanMap, $periodeDate) {
            /** @var Tagihan $first */
            $first = $items->first();

            $penghunian = $first->penghunian;
            $rumah = $penghunian?->rumah;
            $penghuni = $penghunian?->penghuni;

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
                $bulanTunggakan = (int) ($tunggakanBulanMap[$penghunianId] ?? 0);
                if ($bulanTunggakan > 0) {
                    $statusKeseluruhan = 'tunggakan';
                } elseif ($uniqueStatuses->count() === 1) {
                    $statusKeseluruhan = (string) $uniqueStatuses->first();
                } else {
                    $statusKeseluruhan = 'sebagian';
                }
            }

            $keterangan = null;
            if ($statusKeseluruhan === 'tunggakan') {
                $bulanTunggakan = 0;
                if ($tab === 'tunggakan') {
                    $bulanTunggakan = (int) $items->pluck('periode_bulan')->map(fn ($d) => Carbon::parse($d)->format('Y-m'))
                        ->unique()
                        ->count();
                } else {
                    $bulanTunggakan = (int) ($tunggakanBulanMap[$penghunianId] ?? 0);
                }
                $keterangan = $bulanTunggakan > 0 ? "Tunggakan {$bulanTunggakan} bulan" : 'Tunggakan';
            } elseif ($uniqueStatuses->count() === 1) {
                $jenisLabels = $items->pluck('jenis')->unique()->values()->map(function (string $jenis) {
                    return match ($jenis) {
                        'satpam' => 'Satpam',
                        'kebersihan' => 'Kebersihan',
                        'custom' => 'Custom',
                        default => ucfirst($jenis),
                    };
                });
                $keterangan = $jenisLabels->implode(' + ');
            } else {
                $parts = $items->groupBy('jenis')->map(function (Collection $byJenis, string $jenis) {
                    $label = match ($jenis) {
                        'satpam' => 'Satpam',
                        'kebersihan' => 'Kebersihan',
                        'custom' => 'Custom',
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

            return [
                'penghunian_id' => (int) $penghunianId,
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
     * Store a newly created resource in storage.
     */
    public function store(TagihanStoreRequest $request)
    {
        $validated = $request->validated();

        $periodeStart = Carbon::createFromFormat('Y-m', $validated['periode_bulan'])->startOfMonth();

        $tagihan = Tagihan::create([
            'penghunian_id' => $validated['penghunian_id'],
            'jenis' => 'custom',
            'nominal' => (int) $validated['nominal'],
            'periode_bulan' => $periodeStart->toDateString(),
            'status' => 'menunggu',
            'jatuh_tempo' => Carbon::parse($validated['jatuh_tempo'])->toDateString(),
            'keterangan' => $validated['keterangan'],
        ]);

        return response()->json(['data' => $tagihan], 201);
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

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
