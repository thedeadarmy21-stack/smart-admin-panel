import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { BrowserMultiFormatReader } from '@zxing/browser';

const TeachersAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [scanError, setScanError] = useState('');
  
  // 🚀 NAYA: Scan Mode (Teacher ya Student)
  const [scanType, setScanType] = useState('teacher'); 

  const codeReaderRef = useRef(null);
  const controlsRef = useRef(null);
  const token = localStorage.getItem('adminToken');

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      // Agar Student mode on hai, toh students ki list fetch karo, warna teacher ki
      const url = scanType === 'teacher' 
        ? `https://smart-attendance-backend-one.vercel.app/api/teacher-attendance/report?date=${date}`
        : `https://smart-attendance-backend-one.vercel.app/api/attendance/today-absent`; // Ya jo bhi student report API ho

      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      
      if (scanType === 'teacher') {
        setAttendance(res.data.attendance);
      } else {
        // Student mode ke liye yahan logic handle karein
        setAttendance(res.data.data || []); 
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [date, scanType]);

  const startScanner = async () => {
    setScanning(true);
    setScanMessage('');
    setScanError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      setScanError('Camera permission denied.');
      setScanning(false);
      return;
    }

    setTimeout(() => {
      try {
        const codeReader = new BrowserMultiFormatReader();
        codeReaderRef.current = codeReader;

        codeReader.decodeFromConstraints(
          { video: { facingMode: 'environment' } },
          'reader',
          async (result, err) => {
            if (result) {
              if (controlsRef.current) controlsRef.current.stop();
              await handleScanSuccess(result.getText());
            }
          }
        ).then((controls) => {
          controlsRef.current = controls;
        }).catch((err) => {
          setScanError('Scanner start nahi ho raha.');
          setScanning(false);
        });

      } catch (err) {
        setScanError('Scanner initialize nahi ho raha.');
        setScanning(false);
      }
    }, 500);
  };

  const handleScanSuccess = async (qrText) => {
    try {
      // 🚀 Yahan condition lagayi hai ke scanType ke hisaab se API call ho
      const url = scanType === 'teacher'
        ? 'https://smart-attendance-backend-one.vercel.app/api/teacher-attendance/scan'
        : 'https://smart-attendance-backend-one.vercel.app/api/attendance/admin-scan'; // Student scan route

      const body = scanType === 'teacher' 
        ? { qrCode: qrText } 
        : { qrCode: qrText }; // Student scan ke liye class filter nahi hai admin ke paas

      const res = await axios.post(url, body, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const statusText = res.data.status === 'late' ? 'LATE' : 'PRESENT';
      const name = res.data.teacherName || res.data.studentName;
      setScanMessage(`✅ ${name} marked ${statusText} at ${res.data.timeIn}`);
      
      setTimeout(() => {
        stopScanner();
        fetchAttendance();
      }, 2000);
    } catch (err) {
      setScanError(err.response?.data?.message || 'Attendance failed.');
      setTimeout(() => {
        stopScanner();
      }, 3000);
    }
  };

  const stopScanner = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    setScanning(false);
  };

  return (
    <div className="space-y-5 md:space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-[#0a0a0a] p-5 md:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-red-900/30">
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white mb-1.5 md:mb-2">
          {scanType === 'teacher' ? 'Teacher Attendance' : 'Student Attendance'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
          Scan QR codes to mark attendance.
        </p>
      </div>

      {/* 🚀 NAYA: Toggle Button (Teacher vs Student) */}
      <div className="flex bg-slate-100 dark:bg-[#121212] p-1 rounded-xl border border-slate-200 dark:border-red-900/30 max-w-sm">
        <button
          onClick={() => { setScanType('teacher'); setScanMessage(''); setScanError(''); }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
            scanType === 'teacher' ? 'bg-white dark:bg-[#0a0a0a] text-red-600 shadow-sm' : 'text-slate-500'
          }`}
        >
          👨‍🏫 Teacher
        </button>
        <button
          onClick={() => { setScanType('student'); setScanMessage(''); setScanError(''); }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
            scanType === 'student' ? 'bg-white dark:bg-[#0a0a0a] text-red-600 shadow-sm' : 'text-slate-500'
          }`}
        >
          🎓 Student
        </button>
      </div>

      {/* Date Filter & Scan Button */}
      <div className="bg-white dark:bg-[#0a0a0a] p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-red-900/30 flex flex-col md:flex-row gap-3 md:gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 md:mb-2">Select Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 md:px-4 py-2.5 md:py-3 bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-red-900/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-700 dark:text-white font-medium text-sm md:text-base"
          />
        </div>
        <button
          onClick={startScanner}
          className="w-full md:w-auto bg-emerald-600 text-white font-bold px-6 md:px-8 py-3 md:py-3.5 rounded-xl hover:bg-emerald-700 transition-all whitespace-nowrap flex items-center justify-center gap-2 text-sm md:text-base"
        >
          📷 Scan {scanType === 'teacher' ? 'Teacher' : 'Student'} QR
        </button>
      </div>

      {/* Scanner Area (Same as before) */}
      {scanning && (
        <div className="bg-white dark:bg-[#0a0a0a] p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-red-900/30 flex flex-col items-center">
          <div className="w-full max-w-xs md:max-w-sm relative rounded-2xl overflow-hidden border-2 border-dashed border-red-500 bg-black">
            <video id="reader" className="w-full h-auto object-cover" autoPlay muted playsInline></video>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500 shadow-[0_0_10px_2px_rgba(239,68,68,0.8)] animate-scanline"></div>
            </div>
          </div>
          <button onClick={stopScanner} className="mt-4 w-full max-w-xs md:max-w-sm bg-red-100 dark:bg-red-900/30 text-red-600 font-bold py-2.5 rounded-xl hover:bg-red-200 transition text-sm">
            Cancel Scanning
          </button>
        </div>
      )}

      {/* Messages */}
      {scanMessage && <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 p-3 rounded-xl border border-emerald-200 font-bold text-sm">{scanMessage}</div>}
      {scanError && <div className="bg-red-50 dark:bg-red-900/30 text-red-700 p-3 rounded-xl border border-red-200 font-bold text-sm">⚠️ {scanError}</div>}

      {/* Attendance List (Table/Mobile Cards) */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm border border-slate-200 dark:border-red-900/30 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-red-900/30 bg-slate-50/50 dark:bg-[#0f0f11] flex justify-between items-center">
          <h3 className="text-base md:text-lg font-extrabold text-slate-800 dark:text-white">Attendance on {date}</h3>
          <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 px-3 py-1 rounded-full font-bold text-xs border border-emerald-200">
            {attendance.length} Total
          </span>
        </div>

        {/* DESKTOP TABLE / MOBILE CARDS */}
        <div className="p-4">
          {attendance.length === 0 ? (
            <p className="text-center text-slate-500 py-6 text-sm">No attendance records found.</p>
          ) : (
            <div className="space-y-2">
              {attendance.map((att, idx) => (
                <div key={att._id} className="bg-slate-50 dark:bg-[#121212] p-3 rounded-xl border border-slate-200 dark:border-red-900/20 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center font-bold text-xs">
                      {att.teacherId?.name?.charAt(0) || att.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{att.teacherId?.name || att.name || 'Unknown'}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{att.timeIn || '--:--'}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                    att.status === 'present' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                    att.status === 'late' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                    'bg-red-100 text-red-700 border-red-200'
                  }`}>
                    {att.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeachersAttendance;