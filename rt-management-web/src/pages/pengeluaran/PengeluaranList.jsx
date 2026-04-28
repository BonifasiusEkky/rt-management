import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import client from '../../api/client';
import Layout from '../../components/Layout';

const PengeluaranList = () => {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        kategori: '',
        nominal: '',
        tanggal: new Date().toISOString().split('T')[0],
        berulang: 0,
        deskripsi: ''
    });

    const { data: response, isLoading } = useQuery({
        queryKey: ['pengeluaran'],
        queryFn: () => client.get('/pengeluaran').then(res => res.data)
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

    return (
        <Layout>
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Pengeluaran Kas</h1>
                        <p className="text-gray-500">Catat semua biaya operasional RT.</p>
                    </div>
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className="bg-red-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:bg-red-700 transition"
                    >
                        {showForm ? 'Batal' : '+ Catat Pengeluaran'}
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 mb-8 animate-in fade-in slide-in-from-top-4">
                        <h2 className="text-lg font-bold mb-4">Input Pengeluaran Baru</h2>
                        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input 
                                type="text" placeholder="Kategori (Gaji, Listrik...)" className="p-2 border rounded-lg"
                                value={formData.kategori} onChange={e => setFormData({...formData, kategori: e.target.value})} required
                            />
                            <input 
                                type="number" placeholder="Nominal" className="p-2 border rounded-lg"
                                value={formData.nominal} onChange={e => setFormData({...formData, nominal: e.target.value})} required
                            />
                            <input 
                                type="date" className="p-2 border rounded-lg"
                                value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} required
                            />
                            <button className="bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition">Simpan</button>
                            <div className="md:col-span-4">
                                <textarea 
                                    placeholder="Deskripsi tambahan..." className="w-full p-2 border rounded-lg"
                                    value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})}
                                ></textarea>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Tanggal</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4">Deskripsi</th>
                                <th className="px-6 py-4">Nominal</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">Loading...</td></tr>
                            ) : response?.data?.data?.map((ex) => (
                                <tr key={ex.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-sm text-gray-500">{ex.tanggal}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">{ex.kategori}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{ex.deskripsi || '-'}</td>
                                    <td className="px-6 py-4 font-bold text-red-600">{formatCurrency(ex.nominal)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => confirm('Hapus?') && deleteMutation.mutate(ex.id)} className="text-red-400 hover:text-red-600 text-sm font-semibold">Hapus</button>
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
