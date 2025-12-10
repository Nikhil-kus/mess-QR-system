import React, { useState } from 'react';
import { ref, get, child } from 'firebase/database';
import { db } from '../services/firebase';

const StudentLogin: React.FC = () => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !password) {
      setError('Please enter both ID and Password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch student directly by ID (key)
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, `students/${studentId}`));

      if (snapshot.exists()) {
        const student = snapshot.val();
        
        // Check password (simple check for MVP)
        if (student.password === password) {
            // Success: Store auth ID in local storage for the session
            localStorage.setItem('studentAuth', studentId);
            // Redirect to Student Card
            window.location.hash = `/student?id=${studentId}`;
        } else {
            setError('Invalid Password');
        }
      } else {
        setError('Student ID not found');
      }
    } catch (err) {
      console.error(err);
      setError('Login failed. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-user-graduate text-2xl text-indigo-600"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Student Login</h2>
          <p className="text-sm text-gray-500 mt-1">Enter your details to view card</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="space-y-4 mb-6">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Student ID</label>
                <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. 1234"
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
            </div>
            
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
            </div>
          
            {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 text-white rounded-xl font-bold shadow-md transition-all ${
                loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg active:scale-95'
            }`}
          >
            {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Login'}
          </button>
        </form>

        <div className="text-center mt-6">
            <button onClick={() => window.location.hash = '/'} className="text-sm text-gray-400 hover:text-gray-600">Return Home</button>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;