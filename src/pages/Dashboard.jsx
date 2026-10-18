import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalStudents: 0, presentToday: 0, absentToday: 0 });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('https://smart-attendance-backend-one.vercel.app/api/attendance/dashboard-stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  // Mock Data for Weekly Chart (Demo purposes)
  const chartData = [40, 65, 80, 55, 90, 70, 85]; 
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-8 animate-pop">
      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 text-9xl transform translate-x-4 -translate-y-4">🎓</div>
        <h3 className="text-2xl font-bold mb-2 relative z-10">Welcome back, {adminData.name || 'Principal'}!</h3>
        <p className="text-blue-100 relative z-10 max-w-xl">
          Here is the live overview of Smart School. You can manage students, print ID cards, and view attendance reports from the sidebar.
        </p>
      </div>

      {/* LIVE STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center space-x-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl text-3xl">👨‍🎓</div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Total Students</p>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-white">
              {loading ? '-' : stats.totalStudents}
            </p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center space-x-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl text-3xl">✅</div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Present Today</p>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {loading ? '-' : stats.presentToday}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center space-x-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-3xl">❌</div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Absent Today</p>
            <p className="text-3xl font-extrabold text-red-500 dark:text-red-400">
              {loading ? '-' : stats.absentToday}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WEEKLY CHART */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-6">Weekly Attendance Overview</h4>
          <div className="flex items-end justify-between h-48 gap-2">
            {chartData.map((val, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 group">
                <div 
                  className="w-full bg-blue-100 dark:bg-slate-700 rounded-t-lg relative group-hover:bg-blue-500 dark:group-hover:bg-blue-600 transition-all duration-300"
                  style={{ height: `${val}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {val} Students
                  </div>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-bold">{days[idx]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="space-y-4">
          <Link to="/add-student" className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group flex items-center justify-between block">
            <div>
              <h4 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Add New Student</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enroll a new student and generate their QR ID card.</p>
            </div>
            <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
              ➕
            </div>
          </Link>

          <Link to="/reports" className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all group flex items-center justify-between block">
            <div>
              <h4 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">View Reports</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Check monthly attendance records for any student.</p>
            </div>
            <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
              📊
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;