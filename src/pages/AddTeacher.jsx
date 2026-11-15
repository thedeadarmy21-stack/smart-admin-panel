import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddTeacher = () => {
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
  const defaultSchoolName = adminData.schoolName || '';

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    schoolName: defaultSchoolName,
    phone: '',
    assignedClass: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get('https://smart-attendance-backend-one.vercel.app/api/auth/classes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClasses(res.data.classes);
      } catch (err) {
        console.error('Error fetching classes:', err);
      }
    };
    fetchClasses();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        'https://smart-attendance-backend-one.vercel.app/api/auth/register',
        {
          ...formData,
          role: 'teacher',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(`Teacher "${response.data.teacher.name}" added successfully!`);
      setFormData({ name: '', username: '', password: '', schoolName: defaultSchoolName, phone: '', assignedClass: '' });

      setTimeout(() => navigate('/teachers'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add teacher.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-[#0a0a0a] p-4 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 dark:border-red-900/30 transition-colors duration-300">
      
      <div className="mb-6 md:mb-8 text-center md:text-left">
        <h3 className="text-lg md:text-2xl font-extrabold text-slate-800 dark:text-white">Add New Teacher</h3>
        <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm mt-1">Register a new teacher and assign them a class.</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 md:p-4 rounded-xl mb-4 md:mb-6 text-xs md:text-sm font-bold border border-red-100 dark:border-red-800 flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-3 md:p-4 rounded-xl mb-4 md:mb-6 text-xs md:text-sm font-bold border border-emerald-100 dark:border-emerald-800 flex items-center gap-2">
          <span>✅</span> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 md:mb-2 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-red-900/30 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white placeholder:text-slate-400 text-xs md:text-base"
              placeholder="Enter full name"
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 md:mb-2 uppercase tracking-wider">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-red-900/30 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white placeholder:text-slate-400 text-xs md:text-base"
              placeholder="Enter username"
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 md:mb-2 uppercase tracking-wider">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-red-900/30 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white placeholder:text-slate-400 text-xs md:text-base"
              placeholder="Min 6 characters"
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 md:mb-2 uppercase tracking-wider">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-red-900/30 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white placeholder:text-slate-400 text-xs md:text-base"
              placeholder="Enter phone number"
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 md:mb-2 uppercase tracking-wider">Assigned Class</label>
            <select
              name="assignedClass"
              value={formData.assignedClass}
              onChange={handleChange}
              className="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-red-900/30 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white cursor-pointer text-xs md:text-base"
            >
              <option value="">Select Class</option>
              {classes.map((cls, idx) => (
                <option key={idx} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 md:mb-2 uppercase tracking-wider">School Name</label>
            <input
              type="text"
              name="schoolName"
              value={formData.schoolName}
              onChange={handleChange}
              required
              readOnly
              className="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-100 dark:bg-[#0a0a0a] border border-slate-200 dark:border-red-900/30 rounded-lg md:rounded-xl text-slate-600 dark:text-slate-400 cursor-not-allowed text-xs md:text-base"
              title="School name admin ke account se aata hai"
            />
          </div>
        </div>

        <div className="pt-3 md:pt-4 border-t border-slate-100 dark:border-red-900/20">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white font-bold py-3 md:py-4 rounded-lg md:rounded-xl hover:bg-red-700 transition-all flex justify-center items-center gap-2 text-xs md:text-base"
          >
            {loading ? (
              <><div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</>
            ) : (
              <>➕ Add Teacher</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTeacher;