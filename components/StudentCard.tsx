import React, { useEffect, useState } from 'react';
import { getStudent } from '../services/db';
import { Student } from '../types';
import QRCodeGenerator from './QRCodeGenerator';

interface StudentCardProps {
  studentId: string;
}

const StudentCard: React.FC<StudentCardProps> = ({ studentId }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError('');
        if (!studentId) {
            setError('No Student ID provided.');
            return;
        }
        
        const data = await getStudent(studentId);
        if (data) {
          setStudent(data);
        } else {
          setError(`Student with ID '${studentId}' not found in database.`);
        }
      } catch (err) {
        setError('Failed to load data. Please check connection.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [studentId]);

  const handleLogout = () => {
      localStorage.removeItem('studentAuth');
      window.location.hash = '/';
  };

  const goHome = () => {
      window.location.hash = '/';
  };

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <i className="fas fa-spinner fa-spin text-4xl text-indigo-500 mb-4"></i>
              <p className="text-gray-500">Loading Student Profile...</p>
          </div>
      );
  }

  if (error) {
      return (
          <div className="p-8 text-center">
              <div className="inline-block p-4 rounded-full bg-red-100 text-red-500 mb-4">
                  <i className="fas fa-exclamation-triangle text-2xl"></i>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button onClick={goHome} className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Go Home</button>
          </div>
      );
  }

  if (!student) return null;

  return (
    <div className="max-w-md mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
            <button onClick={goHome} className="inline-flex items-center text-indigo-600 hover:underline focus:outline-none">
                <i className="fas fa-arrow-left mr-2"></i> Home
            </button>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
                Logout <i className="fas fa-sign-out-alt ml-1"></i>
            </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-indigo-600 p-6 text-white text-center">
                <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl font-bold border-4 border-indigo-400">
                    {student.name.charAt(0)}
                </div>
                <h1 className="text-2xl font-bold">{student.name}</h1>
                <p className="opacity-90 font-mono text-sm">Room: {student.room}</p>
            </div>

            <div className="p-6 flex flex-col items-center">
                {/* Valid Till Badge */}
                <div className={`mb-6 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    student.hasPaid ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                    {student.hasPaid ? `Valid Till: ${student.validTill}` : 'Fees Not Paid'}
                </div>

                <div className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-xl mb-6">
                    <QRCodeGenerator data={`studentID-${student.id}`} size={200} />
                </div>

                <div className="w-full">
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-4 text-center">— Today's Meals —</h3>
                    <div className="grid grid-cols-3 gap-3">
                        <MealStatus label="Breakfast" taken={student.mealsToday.breakfast} />
                        <MealStatus label="Lunch" taken={student.mealsToday.lunch} />
                        <MealStatus label="Dinner" taken={student.mealsToday.dinner} />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

const MealStatus = ({ label, taken }: { label: string, taken: boolean }) => (
    <div className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors ${
        taken 
        ? 'bg-gray-50 border-gray-200 opacity-60' 
        : 'bg-indigo-50 border-indigo-100'
    }`}>
        <div className={`text-xl mb-1 ${taken ? 'text-gray-400' : 'text-indigo-600'}`}>
            <i className={`fas ${taken ? 'fa-check-circle' : 'fa-utensils'}`}></i>
        </div>
        <div className="text-xs font-medium text-gray-600">{label}</div>
    </div>
);

export default StudentCard;