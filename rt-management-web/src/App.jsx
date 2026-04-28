import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/useAuthStore';
import LoginPage from './pages/LoginPage';
import PenghuniList from './pages/penghuni/PenghuniList';
import PenghuniForm from './pages/penghuni/PenghuniForm';
import PenghuniDetail from './pages/penghuni/PenghuniDetail';
import RumahList from './pages/rumah/RumahList';
import RumahDetail from './pages/rumah/RumahDetail';

// Dashboard Placeholder
const Dashboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600">Selamat datang di sistem manajemen RT Elite Residence.</p>
    </div>
  );
};

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
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      
      {/* Penghuni Routes */}
      <Route path="/penghuni" element={<ProtectedRoute><PenghuniList /></ProtectedRoute>} />
      <Route path="/penghuni/baru" element={<ProtectedRoute><PenghuniForm /></ProtectedRoute>} />
      <Route path="/penghuni/:id" element={<ProtectedRoute><PenghuniDetail /></ProtectedRoute>} />
      
      {/* Rumah Routes */}
      <Route path="/rumah" element={<ProtectedRoute><RumahList /></ProtectedRoute>} />
      <Route path="/rumah/:id" element={<ProtectedRoute><RumahDetail /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
