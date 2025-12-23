import React, { useEffect, useState } from 'react';
import { ref, get, child, update } from 'firebase/database';
import { db } from '../services/firebase';
import QRCodeGenerator from './QRCodeGenerator';

interface StudentInfo {
  id: string;
  name: string;
  room: string;
  validTill?: string;
  phone?: string;
  hasPaid?: boolean;
}

interface MealLog {
  breakfast?: boolean;
  lunch?: boolean;
  dinner?: boolean;
}

const AdminMealReport: React.FC = () => {
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [logs, setLogs] = useState<Record<string, MealLog>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ breakfast: 0, lunch: 0, dinner: 0 });

  // Student Detail/Edit Modal State
  const [selectedStudent, setSelectedStudent] = useState<StudentInfo | null>(null);
  const [newValidTill, setNewValidTill] = useState('');
  const [updatingValidity, setUpdatingValidity] = useState(false);

  const fetchData = async (date: string) => {
    setLoading(true);
    try {
      const dbRef = ref(db);
      
      // 1. Fetch Master Student List
      const studentsSnapshot = await get(child(dbRef, 'students'));
      const studentList: StudentInfo[] = [];
      if (studentsSnapshot.exists()) {
        const data = studentsSnapshot.val();
        Object.keys(data).forEach(key => {
          studentList.push({
            id: key,
            ...data[key]
          });
        });
      }
      setStudents(studentList);

      // 2. Fetch Logs for specific date
      const logsSnapshot = await get(child(dbRef, `mealLogs/${date}`));
      const counts = { breakfast: 0, lunch: 0, dinner: 0 };

      if (logsSnapshot.exists()) {
        const logsData = logsSnapshot.val();
        setLogs(logsData);
        
        Object.values(logsData).forEach((meal: any) => {
          if (meal.breakfast) counts.breakfast++;
          if (meal.lunch) counts.lunch++;
          if (meal.dinner) counts.dinner++;
        });
      } else {
        setLogs({});
      }

      setStats(counts);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const shiftDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    const newDateStr = current.toISOString().split('T')[0];
    setSelectedDate(newDateStr);
  };

  const handleStudentClick = (student: StudentInfo) => {
    setSelectedStudent(student);
    setNewValidTill(student.validTill || '');
  };

  const handlePresetDate = (value: number, type: 'days' | 'months') => {
    const d = new Date(newValidTill || new Date());
    if (type === 'days') {
        d.setDate(d.getDate() + value);
    } else {
        d.setMonth(d.getMonth() + value);
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setNewValidTill(`${year}-${month}-${day}`);
  };

  const updateValidity = async () => {
    if (!selectedStudent || !newValidTill) return;
    setUpdatingValidity(true);
    try {
      const updates: any = {};
      updates[`/students/${selectedStudent.id}/validTill`] = newValidTill;
      updates[`/students/${selectedStudent.id}/hasPaid`] = true;
      
      await update(ref(db), updates);
      
      // Update local state
      setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, validTill: newValidTill, hasPaid: true } : s));
      setSelectedStudent(prev => prev ? { ...prev, validTill: newValidTill, hasPaid: true } : null);
      
      alert("Validity updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update validity.");
    } finally {
      setUpdatingValidity(false);
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-4 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <button onClick={() => window.location.hash = '/admin'} className="text-indigo-600 mb-2 hover:underline flex items-center text-sm font-medium">
                <i className="fas fa-arrow-left mr-2"></i> Back to Dashboard
            </button>
            <h2 className="text-3xl font-bold text-gray-800">Meal Reports</h2>
          </div>

          <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200">
              <button 
                onClick={() => shiftDate(-1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition"
                title="Previous Day"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              <div className="px-3 flex flex-col items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Select Date</span>
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={handleDateChange}
                    className="bg-transparent border-none rounded-lg text-sm font-bold text-indigo-700 p-0 focus:ring-0 cursor-pointer text-center"
                  />
              </div>

              <button 
                onClick={() => shiftDate(1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition"
                title="Next Day"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
          </div>
      </div>

      {loading ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <i className="fas fa-circle-notch fa-spin text-4xl text-indigo-500"></i>
            <p className="mt-4 text-gray-500 font-medium">Fetching logs for {selectedDate}...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="Breakfast" count={stats.breakfast} color="bg-orange-50 text-orange-700 border-orange-100" icon="fa-coffee" />
            <StatCard label="Lunch" count={stats.lunch} color="bg-green-50 text-green-700 border-green-100" icon="fa-hamburger" />
            <StatCard label="Dinner" count={stats.dinner} color="bg-blue-50 text-blue-700 border-blue-100" icon="fa-utensils" />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-gray-700">Detailed Breakdown</h3>
                        <p className="text-xs text-gray-400 italic">Showing {filteredStudents.length} of {students.length} students</p>
                    </div>
                    
                    <div className="relative flex-1 max-w-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="fas fa-search text-gray-400 text-xs"></i>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search by name, room or ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50/50"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                <i className="fas fa-times-circle"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-400 uppercase font-bold text-[10px] tracking-widest">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4 text-center">Room</th>
                    <th className="p-4 text-center">Breakfast</th>
                    <th className="p-4 text-center">Lunch</th>
                    <th className="p-4 text-center">Dinner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => {
                      const mealLog = logs[student.id] || {};
                      return (
                        <tr key={student.id} className="hover:bg-indigo-50/30 transition">
                          <td className="p-4 cursor-pointer group" onClick={() => handleStudentClick(student)}>
                              <div className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors flex items-center">
                                  {student.name}
                                  <i className="fas fa-external-link-alt text-[10px] ml-2 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                              </div>
                              <div className="text-[10px] font-mono text-gray-400">ID: {student.id}</div>
                          </td>
                          <td className="p-4 text-center text-gray-500 font-medium">{student.room}</td>
                          <td className="p-4 text-center">
                              <StatusIndicator active={mealLog.breakfast} />
                          </td>
                          <td className="p-4 text-center">
                              <StatusIndicator active={mealLog.lunch} />
                          </td>
                          <td className="p-4 text-center">
                              <StatusIndicator active={mealLog.dinner} />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-gray-400">
                        <i className={`fas ${searchTerm ? 'fa-search-minus' : 'fa-users-slash'} text-4xl mb-3 block opacity-20`}></i>
                        {searchTerm ? `No results found for "${searchTerm}"` : "No students registered yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Student Detail & Validity Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg">Student Details</h3>
                    <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-white/20 rounded-lg transition">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold">
                            {selectedStudent.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-800">{selectedStudent.name}</h4>
                            <p className="text-sm text-gray-500">Room: {selectedStudent.room} • ID: {selectedStudent.id}</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center mb-8 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <QRCodeGenerator data={`studentID-${selectedStudent.id}`} size={140} />
                        <span className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-bold">Verification QR</span>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Update Validity</label>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${new Date(selectedStudent.validTill || '') < new Date() ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    Current: {selectedStudent.validTill}
                                </span>
                            </div>
                            
                            <div className="flex gap-2 mb-3">
                                <button 
                                    onClick={() => handlePresetDate(15, 'days')}
                                    className="flex-1 py-2 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition"
                                >
                                    +15 Days
                                </button>
                                <button 
                                    onClick={() => handlePresetDate(1, 'months')}
                                    className="flex-1 py-2 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition"
                                >
                                    +1 Month
                                </button>
                            </div>
                            
                            <input 
                                type="date" 
                                value={newValidTill}
                                onChange={(e) => setNewValidTill(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm font-medium"
                            />
                        </div>

                        <button 
                            onClick={updateValidity}
                            disabled={updatingValidity || newValidTill === selectedStudent.validTill}
                            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all ${
                                updatingValidity || newValidTill === selectedStudent.validTill
                                ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                            }`}
                        >
                            {updatingValidity ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-save mr-2"></i>}
                            {updatingValidity ? 'Saving...' : 'Save New Validity'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const StatusIndicator = ({ active }: { active?: boolean }) => (
    active ? (
        <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full animate-in zoom-in duration-300">
            <i className="fas fa-check text-xs"></i>
        </div>
    ) : (
        <span className="text-gray-200">—</span>
    )
);

const StatCard = ({ label, count, color, icon }: any) => (
    <div className={`p-5 rounded-2xl flex items-center justify-between border ${color} shadow-sm`}>
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
            <p className="text-3xl font-black">{count}</p>
        </div>
        <div className="text-4xl opacity-10">
            <i className={`fas ${icon}`}></i>
        </div>
    </div>
);

export default AdminMealReport;