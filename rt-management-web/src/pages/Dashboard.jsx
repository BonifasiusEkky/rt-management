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
      <div className="p-10 bg-white min-h-screen">
        {/* Header with Navigation Tabs */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">Overview of financial and residential health</p>
          </div>
          <div className="flex gap-4">
            <button className="text-sm font-bold text-slate-900 border-b-2 border-slate-900 pb-1">Overview</button>
            <button className="text-sm font-bold text-slate-400 hover:text-slate-900 pb-1 transition-colors">Analytics</button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          {/* Total Warga Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Residents</p>
            <p className="text-3xl font-bold text-slate-900">{stats.total_warga}</p>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Active registered citizens</p>
          </div>

          {/* Okupansi Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Occupancy</p>
                <p className="text-3xl font-bold text-slate-900">{stats.okupansi}%</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">+6%</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Occupied units</p>
          </div>

          {/* Pemasukan Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly In</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.pemasukan_bulan_ini)}</p>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Total income this month</p>
          </div>

          {/* Pengeluaran Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Out</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.pengeluaran_bulan_ini)}</p>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Total expenses this month</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-10">
          {/* Revenue Analytics Chart */}
          <div className="col-span-2 bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Cash Flow</h2>
                <p className="text-xs text-slate-400 mt-1">Income vs Expenses (Last 6 Months)</p>
              </div>
              <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Filters ▼</button>
            </div>
            <div className="h-64 -mx-6 px-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#ffffff', color: '#1e293b', padding: '12px'}}
                    cursor={{fill: '#f8fafc'}}
                  />
                  <Legend verticalAlign="top" align="right" iconType="square" wrapperStyle={{paddingBottom: '24px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'}} />
                  <Bar dataKey="pemasukan" fill="#111827" radius={[4, 4, 0, 0]} name="In" />
                  <Bar dataKey="pengeluaran" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Out" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Saldo Kas Summary */}
          <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-sm flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Total Balance</p>
            <p className="text-3xl font-bold mb-auto">{formatCurrency(stats.saldo_saat_ini)}</p>
            <div className="mt-8 space-y-4">
              <div className="border-t border-slate-800 pt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net Change</p>
                <p className="text-lg font-bold text-white mt-1">{formatCurrency(stats.pemasukan_bulan_ini - stats.pengeluaran_bulan_ini)}</p>
              </div>
              <button className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-gray-100 transition-all active:scale-[0.98] text-sm">Statements</button>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Activity</h3>
              <p className="text-xs text-slate-400 mt-1">Latest payment transactions</p>
            </div>
            <a href="#" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">View All</a>
          </div>
          <div className="space-y-1">
            {recent_pembayaran?.length > 0 ? recent_pembayaran.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-slate-900 text-xs font-bold">
                    {p.tagihans?.[0]?.penghunian?.penghuni?.nama_lengkap?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{p.tagihans?.[0]?.penghunian?.penghuni?.nama_lengkap}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{p.tanggal_bayar}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-900">+{formatCurrency(p.jumlah_bayar)}</p>
              </div>
            )) : (
              <p className="text-sm text-slate-400 text-center py-6">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
