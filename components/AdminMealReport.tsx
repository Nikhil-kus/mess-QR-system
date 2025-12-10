import React, { useEffect, useState } from 'react';
import { ref, get, child } from 'firebase/database';
import { db } from '../services/firebase';

interface StudentData {
  id: string;
  name: string;
  mealsToday: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
}

const AdminMealReport: React.FC = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ breakfast: 0, lunch: 0, dinner: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, 'students'));
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const studentList: StudentData[] = [];
          const counts = { breakfast: 0, lunch: 0, dinner: 0 };

          Object.keys(data).forEach((key) => {
            const s = data[key];
            const meals = s.mealsToday || { breakfast: false, lunch: false, dinner: false };
            
            // Count stats
            if (meals.breakfast) counts.breakfast++;
            if (meals.lunch) counts.lunch++;
            if (meals.dinner) counts.dinner++;

            studentList.push({
              id: key,
              name: s.name,
              mealsToday: meals
            });
          });

          setStudents(studentList);
          setStats(counts);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 animate-in fade-in">
      <button onClick={() => window.location.hash = '/admin'} className="text-indigo-600 mb-4 hover:underline flex items-center">
         <i className="fas fa-arrow-left mr-2"></i> Back to Dashboard
      </button>

      <h2 className="text-3xl font-bold text-gray-800 mb-6">Daily Meal Report</h2>

      {loading ? (
        <div className="text-center py-12">
            <i className="fas fa-circle-notch fa-spin text-4xl text-indigo-300"></i>
            <p className="mt-4 text-gray-500">Loading Report Data...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard label="Breakfast" count={stats.breakfast} color="bg-orange-100 text-orange-700" icon="fa-coffee" />
            <StatCard label="Lunch" count={stats.lunch} color="bg-green-100 text-green-700" icon="fa-hamburger" />
            <StatCard label="Dinner" count={stats.dinner} color="bg-blue-100 text-blue-700" icon="fa-utensils" />
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-xs">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Name</th>
                    <th className="p-4 text-center">Breakfast</th>
                    <th className="p-4 text-center">Lunch</th>
                    <th className="p-4 text-center">Dinner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.length > 0 ? (
                    students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 font-mono text-xs text-gray-400">{student.id}</td>
                        <td className="p-4 font-medium text-gray-800">{student.name}</td>
                        <td className="p-4 text-center">
                            {student.mealsToday.breakfast ? 
                                <i className="fas fa-check-circle text-green-500 text-lg"></i> : 
                                <span className="text-gray-200">-</span>
                            }
                        </td>
                        <td className="p-4 text-center">
                            {student.mealsToday.lunch ? 
                                <i className="fas fa-check-circle text-green-500 text-lg"></i> : 
                                <span className="text-gray-200">-</span>
                            }
                        </td>
                        <td className="p-4 text-center">
                            {student.mealsToday.dinner ? 
                                <i className="fas fa-check-circle text-green-500 text-lg"></i> : 
                                <span className="text-gray-200">-</span>
                            }
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400">No student data found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const StatCard = ({ label, count, color, icon }: any) => (
    <div className={`p-4 rounded-xl flex items-center justify-between ${color}`}>
        <div>
            <p className="text-xs font-bold uppercase opacity-75">{label}</p>
            <p className="text-2xl font-bold">{count}</p>
        </div>
        <div className="text-3xl opacity-20">
            <i className={`fas ${icon}`}></i>
        </div>
    </div>
);

export default AdminMealReport;