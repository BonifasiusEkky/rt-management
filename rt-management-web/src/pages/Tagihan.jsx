import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ProgressBar from "../components/ui/ProgressBar";
import TabNav from "../components/ui/TabNav";
import Modal from "../components/ui/Modal";
import Skeleton from "../components/ui/Skeleton";
import { PlusIcon } from "@heroicons/react/24/solid";
import { toast } from "sonner";

function toPeriode(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getDefaultPeriodeForTab(tab) {
  const now = new Date();
  if (tab === "history") {
    const prev = new Date(now);
    prev.setMonth(prev.getMonth() - 1);
    return toPeriode(prev);
  }
  return toPeriode(now);
}

function formatPeriodeLabel(periode) {
  if (!periode) return "-";
  const [year, month] = periode.split("-").map(Number);
  if (!year || !month) return periode;
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatRupiah(nominal) {
  const value = Number(nominal) || 0;
  return value.toLocaleString("id-ID");
}

function getRumahLabel(rumah) {
  if (!rumah) return "-";
  const nomor = rumah.nomor_rumah ?? "";
  const blok = rumah.blok ?? "";
  if (!nomor) return blok || "-";
  const nomorUpper = String(nomor).toUpperCase();
  const blokUpper = String(blok).toUpperCase();
  if (blok && !nomorUpper.startsWith(blokUpper)) {
    return `${blok}${nomor}`;
  }
  return String(nomor);
}

function getEmptyCopy(tab) {
  switch (tab) {
    case "aktif":
      return {
        title: "Belum ada tagihan aktif bulan ini",
        description: "Generate tagihan otomatis akan jalan tiap awal bulan",
      };
    case "tunggakan":
      return {
        title: "Tidak ada tunggakan",
        description: "Semua warga sudah bayar tepat waktu",
      };
    case "lunas":
      return {
        title: "Belum ada pembayaran masuk bulan ini",
        description: "",
      };
    case "history":
      return {
        title: "Belum ada history pembayaran",
        description: "",
      };
    default:
      return {
        title: "Belum ada tagihan",
        description: "",
      };
  }
}

function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

function toMonthInputValue(periode) {
  return periode || "";
}

function firstApiErrorMessage(err) {
  const msg = err?.response?.data?.message;
  if (msg) return msg;
  const errors = err?.response?.data?.errors;
  if (errors && typeof errors === "object") {
    const firstKey = Object.keys(errors)[0];
    const firstVal = errors[firstKey];
    if (Array.isArray(firstVal) && firstVal[0]) return firstVal[0];
  }
  return "Terjadi kesalahan. Coba lagi.";
}

function TagihanCustomModal({ open, onClose, defaultPeriode }) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState(() => ({
    mode: 'semua',
    penghunian_id: "",
    periode_bulan: defaultPeriode,
    total_nominal: "",
    nominal: "",
    jatuh_tempo: getTodayISO(),
    keterangan: "",
  }));

  const { data: rumahRes, isLoading: rumahLoading } = useQuery({
    queryKey: ["rumah-tagihan-custom"],
    queryFn: () => client.get("/rumah").then((r) => r.data),
    enabled: open,
  });

  const rumahOptions = useMemo(() => {
    const list = rumahRes?.data ?? [];
    return list.filter((r) => r.penghunian_aktif);
  }, [rumahRes]);

  const occupiedCount = rumahOptions.length;

  const nominalPerRumah = useMemo(() => {
    const total = Number(form.total_nominal) || 0;
    if (occupiedCount === 0 || total === 0) return 0;
    return Math.floor(total / occupiedCount);
  }, [form.total_nominal, occupiedCount]);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return client.post("/tagihan", payload).then((r) => r.data);
    },
    onSuccess: async (res) => {
      toast.success(res.message || "Tagihan custom berhasil dibuat");
      await queryClient.invalidateQueries({ queryKey: ["tagihan"] });
      onClose();
      setForm({
        mode: 'semua',
        penghunian_id: "",
        periode_bulan: defaultPeriode,
        total_nominal: "",
        nominal: "",
        jatuh_tempo: getTodayISO(),
        keterangan: "",
      });
    },
    onError: (err) => {
      toast.error(firstApiErrorMessage(err));
    },
  });

  if (!open) return null;

  const validate = () => {
    if (!form.periode_bulan) return "Periode wajib diisi.";
    if (!form.jatuh_tempo) return "Jatuh tempo wajib diisi.";
    if (form.jatuh_tempo < getTodayISO()) return "Jatuh tempo tidak boleh sebelum hari ini.";
    if (!form.keterangan.trim()) return "Keterangan wajib diisi.";
    if (form.keterangan.length > 255) return "Keterangan maksimal 255 karakter.";

    if (form.mode === 'semua') {
      const totalNum = Number(form.total_nominal);
      if (!Number.isFinite(totalNum) || totalNum < 1000) return "Total nominal minimal Rp 1.000.";
      if (occupiedCount === 0) return "Tidak ada rumah yang terisi saat ini.";
    } else {
      if (!form.penghunian_id) return "Pilih rumah/warga terlebih dahulu.";
      const nomNum = Number(form.nominal);
      if (!Number.isFinite(nomNum) || nomNum < 1000) return "Nominal minimal Rp 1.000.";
    }

    return null;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    const payload = {
      mode: form.mode,
      periode_bulan: form.periode_bulan,
      jatuh_tempo: form.jatuh_tempo,
      keterangan: form.keterangan.trim(),
    };

    if (form.mode === 'semua') {
      payload.total_nominal = Number(form.total_nominal);
    } else {
      payload.penghunian_id = Number(form.penghunian_id);
      payload.nominal = Number(form.nominal);
    }

    mutation.mutate(payload);
  };

  return (
    <Modal open={open} onClose={onClose} title="Tagihan Custom">
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Mode Selector */}
        <div className="flex gap-4 mb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="mode" 
              value="semua"
              checked={form.mode === 'semua'}
              onChange={(e) => setForm(p => ({ ...p, mode: e.target.value }))}
              className="text-slate-900 focus:ring-slate-900"
            />
            <span className="text-sm font-semibold text-slate-700">Tagih ke Semua Rumah</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="mode" 
              value="pilih"
              checked={form.mode === 'pilih'}
              onChange={(e) => setForm(p => ({ ...p, mode: e.target.value }))}
              className="text-slate-900 focus:ring-slate-900"
            />
            <span className="text-sm font-semibold text-slate-700">Pilih Rumah Tertentu</span>
          </label>
        </div>

        {form.mode === 'semua' ? (
          <>
            {/* Info banner */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs font-bold text-blue-700 mb-1">Tagihan ke semua rumah terisi</p>
              <p className="text-[11px] text-blue-500">
                {rumahLoading ? 'Memuat data...' : `${occupiedCount} rumah terisi saat ini. Total nominal akan dibagi rata.`}
              </p>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Pilih Rumah (Warga)</label>
            <select
              className="w-full px-4 py-3 rounded-lg border border-border"
              value={form.penghunian_id}
              onChange={(e) => setForm((p) => ({ ...p, penghunian_id: e.target.value }))}
              required={form.mode === 'pilih'}
            >
              <option value="">-- Pilih Unit Rumah --</option>
              {rumahLoading ? (
                <option value="" disabled>
                  Memuat...
                </option>
              ) : (
                rumahOptions.map((r) => (
                  <option key={r.id} value={r.penghunian_aktif.id}>
                    {r.label} - {r.penghunian_aktif.penghuni?.nama_lengkap}
                  </option>
                ))
              )}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Periode</label>
            <input
              type="month"
              className="w-full px-4 py-3 rounded-lg border border-border"
              value={toMonthInputValue(form.periode_bulan)}
              onChange={(e) => setForm((p) => ({ ...p, periode_bulan: e.target.value }))}
              required
            />
          </div>

          {form.mode === 'semua' ? (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Total Nominal</label>
              <input
                type="number"
                min={1000}
                className="w-full px-4 py-3 rounded-lg border border-border"
                placeholder="1000000"
                value={form.total_nominal}
                onChange={(e) => setForm((p) => ({ ...p, total_nominal: e.target.value }))}
                required={form.mode === 'semua'}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nominal</label>
              <input
                type="number"
                min={1000}
                className="w-full px-4 py-3 rounded-lg border border-border"
                placeholder="10000"
                value={form.nominal}
                onChange={(e) => setForm((p) => ({ ...p, nominal: e.target.value }))}
                required={form.mode === 'pilih'}
              />
            </div>
          )}
        </div>

        {/* Per-house calculation preview */}
        {form.mode === 'semua' && Number(form.total_nominal) > 0 && occupiedCount > 0 && (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-medium">Rp {formatRupiah(form.total_nominal)} ÷ {occupiedCount} rumah</span>
              <span className="font-bold text-slate-900">= Rp {formatRupiah(nominalPerRumah)} / rumah</span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Jatuh Tempo</label>
          <input
            type="date"
            className="w-full px-4 py-3 rounded-lg border border-border"
            value={form.jatuh_tempo}
            onChange={(e) => setForm((p) => ({ ...p, jatuh_tempo: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Keterangan</label>
          <input
            type="text"
            maxLength={255}
            className="w-full px-4 py-3 rounded-lg border border-border"
            placeholder="Contoh: Iuran perbaikan jalan"
            value={form.keterangan}
            onChange={(e) => setForm((p) => ({ ...p, keterangan: e.target.value }))}
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" disabled={mutation.isPending}>
            {mutation.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function TagihanCardSkeleton() {
  return (
    <Card className="flex items-center gap-4 mb-4">
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-border animate-pulse" />
      <div className="flex-1 min-w-0">
        <div className="h-4 bg-border rounded w-40 mb-2 animate-pulse" />
        <div className="h-3 bg-border rounded w-64 mb-2 animate-pulse" />
        <div className="h-3 bg-border rounded w-24 animate-pulse" />
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="h-6 bg-border rounded w-20 animate-pulse" />
        <div className="h-8 bg-border rounded w-24 animate-pulse" />
      </div>
    </Card>
  );
}

function TagihanCard({ tagihan, onVerify, isVerifying }) {
  const status = tagihan.status || "menunggu";

  const statusColors = {
    lunas: { badge: 'bg-emerald-50 text-emerald-600' },
    menunggu: { badge: 'bg-orange-50 text-orange-600' },
    tunggakan: { badge: 'bg-red-50 text-red-600' }
  };

  const colors = statusColors[status] || statusColors.menunggu;

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-6 flex-1">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center font-bold text-slate-900 text-sm border border-gray-100">
            {tagihan.rumah}
          </div>
          <div className="flex-1">
            <div className="font-bold text-slate-900 text-base tracking-tight">
              {tagihan.nama}
              {tagihan.is_custom && (
                <span className="ml-2 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-wider align-middle">
                  Custom
                </span>
              )}
            </div>
            {tagihan.detail && <div className="text-slate-400 text-xs mt-1 font-medium">{tagihan.detail}</div>}
            <div className="text-slate-900 font-bold text-sm mt-3">Rp {formatRupiah(tagihan.nominal)}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-4">
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${colors.badge}`}>
            {status === 'menunggu' ? 'Pending' : status === 'lunas' ? 'Paid' : 'Overdue'}
          </span>
          {status !== 'lunas' && (
            <button 
              onClick={() => onVerify(tagihan)}
              disabled={isVerifying}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isVerifying ? '...' : 'Verify'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Tagihan() {
  const [tab, setTab] = useState("aktif");
  const [openCustom, setOpenCustom] = useState(false);
  const [search, setSearch] = useState("");
  
  const now = useMemo(() => toPeriode(new Date()), []);
  const [selectedMonth, setSelectedMonth] = useState(now);

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tagihan", tab, selectedMonth],
    queryFn: () =>
      client
        .get("/tagihan", {
          params: { tab, periode: selectedMonth },
        })
        .then((r) => r.data),
  });

  const queryClient = useQueryClient();
  const verifyMutation = useMutation({
    mutationFn: (item) => client.post("/tagihan/verify", {
      penghunian_id: item.penghunian_id,
      periode_bulan: selectedMonth,
      is_custom: item.is_custom
    }).then(r => ({ ...r.data, id: item.id })),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["tagihan"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
    },
    onError: (err) => {
      toast.error(firstApiErrorMessage(err));
    }
  });

  const tagihanList = response?.data ?? [];
  const meta = response?.meta;

  const cards = useMemo(() => {
    let list = tagihanList.map((item) => ({
      id: `${item.penghunian_id}_${item.is_custom ? 'custom' : 'tetap'}`,
      penghunian_id: item.penghunian_id,
      is_custom: item.is_custom,
      rumah: getRumahLabel(item.rumah),
      nama: item.penghuni?.nama_lengkap ?? "-",
      detail: item.keterangan ?? "",
      nominal: item.total_nominal ?? 0,
      status: item.status_keseluruhan ?? "menunggu",
    }));

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => 
        c.nama.toLowerCase().includes(q) || 
        c.rumah.toLowerCase().includes(q)
      );
    }

    return list;
  }, [tagihanList, search]);

  const emptyCopy = getEmptyCopy(tab);

  return (
    <Layout>
      <div className="p-10 min-h-screen">
        {/* Header */}
        <div className="mb-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Billing</h1>
              <p className="text-sm text-slate-400 mt-1">Monitor and manage resident invoices</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search name or unit..." 
                  className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none transition-all w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <input 
                type="month" 
                className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
              <button
                onClick={() => setOpenCustom(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                <PlusIcon className="w-5 h-5" /> Custom Bill
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-between items-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Tab: <span className="text-slate-900">{tab.toUpperCase()}</span>
            </div>
            <div className="flex gap-4 border-b border-gray-100">
              {['aktif', 'tunggakan', 'lunas', 'history'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`pb-2 px-1 text-xs font-bold uppercase tracking-widest transition-all ${
                    tab === t
                      ? 'border-b-2 border-slate-900 text-slate-900'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {t === 'aktif' ? 'Active' : t === 'tunggakan' ? 'Overdue' : t === 'lunas' ? 'Paid' : 'History'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 mb-10 shadow-sm">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-72 mb-3" />
              <div className="h-2 bg-gray-100 rounded w-full" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Rate ({formatPeriodeLabel(selectedMonth)})</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    Rp {formatRupiah(meta?.total_terkumpul ?? 0)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">
                    Collected from Rp {formatRupiah(meta?.total_tagihan ?? 0)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-slate-900">{meta?.progress_persen ?? 0}%</div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Complete</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-slate-900 h-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(meta?.progress_persen ?? 0, 100)}%` }}
                />
              </div>
            </>
          )}
        </div>

        {/* Tagihan List */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              <TagihanCardSkeleton />
              <TagihanCardSkeleton />
            </>
          ) : isError ? (
            <div className="text-center py-20">
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Failed to load bills</p>
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                {search ? 'No matches found' : emptyCopy.title}
              </p>
            </div>
          ) : (
            cards.map((t) => (
              <TagihanCard 
                key={t.id} 
                tagihan={t} 
                onVerify={verifyMutation.mutate}
                isVerifying={verifyMutation.isPending && verifyMutation.variables?.id === t.id}
              />
            ))
          )}
        </div>

        <TagihanCustomModal
          open={openCustom}
          onClose={() => setOpenCustom(false)}
        defaultPeriode={selectedMonth}
      />
      </div>
    </Layout>
  );
}
