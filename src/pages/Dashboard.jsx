import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalStudents: 0, presentToday: 0, absentToday: 0 });
  const [classStats, setClassStats] = useState([]);
  const [lowAttendance, setLowAttendance] = useState([]);
  const [selectedClassFilter, setSelectedClassFilter] = useState('all'); // 👈 Naya State
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [profileData, setProfileData] = useState({ newUsername: '', currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  const token = localStorage.getItem('adminToken');
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');

  const fetchData = async () => {
    try {
      const [statsRes, classRes, lowRes] = await Promise.all([
        axios.get('https://smart-attendance-backend-one.vercel.app/api/attendance/dashboard-stats', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('https://smart-attendance-backend-one.vercel.app/api/attendance/class-stats', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`https://smart-attendance-backend-one.vercel.app/api/attendance/low-attendance?className=${selectedClassFilter}`, { headers: { Authorization: `Bearer ${token}` } }) // 👈 Class filter bhej rahe hain
      ]);
      setStats(statsRes.data);
      setClassStats(classRes.data.data);
      setLowAttendance(lowRes.data.data);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, selectedClassFilter]); // 👈 Jab class filter change ho, dobara fetch karo

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    try {
      const res = await axios.put('https://smart-attendance-backend-one.vercel.app/api/auth/update-profile', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('adminData', JSON.stringify(res.data.teacher));
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => { setShowModal(false); window.location.reload(); }, 1500);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    }
  };

  const chartData = [40, 65, 80, 55, 90, 70, 85]; 
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-8 animate-pop relative">
      
      {/* WELCOME BANNER & SECURITY MODAL (Same as before) */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold mb-2 relative z-10">Welcome back, {adminData.name === 'Sir Bilal' ? 'Sir Sarkar' : (adminData.name || 'Principal')}!</h3>
          <p className="text-blue-100 relative z-10 max-w-xl">
            Here is the live overview of Smart School. You can manage students, print ID cards, and view attendance reports.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-white/10 hover:bg-white/20 transition-all px-5 py-2.5 rounded-xl text-sm font-bold backdrop-blur-md border border-white/20 z-10 whitespace-nowrap flex items-center gap-2 shadow-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          Security
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Account Security</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Update your login credentials</p>
              </div>
            </div>
            {msg.text && <div className={`p-3 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{msg.text}</div>}
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Current Password <span className="text-red-500">*</span></label>
                <input type="password" value={profileData.currentPassword} onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white" required />
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Username (Optional)</label>
                <input type="text" value={profileData.newUsername} onChange={(e) => setProfileData({...profileData, newUsername: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Password (Optional)</label>
                <input type="password" value={profileData.newPassword} onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white font-bold py-3 rounded-xl hover:bg-slate-200 transition">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE STATS CARDS (Same as before) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center space-x-5">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Total Students</p>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-white">{loading ? '-' : stats.totalStudents}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center space-x-5">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Present Today</p>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{loading ? '-' : stats.presentToday}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center space-x-5">
          <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Absent Today</p>
            <p className="text-3xl font-extrabold text-red-500 dark:text-red-400">{loading ? '-' : stats.absentToday}</p>
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
                <div className="w-full bg-blue-100 dark:bg-slate-700 rounded-t-lg relative group-hover:bg-blue-500 dark:group-hover:bg-blue-600 transition-all duration-300" style={{ height: `${val}%` }}>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">{val} Students</div>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-bold">{days[idx]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CLASS-WISE STATS */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Class-wise Overview</h4>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
            {classStats.length === 0 ? (
              <p className="text-slate-500 text-sm">No data available.</p>
            ) : (
              classStats.map((cls, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Class {cls.className}</span>
                  <div className="flex gap-4 text-sm font-bold">
                    <span className="text-emerald-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> {cls.present} P</span>
                    <span className="text-red-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> {cls.absent} A</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 🚀 NAYA FEATURE: LOW ATTENDANCE ALERT (With Class Filter) */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-red-200 dark:border-red-900/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <h4 className="font-bold text-lg text-red-600 dark:text-red-400">Low Attendance Alert (Below 75%)</h4>
          </div>
          
          {/* 👇 NAYA: Class Filter */}
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-bold text-sm cursor-pointer"
          >
            <option value="all">All Classes</option>
            {classStats.map((cls, idx) => (
              <option key={idx} value={cls.className}>Class {cls.className}</option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lowAttendance.length === 0 ? (
            <p className="text-slate-500 text-sm col-span-full">All students in this class have good attendance. 🎉</p>
          ) : (
            lowAttendance.map((student) => (
              <Link to={`/student/${student._id}`} key={student._id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 hover:shadow-md transition">
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">{student.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Roll: {student.rollNumber} | Class: {student.className}</p>
                </div>
                <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg">
                  {student.percentage}%
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;