import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import Layout from '../../components/Layout';

const PembayaranList = () => {
    const { data: response, isLoading } = useQuery({
        queryKey: ['pembayaran'],
        queryFn: () => client.get('/pembayaran').then(res => res.data)
    });

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <Layout>
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Riwayat Pembayaran</h1>
                        <p className="text-gray-500">Semua transaksi iuran masuk.</p>
                    </div>
                    <Link 
                        to="/pembayaran/baru" 
                        className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition"
                    >
                        + Input Pembayaran
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Tgl Bayar</th>
                                <th className="px-6 py-4">Warga / Rumah</th>
                                <th className="px-6 py-4">Jumlah</th>
                                <th className="px-6 py-4">Metode</th>
                                <th className="px-6 py-4">Periode</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">Loading data...</td>
                                </tr>
                            ) : response?.data?.map((p) => {
                                // Ambil info rumah dari tagihan pertama
                                const houseInfo = p.tagihans?.[0]?.penghunian;
                                return (
                                    <tr key={p.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-gray-600 text-sm">{p.tanggal_bayar}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{houseInfo?.penghuni?.nama_lengkap}</div>
                                            <div className="text-xs text-gray-400">Rumah {houseInfo?.rumah?.blok}{houseInfo?.rumah?.nomor_rumah}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-green-600">
                                            {formatCurrency(p.jumlah_bayar)}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">{p.metode}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-[10px] font-bold">
                                                {p.periode_dibayar} BULAN
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link to={`/pembayaran/${p.id}`} className="text-blue-600 hover:underline font-semibold text-sm">Detail</Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default PembayaranList;
