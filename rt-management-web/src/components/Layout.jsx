import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const Layout = ({ children }) => {
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
                <div className="p-8 font-bold text-xl tracking-tight text-slate-900">
                    RT Admin
                </div>
                <nav className="flex-1 px-4 space-y-1">
                    <Link to="/" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">Dashboard</Link>
                    <Link to="/penghuni" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">Data Penghuni</Link>
                    <Link to="/rumah" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">Data Rumah</Link>
                    <Link to="/tagihan" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">Tagihan</Link>
                    <Link to="/pembayaran" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">Pembayaran</Link>
                    <Link to="/pengeluaran" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">Pengeluaran</Link>
                </nav>
                <div className="p-6 border-t border-gray-50">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Account</div>
                    <div className="text-sm font-semibold text-slate-900">{user?.name}</div>
                    <button onClick={handleLogout} className="text-xs text-slate-400 mt-1 hover:text-red-500 transition-colors">Sign Out</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-white">
                {children}
            </main>
        </div>
    );
};

export default Layout;
