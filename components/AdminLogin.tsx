import React, { useState, useEffect } from 'react';
import { ref, get, child } from 'firebase/database';
import { db } from '../services/firebase';

const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear any existing auth state on mount to ensure fresh login
  useEffect(() => {
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('adminEmail');
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const dbRef = ref(db);
      // Fetch password from DB at /adminPassword
      const snapshot = await get(child(dbRef, 'adminPassword'));
      
      // Default to 'admin123' if not set in DB
      const dbPassword = snapshot.exists() ? snapshot.val() : 'admin123';

      if (password === dbPassword) {
        localStorage.setItem('adminLoggedIn', 'true');
        window.location.hash = '/admin';
      } else {
        setError('Incorrect password');
      }
    } catch (err) {
      console.error("Login error:", err);
      // Fallback in case of connection error, mainly for demo stability
      if (password === 'admin123') {
           localStorage.setItem('adminLoggedIn', 'true');
           window.location.hash = '/admin';
      } else {
           setError('Login failed. Please check connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-user-shield text-2xl text-indigo-600"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Portal</h2>
          <p className="text-sm text-gray-500 mt-2">Restricted access for Mess Staff.</p>
        </div>

        <form onSubmit={handleLogin}>
            <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Admin Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    placeholder="Enter admin password"
                    autoFocus
                />
                <p className="text-xs text-gray-400 mt-1 italic text-right">Default: admin123</p>
            </div>

            {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start text-left">
                    <i className="fas fa-exclamation-circle text-red-500 mt-0.5 mr-2 flex-shrink-0"></i>
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
            )}

            <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 rounded-xl border flex items-center justify-center space-x-3 transition-all shadow-sm hover:shadow-md ${
                loading 
                ? 'bg-indigo-400 text-white cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
            }`}
            >
            {loading ? (
                <i className="fas fa-circle-notch fa-spin"></i>
            ) : (
                <span className="font-bold">Login</span>
            )}
            </button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-gray-50">
            <button onClick={() => window.location.hash = '/'} className="text-sm text-gray-400 hover:text-gray-600 flex items-center justify-center mx-auto">
                <i className="fas fa-arrow-left mr-1"></i> Return Home
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;