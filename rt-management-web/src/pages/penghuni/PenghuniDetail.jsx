import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import Layout from '../../components/Layout';

const PenghuniDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const { data: response, isLoading } = useQuery({
        queryKey: ['penghuni', id],
        queryFn: () => client.get(`/penghuni/${id}`).then(res => res.data)
    });

    const archivePenghuni = async () => {
        if (confirm('Yakin ingin mengarsipkan penghuni ini?')) {
            try {
                await client.delete(`/penghuni/${id}`);
                navigate('/penghuni');
            } catch (err) {
                alert('Gagal mengarsipkan');
            }
        }
    };

    if (isLoading) return <Layout><div className="p-8">Loading...</div></Layout>;
    
    const p = response?.data;

    return (
        <Layout>
            <div className="p-8 max-w-4xl mx-auto">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <Link to="/penghuni" className="text-blue-600 text-sm font-semibold hover:underline">← Kembali ke Daftar</Link>
                        <h1 className="text-3xl font-bold text-gray-900 mt-2">{p.nama_lengkap}</h1>
                        <div className="flex space-x-2 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                p.status === 'tetap' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                                {p.status}
                            </span>
                        </div>
                    </div>
                    <div className="space-x-4">
                        <button 
                            onClick={archivePenghuni}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-semibold border border-red-100 hover:bg-red-100 transition"
                        >
                            Arsipkan
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-8">
                    <div className="col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold mb-4 border-b pb-2 text-gray-700">Informasi Pribadi</h2>
                            <div className="grid grid-cols-2 gap-y-4">
                                <div>
                                    <span className="text-xs text-gray-400 uppercase font-bold">No. Telepon</span>
                                    <p className="font-semibold">{p.no_telepon}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 uppercase font-bold">Status Pernikahan</span>
                                    <p className="font-semibold">{p.sudah_menikah ? 'Sudah Menikah' : 'Belum Menikah'}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-xs text-gray-400 uppercase font-bold">Catatan</span>
                                    <p className="text-gray-600 italic">{p.catatan || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold mb-4 border-b pb-2 text-gray-700">Riwayat Penghunian</h2>
                            <p className="text-sm text-gray-400 italic">Fitur riwayat akan muncul di Tahap 6.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold mb-4 text-gray-700 text-center">Foto KTP</h2>
                            {p.foto_ktp_url ? (
                                <div className="rounded-xl overflow-hidden shadow-inner border bg-gray-50">
                                    <img 
                                        src={`http://localhost:8000${p.foto_ktp_url}`} 
                                        alt="KTP" 
                                        className="w-full h-auto cursor-pointer hover:opacity-90 transition"
                                        onClick={() => window.open(`http://localhost:8000${p.foto_ktp_url}`, '_blank')}
                                    />
                                </div>
                            ) : (
                                <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 italic text-sm">
                                    Tidak ada foto KTP
                                </div>
                            )}
                            <p className="text-[10px] text-gray-400 text-center mt-4">Klik gambar untuk melihat ukuran penuh</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default PenghuniDetail;
