import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const LoginPage = () => {
    const [email, setEmail] = useState('admin@rt.local');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState(null);
    const login = useAuthStore((state) => state.login);
    const loading = useAuthStore((state) => state.loading);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login gagal. Cek email dan password.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-10 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">RT Admin Portal</h1>
                    <p className="text-slate-500 mt-2 text-sm">Please enter your credentials to continue</p>
                </div>
                
                <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-medium border border-red-100 text-center">
                            {error}
                        </div>
                    )}
                    
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-sm"
                            placeholder="admin@rt.local"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-sm"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 text-sm mt-4"
                    >
                        {loading ? 'Verifying...' : 'Sign In'}
                    </button>
                </form>
                
                <div className="py-6 bg-gray-50/50 border-t border-gray-100 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">
                        Secure Administrative Access
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
