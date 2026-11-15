import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddStudent = () => {
  const [formData, setFormData] = useState({
    name: '', rollNumber: '', className: '', section: 'A', fatherName: '', fatherWhatsApp: '', profilePicture: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return alert('Please select an image file.');
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setFormData({ ...formData, profilePicture: compressedBase64 });
      };
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('https://smart-attendance-backend-one.vercel.app/api/students/add', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/students');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-[#0a0a0a] p-4 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 dark:border-red-900/30 transition-colors duration-300">
      
      <div className="mb-6 md:mb-8 text-center md:text-left">
        <h3 className="text-lg md:text-2xl font-extrabold text-slate-800 dark:text-white">Add New Student</h3>
        <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm mt-1">Enter details to generate their secure QR ID card.</p>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 md:p-4 rounded-xl mb-4 md:mb-6 text-xs md:text-sm font-bold border border-red-100 dark:border-red-800 flex items-center gap-2"><span>⚠️</span>{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        
        {/* Picture Upload Section */}
        <div className="flex flex-col items-center justify-center mb-2 md:mb-6">
          <div className="relative">
            <div className="h-20 w-20 md:h-28 md:w-28 rounded-full bg-slate-100 dark:bg-[#121212] border-2 border-dashed border-slate-300 dark:border-red-900/30 flex items-center justify-center overflow-hidden">
              {formData.profilePicture ? (
                <img src={formData.profilePicture} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl md:text-4xl text-slate-400">📷</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 h-7 w-7 md:h-8 md:w-8 bg-red-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-red-700 transition shadow-lg border-2 border-white dark:border-[#0a0a0a]">
              <span className="text-sm md:text-lg">+</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
          <p className="text-[9px] md:text-xs text-slate-500 mt-1.5 md:mt-2">Upload Profile Picture (Auto-compressed)</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 md:mb-2 uppercase tracking-wider">Full Name</label>
            <input type="text" name="name" required onChange={handleChange} className="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-red-900/30 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white transition-all text-xs md:text-base" placeholder="Enter full name" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 md:mb-2 uppercase tracking-wider">Roll Number</label>
            <input type="text" name="rollNumber" required onChange={handleChange} className="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-red-900/30 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white transition-all text-xs md:text-base" placeholder="Enter roll number" />
          </div>
          <div>
            <label className="block text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 md:mb-2 uppercase tracking-wider">Class</label>
            <input type="text" name="className" required onChange={handleChange} className="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-red-900/30 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white transition-all text-xs md:text-base" placeholder="Enter class" />
          </div>
          <div>
            <label className="block text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 md:mb-2 uppercase tracking-wider">Section</label>
            <input type="text" name="section" value={formData.section} onChange={handleChange} className="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-red-900/30 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white transition-all text-xs md:text-base" placeholder="Enter section" />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 md:mb-2 uppercase tracking-wider">Father Name</label>
            <input type="text" name="fatherName" required onChange={handleChange} className="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-red-900/30 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white transition-all text-xs md:text-base" placeholder="Enter father name" />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 md:mb-2 uppercase tracking-wider">Phone Number (WhatsApp)</label>
            <input type="text" name="fatherWhatsApp" onChange={handleChange} className="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-red-900/30 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white transition-all text-xs md:text-base" placeholder="Enter phone number" />
          </div>
        </div>
        <div className="pt-3 md:pt-4 border-t border-slate-100 dark:border-red-900/20">
          <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-bold py-3 md:py-4 rounded-lg md:rounded-xl hover:bg-red-700 transition-all flex justify-center items-center gap-2 text-xs md:text-base">
            {loading ? (
              <><div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</>
            ) : (
              <>➕ Add Student & Generate QR</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudent;