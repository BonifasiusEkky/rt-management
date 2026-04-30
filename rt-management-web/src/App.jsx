import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/useAuthStore';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import PenghuniList from './pages/penghuni/PenghuniList';
import PenghuniForm from './pages/penghuni/PenghuniForm';
import PenghuniDetail from './pages/penghuni/PenghuniDetail';
import RumahList from './pages/rumah/RumahList';
import RumahDetail from './pages/rumah/RumahDetail';
import RumahForm from './pages/rumah/RumahForm';
import PembayaranList from './pages/pembayaran/PembayaranList';
import PembayaranForm from './pages/pembayaran/PembayaranForm';
import PengeluaranList from './pages/pengeluaran/PengeluaranList';
import PengaturanPage from './pages/pengaturan/PengaturanPage';
import Tagihan from './pages/Tagihan';
import Laporan from './pages/Laporan';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* Penghuni Routes */}
        <Route path="/penghuni" element={<ProtectedRoute><PenghuniList /></ProtectedRoute>} />
        <Route path="/penghuni/baru" element={<ProtectedRoute><PenghuniForm /></ProtectedRoute>} />
        <Route path="/penghuni/:id" element={<ProtectedRoute><PenghuniDetail /></ProtectedRoute>} />
        
        {/* Rumah Routes */}
        <Route path="/rumah" element={<ProtectedRoute><RumahList /></ProtectedRoute>} />
        <Route path="/rumah/baru" element={<ProtectedRoute><RumahForm /></ProtectedRoute>} />
        <Route path="/rumah/:id" element={<ProtectedRoute><RumahDetail /></ProtectedRoute>} />
        <Route path="/rumah/:id/edit" element={<ProtectedRoute><RumahForm /></ProtectedRoute>} />
  
        {/* Pembayaran Routes */}
        <Route path="/pembayaran" element={<ProtectedRoute><PembayaranList /></ProtectedRoute>} />
        <Route path="/pembayaran/baru" element={<ProtectedRoute><PembayaranForm /></ProtectedRoute>} />
  
        {/* Pengeluaran Routes */}
        <Route path="/pengeluaran" element={<ProtectedRoute><PengeluaranList /></ProtectedRoute>} />
  
        {/* Tagihan Route */}
        <Route path="/tagihan" element={<ProtectedRoute><Tagihan /></ProtectedRoute>} />

        {/* Laporan Route */}
        <Route path="/laporan" element={<ProtectedRoute><Laporan /></ProtectedRoute>} />
  
        {/* Pengaturan Routes */}
        <Route path="/pengaturan" element={<ProtectedRoute><PengaturanPage /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
