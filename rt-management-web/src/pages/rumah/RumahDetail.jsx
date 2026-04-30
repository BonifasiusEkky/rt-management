import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import client from '../../api/client';
import Layout from '../../components/Layout';
import Modal from '../../components/ui/Modal';
import { toast } from 'sonner';
import { 
    HomeIcon, 
    UserIcon, 
    CalendarIcon, 
    ArrowLeftIcon, 
    PencilIcon, 
    TrashIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    BanknotesIcon,
    CreditCardIcon
} from '@heroicons/react/24/outline';

const RumahDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedPenghuni, setSelectedPenghuni] = useState('');
    const [tanggalMasuk, setTanggalMasuk] = useState(new Date().toISOString().split('T')[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tanggalKeluar, setTanggalKeluar] = useState(new Date().toISOString().split('T')[0]);

    const { data: response, isLoading } = useQuery({
        queryKey: ['rumah', id],
        queryFn: () => client.get(`/rumah/${id}`).then(res => res.data)
    });

    const { data: penghuniRes } = useQuery({
        queryKey: ['penghuni-options'],
        queryFn: () => client.get('/penghuni?is_archived=0&unassigned_only=1').then(res => res.data)
    });

    const assignMutation = useMutation({
        mutationFn: (data) => client.post(`/rumah/${id}/assign`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['rumah', id]);
            setSelectedPenghuni('');
            toast.success('Penghuni berhasil ditetapkan!');
        }
    });

    const kosongkanMutation = useMutation({
        mutationFn: (data) => client.post(`/rumah/${id}/kosongkan`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['rumah', id]);
            setIsModalOpen(false);
            toast.success('Rumah telah dikosongkan.');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: () => client.delete(`/rumah/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['rumah']);
            toast.success('Unit rumah berhasil dihapus');
            navigate('/rumah');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Gagal menghapus rumah');
        }
    });

    const handleDelete = () => {
        if (window.confirm('Yakin ingin menghapus unit rumah ini? Tindakan ini tidak dapat dibatalkan.')) {
            deleteMutation.mutate();
        }
    };

    if (isLoading) return (
        <Layout>
            <div className="p-10 max-w-6xl mx-auto min-h-screen animate-pulse">
                <div className="flex justify-between items-center mb-10">
                    <div className="w-32 h-4 bg-gray-100 rounded" />
                    <div className="flex gap-3">
                        <div className="w-24 h-10 bg-gray-100 rounded-xl" />
                        <div className="w-24 h-10 bg-gray-100 rounded-xl" />
                    </div>
                </div>
                <div className="flex items-center gap-6 mb-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-3xl" />
                    <div>
                        <div className="w-64 h-10 bg-gray-100 rounded mb-4" />
                        <div className="w-48 h-4 bg-gray-100 rounded" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 h-96 shadow-sm" />
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 h-96 shadow-sm" />
                </div>
            </div>
        </Layout>
    );

    const r = response?.data;
    const active = r.penghunian_aktif;

    return (
        <Layout>
            <div className="p-10 max-w-6xl mx-auto min-h-screen">
                {/* Navigation & Actions */}
                <div className="flex justify-between items-center mb-10">
                    <button 
                        onClick={() => navigate('/rumah')}
                        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-bold text-xs uppercase tracking-widest"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Peta Properti
                    </button>
                    <div className="flex gap-3">
                        <Link 
                            to={`/rumah/${id}/edit`}
                            className="flex items-center gap-2 bg-white text-slate-600 px-5 py-2.5 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition shadow-sm text-sm"
                        >
                            <PencilIcon className="w-4 h-4" />
                            Edit Unit
                        </Link>
                        <button 
                            onClick={handleDelete}
                            className="flex items-center gap-2 bg-white text-red-600 px-5 py-2.5 rounded-xl font-bold border border-red-100 hover:bg-red-50 transition shadow-sm text-sm"
                        >
                            <TrashIcon className="w-4 h-4" />
                            Hapus
                        </button>
                    </div>
                </div>

                {/* Main Header */}
                <div className="flex items-center gap-6 mb-12">
                    <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                        <span className="text-3xl font-bold tracking-tighter">{r.blok}-{r.nomor_rumah}</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Detail Unit {r.blok}{r.nomor_rumah}</h1>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                            }`}>
                                {active ? 'Terisi' : 'Kosong'}
                            </span>
                        </div>
                        <p className="text-slate-400 mt-2 font-medium">Elite Residence • Blok {r.blok} No. {r.nomor_rumah}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Status & Assignment Card */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className={`p-8 rounded-3xl border transition-all shadow-md ${
                            active ? 'bg-white border-indigo-200' : 'bg-white border-gray-200'
                        }`}>
                            <div className="flex items-center gap-2 mb-8">
                                <div className={`p-2 rounded-lg ${active ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <UserIcon className="w-5 h-5" />
                                </div>
                                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Penghuni Saat Ini</h2>
                            </div>

                            {active ? (
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nama Penghuni</p>
                                        <h3 className="text-xl font-bold text-slate-900">{active.penghuni.nama_lengkap}</h3>
                                        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold mt-2">
                                            <CalendarIcon className="w-4 h-4" />
                                            <span>Mulai: {active.tanggal_masuk}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-6 border-t border-indigo-100">
                                        <button 
                                            onClick={() => setIsModalOpen(true)}
                                            className="w-full bg-white text-red-600 border border-red-200 py-3 rounded-2xl font-bold hover:bg-red-50 transition shadow-sm text-sm"
                                        >
                                            Kosongkan Unit
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="flex flex-col items-center py-4 opacity-40">
                                        <HomeIcon className="w-12 h-12 text-slate-300" />
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] mt-4 text-slate-400">Unit Tersedia</p>
                                    </div>
                                    
                                    <div className="pt-8 border-t border-gray-200">
                                        <h4 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-wider">Tetapkan Penghuni Baru</h4>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Pilih Warga</label>
                                                <select 
                                                    className="w-full p-4 rounded-2xl border border-gray-100 bg-white text-sm font-semibold outline-none focus:ring-2 focus:ring-slate-900 transition-all appearance-none"
                                                    value={selectedPenghuni}
                                                    onChange={e => setSelectedPenghuni(e.target.value)}
                                                >
                                                    <option value="">-- Pilih Warga --</option>
                                                    {penghuniRes?.data?.map(p => (
                                                        <option key={p.id} value={p.id}>{p.nama_lengkap} ({p.status})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tanggal Masuk</label>
                                                <input 
                                                    type="date" 
                                                    className="w-full p-4 rounded-2xl border border-gray-100 bg-white text-sm font-semibold outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                                                    value={tanggalMasuk}
                                                    onChange={e => setTanggalMasuk(e.target.value)}
                                                />
                                            </div>
                                            <button 
                                                disabled={!selectedPenghuni || assignMutation.isPending}
                                                onClick={() => assignMutation.mutate({ penghuni_id: selectedPenghuni, tanggal_masuk: tanggalMasuk })}
                                                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 disabled:opacity-50 transition shadow-lg shadow-slate-100 mt-2 text-sm"
                                            >
                                                Konfirmasi Assign
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* History Section */}
                    {/* History Sections */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Riwayat Penghunian */}
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">
                            <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Riwayat Penghunian</h2>
                                <span className="bg-white border border-gray-100 px-3 py-1 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest shadow-sm">
                                    {r.penghunians?.length || 0} Records
                                </span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {r.penghunians?.length > 0 ? r.penghunians.map(h => (
                                    <div key={h.id} className="p-8 flex justify-between items-center hover:bg-gray-50/80 transition-all group">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                                h.aktif ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                                {h.aktif ? <CheckCircleIcon className="w-6 h-6" /> : <CalendarIcon className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{h.penghuni.nama_lengkap}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <p className="text-xs text-slate-400 font-medium">
                                                        {h.tanggal_masuk} — {h.tanggal_keluar || 'Sekarang'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            {h.aktif ? (
                                                <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] shadow-lg shadow-indigo-100">Aktif</span>
                                            ) : (
                                                <span className="bg-gray-100 text-slate-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.1em]">Selesai</span>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-20 text-center flex flex-col items-center">
                                        <div className="p-4 bg-slate-50 rounded-full mb-4">
                                            <ExclamationTriangleIcon className="w-8 h-8 text-slate-200" />
                                        </div>
                                        <p className="text-sm text-slate-400 font-medium italic">Belum ada riwayat penghunian tercatat untuk unit ini.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Riwayat Pembayaran */}
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">
                            <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Riwayat Pembayaran</h2>
                                <div className="p-2 bg-white rounded-lg text-slate-400 border border-gray-100">
                                    <BanknotesIcon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {r.penghunians?.flatMap(p => p.tagihans || []).length > 0 ? (
                                    r.penghunians.flatMap(p => (p.tagihans || []).map(t => ({...t, penghuni: p.penghuni}))).map(t => (
                                        <div key={t.id} className="p-8 flex justify-between items-center hover:bg-gray-50/80 transition-all group">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                                    t.status === 'lunas' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                                }`}>
                                                    <CreditCardIcon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <p className="font-bold text-slate-900 text-lg group-hover:text-slate-900">{t.periode_bulan}</p>
                                                        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">• {t.penghuni.nama_lengkap}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 font-medium mt-1">
                                                        Nominal: <span className="text-slate-900 font-bold">Rp {parseInt(t.nominal).toLocaleString('id-ID')}</span> • {t.jenis}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] shadow-sm ${
                                                    t.status === 'lunas' 
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                                    : 'bg-rose-50 text-rose-600 border border-rose-100'
                                                }`}>
                                                    {t.status === 'lunas' ? 'Lunas' : 'Menunggak'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-20 text-center flex flex-col items-center">
                                        <div className="p-4 bg-slate-50 rounded-full mb-4">
                                            <CreditCardIcon className="w-8 h-8 text-slate-200" />
                                        </div>
                                        <p className="text-sm text-slate-400 font-medium italic">Belum ada riwayat pembayaran untuk unit ini.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Kosongkan Unit */}
            <Modal 
                open={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title="Kosongkan Unit Rumah"
            >
                <div className="space-y-6">
                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex gap-4">
                        <div className="p-2 bg-white rounded-xl text-red-600 shadow-sm h-fit">
                            <ExclamationTriangleIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-red-900">Konfirmasi Keluar</p>
                            <p className="text-xs text-red-600 mt-1">Anda akan mengakhiri masa huni **{active?.penghuni.nama_lengkap}**. Data ini akan dipindahkan ke riwayat.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tanggal Keluar</label>
                        <input 
                            type="date" 
                            className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all outline-none font-semibold"
                            value={tanggalKeluar}
                            onChange={(e) => setTanggalKeluar(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 text-slate-600 font-bold hover:bg-gray-100 transition-all text-sm"
                        >
                            Batal
                        </button>
                        <button 
                            onClick={() => kosongkanMutation.mutate({ tanggal_keluar: tanggalKeluar })}
                            disabled={kosongkanMutation.isPending}
                            className="flex-1 px-6 py-4 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 text-sm disabled:opacity-50"
                        >
                            {kosongkanMutation.isPending ? 'Memproses...' : 'Ya, Kosongkan Unit'}
                        </button>
                    </div>
                </div>
            </Modal>
        </Layout>
    );
};

export default RumahDetail;
