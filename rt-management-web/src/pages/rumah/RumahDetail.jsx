import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import client from '../../api/client';
import Layout from '../../components/Layout';

const RumahDetail = () => {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [selectedPenghuni, setSelectedPenghuni] = useState('');
    const [tanggalMasuk, setTanggalMasuk] = useState(new Date().toISOString().split('T')[0]);

    const { data: response, isLoading } = useQuery({
        queryKey: ['rumah', id],
        queryFn: () => client.get(`/rumah/${id}`).then(res => res.data)
    });

    const { data: penghuniRes } = useQuery({
        queryKey: ['penghuni-options'],
        queryFn: () => client.get('/penghuni?is_archived=0').then(res => res.data)
    });

    const assignMutation = useMutation({
        mutationFn: (data) => client.post(`/rumah/${id}/assign`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['rumah', id]);
            setSelectedPenghuni('');
            alert('Penghuni berhasil ditetapkan!');
        }
    });

    const kosongkanMutation = useMutation({
        mutationFn: (data) => client.post(`/rumah/${id}/kosongkan`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['rumah', id]);
            alert('Rumah telah dikosongkan.');
        }
    });

    if (isLoading) return <Layout><div className="p-8">Loading...</div></Layout>;

    const r = response?.data;
    const active = r.penghunian_aktif;

    return (
        <Layout>
            <div className="p-10 max-w-5xl mx-auto min-h-screen bg-white">
                <div className="mb-10">
                    <Link to="/rumah" className="group inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-4">
                        <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-gray-100 transition-colors">
                            <ArrowLeftIcon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">Back to Map</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Unit {r.label}</h1>
                    <p className="text-sm text-slate-400 mt-1">Block {r.blok}, Number {r.nomor_rumah}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Status Section */}
                    <div className="col-span-1 space-y-6">
                        <div className={`p-6 rounded-2xl border-2 ${active ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Status Saat Ini</h2>
                            {active ? (
                                <div>
                                    <p className="text-blue-600 font-bold text-xs uppercase mb-1">Dihuni Oleh:</p>
                                    <h3 className="text-xl font-bold text-blue-900">{active.penghuni.nama_lengkap}</h3>
                                    <p className="text-blue-700 text-sm mt-1 italic">Mulai: {active.tanggal_masuk}</p>
                                    
                                    <div className="mt-6 pt-6 border-t border-blue-200">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Kosongkan Rumah</label>
                                        <button 
                                            onClick={() => {
                                                const date = prompt('Tanggal keluar (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
                                                if(date) kosongkanMutation.mutate({ tanggal_keluar: date });
                                            }}
                                            className="w-full bg-white text-red-600 border border-red-200 py-2 rounded-xl font-bold hover:bg-red-50 transition"
                                        >
                                            Check-out
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-gray-400 font-bold text-xl uppercase tracking-widest">KOSONG</p>
                                    
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <h4 className="text-sm font-bold text-gray-700 mb-4">Tetapkan Penghuni Baru</h4>
                                        <div className="space-y-4">
                                            <select 
                                                className="w-full p-2 rounded-lg border text-sm"
                                                value={selectedPenghuni}
                                                onChange={e => setSelectedPenghuni(e.target.value)}
                                            >
                                                <option value="">Pilih Warga...</option>
                                                {penghuniRes?.data?.map(p => (
                                                    <option key={p.id} value={p.id}>{p.nama_lengkap} ({p.status})</option>
                                                ))}
                                            </select>
                                            <input 
                                                type="date" 
                                                className="w-full p-2 rounded-lg border text-sm"
                                                value={tanggalMasuk}
                                                onChange={e => setTanggalMasuk(e.target.value)}
                                            />
                                            <button 
                                                disabled={!selectedPenghuni || assignMutation.isPending}
                                                onClick={() => assignMutation.mutate({ penghuni_id: selectedPenghuni, tanggal_masuk: tanggalMasuk })}
                                                className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition shadow-md"
                                            >
                                                Assign Sekarang
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* History Section */}
                    <div className="col-span-2">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b bg-gray-50">
                                <h2 className="text-lg font-bold text-gray-800">Riwayat Penghunian</h2>
                            </div>
                            <div className="divide-y">
                                {r.penghunians?.length > 0 ? r.penghunians.map(h => (
                                    <div key={h.id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition">
                                        <div>
                                            <p className="font-bold text-gray-900">{h.penghuni.nama_lengkap}</p>
                                            <p className="text-xs text-gray-500">{h.tanggal_masuk} s/d {h.tanggal_keluar || 'Sekarang'}</p>
                                        </div>
                                        <div>
                                            {h.aktif ? (
                                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Aktif</span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold uppercase">Selesai</span>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-12 text-center text-gray-400 italic">Belum ada riwayat penghunian.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default RumahDetail;
