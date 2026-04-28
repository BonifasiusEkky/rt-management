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
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 bg-blue-600 font-bold text-xl">
                    RT Management
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/" className="block p-3 rounded-lg hover:bg-slate-800 transition">Dashboard</Link>
                    <Link to="/penghuni" className="block p-3 rounded-lg hover:bg-slate-800 transition">Data Penghuni</Link>
                    <Link to="/rumah" className="block p-3 rounded-lg hover:bg-slate-800 transition">Data Rumah</Link>
                    <Link to="/tagihan" className="block p-3 rounded-lg hover:bg-slate-800 transition">Tagihan</Link>
                    <Link to="/pembayaran" className="block p-3 rounded-lg hover:bg-slate-800 transition">Pembayaran</Link>
                    <Link to="/pengeluaran" className="block p-3 rounded-lg hover:bg-slate-800 transition">Pengeluaran</Link>
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <div className="text-sm font-semibold">{user?.name}</div>
                    <button onClick={handleLogout} className="text-xs text-red-400 mt-1 hover:text-red-300">Logout</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
};

export default Layout;
