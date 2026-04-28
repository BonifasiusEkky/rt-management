import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import Layout from '../../components/Layout';

const RumahList = () => {
    const { data: response, isLoading } = useQuery({
        queryKey: ['rumah'],
        queryFn: () => client.get('/rumah').then(res => res.data)
    });

    return (
        <Layout>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Peta Rumah</h1>
                    <p className="text-gray-500">Grid 20 unit rumah di Elite Residence.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {isLoading ? (
                        <p className="text-gray-400">Loading grid...</p>
                    ) : response?.data?.map((rumah) => (
                        <Link 
                            key={rumah.id} 
                            to={`/rumah/${rumah.id}`}
                            className={`aspect-square rounded-2xl p-6 flex flex-col justify-between transition transform hover:scale-105 shadow-sm border-2 ${
                                rumah.penghunian_aktif 
                                ? 'bg-blue-50 border-blue-200 hover:border-blue-400' 
                                : 'bg-gray-50 border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <span className={`text-2xl font-black ${rumah.penghunian_aktif ? 'text-blue-700' : 'text-gray-400'}`}>
                                    {rumah.label}
                                </span>
                                <div className={`w-3 h-3 rounded-full ${rumah.penghunian_aktif ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                            </div>
                            
                            <div className="mt-4">
                                {rumah.penghunian_aktif ? (
                                    <div className="text-xs">
                                        <p className="text-blue-400 font-bold uppercase tracking-wider">Terisi</p>
                                        <p className="text-blue-900 font-semibold truncate">{rumah.penghunian_aktif.penghuni?.nama_lengkap}</p>
                                    </div>
                                ) : (
                                    <div className="text-xs">
                                        <p className="text-gray-400 font-bold uppercase tracking-wider">Kosong</p>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-12 flex items-center space-x-6 text-sm text-gray-500 bg-white p-4 rounded-xl border inline-flex">
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span>Berpenghuni</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gray-300 rounded"></div>
                        <span>Kosong / Tersedia</span>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default RumahList;
