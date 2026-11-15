import { useState, useEffect } from 'react';
import axios from 'axios';

const Broadcast = () => {
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState('all');
  const [targetClass, setTargetClass] = useState('');
  const [targetStudentId, setTargetStudentId] = useState('');
  
  const [classes, setClasses] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('https://smart-attendance-backend-one.vercel.app/api/students', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const students = res.data.students;
        setAllStudents(students);
        const uniqueClasses = [...new Set(students.map(s => s.className))].sort();
        setClasses(uniqueClasses);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (targetClass) {
      const filtered = allStudents.filter(s => s.className === targetClass);
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
    setTargetStudentId('');
  }, [targetClass, allStudents]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('https://smart-attendance-backend-one.vercel.app/api/broadcast/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data.history);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const handleSend = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!message.trim()) return setMsg({ type: 'error', text: 'Please enter a message.' });
    if (targetType === 'class' && !targetClass) return setMsg({ type: 'error', text: 'Please select a class.' });
    if (targetType === 'student' && (!targetClass || !targetStudentId)) return setMsg({ type: 'error', text: 'Please select a class and student.' });

    let confirmMessage = '';
    if (targetType === 'all') confirmMessage = 'Kya aap sach me SAARE students ke parents ko ye message bhejna chahte hain?';
    else if (targetType === 'class') confirmMessage = `Kya aap sach me Class ${targetClass} ke parents ko ye message bhejna chahte hain?`;
    else confirmMessage = `Kya aap sach me is student ke parent ko ye message bhejna chahte hain?`;

    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    try {
      const res = await axios.post(
        'https://smart-attendance-backend-one.vercel.app/api/broadcast/send',
        { message, targetType, targetClass, targetStudentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg({ type: 'success', text: res.data.message });
      setMessage('');
      setTargetType('all');
      setTargetClass('');
      setTargetStudentId('');
      fetchHistory();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to send message.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-8 animate-pop">
      
      {/* Header (Premium Red Gradient) */}
      <div className="bg-gradient-to-r from-[#2a0000] via-[#5c0000] to-[#991b1b] p-5 md:p-8 rounded-2xl md:rounded-[2rem] shadow-lg text-white relative overflow-hidden border border-red-900/40">
        <div className="flex flex-row items-center gap-3 md:gap-4 relative z-10 text-left">
          <div className="h-10 w-10 md:h-14 md:w-14 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 flex-shrink-0">
            <svg className="w-5 h-5 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
          </div>
          <div>
            <h2 className="text-base md:text-2xl font-bold mb-0.5 md:mb-1">Broadcast Message</h2>
            <p className="text-red-100/90 text-[10px] md:text-sm">Send SMS to parents, a class, or individual student.</p>
          </div>
        </div>
      </div>

      {/* Message Form */}
      <div className="bg-white dark:bg-[#0a0a0a] p-4 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 dark:border-red-900/30 transition-colors duration-300">
        
        {msg.text && (
          <div className={`p-3 md:p-4 rounded-xl mb-4 md:mb-6 text-xs md:text-sm font-bold flex items-center gap-2 ${
            msg.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
              : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}>
            <span>{msg.type === 'success' ? '✅' : '⚠️'}</span>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-4 md:space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
            
            <div className="md:col-span-2">
              <label className="block text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 md:mb-2 uppercase tracking-wider">Send To</label>
              <select
                value={targetType}
                onChange={(e) => { 
                  setTargetType(e.target.value); 
                  setTargetClass(''); 
                  setTargetStudentId(''); 
                }}
                className="w-full px-3 py-2.5 md:py-3 bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-red-900/30 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white font-medium cursor-pointer text-xs md:text-base"
              >
                <option value="all">🌍 All Students</option>
                <option value="class">🎓 Specific Class</option>
                <option value="student">👤 Specific Student</option>
              </select>
            </div>

            {(targetType === 'class' || targetType === 'student') && (
              <div>
                <label className="block text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 md:mb-2 uppercase tracking-wider">Select Class</label>
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  className="w-full px-3 py-2.5 md:py-3 bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-red-900/30 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white font-medium cursor-pointer text-xs md:text-base"
                  required
                >
                  <option value="">-- Select Class --</option>
                  {classes.map((cls, idx) => (
                    <option key={idx} value={cls}>Class {cls}</option>
                  ))}
                </select>
              </div>
            )}

            {targetType === 'student' && targetClass && (
              <div>
                <label className="block text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 md:mb-2 uppercase tracking-wider">Select Student</label>
                <select
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  className="w-full px-3 py-2.5 md:py-3 bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-red-900/30 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white font-medium cursor-pointer text-xs md:text-base"
                  required
                >
                  <option value="">-- Select Student --</option>
                  {filteredStudents.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 md:mb-2 uppercase tracking-wider">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
              className="w-full px-3 py-3 md:px-4 md:py-3 bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-red-900/30 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white resize-none placeholder:text-slate-400 text-xs md:text-base"
              placeholder="Type your message here..."
              required
            />
            <p className="text-[9px] md:text-xs text-slate-500 dark:text-slate-400 mt-1.5 text-right">{message.length} characters</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white font-bold py-3 md:py-4 rounded-lg md:rounded-xl hover:bg-red-700 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-xs md:text-base"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  Send Message
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* History Section */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 dark:border-red-900/30 overflow-hidden transition-colors duration-300">
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-red-900/30 bg-slate-50/50 dark:bg-[#0f0f11] flex flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-slate-500 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h3 className="text-sm md:text-lg font-extrabold text-slate-800 dark:text-white">Message History</h3>
          </div>
          <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 md:px-3 py-1 rounded-full font-bold text-[9px] md:text-xs border border-red-200 dark:border-red-800">
            Last 50
          </span>
        </div>

        {historyLoading ? (
          <div className="p-10 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="p-10 text-center text-slate-500 dark:text-slate-400">
            <p className="text-2xl md:text-4xl mb-2 md:mb-3">📭</p>
            <p className="text-xs md:text-sm">No broadcast messages yet.</p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white dark:bg-[#0f0f11] text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-red-900/30">
                  <tr>
                    <th className="p-5 font-bold">Date & Time</th>
                    <th className="p-5 font-bold">Message</th>
                    <th className="p-5 font-bold">Target</th>
                    <th className="p-5 font-bold">Delivery</th>
                    <th className="p-5 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-red-900/20">
                  {history.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition">
                      <td className="p-5 text-slate-600 dark:text-slate-300 font-medium text-sm whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-5 text-slate-800 dark:text-white font-medium max-w-xs truncate" title={item.message}>
                        {item.message}
                      </td>
                      <td className="p-5">
                        {item.targetType === 'all' ? (
                          <span className="bg-slate-100 dark:bg-[#1a1a1a] text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 dark:border-red-900/20">All</span>
                        ) : item.targetType === 'class' ? (
                          <span className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-100 dark:border-red-900/30">Class {item.targetClass}</span>
                        ) : (
                          <span className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-100 dark:border-red-900/30">{item.targetStudentName || 'N/A'}</span>
                        )}
                      </td>
                      
                      <td className="p-5">
                        {item.status === 'replied' ? (
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1 w-max">
                            💬 Replied
                          </span>
                        ) : (
                          <span className="bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 dark:border-red-900/20 flex items-center gap-1 w-max">
                            ✔️ Sent
                          </span>
                        )}
                      </td>

                      <td className="p-5">
                        <div className="flex flex-col gap-1 text-xs font-bold">
                          <span className="text-emerald-500 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {item.successCount} Sent
                          </span>
                          {item.failedCount > 0 && (
                            <span className="text-red-500 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-red-500"></span> {item.failedCount} Failed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden p-3 space-y-2.5">
              {history.map((item) => (
                <div key={item._id} className="bg-slate-50 dark:bg-[#121212] p-3 rounded-xl border border-slate-200 dark:border-red-900/20 flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(item.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <div className="flex gap-1.5">
                      {item.status === 'replied' ? (
                        <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md text-[9px] font-bold border border-emerald-200">💬 Replied</span>
                      ) : (
                        <span className="bg-slate-200 dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-md text-[9px] font-bold border border-slate-300 dark:border-red-900/20">✔️ Sent</span>
                      )}
                      
                      {item.targetType === 'all' ? (
                        <span className="bg-slate-100 dark:bg-[#1a1a1a] text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded-md text-[9px] font-bold border border-slate-200 dark:border-red-900/20">All</span>
                      ) : item.targetType === 'class' ? (
                        <span className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded-md text-[9px] font-bold border border-red-200 dark:border-red-800">Class {item.targetClass}</span>
                      ) : (
                        <span className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded-md text-[9px] font-bold border border-red-200 dark:border-red-800 truncate max-w-[60px] inline-block">{item.targetStudentName || 'N/A'}</span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-800 dark:text-white font-medium line-clamp-2">{item.message}</p>
                  
                  <div className="flex gap-3 text-[9px] font-bold pt-1.5 border-t border-slate-200 dark:border-red-900/20 mt-0.5">
                    <span className="text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {item.successCount} Sent
                    </span>
                    {item.failedCount > 0 && (
                      <span className="text-red-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {item.failedCount} Failed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Broadcast;