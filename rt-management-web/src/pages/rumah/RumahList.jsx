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
            <div className="p-10 bg-white min-h-screen">
                <div className="mb-10">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Property Map</h1>
                    <p className="text-sm text-slate-400 mt-1">Status of residential units in Elite Residence</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {isLoading ? (
                        <p className="text-slate-400 font-medium">Loading map...</p>
                    ) : response?.data?.map((rumah) => (
                        <Link 
                            key={rumah.id} 
                            to={`/rumah/${rumah.id}`}
                            className={`aspect-square rounded-2xl p-6 flex flex-col justify-between transition-all border shadow-sm group hover:border-slate-900 ${
                                rumah.penghunian_aktif 
                                ? 'bg-white border-gray-100' 
                                : 'bg-gray-50/50 border-gray-100'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <span className={`text-2xl font-bold tracking-tight ${rumah.penghunian_aktif ? 'text-slate-900' : 'text-slate-300'}`}>
                                    {rumah.label}
                                </span>
                                <div className={`w-2 h-2 rounded-full ${rumah.penghunian_aktif ? 'bg-emerald-400' : 'bg-gray-200'}`}></div>
                            </div>
                            
                            <div className="mt-4">
                                {rumah.penghunian_aktif ? (
                                    <div className="text-[10px] font-bold uppercase tracking-widest">
                                        <p className="text-emerald-600 mb-1">Occupied</p>
                                        <p className="text-slate-900 truncate normal-case tracking-normal text-xs font-bold">{rumah.penghunian_aktif.penghuni?.nama_lengkap}</p>
                                    </div>
                                ) : (
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                                        <p>Vacant</p>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-12 flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 border border-gray-100 px-6 py-4 rounded-2xl inline-flex bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full"></div>
                        <span>Occupied</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-gray-200 rounded-full"></div>
                        <span>Vacant / Available</span>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default RumahList;
