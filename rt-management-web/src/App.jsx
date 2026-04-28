import { useState, useEffect } from 'react'
import client from './api/client'

function App() {
  const [ping, setPing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    client.get('/ping')
      .then(response => {
        setPing(response.data.message)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError('Gagal menghubungi backend')
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-4 text-blue-600">RT Management App</h1>
        <p className="text-gray-600 mb-6">Tahap 1: Setup & Ping Test</p>
        
        <div className="p-4 rounded border">
          {loading ? (
            <p className="text-yellow-500 font-semibold">Menghubungkan ke API...</p>
          ) : error ? (
            <p className="text-red-500 font-semibold">{error}</p>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-sm text-gray-500">Response dari Backend:</span>
              <span className="text-xl font-mono text-green-600 font-bold uppercase">{ping}</span>
            </div>
          )}
        </div>

        <div className="mt-8 text-xs text-gray-400">
          Backend: Laravel 10 (PHP 8.1) <br />
          Frontend: React + Vite + Tailwind
        </div>
      </div>
    </div>
  )
}

export default App
