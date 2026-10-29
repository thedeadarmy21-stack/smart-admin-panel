import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('adminToken');
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
  const schoolName = adminData.schoolName || 'Smart School';
  const navigate = useNavigate();

  const fetchTeachers = async () => {
    try {
      const res = await axios.get('https://smart-attendance-backend-one.vercel.app/api/auth/all-teachers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(res.data.teachers);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [token]);

  // 🚀 Download QR Code (PNG)
  const downloadQR = async (teacher) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(teacher.username, { width: 400, margin: 2 });
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `${teacher.name}-${teacher.username}-QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('QR Download Error:', err);
      alert('QR download nahi ho paya.');
    }
  };

  // 🚀 Generate & Download Teacher ID Card (PDF)
  const downloadTeacherID = async (teacher) => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 54] });
      const qrDataUrl = await QRCode.toDataURL(teacher.username, { width: 400, margin: 1 });

      // 1. Background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 85.6, 54, 'F');

      // 2. Top Header (Indigo/Purple Theme)
      doc.setFillColor(67, 56, 202); // Indigo-700
      doc.rect(0, 0, 85.6, 20, 'F');

      // 3. Top Right Blob (Purple)
      doc.setFillColor(147, 51, 234); // Purple-600
      doc.ellipse(85.6, 0, 30, 18, 'F');

      // 4. Bottom Wave (Light Indigo)
      doc.setFillColor(238, 242, 255); // Indigo-50
      doc.rect(0, 42, 85.6, 12, 'F');

      // 5. Header Text (School Name)
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('times', 'bold');
      doc.text(schoolName.toUpperCase(), 10, 8);
      
      doc.setFontSize(5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(199, 210, 254); // Indigo-200
      doc.text('Faculty Identification Card', 10, 13);

      // 6. Big Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('times', 'bold');
      doc.text('TEACHER', 45, 11);
      doc.text('ID CARD', 45, 18);

      // 7. Teacher Details
      doc.setTextColor(30, 41, 59); // Slate-800
      
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.text('Name', 38, 26);
      doc.text('Username', 38, 32);
      doc.text('Phone', 38, 38);
      doc.text('Class', 38, 44);

      doc.text(':', 52, 26);
      doc.text(':', 52, 32);
      doc.text(':', 52, 38);
      doc.text(':', 52, 44);

      doc.setFont('helvetica', 'normal');
      doc.text(teacher.name.toUpperCase(), 56, 26);
      doc.text(teacher.username, 56, 32);
      doc.text(teacher.phone || 'N/A', 56, 38);
      doc.text(teacher.assignedClass ? `Class ${teacher.assignedClass}` : 'N/A', 56, 44);

      // 8. QR Code (Left Side)
      doc.setDrawColor(67, 56, 202); // Indigo Border
      doc.setLineWidth(0.8);
      doc.rect(8, 21, 26, 26, 'S'); 
      doc.addImage(qrDataUrl, 'PNG', 9, 22, 24, 24);

      // 9. Footer Text
      doc.setFontSize(5);
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.text('This card is property of the school.', 45, 50);

      doc.save(`${teacher.name}-Teacher-ID.pdf`);
    } catch (err) {
      console.error('ID Card Error:', err);
      alert('ID Card download nahi ho paya.');
    }
  };

  // 🚀 Delete Teacher
  const handleDelete = async (teacherId, teacherName) => {
    if (!window.confirm(`Kya aap sach me "${teacherName}" ko delete karna chahte hain? Iski saari attendance bhi delete ho jayegi.`)) {
      return;
    }
    try {
      await axios.delete(`https://smart-attendance-backend-one.vercel.app/api/teacher-attendance/delete/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Teacher deleted successfully!');
      fetchTeachers();
    } catch (error) {
      console.error('Delete Error:', error);
      alert(error.response?.data?.message || 'Teacher delete nahi ho paya.');
    }
  };

  const filteredTeachers = teachers.filter(t =>
    t.role === 'teacher' && (
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-extrabold text-xl text-slate-800 dark:text-white">All Teachers</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Showing {filteredTeachers.length} teachers</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-56"
            />
          </div>
          <Link to="/add-teacher" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2">
            <span>➕</span> Add Teacher
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-5">Teacher Name</th>
              <th className="p-5">Username</th>
              <th className="p-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredTeachers.length === 0 ? (
              <tr><td colSpan="3" className="p-10 text-center text-slate-500 dark:text-slate-400 font-medium">No teachers found.</td></tr>
            ) : (
              filteredTeachers.map((teacher) => (
                <tr key={teacher._id} className="hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-5">
                    <div 
                      onClick={() => navigate(`/teacher/${teacher._id}`)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {teacher.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors underline-offset-4 group-hover:underline">
                        {teacher.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-5 text-slate-600 dark:text-slate-300 font-mono text-sm">{teacher.username}</td>
                  <td className="p-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => downloadTeacherID(teacher)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
                        title="Download ID Card"
                      >
                        🪪 ID
                      </button>
                      <button
                        onClick={() => downloadQR(teacher)}
                        className="bg-slate-800 dark:bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-900 dark:hover:bg-black transition-all shadow-md flex items-center gap-2"
                        title="Download QR"
                      >
                        📱 QR
                      </button>
                      <button
                        onClick={() => handleDelete(teacher._id, teacher.name)}
                        className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all shadow-sm border border-red-200 dark:border-red-800"
                        title="Delete Teacher"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Teachers;