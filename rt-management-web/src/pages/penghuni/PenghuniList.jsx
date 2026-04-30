import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import client from '../../api/client';
import Layout from '../../components/Layout';

const PenghuniList = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState('active'); // active or archived
    
    const { data: response, isLoading } = useQuery({
        queryKey: ['penghuni', page, search, tab],
        queryFn: () => client.get(`/penghuni`, { 
            params: { 
                page, 
                search, 
                is_archived: tab === 'archived' ? 1 : 0 
            } 
        }).then(res => res.data)
    });

    const penghunis = response?.data || [];
    const pagination = response?.meta || {};
    const lastPage = pagination.last_page || 1;

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleTabChange = (newTab) => {
        setTab(newTab);
        setPage(1);
    };

    return (
        <Layout>
            <div className="p-10 min-h-screen">
                {/* Header */}
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Residents</h1>
                        <p className="text-sm text-slate-400 mt-1">Manage permanent and contract residents</p>
                    </div>
                    <div className="flex gap-3">
                        <input 
                            type="text" 
                            placeholder="Search name..." 
                            className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none transition-all w-64"
                            value={search}
                            onChange={handleSearch}
                        />
                        <Link 
                            to="/penghuni/baru" 
                            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-[0.98]"
                        >
                            Add Resident
                        </Link>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 border-b border-gray-100 mb-8">
                    <button 
                        onClick={() => handleTabChange('active')}
                        className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${tab === 'active' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Active Residents
                        {tab === 'active' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900 rounded-full" />}
                    </button>
                    <button 
                        onClick={() => handleTabChange('archived')}
                        className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${tab === 'archived' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Archived / History
                        {tab === 'archived' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900 rounded-full" />}
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Name</th>
                                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Status</th>
                                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Phone</th>
                                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Marital Status</th>
                                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-16 text-center text-slate-400 font-medium">Loading data...</td>
                                </tr>
                            ) : penghunis.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-16 text-center text-slate-400 font-medium">No residents found.</td>
                                </tr>
                            ) : penghunis.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="font-bold text-slate-900">{p.nama_lengkap}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                            p.status === 'tetap' 
                                                ? 'bg-emerald-50 text-emerald-600' 
                                                : 'bg-orange-50 text-orange-600'
                                        }`}>
                                            {p.status === 'tetap' ? 'Permanent' : 'Contract'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-slate-500 font-medium">{p.no_telepon}</td>
                                    <td className="px-8 py-5">
                                        {p.sudah_menikah ? (
                                            <span className="text-[10px] font-bold text-slate-500 bg-gray-100 px-2 py-0.5 rounded uppercase">Married</span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-300 uppercase">Single</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <Link to={`/penghuni/${p.id}`} className="text-slate-900 hover:text-slate-600 font-bold text-xs underline underline-offset-4">View Details</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-10 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        Page <span className="text-slate-900">{page}</span> of <span className="text-slate-900">{lastPage}</span>
                        {pagination.total && <span className="ml-4 opacity-50">Total: {pagination.total}</span>}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1 || isLoading}
                            className="px-4 py-2 rounded-xl border border-gray-100 text-slate-600 text-xs font-bold hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            Previous
                        </button>
                        
                        <div className="flex gap-1">
                            {Array.from({ length: lastPage }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    disabled={isLoading}
                                    className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                                        page === pageNum
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-400 hover:bg-gray-50'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            ))}
                        </div>
                        
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === lastPage || isLoading}
                            className="px-4 py-2 rounded-xl border border-gray-100 text-slate-600 text-xs font-bold hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default PenghuniList;
