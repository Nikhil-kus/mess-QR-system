import React, { useState, useEffect } from 'react';
import StudentCard from './components/StudentCard';
import ScannerView from './components/ScannerView';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminAddStudent from './components/AdminAddStudent';
import AdminMealReport from './components/AdminMealReport';
import StudentLogin from './components/StudentLogin';
import { isConfigured } from './services/firebase';

// Helper to get current hash path safely
const getHashPath = () => window.location.hash.substring(1) || '/';

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(getHashPath());
  const [configured, setConfigured] = useState(true);

  // 1. Check Configuration on mount
  useEffect(() => {
    if (!isConfigured()) {
        setConfigured(false);
    }
  }, []);

  // 2. Setup Hash Router Listener
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(getHashPath());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Navigation Helper
  const navigate = (path: string) => {
      window.location.hash = path;
  };

  // Admin Auth Helper
  const isAdminLoggedIn = () => {
      return localStorage.getItem('adminLoggedIn') === 'true';
  };
  
  // Student Auth Helper
  const isStudentLoggedIn = (id: string) => {
      return localStorage.getItem('studentAuth') === id;
  };

  // 3. Routing Logic
  let PageComponent;
  let studentId = '';

  // Parse ID from /student?id=123
  const isStudentRoute = currentPath.startsWith('/student') && !currentPath.includes('/login');
  if (isStudentRoute) {
      const params = new URLSearchParams(currentPath.split('?')[1]);
      studentId = params.get('id') || '';
  }

  if (!configured) {
      PageComponent = ConfigErrorScreen;
  } 
  // --- Student Login Route ---
  else if (currentPath === '/student/login') {
      PageComponent = StudentLogin;
  }
  // --- Public Routes ---
  else if (currentPath === '/scanner') {
      // Scanner is now accessed primarily via Admin Dashboard, but route remains valid
      PageComponent = ScannerView;
  } 
  // --- Protected Student Route ---
  else if (isStudentRoute) {
      if (!isStudentLoggedIn(studentId)) {
          // If trying to access specific ID but not logged in as that ID
          window.location.hash = '/student/login';
          PageComponent = () => null;
      } else {
          PageComponent = () => <StudentCard studentId={studentId} />;
      }
  } 
  else if (currentPath === '/admin/login') {
      PageComponent = AdminLogin;
  } 
  // --- Protected Admin Routes ---
  else if (currentPath.startsWith('/admin')) {
      if (!isAdminLoggedIn()) {
          // Redirect to login if not authenticated
          window.location.hash = '/admin/login';
          PageComponent = () => null; // Render nothing while redirecting
      } else {
          switch (currentPath) {
              case '/admin':
                  PageComponent = AdminDashboard;
                  break;
              case '/admin/add':
                  PageComponent = AdminAddStudent;
                  break;
              case '/admin/reports':
                  PageComponent = AdminMealReport;
                  break;
              default:
                  PageComponent = AdminDashboard;
          }
      }
  } 
  // --- Home Route ---
  else {
      PageComponent = () => <HomeScreen navigate={navigate} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <nav className="bg-indigo-700 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex justify-between items-center">
            <button 
                onClick={() => navigate('/')} 
                className="flex items-center space-x-2 font-bold text-xl hover:text-indigo-100 transition focus:outline-none"
            >
                <i className="fas fa-qrcode"></i>
                <span>Mess<span className="text-indigo-300">QR</span></span>
            </button>
            <div className="space-x-4 text-sm font-medium flex items-center">
                {/* Only show Admin Login link if on Home and not logged in */}
                {currentPath === '/' && !isAdminLoggedIn() && (
                    <button onClick={() => navigate('/admin/login')} className="text-indigo-200 hover:text-white transition">Admin Login</button>
                )}
                {/* Show Dashboard link if logged in */}
                {isAdminLoggedIn() && (
                    <button onClick={() => navigate('/admin')} className="text-white hover:text-indigo-200 transition bg-indigo-800 px-3 py-1 rounded">Dashboard</button>
                )}
                {currentPath !== '/' && (
                    <button onClick={() => navigate('/')} className="hover:text-indigo-200 transition focus:outline-none">Home</button>
                )}
            </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-4xl mx-auto p-4">
        <PageComponent />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-8">
        <div className="text-center text-sm text-gray-400">
            <p className="font-semibold mb-1">Mess QR System MVP</p>
            <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

// --- Sub-components ---

interface HomeScreenProps {
    navigate: (path: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigate }) => (
    <div className="max-w-lg mx-auto mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-3">Welcome Back</h2>
            <p className="text-gray-500">Select an option to continue.</p>
        </div>

        <div className="grid grid-cols-1 gap-5">
            {/* Student View - Links to Login now */}
            <div 
                onClick={() => navigate('/student/login')} 
                className="block relative group overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-indigo-300 transition-all duration-300 cursor-pointer"
                role="button"
                tabIndex={0}
            >
                <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-full p-4 text-indigo-600 mr-5 group-hover:scale-110 transition-transform">
                        <i className="fas fa-user-graduate text-2xl"></i>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Student View</h3>
                        <p className="text-sm text-gray-500 mt-1">Login to view your ID Card, status, and history.</p>
                    </div>
                    <div className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400">
                        <i className="fas fa-chevron-right"></i>
                    </div>
                </div>
            </div>

            {/* Admin Dashboard */}
            <div 
                onClick={() => navigate('/admin')} 
                className="block relative group overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-purple-300 transition-all duration-300 cursor-pointer"
                role="button"
                tabIndex={0}
            >
                <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 rounded-full p-4 text-purple-600 mr-5 group-hover:scale-110 transition-transform">
                        <i className="fas fa-user-shield text-2xl"></i>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Admin Dashboard</h3>
                        <p className="text-sm text-gray-500 mt-1">Staff login for scanning, reports, and management.</p>
                    </div>
                    <div className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity text-purple-400">
                        <i className="fas fa-chevron-right"></i>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 border border-blue-100 flex items-start">
            <i className="fas fa-info-circle mt-0.5 mr-2"></i>
            <div>
                <strong>Note:</strong> Ensure you have added the sample data to your Firebase Realtime Database as described in the README to test functionality.
            </div>
        </div>
    </div>
);

const ConfigErrorScreen = () => (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
        <div className="max-w-lg bg-white p-8 rounded-xl shadow-xl border-l-4 border-red-500">
            <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
                <i className="fas fa-cogs mr-2"></i> Configuration Required
            </h2>
            <p className="mb-4 text-gray-700">You must configure your Firebase credentials in <code>services/firebase.ts</code>.</p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 bg-gray-50 p-4 rounded border border-gray-200">
                <li>Create a Firebase Project at <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">console.firebase.google.com</a></li>
                <li>Enable <strong>Realtime Database</strong></li>
                <li>Import Sample Data (JSON)</li>
                <li>Update <code>services/firebase.ts</code></li>
            </ol>
        </div>
    </div>
);

export default App;