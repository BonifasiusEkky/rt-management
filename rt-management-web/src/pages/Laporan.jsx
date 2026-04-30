import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import client from "../api/client";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import { 
  DocumentTextIcon,
} from "@heroicons/react/24/solid";

function formatRupiah(nominal) {
  const value = Number(nominal) || 0;
  return value.toLocaleString("id-ID");
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

function toPeriode(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export default function Laporan() {
  const now = useMemo(() => toPeriode(new Date()), []);
  const [selectedMonth, setSelectedMonth] = useState(now);

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["report", selectedMonth],
    queryFn: () => client.get("/report", { params: { periode: selectedMonth } }).then(r => r.data)
  });

  const summary = response?.summary;
  const details = response?.details ?? [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="p-10 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-end mb-10 print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports</h1>
            <p className="text-sm text-slate-400 mt-1">Monthly financial summary and transaction logs</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm">
              <input 
                type="month" 
                className="text-sm font-bold text-slate-900 outline-none border-none p-0 bg-transparent"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all active:scale-[0.95]"
            >
              Export PDF / Print
            </button>
          </div>
        </div>

        {/* Print Only Header */}
        <div className="hidden print:block mb-10 text-center border-b-2 border-slate-900 pb-6">
          <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-tighter">Financial Report</h1>
          <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-[0.3em]">RT Management System</p>
          <p className="text-lg font-bold text-slate-900 mt-4">{formatPeriodeLabel(selectedMonth)}</p>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="mb-4">
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">START</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initial Balance</p>
            <p className="text-base font-bold text-slate-900 mt-1 whitespace-nowrap">Rp {formatRupiah(summary?.saldo_awal)}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="mb-4">
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">INCOME</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Income</p>
            <p className="text-base font-bold text-slate-900 mt-1 whitespace-nowrap">Rp {formatRupiah(summary?.total_pemasukan)}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="mb-4">
              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg">EXPENSE</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Expense</p>
            <p className="text-base font-bold text-slate-900 mt-1 whitespace-nowrap">Rp {formatRupiah(summary?.total_pengeluaran)}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="mb-4">
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">END</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Final Balance</p>
            <p className="text-base font-bold text-slate-900 mt-1 whitespace-nowrap">Rp {formatRupiah(summary?.saldo_akhir)}</p>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Transaction Log</h2>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {formatPeriodeLabel(selectedMonth)}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[120px]">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source / Target</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[140px]">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-48" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24 ml-auto" /></td>
                    </tr>
                  ))
                ) : details.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                      No transactions found for this period
                    </td>
                  </tr>
                ) : (
                  details.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-all">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-bold text-slate-900">{item.tanggal}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">{item.keterangan}</p>
                          {item.kategori && <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{item.kategori}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[11px] font-medium text-slate-600">
                          {item.tipe === 'pemasukan' ? `${item.warga} (${item.rumah})` : 'Operational'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <span className={`text-xs font-bold ${item.tipe === 'pemasukan' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {item.tipe === 'pemasukan' ? '+' : '-'} Rp {formatRupiah(item.nominal)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
