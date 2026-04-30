import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../../api/client';
import Layout from '../../components/Layout';
import { toast } from 'sonner';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const RumahForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        blok: '',
        nomor_rumah: ''
    });

    const { data: response, isLoading } = useQuery({
        queryKey: ['rumah', id],
        queryFn: () => client.get(`/rumah/${id}`).then(res => res.data),
        enabled: isEdit
    });

    useEffect(() => {
        if (isEdit && response?.data) {
            setFormData({
                blok: response.data.blok,
                nomor_rumah: response.data.nomor_rumah
            });
        }
    }, [isEdit, response]);

    const mutation = useMutation({
        mutationFn: (data) => {
            if (isEdit) {
                return client.put(`/rumah/${id}`, data);
            }
            return client.post('/rumah', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['rumah']);
            toast.success(isEdit ? 'Data rumah berhasil diperbarui' : 'Rumah baru berhasil ditambahkan');
            navigate('/rumah');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    if (isEdit && isLoading) return <Layout><div className="p-10">Memuat data...</div></Layout>;

    return (
        <Layout>
            <div className="p-10 max-w-2xl mx-auto min-h-screen">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-8 font-bold text-xs uppercase tracking-widest"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Kembali
                </button>

                <div className="bg-white p-10 rounded-3xl shadow-md border border-gray-200">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-slate-900 rounded-2xl text-white">
                            <HomeIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                {isEdit ? 'Edit Data Rumah' : 'Tambah Rumah Baru'}
                            </h1>
                            <p className="text-sm text-slate-400 mt-1">
                                {isEdit ? 'Perbarui informasi unit perumahan' : 'Daftarkan unit perumahan baru ke dalam sistem'}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Blok</label>
                                <input 
                                    type="text"
                                    placeholder="Contoh: A, B, C"
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all font-semibold"
                                    value={formData.blok}
                                    onChange={(e) => setFormData({...formData, blok: e.target.value.toUpperCase()})}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nomor Rumah</label>
                                <input 
                                    type="text"
                                    placeholder="Contoh: 01, 12, 15"
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all font-semibold"
                                    value={formData.nomor_rumah}
                                    onChange={(e) => setFormData({...formData, nomor_rumah: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit"
                                disabled={mutation.isPending}
                                className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-slate-200"
                            >
                                {mutation.isPending ? 'Menyimpan...' : isEdit ? 'Perbarui Data' : 'Daftarkan Rumah'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default RumahForm;
