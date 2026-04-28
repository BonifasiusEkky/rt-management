import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import client from '../../api/client';
import Layout from '../../components/Layout';

const PembayaranList = () => {
    const [search, setSearch] = useState("");
    const { data: response, isLoading } = useQuery({
        queryKey: ['pembayaran'],
        queryFn: () => client.get('/pembayaran').then(res => res.data)
    });

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    const filteredData = (response?.data || []).filter(p => {
        const q = search.toLowerCase();
        const houseInfo = p.tagihans?.[0]?.penghunian;
        const name = houseInfo?.penghuni?.nama_lengkap?.toLowerCase() || "";
        const unit = `unit ${houseInfo?.rumah?.blok}${houseInfo?.rumah?.nomor_rumah}`.toLowerCase();
        return name.includes(q) || unit.includes(q);
    });

    return (
        <Layout>
            <div className="p-10 bg-white min-h-screen">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payments</h1>
                        <p className="text-sm text-slate-400 mt-1">Transaction history of all incoming fees</p>
                    </div>
                    <div className="flex gap-3">
                        <input 
                            type="text" 
                            placeholder="Search name or unit..." 
                            className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none transition-all w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Link 
                            to="/pembayaran/baru" 
                            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-[0.98]"
                        >
                            New Payment
                        </Link>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Date</th>
                                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Resident / Unit</th>
                                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Amount</th>
                                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Method</th>
                                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Period</th>
                                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-16 text-center text-slate-400 font-medium">Loading data...</td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-16 text-center text-slate-400 font-medium">No payments found.</td>
                                </tr>
                            ) : filteredData.map((p) => {
                                const houseInfo = p.tagihans?.[0]?.penghunian;
                                return (
                                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5 text-slate-500 font-medium">{p.tanggal_bayar}</td>
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-slate-900">{houseInfo?.penghuni?.nama_lengkap}</div>
                                            <div className="text-[11px] text-slate-400 font-medium">Unit {houseInfo?.rumah?.blok}{houseInfo?.rumah?.nomor_rumah}</div>
                                        </td>
                                        <td className="px-8 py-5 font-bold text-slate-900">
                                            {formatCurrency(p.jumlah_bayar)}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-gray-100 px-2 py-0.5 rounded">{p.metode}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="bg-slate-50 text-slate-900 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                                {p.periode_dibayar} MONTHS
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <Link to={`/pembayaran/${p.id}`} className="text-slate-900 hover:text-slate-600 font-bold text-xs underline underline-offset-4">View</Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default PembayaranList;
