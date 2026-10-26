import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
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
    fetchTeachers();
  }, [token]);

  // QR Code download karo (Teacher ka username QR me hoga)
  const downloadQR = async (teacher) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(teacher.username, {
        width: 400,
        margin: 2,
      });

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

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.username.toLowerCase().includes(searchTerm.toLowerCase())
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
              <th className="p-5">Role</th>
              <th className="p-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredTeachers.length === 0 ? (
              <tr><td colSpan="4" className="p-10 text-center text-slate-500 dark:text-slate-400 font-medium">No teachers found.</td></tr>
            ) : (
              filteredTeachers.map((teacher) => (
                <tr key={teacher._id} className="hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        {teacher.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-white">{teacher.name}</span>
                    </div>
                  </td>
                  <td className="p-5 text-slate-600 dark:text-slate-300 font-mono text-sm">{teacher.username}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      teacher.role === 'admin' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      {teacher.role}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <button
                      onClick={() => downloadQR(teacher)}
                      className="bg-slate-800 dark:bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-900 dark:hover:bg-black transition-all shadow-md flex items-center gap-2 mx-auto"
                    >
                      🪪 Download QR
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

export default Teachers;