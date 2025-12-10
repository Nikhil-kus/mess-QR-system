import React, { useState } from 'react';
import { ref, set } from 'firebase/database';
import { db } from '../services/firebase';
import QRCodeGenerator from './QRCodeGenerator';

const AdminAddStudent: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    room: '',
    phone: '',
    validTill: ''
  });
  const [generatedId, setGeneratedId] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateId = () => {
    // Generate simple 4-digit ID suffix
    const random = Math.floor(1000 + Math.random() * 9000);
    // Generate simple 6-digit numeric password
    const pwd = Math.floor(100000 + Math.random() * 900000).toString();
    
    setGeneratedId(`studentID-${random}`);
    setGeneratedPassword(pwd);
    setSuccess(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePresetDate = (value: number, type: 'days' | 'months') => {
    const d = new Date();
    if (type === 'days') {
        d.setDate(d.getDate() + value);
    } else {
        d.setMonth(d.getMonth() + value);
    }
    // Format YYYY-MM-DD manually to avoid timezone issues with toISOString
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setFormData(prev => ({ ...prev, validTill: `${year}-${month}-${day}` }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatedId || !generatedPassword) {
      setError("Please generate a Student ID first.");
      return;
    }
    if (!formData.name || !formData.room || !formData.validTill) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    // Parse ID "studentID-1234" -> "1234"
    const idSuffix = generatedId.split('-')[1];
    
    // Construct DB Object matching specific schema
    const newStudent = {
      name: formData.name,
      room: formData.room,
      phone: formData.phone,
      hasPaid: false, // Default per requirements
      validTill: formData.validTill,
      qrData: generatedId,
      password: generatedPassword, // Save the generated password
      mealsToday: {
        breakfast: false,
        lunch: false,
        dinner: false
      }
    };

    try {
      // Write to Firebase: /students/{idSuffix}
      await set(ref(db, `students/${idSuffix}`), newStudent);
      setSuccess(idSuffix);
      
      // Clear form
      setFormData({ name: '', room: '', phone: '', validTill: '' });
      setGeneratedId('');
      setGeneratedPassword('');
    } catch (err) {
      console.error(err);
      setError("Failed to save student to database. Check console/permissions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={() => window.location.hash = '/admin'} className="text-indigo-600 mb-4 hover:underline flex items-center">
         <i className="fas fa-arrow-left mr-2"></i> Back to Dashboard
      </button>
      
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Add Student</h2>

        {success ? (
           <div className="text-center py-8">
             <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
               <i className="fas fa-check"></i>
             </div>
             <h3 className="text-xl font-bold text-gray-800 mb-2">Student added successfully</h3>
             <p className="text-gray-500 mb-6">Database ID: <strong>{success}</strong></p>
             
             <div className="space-y-3">
                 <button 
                   onClick={() => window.location.hash = `/student?id=${success}`}
                   className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition shadow-md"
                 >
                   View Student Page
                 </button>
                 <button 
                   onClick={() => setSuccess(null)}
                   className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                 >
                   + Add Another
                 </button>
             </div>
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200 flex items-start">
                <i className="fas fa-exclamation-circle mt-1 mr-2"></i>
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
              <input 
                name="name" type="text" required value={formData.name} onChange={handleChange}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="e.g. John Doe"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Room</label>
                <input 
                  name="room" type="text" required value={formData.room} onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  placeholder="e.g. 101"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Valid Till</label>
                <div className="flex gap-1 mb-2">
                    <button 
                        type="button"
                        onClick={() => handlePresetDate(15, 'days')}
                        className="flex-1 py-1 text-[10px] sm:text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded hover:bg-indigo-100 transition whitespace-nowrap"
                    >
                        +15 Days
                    </button>
                    <button 
                        type="button"
                        onClick={() => handlePresetDate(1, 'months')}
                        className="flex-1 py-1 text-[10px] sm:text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded hover:bg-indigo-100 transition whitespace-nowrap"
                    >
                        +1 Month
                    </button>
                </div>
                <input 
                  name="validTill" type="date" required value={formData.validTill} onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Phone</label>
              <input 
                name="phone" type="tel" value={formData.phone} onChange={handleChange}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="e.g. 1234567890"
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">Credentials</label>
              
              <div className="flex gap-2 mb-4">
                 <input 
                   readOnly value={generatedId} 
                   placeholder="Student ID"
                   className="flex-grow p-3 bg-gray-100 border border-gray-300 rounded-lg font-mono text-gray-600 text-sm"
                 />
                 <button 
                   type="button" 
                   onClick={generateId}
                   className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition font-medium text-sm whitespace-nowrap"
                 >
                   Generate
                 </button>
              </div>

              {generatedPassword && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex justify-between items-center animate-in fade-in">
                      <div>
                          <span className="text-xs text-yellow-800 font-bold uppercase block">Generated Password</span>
                          <span className="font-mono text-lg text-gray-800 tracking-wider">{generatedPassword}</span>
                      </div>
                      <i className="fas fa-key text-yellow-400 text-xl"></i>
                  </div>
              )}
              
              {generatedId && (
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 animate-in fade-in">
                  <span className="text-xs text-gray-400 mb-2">QR PREVIEW</span>
                  <QRCodeGenerator data={generatedId} size={150} />
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-3.5 rounded-lg font-bold text-lg text-white shadow-lg transition-all ${
                loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl active:scale-95'
              }`}
            >
              {loading ? 'Saving...' : 'Add Student'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminAddStudent;