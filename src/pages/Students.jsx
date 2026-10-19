import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const token = localStorage.getItem('adminToken');
  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      const response = await axios.get('https://smart-attendance-backend-one.vercel.app/api/students', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [token]);

  const handleDelete = async (studentId, studentName) => {
    if (!window.confirm(`Kya aap sach me "${studentName}" ko delete karna chahte hain? Iski saari attendance bhi delete ho jayegi.`)) {
      return;
    }
    try {
      await axios.delete(`https://smart-attendance-backend-one.vercel.app/api/students/delete/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Student deleted successfully!');
      fetchStudents();
    } catch (error) {
      console.error('Delete Error:', error);
      alert('Student delete nahi ho paya.');
    }
  };

  // 🌟 FINAL PREMIUM ID CARD (No Logo, Just Clean Typography)
  const generateIDCardPDF = async (doc, student, isFirst) => {
    if (!isFirst) doc.addPage([85.6, 54], 'landscape');
    
    const qrDataUrl = await QRCode.toDataURL(student.qrCode, { width: 400, margin: 1 });
    
    // 1. Background White
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 85.6, 54, 'F');

    // 2. Top Header Wave (Dark Teal)
    doc.setFillColor(15, 118, 110); // Teal-700
    doc.rect(0, 0, 85.6, 20, 'F');
    
    // 3. Top Right Green Blob
    doc.setFillColor(22, 163, 74); // Green-600
    doc.ellipse(85.6, 0, 30, 18, 'F');

    // 4. Bottom Wave (Light Teal)
    doc.setFillColor(240, 253, 250); // Teal-50
    doc.rect(0, 42, 85.6, 12, 'F');

    // 🚀 5. PROFESSIONAL SCHOOL NAME (No Logo, Just Text)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('times', 'bold'); // Premium Serif Font
    doc.text('SMART SCHOOL', 10, 9); 
    
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 250, 240); // Light Teal text for tagline
    doc.text('Excellence in Education', 10, 14);

    // 6. Big Title (Times New Roman for Premium Look)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('times', 'bold');
    doc.text('STUDENT', 45, 11);
    doc.text('ID CARD', 45, 18);

    // 7. Student Details (Right Side)
    doc.setTextColor(30, 41, 59); // Slate-800
    
    // Labels (Bold)
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('Name', 38, 26);
    doc.text('Roll No', 38, 32);
    doc.text('Class', 38, 38);
    doc.text('Father', 38, 44);

    // Colons
    doc.text(':', 50, 26);
    doc.text(':', 50, 32);
    doc.text(':', 50, 38);
    doc.text(':', 50, 44);

    // Values (Normal)
    doc.setFont('helvetica', 'normal');
    doc.text(student.name.toUpperCase(), 54, 26);
    doc.text(student.rollNumber, 54, 32);
    doc.text(`${student.className} - ${student.section}`, 54, 38);
    doc.text(student.fatherName, 54, 44);

    // 8. BIG QR Code (Left Side)
    // Border Frame
    doc.setDrawColor(15, 118, 110); // Teal Border
    doc.setLineWidth(0.8);
    doc.rect(8, 21, 26, 26, 'S'); 
    // QR Image
    doc.addImage(qrDataUrl, 'PNG', 9, 22, 24, 24); 
  };

  const downloadIDCard = async (student) => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 54] });
      await generateIDCardPDF(doc, student, true);
      doc.save(`${student.name}-ID-Card.pdf`);
    } catch (err) {
      console.error('ID Card Error:', err);
      alert('ID Card download nahi ho paya.');
    }
  };

  const downloadAllIDCards = async () => {
    if (filteredStudents.length === 0) return alert("No students to download.");
    setDownloadingAll(true);
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 54] });
      for (let i = 0; i < filteredStudents.length; i++) {
        await generateIDCardPDF(doc, filteredStudents[i], i === 0);
      }
      const className = selectedClass ? `Class-${selectedClass}` : 'All-Students';
      doc.save(`ID-Cards-${className}.pdf`);
    } catch (err) {
      console.error('Bulk ID Error:', err);
      alert('Bulk ID Cards download nahi ho paye.');
    } finally {
      setDownloadingAll(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === '' || student.className === selectedClass;
    return matchesSearch && matchesClass;
  });

  const uniqueClasses = [...new Set(students.map(s => s.className))];

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-extrabold text-xl text-slate-800 dark:text-white">Enrolled Students</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Showing {filteredStudents.length} students</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-56"
            />
          </div>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Classes</option>
            {uniqueClasses.map((cls, idx) => (
              <option key={idx} value={cls}>Class {cls}</option>
            ))}
          </select>
          <button 
            onClick={downloadAllIDCards}
            disabled={downloadingAll}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            <span>🖨️</span> {downloadingAll ? 'Printing...' : 'Print All IDs'}
          </button>
          <Link to="/add-student" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2">
            <span>➕</span> Add Student
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-5">Student Name</th>
              <th className="p-5">Roll No</th>
              <th className="p-5">Class</th>
              <th className="p-5">Father Name</th>
              <th className="p-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredStudents.length === 0 ? (
               <tr><td colSpan="5" className="p-10 text-center text-slate-500 dark:text-slate-400 font-medium">No students found matching your search.</td></tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student._id} className="hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-5">
                    <div 
                      onClick={() => navigate(`/student/${student._id}`)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {student.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors underline-offset-4 group-hover:underline">
                        {student.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-5 text-slate-600 dark:text-slate-300 font-medium">{student.rollNumber}</td>
                  <td className="p-5 text-slate-600 dark:text-slate-300">{student.className}-{student.section}</td>
                  <td className="p-5 text-slate-600 dark:text-slate-300">{student.fatherName}</td>
                  <td className="p-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => downloadIDCard(student)}
                        className="bg-slate-800 dark:bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-900 dark:hover:bg-black transition-all shadow-md flex items-center gap-2 border border-transparent dark:border-slate-700"
                      >
                        🪪 ID
                      </button>
                      <button 
                        onClick={() => handleDelete(student._id, student.name)}
                        className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all shadow-sm border border-red-200 dark:border-red-800"
                        title="Delete Student"
                      >
                        🗑️ Delete
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

export default Students;