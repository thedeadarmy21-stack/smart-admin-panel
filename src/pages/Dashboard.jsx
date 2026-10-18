import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalStudents: 0, presentToday: 0, absentToday: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [profileData, setProfileData] = useState({ newUsername: '', currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    try {
      const res = await axios.put('https://smart-attendance-backend-one.vercel.app/api/auth/update-profile', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      localStorage.setItem('adminData', JSON.stringify(res.data.teacher));
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
      
      setTimeout(() => {
        setShowModal(false);
        window.location.reload(); 
      }, 1500);
      
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    }
  };

  const chartData = [40, 65, 80, 55, 90, 70, 85]; 
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-8 animate-pop relative">
      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold mb-2 relative z-10">
  Welcome back, {adminData.name === 'Sir Bilal' ? 'Sarkar Sir' : (adminData.name || 'Principal')}!
</h3>
          <p className="text-blue-100 relative z-10 max-w-xl">
            Here is the live overview of Smart School. You can manage students, print ID cards, and view attendance reports.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-white/10 hover:bg-white/20 transition-all px-5 py-2.5 rounded-xl text-sm font-bold backdrop-blur-md border border-white/20 z-10 whitespace-nowrap flex items-center gap-2 shadow-lg"
        >
          <span>🔐</span> Security
        </button>
        <div className="absolute top-0 right-0 opacity-10 text-9xl transform translate-x-4 -translate-y-4">🎓</div>
      </div>

      {/* SECURITY MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl">
                🔐
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Account Security</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Update your login credentials</p>
              </div>
            </div>
            
            {msg.text && (
              <div className={`p-3 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                <span>{msg.type === 'success' ? '✅' : '⚠️'}</span> {msg.text}
              </div>
            )}
            
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Current Password <span className="text-red-500">*</span></label>
                <input 
                  type="password" 
                  value={profileData.currentPassword}
                  onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white transition-all"
                  placeholder="Enter current password"
                  required 
                />
                <p className="text-xs text-slate-500 mt-1">Required to verify your identity.</p>
              </div>
              
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Username (Optional)</label>
                <input 
                  type="text" 
                  value={profileData.newUsername}
                  onChange={(e) => setProfileData({...profileData, newUsername: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white transition-all"
                  placeholder="Leave blank to keep current"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Password (Optional)</label>
                <input 
                  type="password" 
                  value={profileData.newPassword}
                  onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white transition-all"
                  placeholder="Leave blank to keep current"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white font-bold py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/30">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center space-x-5">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl text-3xl">👨‍🎓</div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Total Students</p>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-white">{loading ? '-' : stats.totalStudents}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center space-x-5">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl text-3xl">✅</div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Present Today</p>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{loading ? '-' : stats.presentToday}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center space-x-5">
          <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-3xl">❌</div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Absent Today</p>
            <p className="text-3xl font-extrabold text-red-500 dark:text-red-400">{loading ? '-' : stats.absentToday}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-6">Weekly Attendance Overview</h4>
          <div className="flex items-end justify-between h-48 gap-2">
            {chartData.map((val, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 group">
                <div className="w-full bg-blue-100 dark:bg-slate-700 rounded-t-lg relative group-hover:bg-blue-500 dark:group-hover:bg-blue-600 transition-all duration-300" style={{ height: `${val}%` }}>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">{val} Students</div>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-bold">{days[idx]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Link to="/add-student" className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group flex items-center justify-between block">
            <div>
              <h4 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">Add New Student</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enroll a new student and generate their QR ID card.</p>
            </div>
            <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition-all">➕</div>
          </Link>
          <Link to="/reports" className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all group flex items-center justify-between block">
            <div>
              <h4 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">View Reports</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Check monthly attendance records for any student.</p>
            </div>
            <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">📊</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;