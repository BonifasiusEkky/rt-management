import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { toast } from 'sonner';
import client from '../../api/client';
import Layout from '../../components/Layout';

const PembayaranForm = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        penghunian_id: '',
        jenis_tagihan: ['satpam', 'kebersihan'],
        periode_bulan: 1,
        metode: 'tunai',
        tanggal_bayar: new Date().toISOString().split('T')[0],
        catatan: ''
    });

    const { data: rumahRes } = useQuery({
        queryKey: ['rumah-pembayaran'],
        queryFn: () => client.get('/rumah').then(res => res.data)
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.penghunian_id) return toast.error('Pilih rumah terlebih dahulu');
        
        setLoading(true);
        try {
            await client.post('/pembayaran', formData);
            toast.success('Pembayaran berhasil dicatat!');
            navigate('/pembayaran');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal mencatat pembayaran');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="p-10 max-w-2xl mx-auto min-h-screen bg-white">
                <div className="mb-10">
                    <Link to="/pembayaran" className="group inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-4">
                        <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-gray-100 transition-colors">
                            <ArrowLeftIcon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">Back to History</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Record New Payment</h1>
                </div>
                
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    {/* Pilih Rumah */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Pilih Rumah (Warga)</label>
                        <select 
                            className="w-full p-3 rounded-xl border"
                            value={formData.penghunian_id}
                            onChange={e => setFormData({...formData, penghunian_id: e.target.value})}
                            required
                        >
                            <option value="">-- Pilih Unit Rumah --</option>
                            {rumahRes?.data?.filter(r => r.penghunian_aktif).map(r => (
                                <option key={r.id} value={r.penghunian_aktif.id}>
                                    {r.label} - {r.penghunian_aktif.penghuni.nama_lengkap}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Jenis Iuran */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">Jenis Iuran</label>
                            <div className="space-y-2">
                                <label className="flex items-center space-x-2">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.jenis_tagihan.includes('satpam')} 
                                        onChange={e => {
                                            const newJenis = e.target.checked 
                                                ? [...formData.jenis_tagihan, 'satpam'] 
                                                : formData.jenis_tagihan.filter(j => j !== 'satpam');
                                            setFormData({...formData, jenis_tagihan: newJenis});
                                        }}
                                    />
                                    <span>Satpam</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.jenis_tagihan.includes('kebersihan')} 
                                        onChange={e => {
                                            const newJenis = e.target.checked 
                                                ? [...formData.jenis_tagihan, 'kebersihan'] 
                                                : formData.jenis_tagihan.filter(j => j !== 'kebersihan');
                                            setFormData({...formData, jenis_tagihan: newJenis});
                                        }}
                                    />
                                    <span>Kebersihan</span>
                                </label>
                            </div>
                        </div>

                        {/* Periode */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">Periode Bayar</label>
                            <select 
                                className="w-full p-3 rounded-xl border"
                                value={formData.periode_bulan}
                                onChange={e => setFormData({...formData, periode_bulan: parseInt(e.target.value)})}
                            >
                                <option value={1}>1 Bulan (Bulan Ini)</option>
                                <option value={3}>3 Bulan (1 Quarter)</option>
                                <option value={6}>6 Bulan (Setengah Tahun)</option>
                                <option value={12}>12 Bulan (1 Tahun)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2">Metode</label>
                            <select 
                                className="w-full p-3 rounded-xl border"
                                value={formData.metode}
                                onChange={e => setFormData({...formData, metode: e.target.value})}
                            >
                                <option value="tunai">Tunai</option>
                                <option value="transfer">Transfer</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Tanggal Bayar</label>
                            <input 
                                type="date" 
                                className="w-full p-3 rounded-xl border"
                                value={formData.tanggal_bayar}
                                onChange={e => setFormData({...formData, tanggal_bayar: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Catatan</label>
                        <textarea 
                            className="w-full p-3 rounded-xl border h-24"
                            value={formData.catatan}
                            onChange={e => setFormData({...formData, catatan: e.target.value})}
                            placeholder="Catatan tambahan..."
                        ></textarea>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            {loading ? 'Memproses...' : 'Simpan Pembayaran'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default PembayaranForm;
