import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
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
    fetchStudents();
  }, [token]);

  // Helper function for PDF generation
  const generateIDCardPDF = async (doc, student, isFirst) => {
    if (!isFirst) doc.addPage([54, 86], 'portrait');
    
    const qrDataUrl = await QRCode.toDataURL(student.qrCode, { width: 400, margin: 1 });
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 54, 86, 'F');
    doc.setFillColor(29, 78, 216); 
    doc.rect(0, 0, 54, 24, 'F');
    doc.setFillColor(255, 255, 255);
    doc.circle(27, 12, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('SMART SCHOOL', 27, 20, { align: 'center' });
    doc.setDrawColor(226, 232, 240);
    doc.line(5, 28, 49, 28);
    doc.setFillColor(239, 246, 255);
    doc.circle(27, 39, 9, 'F');
    doc.setTextColor(29, 78, 216);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(student.name.charAt(0).toUpperCase(), 27, 42, { align: 'center' });
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text(student.name.toUpperCase(), 27, 54, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Roll No: ${student.rollNumber}`, 27, 60, { align: 'center' });
    doc.text(`Class: ${student.className} - ${student.section}`, 27, 64, { align: 'center' });
    doc.addImage(qrDataUrl, 'PNG', 18, 68, 18, 18);
    doc.setDrawColor(226, 232, 240);
    doc.line(0, 80, 54, 80);
    doc.setFontSize(5);
    doc.setTextColor(148, 163, 184);
    doc.text('Powered by Smart School', 27, 83.5, { align: 'center' });
  };

  // Single ID Download
  const downloadIDCard = async (student) => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [54, 86] });
      await generateIDCardPDF(doc, student, true);
      doc.save(`${student.name}-ID-Card.pdf`);
    } catch (err) {
      console.error('ID Card Error:', err);
      alert('ID Card download nahi ho paya.');
    }
  };

  // 🚀 NAYA FEATURE: Bulk ID Download
  const downloadAllIDCards = async () => {
    if (filteredStudents.length === 0) return alert("No students to download.");
    
    setDownloadingAll(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [54, 86] });
      
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
      
      {/* Header & Filter Area */}
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

          {/* 🚀 BULK DOWNLOAD BUTTON */}
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

      {/* Table Area */}
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
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-white">{student.name}</span>
                    </div>
                  </td>
                  <td className="p-5 text-slate-600 dark:text-slate-300 font-medium">{student.rollNumber}</td>
                  <td className="p-5 text-slate-600 dark:text-slate-300">{student.className}-{student.section}</td>
                  <td className="p-5 text-slate-600 dark:text-slate-300">{student.fatherName}</td>
                  <td className="p-5 text-center">
                    <button 
                      onClick={() => downloadIDCard(student)}
                      className="bg-slate-800 dark:bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-900 dark:hover:bg-black transition-all shadow-md flex items-center gap-2 mx-auto border border-transparent dark:border-slate-700"
                    >
                      🪪 Download ID
                    </button>
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