import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import Layout from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Dashboard = () => {
  const [loadingTagihan, setLoadingTagihan] = useState(false);
  const [message, setMessage] = useState('');

  const { data: response, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => client.get('/dashboard').then(res => res.data)
  });

  const handleGenerate = async () => {
    setLoadingTagihan(true);
    setMessage('');
    try {
      const res = await client.post('/tagihan/generate');
      setMessage(res.data.message);
    } catch (err) {
      setMessage('Gagal generate tagihan');
    } finally {
      setLoadingTagihan(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  if (isLoading) return <Layout><div className="p-8 text-gray-400">Memuat Dashboard...</div></Layout>;

  const { stats, chart, recent_pembayaran } = response;

  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard Ringkasan</h1>
            <p className="text-slate-500 font-medium">Statistik keuangan dan hunian perumahan.</p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Saldo Kas Saat Ini</p>
                <p className="text-2xl font-black text-blue-600">{formatCurrency(stats.saldo_saat_ini)}</p>
             </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Warga</p>
            <p className="text-3xl font-black text-slate-800">{stats.total_warga}</p>
            <p className="text-[10px] text-slate-400 mt-2">Warga terdaftar (Aktif)</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Okupansi</p>
            <p className="text-3xl font-black text-slate-800">{stats.okupansi}%</p>
            <p className="text-[10px] text-slate-400 mt-2">Rumah terisi vs total</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-green-400 uppercase mb-1">In (Bulan Ini)</p>
            <p className="text-3xl font-black text-green-600">{formatCurrency(stats.pemasukan_bulan_ini)}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-red-400 uppercase mb-1">Out (Bulan Ini)</p>
            <p className="text-3xl font-black text-red-600">{formatCurrency(stats.pengeluaran_bulan_ini)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-8">Arus Kas 6 Bulan Terakhir</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    cursor={{fill: '#f8fafc'}}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom: '20px'}} />
                  <Bar dataKey="pemasukan" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Pemasukan" />
                  <Bar dataKey="pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} name="Pengeluaran" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions & Recent Transactions */}
          <div className="space-y-8">
            <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Aksi Cepat</h3>
              <button 
                onClick={handleGenerate}
                disabled={loadingTagihan}
                className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold transition flex items-center justify-center space-x-2"
              >
                <span>{loadingTagihan ? 'Memproses...' : 'Tagih Iuran Bulan Ini'}</span>
              </button>
              {message && <p className="mt-4 text-center text-blue-300 text-xs font-medium">{message}</p>}
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 uppercase mb-6">Transaksi Terbaru</h3>
              <div className="space-y-6">
                {recent_pembayaran?.length > 0 ? recent_pembayaran.map(p => (
                   <div key={p.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{p.tagihans?.[0]?.penghunian?.penghuni?.nama_lengkap}</p>
                        <p className="text-[10px] text-slate-400">{p.tanggal_bayar}</p>
                      </div>
                      <p className="text-sm font-black text-green-600">+{formatCurrency(p.jumlah_bayar)}</p>
                   </div>
                )) : (
                  <p className="text-xs text-slate-400 italic">Belum ada transaksi.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
