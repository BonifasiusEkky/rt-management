import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import client from '../../api/client';
import { toast } from 'sonner';
import Layout from '../../components/Layout';
import { Cog6ToothIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

const PengeluaranList = () => {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [showRecurringSettings, setShowRecurringSettings] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newRecurring, setNewRecurring] = useState({ nama: '', nominal: '' });
    const [tab, setTab] = useState('pending');
    const [search, setSearch] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [formData, setFormData] = useState({
        kategori: '',
        nominal: '',
        tanggal: new Date().toISOString().split('T')[0],
        berulang: 0,
        deskripsi: ''
    });
    
    // Date formatting helpers
    const formatPeriode = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    };

    const formatFullDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const { data: response, isLoading } = useQuery({
        queryKey: ['pengeluaran', tab, selectedMonth],
        queryFn: () => client.get('/pengeluaran', { params: { tab, periode: selectedMonth } }).then(res => res.data)
    });

    const { data: settingsRes, refetch: refetchSettings } = useQuery({
        queryKey: ['pengaturan-pengeluaran'],
        queryFn: () => client.get('/pengaturan').then(res => res.data)
    });

    const recurringExpenses = settingsRes?.pengeluaran_tetap || [];

    const createMutation = useMutation({
        mutationFn: (data) => client.post('/pengeluaran', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['pengeluaran']);
            setShowForm(false);
            setFormData({ kategori: '', nominal: '', tanggal: new Date().toISOString().split('T')[0], berulang: 0, deskripsi: '' });
            toast.success('Pengeluaran berhasil dicatat');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Gagal mencatat pengeluaran');
        }
    });

    const verifyMutation = useMutation({
        mutationFn: (id) => client.post(`/pengeluaran/${id}/verify`),
        onSuccess: (res) => {
            queryClient.invalidateQueries(['pengeluaran']);
            queryClient.invalidateQueries(['dashboard']);
            toast.success(res.data.message);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Gagal verifikasi pengeluaran');
        }
    });

    const storeRecurringMutation = useMutation({
        mutationFn: (data) => client.post('/pengeluaran-tetap', data),
        onSuccess: () => {
            refetchSettings();
            setIsAdding(false);
            setNewRecurring({ nama: '', nominal: '' });
            toast.success('Pengeluaran rutin baru ditambahkan');
        },
        onError: () => {
            toast.error('Gagal menambah pengeluaran rutin');
        }
    });

    const updateRecurringMutation = useMutation({
        mutationFn: ({ id, data }) => client.put(`/pengeluaran-tetap/${id}`, data),
        onSuccess: () => {
            refetchSettings();
            queryClient.invalidateQueries(['pengeluaran']);
            toast.success('Pengeluaran rutin diperbarui');
        },
        onError: () => {
            toast.error('Gagal memperbarui pengeluaran rutin');
        }
    });

    const deleteRecurringMutation = useMutation({
        mutationFn: (id) => client.delete(`/pengeluaran-tetap/${id}`),
        onSuccess: () => {
            refetchSettings();
            queryClient.invalidateQueries(['pengeluaran']);
            toast.success('Pengeluaran rutin dihapus');
        },
        onError: () => {
            toast.error('Gagal menghapus pengeluaran rutin');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => client.delete(`/pengeluaran/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['pengeluaran']);
            toast.success('Pengeluaran berhasil dihapus');
        },
        onError: () => {
            toast.error('Gagal menghapus pengeluaran');
        }
    });

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    const filteredData = (response?.data?.data || []).filter(ex => {
        const q = search.toLowerCase();
        return ex.kategori.toLowerCase().includes(q) || (ex.deskripsi && ex.deskripsi.toLowerCase().includes(q));
    });

    return (
        <Layout>
            <div className="p-8 min-h-screen">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Expenses</h1>
                        <p className="text-sm text-slate-400 mt-1">Manage and track RT operational costs</p>
                    </div>
                    <div className="flex gap-3">
                        <input 
                            type="text" 
                            placeholder="Search expenses..." 
                            className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none transition-all w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <input 
                            type="month" 
                            className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        />
                        <button 
                            onClick={() => { setShowRecurringSettings(!showRecurringSettings); setShowForm(false); }}
                            className={`p-2.5 rounded-xl transition-all active:scale-[0.98] border ${
                                showRecurringSettings ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-gray-100 text-slate-400 hover:text-slate-600'
                            }`}
                            title="Recurring Settings"
                        >
                            <Cog6ToothIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => { setShowForm(!showForm); setShowRecurringSettings(false); }}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] ${
                                showForm ? 'bg-gray-100 text-slate-600 hover:bg-gray-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                        >
                            {showForm ? 'Cancel' : 'Add Expense'}
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 border-b border-gray-100 mb-8">
                    <button 
                        onClick={() => setTab('pending')}
                        className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${tab === 'pending' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Menunggu Verifikasi
                        {tab === 'pending' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900 rounded-full" />}
                    </button>
                    <button 
                        onClick={() => setTab('selesai')}
                        className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${tab === 'selesai' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Sudah Dibayar
                        {tab === 'selesai' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900 rounded-full" />}
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 mb-10 shadow-md animate-in fade-in slide-in-from-top-4">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">New Expense Entry</h2>
                        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                                    <input 
                                        type="text" placeholder="e.g. Electricity, Salary" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                                        value={formData.kategori} onChange={e => setFormData({...formData, kategori: e.target.value})} required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Amount (Rp)</label>
                                    <input 
                                        type="number" placeholder="0" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                                        value={formData.nominal} onChange={e => setFormData({...formData, nominal: e.target.value})} required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Date</label>
                                    <input 
                                        type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                                        value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                                <textarea 
                                    placeholder="Add details..." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none transition-all h-24"
                                    value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})}
                                ></textarea>
                            </div>
                            <div className="flex justify-end">
                                <button className="bg-slate-900 text-white px-10 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-[0.98]">Save Entry</button>
                            </div>
                        </form>
                    </div>
                )}

                {showRecurringSettings && (
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 mb-10 shadow-md animate-in fade-in slide-in-from-top-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Monthly Recurring Expenses</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {recurringExpenses.map(item => (
                                <div key={item.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/30 group relative">
                                    <button 
                                        onClick={() => confirm('Delete this recurring expense?') && deleteRecurringMutation.mutate(item.id)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-white shadow-sm border border-red-50 text-red-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-600"
                                    >
                                        <TrashIcon className="w-3.5 h-3.5" />
                                    </button>
                                    
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <input 
                                                type="text"
                                                defaultValue={item.nama}
                                                onBlur={(e) => {
                                                    if (e.target.value !== item.nama) {
                                                        updateRecurringMutation.mutate({ id: item.id, data: { nama: e.target.value } });
                                                    }
                                                }}
                                                className="font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 w-full"
                                            />
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer scale-75 origin-right">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer"
                                                checked={!!item.aktif}
                                                onChange={(e) => updateRecurringMutation.mutate({ 
                                                    id: item.id, 
                                                    data: { aktif: e.target.checked } 
                                                })}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            defaultValue={parseInt(item.nominal)}
                                            onBlur={(e) => {
                                                const val = e.target.value;
                                                if (val !== parseInt(item.nominal).toString()) {
                                                    updateRecurringMutation.mutate({ 
                                                        id: item.id, 
                                                        data: { nominal: val } 
                                                    });
                                                }
                                            }}
                                            className="flex-1 px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-xs font-bold focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                                        />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rp</span>
                                    </div>
                                </div>
                            ))}

                            {/* Add New Row / Form */}
                            {isAdding ? (
                                <div className="p-4 rounded-xl border-2 border-slate-900 bg-white shadow-lg animate-in zoom-in-95 duration-200">
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Category Name</label>
                                            <input 
                                                autoFocus
                                                type="text" 
                                                placeholder="e.g. WiFi Bill"
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                                                value={newRecurring.nama}
                                                onChange={e => setNewRecurring({...newRecurring, nama: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Amount</label>
                                            <input 
                                                type="number" 
                                                placeholder="0"
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                                                value={newRecurring.nominal}
                                                onChange={e => setNewRecurring({...newRecurring, nominal: e.target.value})}
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button 
                                                onClick={() => {
                                                    if (!newRecurring.nama || !newRecurring.nominal) {
                                                        return toast.error('Please fill all fields');
                                                    }
                                                    storeRecurringMutation.mutate({ ...newRecurring, aktif: true });
                                                }}
                                                disabled={storeRecurringMutation.isPending}
                                                className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-[10px] font-bold hover:bg-slate-800 transition-all active:scale-[0.98]"
                                            >
                                                {storeRecurringMutation.isPending ? '...' : 'Save Category'}
                                            </button>
                                            <button 
                                                onClick={() => setIsAdding(false)}
                                                className="px-3 bg-gray-50 text-slate-400 py-2 rounded-lg text-[10px] font-bold hover:bg-gray-100 transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl border border-dashed border-gray-200 flex flex-col justify-center items-center gap-3 bg-gray-50/10 hover:bg-gray-50/30 transition-all cursor-pointer min-h-[120px]"
                                    onClick={() => setIsAdding(true)}
                                >
                                    <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-slate-400">
                                        <PlusIcon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New Recurring</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[800px]">
                        <thead className="bg-white border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3.5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">{tab === 'pending' ? 'Periode' : 'Date'}</th>
                                <th className="px-6 py-3.5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Category</th>
                                <th className="px-6 py-3.5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Description</th>
                                <th className="px-6 py-3.5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Amount</th>
                                <th className="px-6 py-3.5 font-bold text-slate-400 uppercase tracking-widest text-[10px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr><td colSpan="5" className="px-6 py-16 text-center text-slate-400 font-medium">Loading data...</td></tr>
                            ) : filteredData.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-16 text-center text-slate-400 font-medium">No expenses found for this period.</td></tr>
                            ) : filteredData.map((ex) => (
                                <tr key={ex.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-3.5 text-slate-500 font-medium whitespace-nowrap">{tab === 'pending' ? formatPeriode(ex.periode_bulan) : formatFullDate(ex.tanggal)}</td>
                                    <td className="px-6 py-3.5 font-bold text-slate-900 whitespace-nowrap">{ex.kategori}</td>
                                    <td className="px-6 py-3.5 text-slate-400 font-medium truncate max-w-xs">{ex.deskripsi || '-'}</td>
                                    <td className="px-6 py-3.5 font-bold text-red-600 whitespace-nowrap">{formatCurrency(ex.nominal)}</td>
                                    <td className="px-6 py-3.5 text-right flex justify-end gap-3 items-center">
                                        {tab === 'pending' && (
                                            <button 
                                                onClick={() => verifyMutation.mutate(ex.id)}
                                                disabled={verifyMutation.isPending}
                                                className="px-4 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-[10px] hover:bg-emerald-100 transition-colors whitespace-nowrap"
                                            >
                                                {verifyMutation.isPending ? '...' : 'Verify Payment'}
                                            </button>
                                        )}
                                        <button onClick={() => confirm('Delete this record?') && deleteMutation.mutate(ex.id)} className="text-slate-300 hover:text-red-600 text-xs font-bold transition-colors">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default PengeluaranList;
