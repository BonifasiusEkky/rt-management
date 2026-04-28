import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import client from '../../api/client';
import Layout from '../../components/Layout';

const PengeluaranList = () => {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
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

    const { data: response, isLoading } = useQuery({
        queryKey: ['pengeluaran', selectedMonth],
        queryFn: () => client.get('/pengeluaran', { params: { periode: selectedMonth } }).then(res => res.data)
    });

    const createMutation = useMutation({
        mutationFn: (data) => client.post('/pengeluaran', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['pengeluaran']);
            setShowForm(false);
            setFormData({ kategori: '', nominal: '', tanggal: new Date().toISOString().split('T')[0], berulang: 0, deskripsi: '' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => client.delete(`/pengeluaran/${id}`),
        onSuccess: () => queryClient.invalidateQueries(['pengeluaran'])
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
            <div className="p-10 bg-white min-h-screen">
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
                            onClick={() => setShowForm(!showForm)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] ${
                                showForm ? 'bg-gray-100 text-slate-600 hover:bg-gray-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                        >
                            {showForm ? 'Cancel' : 'Add Expense'}
                        </button>
                    </div>
                </div>

                {showForm && (
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 mb-10 shadow-sm animate-in fade-in slide-in-from-top-4">
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

                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Date</th>
                                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Category</th>
                                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Description</th>
                                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Amount</th>
                                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr><td colSpan="5" className="px-8 py-16 text-center text-slate-400 font-medium">Loading data...</td></tr>
                            ) : filteredData.length === 0 ? (
                                <tr><td colSpan="5" className="px-8 py-16 text-center text-slate-400 font-medium">No expenses found for this period.</td></tr>
                            ) : filteredData.map((ex) => (
                                <tr key={ex.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-5 text-slate-500 font-medium">{ex.tanggal}</td>
                                    <td className="px-8 py-5 font-bold text-slate-900">{ex.kategori}</td>
                                    <td className="px-8 py-5 text-slate-400 font-medium truncate max-w-xs">{ex.deskripsi || '-'}</td>
                                    <td className="px-8 py-5 font-bold text-red-600">{formatCurrency(ex.nominal)}</td>
                                    <td className="px-8 py-5 text-right">
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
