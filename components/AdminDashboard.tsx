import React from 'react';

const AdminDashboard: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    window.location.hash = '/';
  };

  return (
    <div className="max-w-2xl mx-auto p-4 animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800">Admin Dashboard</h2>
        <button 
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
        >
            <i className="fas fa-sign-out-alt mr-2"></i> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Scan Meals Card */}
        <div 
            onClick={() => window.location.hash = '/scanner'}
            className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-pink-300 transition-all cursor-pointer"
        >
            <div className="flex flex-col items-center text-center p-4">
                <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">
                    <i className="fas fa-camera"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Scan Meals</h3>
                <p className="text-gray-500 mt-2 text-sm">Open scanner to verify and track student meals.</p>
            </div>
        </div>

        {/* Add Student Card */}
        <div 
            onClick={() => window.location.hash = '/admin/add'}
            className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer"
        >
            <div className="flex flex-col items-center text-center p-4">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">
                    <i className="fas fa-user-plus"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Add Student</h3>
                <p className="text-gray-500 mt-2 text-sm">Create new student profiles and generate QR codes.</p>
            </div>
        </div>

        {/* Meal Reports Card */}
        <div 
            onClick={() => window.location.hash = '/admin/reports'}
            className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-green-300 transition-all cursor-pointer"
        >
            <div className="flex flex-col items-center text-center p-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">
                    <i className="fas fa-chart-pie"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Daily Reports</h3>
                <p className="text-gray-500 mt-2 text-sm">View daily meal statistics and student tracking.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;