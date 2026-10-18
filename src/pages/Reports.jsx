import { useEffect, useState } from 'react';
import axios from 'axios';

const Reports = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [markingAbsent, setMarkingAbsent] = useState(false);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get('https://smart-attendance-backend-one.vercel.app/api/students', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(res.data.students);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchStudents();
  }, [token]);

  const fetchReport = async () => {
    if (!selectedStudent || !month) return alert('Select Student and Month');
    setLoading(true);
    setReport(null);

    try {
      const res = await axios.get(
        `https://smart-attendance-backend-one.vercel.app/api/reports/monthly/${selectedStudent}?month=${month}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReport(res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAbsent = async () => {
    if (!window.confirm("Kya aap sach me un sab bacho ko absent mark karna chahte hain jo aaj scan nahi hue?")) return;
    setMarkingAbsent(true);
    try {
      const res = await axios.post(
        'https://smart-attendance-backend-one.vercel.app/api/attendance/mark-absent',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      if (report) fetchReport();
    } catch (error) {
      console.error('Error:', error);
      alert('Absent mark karne me error aya.');
    } finally {
      setMarkingAbsent(false);
    }
  };

  // 👇 Percentage Calculate karo
  const totalDays = report ? report.attendance.length : 0;
  const presentDays = report ? report.attendance.filter(a => a.status === 'present' || a.status === 'late').length : 0;
  const percentage = totalDays === 0 ? 0 : Math.round((presentDays / totalDays) * 100);

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Select Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-white font-medium cursor-pointer"
            >
              <option value="">-- Choose Student --</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
              ))}
            </select>
          </div>

          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Select Month</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-white font-medium"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="w-full md:w-auto bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 whitespace-nowrap"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
            <button
              onClick={handleMarkAbsent}
              disabled={markingAbsent}
              className="w-full md:w-auto bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold px-6 py-3.5 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-all whitespace-nowrap border border-red-200 dark:border-red-800"
            >
              {markingAbsent ? 'Marking...' : '❌ Mark Absentees'}
            </button>
          </div>
        </div>
      </div>

      {report && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">Monthly Attendance Summary</h3>
            <div className="flex gap-3">
              <div className={`px-5 py-2 rounded-xl font-bold text-sm border flex items-center gap-2 shadow-sm ${percentage >= 75 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'}`}>
                <span>📊</span> {percentage}% Attendance
              </div>
              <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-5 py-2 rounded-xl font-bold text-sm border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 shadow-sm">
                <span>✅</span> {report.totalDaysPresent} Days Present
              </div>
            </div>
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
                {report.attendance.length === 0 ? (
                  <tr><td colSpan="3" className="p-10 text-center text-slate-500 dark:text-slate-400 font-medium">No attendance records found for this month.</td></tr>
                ) : (
                  report.attendance.map((att) => (
                    <tr key={att._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                      <td className="p-5 text-slate-800 dark:text-white font-bold">{att.date}</td>
                      <td className="p-5 text-slate-600 dark:text-slate-300 font-medium">
                        <span className="bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg font-mono text-sm">
                          {att.timeIn}
                        </span>
                      </td>
                      <td className="p-5">
                        {/* 👇 Naya Status Logic (Present, Late, Absent) */}
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
      )}
    </div>
  );
};

export default Reports;