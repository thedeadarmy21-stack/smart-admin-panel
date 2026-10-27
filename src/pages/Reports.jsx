import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // PDF Table ke liye

const Reports = () => {
  // 🚀 NAYA: Toggle State (student or teacher)
  const [reportType, setReportType] = useState('student'); 

  // Common States
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [markingAbsent, setMarkingAbsent] = useState(false);
  const token = localStorage.getItem('adminToken');

  // 🚀 Student States
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  // 🚀 Teacher States
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');

  // Fetch Students & Teachers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, teachersRes] = await Promise.all([
          axios.get('https://smart-attendance-backend-one.vercel.app/api/students', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('https://smart-attendance-backend-one.vercel.app/api/auth/all-teachers', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setStudents(studentsRes.data.students);
        // Sirf teachers filter karein (admin nahi)
        setTeachers(teachersRes.data.teachers.filter(t => t.role === 'teacher'));
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchData();
  }, [token]);

  // Class ke hisaab se students filter karo
  const filteredStudents = selectedClass 
    ? students.filter(s => s.className === selectedClass)
    : students;

  const uniqueClasses = [...new Set(students.map(s => s.className))].sort();

  // 🚀 Report Generate Function (Student or Teacher)
  const fetchReport = async () => {
    setReport(null);
    setLoading(true);

    try {
      if (reportType === 'student') {
        if (!selectedStudent || !month) {
          setLoading(false);
          return alert('Select Student and Month');
        }
        const res = await axios.get(
          `https://smart-attendance-backend-one.vercel.app/api/reports/monthly/${selectedStudent}?month=${month}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReport({ ...res.data, type: 'student' });
      } else {
        if (!selectedTeacher || !month) {
          setLoading(false);
          return alert('Select Teacher and Month');
        }
        const res = await axios.get(
          `https://smart-attendance-backend-one.vercel.app/api/reports/teacher-monthly/${selectedTeacher}?month=${month}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReport({ ...res.data, type: 'teacher' });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Report generate nahi hui.');
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Mark Absentees (Sirf students ke liye)
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
      if (report && report.type === 'student') fetchReport();
    } catch (error) {
      console.error('Error:', error);
      alert('Absent mark karne me error aya.');
    } finally {
      setMarkingAbsent(false);
    }
  };

  // 🚀 PDF Download Function
  const downloadPDF = () => {
    if (!report) return;

    const doc = new jsPDF();
    const title = report.type === 'student' ? 'Student Report' : 'Teacher Report';
    const name = report.type === 'student' 
      ? students.find(s => s._id === selectedStudent)?.name 
      : teachers.find(t => t._id === selectedTeacher)?.name;

    // Header
    doc.setFillColor(15, 118, 110);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SMART SCHOOL', 14, 18);
    doc.setFontSize(12);
    doc.text(title, 14, 26);

    // Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${name}`, 14, 45);
    doc.text(`Month: ${month}`, 14, 53);
    
    // Stats
    const totalDays = report.attendance.length;
    const presentDays = report.attendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const percentage = totalDays === 0 ? 0 : Math.round((presentDays / totalDays) * 100);

    doc.text(`Total Records: ${totalDays}`, 14, 61);
    doc.text(`Present: ${report.totalDaysPresent || 0}`, 14, 69);
    doc.text(`Late: ${report.totalDaysLate || 0}`, 14, 77);
    doc.text(`Absent: ${report.totalDaysAbsent || 0}`, 14, 85);
    doc.text(`Attendance %: ${percentage}%`, 14, 93);

    // Table
    const tableData = report.attendance.map(att => [
      att.date,
      att.timeIn,
      att.status.toUpperCase()
    ]);

    doc.autoTable({
      startY: 100,
      head: [['Date', 'Time In', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255] },
    });

    doc.save(`${name}-${month}-Report.pdf`);
  };

  const totalDays = report ? report.attendance.length : 0;
  const presentDays = report ? report.attendance.filter(a => a.status === 'present' || a.status === 'late').length : 0;
  const percentage = totalDays === 0 ? 0 : Math.round((presentDays / totalDays) * 100);

  return (
    <div className="space-y-8">
      
      {/* 🚀 TABS */}
      <div className="flex justify-center">
        <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl inline-flex shadow-inner border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => { setReportType('student'); setReport(null); }}
            className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
              reportType === 'student' 
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            🎓 Student Report
          </button>
          <button
            onClick={() => { setReportType('teacher'); setReport(null); }}
            className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
              reportType === 'teacher' 
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-md' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            👨‍🏫 Teacher Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          
          {/* 🚀 STUDENT TABS KA FILTER */}
          {reportType === 'student' ? (
            <>
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Select Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => { setSelectedClass(e.target.value); setSelectedStudent(''); setReport(null); }}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-white font-medium cursor-pointer"
                >
                  <option value="">All Classes</option>
                  {uniqueClasses.map((cls, idx) => (
                    <option key={idx} value={cls}>Class {cls}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Select Student</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-white font-medium cursor-pointer"
                >
                  <option value="">-- Choose Student --</option>
                  {filteredStudents.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            // 🚀 TEACHER TABS KA FILTER
            <div className="flex-1 w-full md:w-1/2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Select Teacher</label>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-white font-medium cursor-pointer"
              >
                <option value="">-- Choose Teacher --</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>{t.name} ({t.username})</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex-1 w-full md:w-auto">
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
              className={`w-full md:w-auto text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg whitespace-nowrap ${
                reportType === 'student' 
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30' 
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
              }`}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
            {reportType === 'student' && (
              <button
                onClick={handleMarkAbsent}
                disabled={markingAbsent}
                className="w-full md:w-auto bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold px-6 py-3.5 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-all whitespace-nowrap border border-red-200 dark:border-red-800"
              >
                {markingAbsent ? 'Marking...' : '❌ Mark Absentees'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Report Display */}
      {report && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">
              {reportType === 'student' ? 'Monthly Student Summary' : 'Monthly Teacher Summary'}
            </h3>
            <div className="flex flex-wrap gap-3">
              <div className={`px-5 py-2 rounded-xl font-bold text-sm border flex items-center gap-2 shadow-sm ${percentage >= 75 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'}`}>
                <span>📊</span> {percentage}% Attendance
              </div>
              <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-5 py-2 rounded-xl font-bold text-sm border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 shadow-sm">
                <span>✅</span> {report.totalDaysAttended} Days Present
              </div>
              
              {/* 🚀 PDF Download Button */}
              <button
                onClick={downloadPDF}
                className="bg-purple-600 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-purple-700 transition-all shadow-md flex items-center gap-2"
              >
                📥 Download PDF
              </button>
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