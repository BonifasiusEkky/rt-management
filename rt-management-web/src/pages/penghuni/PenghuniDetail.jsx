import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon, XMarkIcon, CheckIcon, PhotoIcon } from '@heroicons/react/24/solid';
import { toast } from 'sonner';
import client from '../../api/client';
import Layout from '../../components/Layout';

const PenghuniDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        nama_lengkap: '',
        no_telepon: '',
        status: '',
        sudah_menikah: false,
        catatan: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showLightbox, setShowLightbox] = useState(false);
    
    const { data: response, isLoading } = useQuery({
        queryKey: ['penghuni', id],
        queryFn: () => client.get(`/penghuni/${id}`).then(res => res.data)
    });

    const { data: riwayatResponse, isLoading: isLoadingRiwayat } = useQuery({
        queryKey: ['penghuni-riwayat', id],
        queryFn: () => client.get(`/penghuni/${id}/riwayat`).then(res => res.data)
    });

    useEffect(() => {
        if (response?.data) {
            const p = response.data;
            setFormData({
                nama_lengkap: p.nama_lengkap || '',
                no_telepon: p.no_telepon || '',
                status: p.status || '',
                sudah_menikah: !!p.sudah_menikah,
                catatan: p.catatan || ''
            });
        }
    }, [response]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            const data = new FormData();
            data.append('_method', 'PUT');
            data.append('nama_lengkap', formData.nama_lengkap);
            data.append('no_telepon', formData.no_telepon);
            data.append('status', formData.status);
            data.append('sudah_menikah', formData.sudah_menikah ? 1 : 0);
            data.append('catatan', formData.catatan || '');
            
            if (selectedFile) {
                data.append('foto_ktp', selectedFile);
            }

            await client.post(`/penghuni/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setIsEditing(false);
            setSelectedFile(null);
            setPreviewUrl(null);
            queryClient.invalidateQueries(['penghuni', id]);
            toast.success('Data berhasil diperbarui');
        } catch (err) {
            console.error(err);
            toast.error('Gagal memperbarui data: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsSaving(false);
        }
    };

    const archivePenghuni = async () => {
        if (confirm('Yakin ingin mengarsipkan penghuni ini?')) {
            try {
                await client.delete(`/penghuni/${id}`);
                toast.success('Penghuni berhasil diarsipkan');
                queryClient.invalidateQueries(['penghuni', id]);
            } catch (err) {
                toast.error('Gagal mengarsipkan');
            }
        }
    };

    const unarchivePenghuni = async () => {
        if (confirm('Pulihkan penghuni ini dari arsip?')) {
            try {
                await client.post(`/penghuni/${id}/unarchive`);
                toast.success('Penghuni berhasil dipulihkan');
                queryClient.invalidateQueries(['penghuni', id]);
            } catch (err) {
                toast.error('Gagal memulihkan penghuni');
            }
        }
    };

    if (isLoading) return (
        <Layout>
            <div className="p-10 max-w-5xl mx-auto min-h-screen animate-pulse">
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <div className="w-24 h-4 bg-gray-100 rounded mb-4" />
                        <div className="w-64 h-10 bg-gray-100 rounded mb-4" />
                        <div className="w-32 h-6 bg-gray-100 rounded-full" />
                    </div>
                    <div className="flex gap-3">
                        <div className="w-32 h-10 bg-gray-100 rounded-xl" />
                        <div className="w-32 h-10 bg-gray-100 rounded-xl" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-8">
                    <div className="col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 h-64 shadow-sm" />
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 h-64 shadow-sm" />
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 h-80 shadow-sm" />
                </div>
            </div>
        </Layout>
    );
    
    const p = response?.data;
    const isArchived = !!p.is_archived;

    return (
        <Layout>
            <div className="p-10 max-w-5xl mx-auto min-h-screen">
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <Link to="/penghuni" className="group inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-4">
                            <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-gray-100 transition-colors">
                                <ArrowLeftIcon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">Back to List</span>
                        </Link>
                        {isEditing ? (
                            <input
                                type="text"
                                name="nama_lengkap"
                                value={formData.nama_lengkap}
                                onChange={handleInputChange}
                                className="text-3xl font-bold text-slate-900 tracking-tight border-b-2 border-indigo-500 focus:outline-none w-full max-w-lg"
                                placeholder="Nama Lengkap"
                            />
                        ) : (
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{p.nama_lengkap}</h1>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                            {isEditing ? (
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="px-2 py-1 rounded-full text-xs font-bold uppercase bg-indigo-50 text-indigo-700 border-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="tetap">Tetap</option>
                                    <option value="kontrak">Kontrak</option>
                                </select>
                            ) : (
                                <>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                        p.status === 'tetap' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                        {p.status}
                                    </span>
                                    {isArchived && (
                                        <span className="px-2 py-1 rounded-full text-xs font-bold uppercase bg-slate-100 text-slate-500">
                                            Archived / History
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        {isEditing ? (
                            <>
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-2 bg-gray-50 text-gray-600 px-4 py-2 rounded-xl font-semibold border border-gray-200 hover:bg-gray-100 transition"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                    Batal
                                </button>
                                <button 
                                    onClick={handleUpdate}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <CheckIcon className="w-4 h-4" />
                                    )}
                                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </>
                        ) : (
                            <>
                                {!isArchived && (
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-xl font-semibold border border-indigo-100 hover:bg-indigo-50 transition"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                        Edit Data
                                    </button>
                                )}
                                
                                {isArchived ? (
                                    <button 
                                        onClick={unarchivePenghuni}
                                        className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-semibold border border-emerald-100 hover:bg-emerald-100 transition"
                                    >
                                        Pulihkan
                                    </button>
                                ) : (
                                    <button 
                                        onClick={archivePenghuni}
                                        className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-semibold border border-red-100 hover:bg-red-100 transition"
                                    >
                                        Arsipkan
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-8">
                    <div className="col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-200">
                            <h2 className="text-lg font-bold mb-6 border-b border-gray-50 pb-4 text-gray-800 flex items-center gap-2">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                Informasi Pribadi
                            </h2>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                <div>
                                    <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">No. Telepon</span>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="no_telepon"
                                            value={formData.no_telepon}
                                            onChange={handleInputChange}
                                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                        />
                                    ) : (
                                        <p className="font-semibold text-slate-800">{p.no_telepon}</p>
                                    )}
                                </div>
                                <div>
                                    <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Status Pernikahan</span>
                                    {isEditing ? (
                                        <div className="flex items-center mt-2">
                                            <input
                                                type="checkbox"
                                                name="sudah_menikah"
                                                checked={formData.sudah_menikah}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                            />
                                            <label className="ml-2 text-sm font-medium text-gray-700">Sudah Menikah</label>
                                        </div>
                                    ) : (
                                        <p className="font-semibold text-slate-800">{p.sudah_menikah ? 'Sudah Menikah' : 'Belum Menikah'}</p>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Catatan</span>
                                    {isEditing ? (
                                        <textarea
                                            name="catatan"
                                            value={formData.catatan}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Tambahkan catatan di sini..."
                                        ></textarea>
                                    ) : (
                                        <p className="text-gray-600 leading-relaxed">{p.catatan || '-'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-200">
                            <h2 className="text-lg font-bold mb-6 border-b border-gray-50 pb-4 text-gray-800 flex items-center gap-2">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                Riwayat Penghunian
                            </h2>
                            
                            {isLoadingRiwayat ? (
                                <p className="text-sm text-gray-400">Memuat riwayat...</p>
                            ) : riwayatResponse?.data?.length > 0 ? (
                                <div className="space-y-4">
                                    {riwayatResponse.data.map((h) => (
                                        <div key={h.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200 hover:border-indigo-200 transition-colors shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600 font-bold">
                                                    {h.rumah?.blok}-{h.rumah?.nomor_rumah}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">Rumah Blok {h.rumah?.blok} No. {h.rumah?.nomor_rumah}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(h.tanggal_masuk).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        {' - '}
                                                        {h.tanggal_keluar 
                                                            ? new Date(h.tanggal_keluar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                                            : 'Sekarang'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    h.aktif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {h.aktif ? 'Aktif' : 'Selesai'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">Belum ada riwayat penghunian.</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-200 overflow-hidden relative group">
                            <h2 className="text-lg font-bold mb-6 text-gray-800 text-center uppercase tracking-widest text-xs">Foto KTP</h2>
                            
                            <div className="relative aspect-[3/2] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-indigo-300">
                                {previewUrl ? (
                                    <img 
                                        src={previewUrl} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : p.foto_ktp_url ? (
                                    <img 
                                        src={`http://localhost:8000${p.foto_ktp_url}`} 
                                        alt="KTP" 
                                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
                                        onClick={() => !isEditing && setShowLightbox(true)}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-gray-300">
                                        <PhotoIcon className="w-12 h-12" />
                                        <span className="text-xs font-medium">Belum ada foto</span>
                                    </div>
                                )}

                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                        <label className="cursor-pointer bg-white text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold shadow-xl hover:scale-105 transition-transform active:scale-95">
                                            {p.foto_ktp_url || previewUrl ? 'Ganti Foto' : 'Unggah Foto'}
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>
                            
                            {!isEditing && p.foto_ktp_url && (
                                <p className="text-[10px] text-gray-400 text-center mt-4">Klik gambar untuk melihat ukuran penuh</p>
                            )}
                            
                            {isEditing && selectedFile && (
                                <div className="mt-4 p-3 bg-indigo-50 rounded-xl flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                                        <PhotoIcon className="w-4 h-4 text-indigo-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-indigo-900 truncate">{selectedFile.name}</p>
                                        <p className="text-[10px] text-indigo-400">Siap diunggah</p>
                                    </div>
                                    <button 
                                        onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                                        className="p-1 hover:bg-white rounded-lg transition-colors"
                                    >
                                        <XMarkIcon className="w-4 h-4 text-indigo-300" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {showLightbox && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
                    onClick={() => setShowLightbox(false)}
                >
                    <div 
                        className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl transition-transform duration-300 scale-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setShowLightbox(false)}
                            className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-slate-800 rounded-full shadow-lg transition-colors z-10"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                        <img 
                            src={`http://localhost:8000${p.foto_ktp_url}`} 
                            alt="KTP Full Size" 
                            className="w-full h-auto max-h-[85vh] object-contain"
                        />
                        <div className="p-4 bg-white border-t border-gray-100 flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">Foto KTP - {p.nama_lengkap}</span>
                            <a 
                                href={`http://localhost:8000${p.foto_ktp_url}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest"
                            >
                                Buka di Tab Baru
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default PenghuniDetail;
