import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import { 
  BarChart, Bar, 
  LineChart, Line, 
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Link } from 'react-router-dom';
import DashboardSkeleton from '../components/ui/DashboardSkeleton';

const Dashboard = () => {
  const [loadingTagihan, setLoadingTagihan] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, analytics
  const [chartType, setChartType] = useState('bar'); // bar, line, area

  const { data: response, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => client.get('/dashboard').then(res => res.data)
  });

  const handleGenerate = async () => {
    setLoadingTagihan(true);
    try {
      const res = await client.post('/tagihan/generate');
      toast.success(res.data.message);
    } catch (err) {
      toast.error('Gagal generate tagihan');
    } finally {
      setLoadingTagihan(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  if (isLoading) return <Layout><DashboardSkeleton /></Layout>;

  const { stats, chart, recent_activity } = response;

  return (
    <Layout>
      <div className="p-10 min-h-screen">
        {/* Header with Navigation Tabs */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">Overview of financial and residential health</p>
          </div>
          <div className="flex gap-4">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`text-sm font-bold pb-1 transition-all ${activeTab === 'overview' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
                Overview
            </button>
            <button 
                onClick={() => setActiveTab('analytics')}
                className={`text-sm font-bold pb-1 transition-all ${activeTab === 'analytics' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
                Analytics
            </button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          {/* Total Warga Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Residents</p>
            <p className="text-3xl font-bold text-slate-900">{stats.total_warga}</p>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Active registered citizens</p>
          </div>

          {/* Okupansi Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Penghunian</p>
                <p className="text-3xl font-bold text-slate-900">{stats.okupansi}%</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">+6%</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Occupied units</p>
          </div>

          {/* Pemasukan Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly In</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.pemasukan_bulan_ini)}</p>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Total income this month</p>
          </div>

          {/* Pengeluaran Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Out</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.pengeluaran_bulan_ini)}</p>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Total expenses this month</p>
          </div>
        </div>

        {activeTab === 'overview' ? (
            <>
                <div className="grid grid-cols-3 gap-6 mb-10">
                    {/* Revenue Analytics Chart */}
                    <div className="col-span-2 bg-white border border-gray-200 rounded-2xl p-8 shadow-md">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Cash Flow</h2>
                                <p className="text-xs text-slate-400 mt-1">Income vs Expenses (Full Year Overview)</p>
                            </div>
                            <div className="flex gap-4 items-center">
                                <select 
                                    className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-transparent border-none focus:ring-0 cursor-pointer hover:text-slate-900 transition-colors"
                                    value={chartType}
                                    onChange={(e) => setChartType(e.target.value)}
                                >
                                    <option value="bar">Bar Chart</option>
                                    <option value="line">Line Chart</option>
                                    <option value="area">Area Chart</option>
                                </select>
                            </div>
                        </div>
                        <div className="h-64 -mx-6 px-6">
                            <ResponsiveContainer width="100%" height="100%">
                                {chartType === 'bar' ? (
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
                                ) : chartType === 'line' ? (
                                    <LineChart data={chart}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} />
                                        <Tooltip 
                                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#ffffff', color: '#1e293b', padding: '12px'}}
                                        />
                                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom: '24px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'}} />
                                        <Line type="monotone" dataKey="pemasukan" stroke="#111827" strokeWidth={3} dot={{ r: 4, fill: '#111827' }} activeDot={{ r: 6 }} name="In" />
                                        <Line type="monotone" dataKey="pengeluaran" stroke="#94a3b8" strokeWidth={3} dot={{ r: 4, fill: '#94a3b8' }} activeDot={{ r: 6 }} name="Out" />
                                    </LineChart>
                                ) : (
                                    <AreaChart data={chart}>
                                        <defs>
                                            <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#111827" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#111827" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} />
                                        <Tooltip 
                                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#ffffff', color: '#1e293b', padding: '12px'}}
                                        />
                                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom: '24px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'}} />
                                        <Area type="monotone" dataKey="pemasukan" stroke="#111827" fillOpacity={1} fill="url(#colorIn)" name="In" />
                                        <Area type="monotone" dataKey="pengeluaran" stroke="#94a3b8" fillOpacity={1} fill="url(#colorOut)" name="Out" />
                                    </AreaChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Saldo Kas Summary - Compacted */}
                    <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-md flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Total Balance</p>
                            <p className="text-3xl font-bold">{formatCurrency(stats.saldo_saat_ini)}</p>
                        </div>
                        <div className="mt-8">
                            <Link to="/laporan" className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-gray-100 transition-all active:scale-[0.98] text-sm flex items-center justify-center">
                                Reports & Statements
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-md">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Activity</h3>
                            <p className="text-xs text-slate-400 mt-1">Latest financial movements</p>
                        </div>
                        <Link to="/laporan" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">View All</Link>
                    </div>
                    <div className="space-y-1">
                        {recent_activity?.length > 0 ? recent_activity.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-50 last:border-0">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${item.tipe === 'pemasukan' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        {item.tipe === 'pemasukan' ? 'IN' : 'OUT'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 line-clamp-1">{item.keterangan}</p>
                                        <p className="text-[11px] text-slate-400 font-medium">{item.nama} • {item.tanggal}</p>
                                    </div>
                                </div>
                                <p className={`text-sm font-bold ${item.tipe === 'pemasukan' ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {item.tipe === 'pemasukan' ? '+' : '-'}{formatCurrency(item.nominal)}
                                </p>
                            </div>
                        )) : (
                            <p className="text-sm text-slate-400 text-center py-6">No recent activity.</p>
                        )}
                    </div>
                </div>
            </>
        ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-md animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Detailed Analytics</h2>
                        <p className="text-xs text-slate-400 mt-1">Growth and occupancy trends over time</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Occupancy Status</p>
                            <div className="flex items-end gap-2">
                                <div className="text-4xl font-bold text-slate-900">{stats.okupansi}%</div>
                                <div className="text-xs font-bold text-emerald-500 mb-1">↑ 2.4%</div>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full mt-4 overflow-hidden">
                                <div className="h-full bg-slate-900 transition-all duration-1000" style={{ width: `${stats.okupansi}%` }}></div>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Houses</p>
                                <p className="text-xl font-bold text-slate-900">120</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Unoccupied</p>
                                <p className="text-xl font-bold text-slate-900">{Math.round(120 * (1 - stats.okupansi/100))}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-xl border border-gray-100">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Inflow Prediction</p>
                         <div className="space-y-4">
                            {[1,2,3].map(i => (
                                <div key={i} className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-slate-400">Month +{i}</span>
                                    <span className="text-slate-900">+{formatCurrency(stats.pemasukan_bulan_ini * (1 + i*0.05))}</span>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
