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

  const codeReaderRef = useRef(null);
  const controlsRef = useRef(null);
  const token = localStorage.getItem('adminToken');

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://smart-attendance-backend-one.vercel.app/api/teacher-attendance/report?date=${date}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAttendance(res.data.attendance);
    } catch (err) {
      console.error('Error fetching teacher attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [date]);

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
      console.error('Permission Error:', err);
      if (err.name === 'NotAllowedError') {
        setScanError('Camera permission denied. Phone settings se allow karein.');
      } else if (err.name === 'NotFoundError') {
        setScanError('Is device par camera nahi mila.');
      } else {
        setScanError('Camera access failed: ' + err.message);
      }
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
            if (err && !(err instanceof Error)) {}
          }
        ).then((controls) => {
          controlsRef.current = controls;
        }).catch((err) => {
          console.error('Scanner Start Error:', err);
          setScanError('Scanner start nahi ho raha: ' + err.message);
          setScanning(false);
        });

      } catch (err) {
        console.error('Scanner Init Error:', err);
        setScanError('Scanner initialize nahi ho raha.');
        setScanning(false);
      }
    }, 500);
  };

  const handleScanSuccess = async (qrText) => {
    try {
      const res = await axios.post(
        'https://smart-attendance-backend-one.vercel.app/api/teacher-attendance/scan',
        { qrCode: qrText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const statusText = res.data.status === 'late' ? 'LATE' : 'PRESENT';
      setScanMessage(`✅ ${res.data.teacherName} marked ${statusText} at ${res.data.timeIn}`);
      
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
    <div className="space-y-4 md:space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-[#0a0a0a] p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 dark:border-red-900/30">
        <h2 className="text-lg md:text-2xl font-extrabold text-slate-800 dark:text-white mb-1">Teachers Attendance</h2>
        <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm">
          Scan teacher QR codes to mark their attendance.
        </p>
      </div>

      {/* Date Filter & Scan Button */}
      <div className="bg-white dark:bg-[#0a0a0a] p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 dark:border-red-900/30 flex flex-col md:flex-row gap-2 md:gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 md:mb-2">Select Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-red-900/30 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-700 dark:text-white font-medium text-xs md:text-base"
          />
        </div>
        <button
          onClick={startScanner}
          className="w-full md:w-auto bg-emerald-600 text-white font-bold px-4 md:px-8 py-2.5 md:py-3.5 rounded-lg md:rounded-xl hover:bg-emerald-700 transition-all whitespace-nowrap flex items-center justify-center gap-2 text-xs md:text-base"
        >
          📷 Scan Teacher QR
        </button>
      </div>

      {/* Scanner Area */}
      {scanning && (
        <div className="bg-white dark:bg-[#0a0a0a] p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 dark:border-red-900/30 flex flex-col items-center">
          <div className="w-full max-w-xs md:max-w-sm relative rounded-xl md:rounded-2xl overflow-hidden border-2 border-dashed border-red-500 bg-black">
            <video 
              id="reader" 
              className="w-full h-auto object-cover" 
              autoPlay 
              muted 
              playsInline
            ></video>
            {/* Scanner Line Animation */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500 shadow-[0_0_10px_2px_rgba(239,68,68,0.8)] animate-scanline"></div>
            </div>
          </div>
          
          <button
            onClick={stopScanner}
            className="mt-3 md:mt-4 w-full max-w-xs md:max-w-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold py-2 md:py-3 rounded-lg md:rounded-xl hover:bg-red-200 transition text-xs md:text-base border border-red-200 dark:border-red-800"
          >
            Cancel Scanning
          </button>
        </div>
      )}

      {/* Messages */}
      {scanMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-3 md:p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 font-bold text-xs md:text-base">
          {scanMessage}
        </div>
      )}
      {scanError && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 md:p-4 rounded-xl border border-red-200 dark:border-red-800 font-bold text-xs md:text-base">
          ⚠️ {scanError}
        </div>
      )}

      {/* Attendance Report */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 dark:border-red-900/30 overflow-hidden">
        
        <div className="p-3 md:p-6 border-b border-slate-200 dark:border-red-900/30 bg-slate-50/50 dark:bg-[#0f0f11] flex flex-row justify-between items-center gap-2">
          <h3 className="text-xs md:text-lg font-extrabold text-slate-800 dark:text-white">Attendance on {date}</h3>
          <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 md:px-4 py-0.5 md:py-1.5 rounded-full font-bold text-[9px] md:text-sm border border-emerald-200 dark:border-emerald-800">
            {attendance.length} Total
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white dark:bg-[#0f0f11] text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-red-900/30">
                  <tr>
                    <th className="p-5 font-bold">#</th>
                    <th className="p-5 font-bold">Teacher Name</th>
                    <th className="p-5 font-bold">Time In</th>
                    <th className="p-5 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-red-900/20">
                  {attendance.length === 0 ? (
                    <tr><td colSpan="4" className="p-10 text-center text-slate-500 dark:text-slate-400">No teacher marked attendance.</td></tr>
                  ) : (
                    attendance.map((att, idx) => (
                      <tr key={att._id} className="hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition">
                        <td className="p-5 text-slate-400 font-bold">{idx + 1}</td>
                        <td className="p-5 text-slate-800 dark:text-white font-bold">
                          {att.teacherId?.name || 'Unknown Teacher'}
                        </td>
                        <td className="p-5 text-slate-600 dark:text-slate-300 font-medium">
                          <span className="bg-slate-100 dark:bg-[#121212] text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg font-mono text-sm">
                            {att.timeIn}
                          </span>
                        </td>
                        <td className="p-5">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-1 w-max ${
                            att.status === 'present' 
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                              : att.status === 'late'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                          }`}>
                            <span>{att.status === 'present' ? '🟢' : att.status === 'late' ? '🟡' : '🔴'}</span> 
                            {att.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden p-3 space-y-2">
              {attendance.length === 0 ? (
                <p className="text-center text-slate-500 dark:text-slate-400 py-6 text-xs">No teacher marked attendance.</p>
              ) : (
                attendance.map((att, idx) => (
                  <div key={att._id} className="bg-slate-50 dark:bg-[#121212] p-2.5 rounded-xl border border-slate-200 dark:border-red-900/20 flex justify-between items-center">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {att.teacherId?.name?.charAt(0) || 'T'}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{att.teacherId?.name || 'Unknown Teacher'}</p>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{att.timeIn}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide border flex items-center gap-1 flex-shrink-0 ${
                      att.status === 'present' 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                        : att.status === 'late'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                    }`}>
                      {att.status === 'present' ? '🟢' : att.status === 'late' ? '🟡' : '🔴'} {att.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TeachersAttendance;