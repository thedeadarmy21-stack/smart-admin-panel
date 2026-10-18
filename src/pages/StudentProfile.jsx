import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`https://smart-attendance-backend-one.vercel.app/api/students/profile/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (error) {
        console.error('Error fetching profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, token]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!data) return <p className="text-center text-slate-500 mt-10">Student not found.</p>;

  const { student, attendance, stats } = data;

  // Total days count (Present + Late + Absent)
  const totalDays = stats.totalPresent + stats.totalLate + stats.totalAbsent;
  const attendancePercentage = totalDays === 0 ? 0 : Math.round(((stats.totalPresent + stats.totalLate) / totalDays) * 100);

  return (
    <div className="space-y-6 animate-pop">
      {/* Back Button */}
      <button onClick={() => navigate('/students')} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold flex items-center gap-2 transition">
        ← Back to Students
      </button>

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-5 text-9xl transform translate-x-4 -translate-y-4">🎓</div>
        
        <div className="h-32 w-32 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-6xl font-bold border-4 border-white dark:border-slate-700 shadow-lg z-10">
          {student.name.charAt(0).toUpperCase()}
        </div>
        
        <div className="text-center md:text-left z-10 flex-1">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">{student.name}</h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
            <span className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg">Roll No: {student.rollNumber}</span>
            <span className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg">Class: {student.className} - {student.section}</span>
            <span className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg">Father: {student.fatherName}</span>
            <span className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg">Email: {student.fatherEmail}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Attendance %</p>
          <p className={`text-3xl font-extrabold ${attendancePercentage >= 75 ? 'text-emerald-500' : 'text-red-500'}`}>
            {attendancePercentage}%
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Present</p>
          <p className="text-3xl font-extrabold text-emerald-500">{stats.totalPresent}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Late</p>
          <p className="text-3xl font-extrabold text-yellow-500">{stats.totalLate}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Absent</p>
          <p className="text-3xl font-extrabold text-red-500">{stats.totalAbsent}</p>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">Full Attendance History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white dark:bg-slate-900 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-5 font-bold">Date</th>
                <th className="p-5 font-bold">Time In</th>
                <th className="p-5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {attendance.length === 0 ? (
                <tr><td colSpan="3" className="p-10 text-center text-slate-500 dark:text-slate-400">No attendance records found.</td></tr>
              ) : (
                attendance.map((att) => (
                  <tr key={att._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                    <td className="p-5 text-slate-800 dark:text-white font-bold">{att.date}</td>
                    <td className="p-5 text-slate-600 dark:text-slate-300 font-medium">
                      <span className="bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg font-mono text-sm">
                        {att.timeIn}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-1 w-max ${
                        att.status === 'present' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' :
                        att.status === 'late' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                      }`}>
                        <span>{att.status === 'present' ? '🟢' : att.status === 'late' ? '🟡' : '🔴'}</span> {att.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;