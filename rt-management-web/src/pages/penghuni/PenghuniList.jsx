import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import Layout from '../../components/Layout';

const PenghuniList = () => {
    const { data: response, isLoading } = useQuery({
        queryKey: ['penghuni'],
        queryFn: () => client.get('/penghuni').then(res => res.data)
    });

    return (
        <Layout>
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Daftar Penghuni</h1>
                        <p className="text-gray-500">Kelola data warga tetap maupun kontrak.</p>
                    </div>
                    <Link 
                        to="/penghuni/baru" 
                        className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition"
                    >
                        + Tambah Penghuni
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Nama Lengkap</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">No. Telepon</th>
                                <th className="px-6 py-4">Pernikahan</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">Loading data...</td>
                                </tr>
                            ) : response?.data?.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{p.nama_lengkap}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                            p.status === 'tetap' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{p.no_telepon}</td>
                                    <td className="px-6 py-4">
                                        {p.sudah_menikah ? (
                                            <span className="text-blue-600 text-xs font-semibold">Sudah Menikah</span>
                                        ) : (
                                            <span className="text-gray-400 text-xs font-semibold">Belum Menikah</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link to={`/penghuni/${p.id}`} className="text-blue-600 hover:underline font-semibold text-sm">Detail</Link>
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

export default PenghuniList;
