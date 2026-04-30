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
            <div className="p-10 min-h-screen">
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Property Map</h1>
                        <p className="text-sm text-slate-400 mt-1">Status of residential units in Elite Residence</p>
                    </div>
                    <Link 
                        to="/rumah/baru" 
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-[0.98]"
                    >
                        Tambah Rumah
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {isLoading ? (
                        <p className="text-slate-400 font-medium">Loading map...</p>
                    ) : response?.data?.map((rumah) => {
                        const penghuni = rumah.penghunian_aktif?.penghuni;
                        const statusPenghuni = penghuni?.status;
                        const isOccupied = !!rumah.penghunian_aktif;
                        
                        return (
                            <Link 
                                key={rumah.id} 
                                to={`/rumah/${rumah.id}`}
                                className={`aspect-square rounded-2xl p-6 flex flex-col justify-between transition-all border shadow-md group hover:border-slate-900 ${
                                    isOccupied 
                                    ? statusPenghuni === 'tetap'
                                        ? 'bg-white border-l-4 border-l-emerald-400 border-t-gray-200 border-r-gray-200 border-b-gray-200'
                                        : 'bg-white border-l-4 border-l-orange-400 border-t-gray-200 border-r-gray-200 border-b-gray-200'
                                    : 'bg-gray-50/50 border-gray-200'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={`text-2xl font-bold tracking-tight ${isOccupied ? 'text-slate-900' : 'text-slate-300'}`}>
                                        {rumah.label}
                                    </span>
                                    <div className={`w-2 h-2 rounded-full ${isOccupied ? 'bg-emerald-400' : 'bg-gray-200'}`}></div>
                                </div>
                                
                                <div className="mt-4">
                                    {isOccupied ? (
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                                    statusPenghuni === 'tetap' 
                                                        ? 'bg-emerald-50 text-emerald-600' 
                                                        : 'bg-orange-50 text-orange-600'
                                                }`}>
                                                    {statusPenghuni === 'tetap' ? 'Tetap' : 'Kontrak'}
                                                </span>
                                            </div>
                                            <p className="text-slate-900 truncate text-xs font-bold">{penghuni?.nama_lengkap}</p>
                                        </div>
                                    ) : (
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                                            <p>Vacant</p>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-12 flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 border border-gray-200 px-6 py-4 rounded-2xl inline-flex bg-white shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full"></div>
                        <span>Tetap</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-orange-400 rounded-full"></div>
                        <span>Kontrak</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-gray-200 rounded-full"></div>
                        <span>Vacant</span>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default RumahList;
