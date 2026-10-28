import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalStudents: 0, presentToday: 0, absentToday: 0 });
  const [teacherStats, setTeacherStats] = useState({ totalTeachers: 0, presentTeachers: 0 });
  const [classStats, setClassStats] = useState([]);
  const [lowAttendance, setLowAttendance] = useState([]);
  const [absentStudents, setAbsentStudents] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [activeTab, setActiveTab] = useState('admin');
  const [teachersList, setTeachersList] = useState([]);
  const [profileData, setProfileData] = useState({ newUsername: '', currentPassword: '', newPassword: '' });
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [teacherUpdateData, setTeacherUpdateData] = useState({ newUsername: '', newPassword: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [updating, setUpdating] = useState(false);
  
  const token = localStorage.getItem('adminToken');
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
  const schoolName = adminData.schoolName || 'Smart School';

  const fetchData = async () => {
    try {
      const [statsRes, classRes, lowRes, teacherStatsRes, teachersRes, absentRes, weeklyRes] = await Promise.all([
        axios.get('https://smart-attendance-backend-one.vercel.app/api/attendance/dashboard-stats', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('https://smart-attendance-backend-one.vercel.app/api/attendance/class-stats', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`https://smart-attendance-backend-one.vercel.app/api/attendance/low-attendance?className=${selectedClassFilter}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('https://smart-attendance-backend-one.vercel.app/api/teacher-attendance/stats', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { totalTeachers: 0, presentTeachers: 0 } })),
        axios.get('https://smart-attendance-backend-one.vercel.app/api/auth/all-teachers', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { teachers: [] } })),
        axios.get('https://smart-attendance-backend-one.vercel.app/api/attendance/today-absent', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { data: [] } })),
        axios.get('https://smart-attendance-backend-one.vercel.app/api/attendance/weekly-stats', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { data: [] } }))
      ]);
      setStats(statsRes.data);
      setClassStats(classRes.data.data);
      setLowAttendance(lowRes.data.data);
      setTeacherStats(teacherStatsRes.data);
      setAbsentStudents(absentRes.data.data || []);
      setWeeklyData(weeklyRes.data.data || []);
      
      const onlyTeachers = teachersRes.data.teachers.filter(t => t.role === 'teacher');
      setTeachersList(onlyTeachers);

    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, selectedClassFilter]);

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setUpdating(true);
    
    try {
      const res = await axios.put('https://smart-attendance-backend-one.vercel.app/api/auth/update-profile', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      localStorage.setItem('adminData', JSON.stringify(res.data.teacher));
      setMsg({ type: 'success', text: 'Admin profile updated successfully!' });
      
      setTimeout(() => { 
        setShowModal(false); 
        window.location.reload(); 
      }, 1500);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update admin profile' });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateTeacher = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    if (!selectedTeacherId) {
      return setMsg({ type: 'error', text: 'Please select a teacher first.' });
    }
    setUpdating(true);
    
    try {
      const res = await axios.put(`https://smart-attendance-backend-one.vercel.app/api/auth/update-teacher/${selectedTeacherId}`, teacherUpdateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMsg({ type: 'success', text: res.data.message });
      setTeacherUpdateData({ newUsername: '', newPassword: '' });
      fetchData();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update teacher profile' });
    } finally {
      setUpdating(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setMsg({ type: '', text: '' });
    setProfileData({ newUsername: '', currentPassword: '', newPassword: '' });
    setTeacherUpdateData({ newUsername: '', newPassword: '' });
    setSelectedTeacherId('');
  };

  const maxWeeklyCount = Math.max(...weeklyData.map(d => d.count), 10);

  return (
    <div className="space-y-8 animate-pop relative">
      
      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold mb-2 relative z-10">Welcome back, {adminData.name || 'Principal'}!</h3>
          <p className="text-blue-100 relative z-10 max-w-xl">
            Here is the live overview of {schoolName}. You can manage students, print ID cards, and view attendance reports.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-white/10 hover:bg-white/20 transition-all px-5 py-2.5 rounded-xl text-sm font-bold backdrop-blur-md border border-white/20 z-10 whitespace-nowrap flex items-center gap-2 shadow-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          Security
        </button>
      </div>

      {/* SECURITY MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden">
            
            <div className="p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Security Settings</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage account credentials</p>
              </div>
            </div>

            <div className="flex border-b border-slate-200 dark:border-slate-700">
              <button 
                onClick={() => { setActiveTab('admin'); setMsg({type:'',text:''}); }}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'admin' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                My Account
              </button>
              <button 
                onClick={() => { setActiveTab('teacher'); setMsg({type:'',text:''}); }}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'teacher' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Manage Teacher
              </button>
            </div>

            <div className="p-6">
              {msg.text && (
                <div className={`p-3 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {msg.text}
                </div>
              )}

              {activeTab === 'admin' && (
                <form onSubmit={handleUpdateAdmin} className="space-y-5 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Current Password <span className="text-red-500">*</span></label>
                    <input type="password" value={profileData.currentPassword} onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white" required placeholder="Enter current password" />
                  </div>
                  
                  <div className="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Username (Optional)</label>
                    <input type="text" value={profileData.newUsername} onChange={(e) => setProfileData({...profileData, newUsername: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white" placeholder="Leave blank to keep same" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Password (Optional)</label>
                    <input type="password" value={profileData.newPassword} onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white" placeholder="Leave blank to keep same" />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={closeModal} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white font-bold py-3 rounded-xl hover:bg-slate-200 transition">Cancel</button>
                    <button type="submit" disabled={updating} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition flex justify-center items-center">
                      {updating ? 'Updating...' : 'Update My Profile'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'teacher' && (
                <form onSubmit={handleUpdateTeacher} className="space-y-5 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Select Teacher <span className="text-red-500">*</span></label>
                    <select 
                      value={selectedTeacherId} 
                      onChange={(e) => setSelectedTeacherId(e.target.value)} 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                      required
                    >
                      <option value="">-- Select a Teacher --</option>
                      {teachersList.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>{teacher.name} ({teacher.username})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Username (Optional)</label>
                    <input type="text" value={teacherUpdateData.newUsername} onChange={(e) => setTeacherUpdateData({...teacherUpdateData, newUsername: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white" placeholder="Leave blank to keep same" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Password (Optional)</label>
                    <input type="password" value={teacherUpdateData.newPassword} onChange={(e) => setTeacherUpdateData({...teacherUpdateData, newPassword: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white" placeholder="Leave blank to keep same" />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={closeModal} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white font-bold py-3 rounded-xl hover:bg-slate-200 transition">Cancel</button>
                    <button type="submit" disabled={updating} className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition flex justify-center items-center">
                      {updating ? 'Updating...' : 'Update Teacher'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LIVE STATS CARDS (5 Cards - Reports button hataya) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center space-x-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Students</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{loading ? '-' : stats.totalStudents}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Present</p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{loading ? '-' : stats.presentToday}</p>
          </div>
        </div>

        <Link to="/reports" className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center space-x-3 hover:shadow-md transition">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Absent</p>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{loading ? '-' : absentStudents.length}</p>
          </div>
        </Link>

        <Link to="/teachers-attendance" className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center space-x-3 hover:shadow-md transition">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Teachers</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{loading ? '-' : teacherStats.totalTeachers}</p>
          </div>
        </Link>

        <Link to="/teachers-attendance" className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center space-x-3 hover:shadow-md transition">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">T. Present</p>
            <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{loading ? '-' : teacherStats.presentTeachers}</p>
          </div>
        </Link>
      </div>

      {/* GRAPH & CLASS-WISE OVERVIEW (Side by Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* WEEKLY GRAPH */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-6">Weekly Attendance Overview</h4>
          <div className="flex items-end justify-between h-48 gap-2">
            {weeklyData.length === 0 ? (
              <p className="text-slate-500 text-sm w-full text-center">No data available for this week.</p>
            ) : (
              weeklyData.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 group">
                  <div className="w-full relative">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-indigo-600 rounded-t-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-sm"
                      style={{ height: `${Math.max((day.count / maxWeeklyCount) * 160, 8)}px` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                        {day.count} Students
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-bold">{day.dayName}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CLASS-WISE STATS (Short) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Class-wise Overview (Today)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
            {classStats.length === 0 ? (
              <p className="text-slate-500 text-sm col-span-full">No data available.</p>
            ) : (
              classStats.map((cls, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">Class {cls.className}</span>
                  <div className="flex gap-3 text-xs font-bold">
                    <span className="text-emerald-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> {cls.present} P</span>
                    <span className="text-red-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> {cls.absent} A</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* LOW ATTENDANCE ALERT */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-red-200 dark:border-red-900/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <h4 className="font-bold text-lg text-red-600 dark:text-red-400">Low Attendance Alert (Below 75%)</h4>
          </div>
          
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