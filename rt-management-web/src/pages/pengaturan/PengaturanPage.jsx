import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import client from '../../api/client';
import Layout from '../../components/Layout';

const PengaturanPage = () => {
    const queryClient = useQueryClient();
    
    const { data: response, isLoading } = useQuery({
        queryKey: ['pengaturan'],
        queryFn: () => client.get('/pengaturan').then(res => res.data)
    });

    const updateTarifMutation = useMutation({
        mutationFn: ({ id, nominal, aktif }) => client.put(`/tagihan-tetap/${id}`, { nominal, aktif }),
        onSuccess: () => {
            queryClient.invalidateQueries(['pengaturan']);
            toast.success('Tarif berhasil diperbarui');
        }
    });

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <Layout>
            <div className="p-8 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-gray-900">Pengaturan Sistem</h1>

                <div className="space-y-8">
                    {/* Tarif Section */}
                    <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
                        <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                            <span className="bg-blue-100 p-2 rounded-lg mr-3">💰</span>
                            Tarif Iuran Rutin
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {isLoading ? (
                                <p>Loading tarifs...</p>
                            ) : response?.tarifs?.map((tarif) => (
                                <div key={tarif.id} className="p-6 rounded-xl border-2 border-gray-50 bg-gray-50/50 hover:border-blue-100 transition">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-bold text-gray-700 uppercase tracking-wider">{tarif.nama}</h3>
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${tarif.aktif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {tarif.aktif ? 'AKTIF' : 'NON-AKTIF'}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input 
                                            type="number" 
                                            className="flex-1 p-2 rounded-lg border font-bold text-blue-600"
                                            defaultValue={tarif.nominal}
                                            onBlur={(e) => {
                                                const newVal = parseInt(e.target.value);
                                                if(newVal !== tarif.nominal) {
                                                    updateTarifMutation.mutate({ id: tarif.id, nominal: newVal, aktif: tarif.aktif });
                                                }
                                            }}
                                        />
                                        <button 
                                            onClick={() => updateTarifMutation.mutate({ id: tarif.id, nominal: tarif.nominal, aktif: !tarif.aktif })}
                                            className={`p-2 rounded-lg border ${tarif.aktif ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                                            title={tarif.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                                        >
                                            {tarif.aktif ? 'OFF' : 'ON'}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 italic">* Perubahan tarif akan berlaku untuk tagihan bulan depan.</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* General Settings */}
                    <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
                        <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                            <span className="bg-orange-100 p-2 rounded-lg mr-3">⚙️</span>
                            Konfigurasi Umum
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Nama Perumahan</label>
                                <input 
                                    type="text" className="w-full p-3 rounded-xl border bg-gray-50" 
                                    value={response?.settings?.nama_rt || 'Elite Residence'} readOnly 
                                />
                            </div>
                            <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-yellow-800 text-sm italic">
                                Catatan: Pengaturan saldo awal dan sinkronisasi data dilakukan via database console untuk keamanan.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default PengaturanPage;
