import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import client from '../../api/client';
import Layout from '../../components/Layout';

const PenghuniForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nama_lengkap: '',
        status: 'tetap',
        no_telepon: '',
        sudah_menikah: 0,
        catatan: '',
    });
    const [fotoKtp, setFotoKtp] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (fotoKtp) data.append('foto_ktp', fotoKtp);

        try {
            await client.post('/penghuni', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/penghuni');
        } catch (err) {
            console.error(err);
            alert('Gagal menyimpan data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="p-10 max-w-2xl mx-auto min-h-screen bg-white">
                <div className="mb-10">
                    <Link to="/penghuni" className="group inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-4">
                        <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-gray-100 transition-colors">
                            <ArrowLeftIcon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">Back to List</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add New Resident</h1>
                </div>
                
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Nama Lengkap</label>
                        <input 
                            type="text" 
                            className="w-full p-3 rounded-xl border"
                            value={formData.nama_lengkap}
                            onChange={e => setFormData({...formData, nama_lengkap: e.target.value})}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2">Status</label>
                            <select 
                                className="w-full p-3 rounded-xl border"
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="tetap">Tetap</option>
                                <option value="kontrak">Kontrak</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">No. Telepon</label>
                            <input 
                                type="text" 
                                className="w-full p-3 rounded-xl border"
                                value={formData.no_telepon}
                                onChange={e => setFormData({...formData, no_telepon: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <label className="text-sm font-semibold">Status Pernikahan:</label>
                        <label className="flex items-center space-x-2">
                            <input 
                                type="radio" 
                                name="sudah_menikah" 
                                value="1" 
                                checked={formData.sudah_menikah === 1}
                                onChange={() => setFormData({...formData, sudah_menikah: 1})}
                            />
                            <span>Sudah Menikah</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input 
                                type="radio" 
                                name="sudah_menikah" 
                                value="0" 
                                checked={formData.sudah_menikah === 0}
                                onChange={() => setFormData({...formData, sudah_menikah: 0})}
                            />
                            <span>Belum Menikah</span>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Foto KTP</label>
                        <input 
                            type="file" 
                            className="w-full p-3 rounded-xl border"
                            onChange={e => setFotoKtp(e.target.files[0])}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Catatan</label>
                        <textarea 
                            className="w-full p-3 rounded-xl border h-32"
                            value={formData.catatan}
                            onChange={e => setFormData({...formData, catatan: e.target.value})}
                        ></textarea>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button 
                            type="button" 
                            onClick={() => navigate('/penghuni')}
                            className="px-6 py-2 rounded-xl text-gray-500 font-semibold"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-blue-600 text-white px-8 py-2 rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan Penghuni'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default PenghuniForm;
