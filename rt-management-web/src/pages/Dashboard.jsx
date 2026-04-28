import { useState } from 'react';
import client from './api/client';
import Layout from './components/Layout';

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await client.post('/tagihan/generate');
      setMessage(response.data.message);
    } catch (err) {
      console.error(err);
      setMessage('Gagal generate tagihan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-gray-600 mb-8">Selamat datang di sistem manajemen RT Elite Residence.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Tagihan Bulan Ini</h3>
              <p className="text-xs text-gray-500 mb-4">Klik tombol di bawah untuk membuat tagihan otomatis bulan ini.</p>
            </div>
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? 'Processing...' : 'Generate Tagihan Otomatis'}
            </button>
            {message && <p className="mt-2 text-xs text-green-600 font-semibold text-center">{message}</p>}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-blue-800 text-sm">
          <strong>Tip:</strong> Tagihan akan otomatis di-generate oleh sistem setiap tanggal 1 jam 01:00 pagi. Tombol di atas hanya untuk memicu proses secara manual jika diperlukan.
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
