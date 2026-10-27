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

  // Aaj ki attendance fetch karo
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

  // 🚀 QR Scanner Start Karo
  const startScanner = () => {
    setScanning(true);
    setScanMessage('');
    setScanError('');

    setTimeout(() => {
      try {
        const codeReader = new BrowserMultiFormatReader();
        codeReaderRef.current = codeReader;

        codeReader.decodeFromVideoDevice(
          undefined,
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
          console.error('Camera Error:', err);
          setScanError('Camera start nahi ho raha.');
          setScanning(false);
        });
      } catch (err) {
        console.error('Scanner Error:', err);
        setScanError('Camera start nahi ho raha.');
        setScanning(false);
      }
    }, 500);
  };

  // 🚀 QR Scan hone par backend ko bhejo
  const handleScanSuccess = async (qrText) => {
    try {
      const res = await axios.post(
        'https://smart-attendance-backend-one.vercel.app/api/teacher-attendance/scan',
        { qrCode: qrText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 🚀 Status ke hisaab se message dikhayein
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">Teachers Attendance</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Scan teacher QR codes to mark their attendance or view report.
        </p>
      </div>

      {/* Date Filter & Scan Button */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Select Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-white font-medium"
          />
        </div>
        <button
          onClick={startScanner}
          className="w-full md:w-auto bg-emerald-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/30 whitespace-nowrap flex items-center justify-center gap-2"
        >
          📷 Scan Teacher QR
        </button>
      </div>

      {/* Scanner Area */}
      {scanning && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div id="reader" className="w-full rounded-2xl overflow-hidden border-2 border-dashed border-blue-500"></div>
          <button
            onClick={stopScanner}
            className="mt-4 w-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold py-3 rounded-xl hover:bg-red-200 transition"
          >
            Cancel Scanning
          </button>
        </div>
      )}

      {/* Messages */}
      {scanMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 font-bold">
          {scanMessage}
        </div>
      )}
      {scanError && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800 font-bold">
          ⚠️ {scanError}
        </div>
      )}

      {/* Attendance Report */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">Teachers Attendance on {date}</h3>
          <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-1.5 rounded-full font-bold text-sm border border-emerald-200 dark:border-emerald-800">
            {attendance.length} Total Marked
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white dark:bg-slate-900 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-5 font-bold">#</th>
                  <th className="p-5 font-bold">Teacher Name</th>
                  <th className="p-5 font-bold">Time In</th>
                  <th className="p-5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {attendance.length === 0 ? (
                  <tr><td colSpan="4" className="p-10 text-center text-slate-500 dark:text-slate-400">No teacher marked attendance on this date.</td></tr>
                ) : (
                  attendance.map((att, idx) => (
                    <tr key={att._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                      <td className="p-5 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="p-5 text-slate-800 dark:text-white font-bold">
                        {att.teacherId?.name || 'Unknown Teacher'}
                      </td>
                      <td className="p-5 text-slate-600 dark:text-slate-300 font-medium">
                        <span className="bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg font-mono text-sm">
                          {att.timeIn}
                        </span>
                      </td>
                      <td className="p-5">
                        {/* 🚀 Status ke hisaab se color change */}
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
        )}
      </div>
    </div>
  );
};

export default TeachersAttendance;