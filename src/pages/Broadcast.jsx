import { useState, useEffect } from 'react';
import axios from 'axios';

const Broadcast = () => {
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState('all'); // 'all' or 'class'
  const [targetClass, setTargetClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const token = localStorage.getItem('adminToken');

  // 🚀 Classes fetch karein (taake dropdown mein dikha saken)
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get('https://smart-attendance-backend-one.vercel.app/api/students', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const uniqueClasses = [...new Set(res.data.students.map(s => s.className))].sort();
        setClasses(uniqueClasses);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };
    fetchClasses();
  }, [token]);

  // 🚀 History fetch karein
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

  // 🚀 Message Send Karein
  const handleSend = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!message.trim()) {
      return setMsg({ type: 'error', text: 'Please enter a message.' });
    }

    if (targetType === 'class' && !targetClass) {
      return setMsg({ type: 'error', text: 'Please select a class.' });
    }

    // Confirmation Dialog
    const confirmMessage = targetType === 'all'
      ? 'Kya aap sach me SAARE students ke parents ko ye message bhejna chahte hain?'
      : `Kya aap sach me Class ${targetClass} ke parents ko ye message bhejna chahte hain?`;

    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    try {
      const res = await axios.post(
        'https://smart-attendance-backend-one.vercel.app/api/broadcast/send',
        { message, targetType, targetClass },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg({ type: 'success', text: res.data.message });
      setMessage(''); // Clear form
      setTargetType('all');
      setTargetClass('');
      fetchHistory(); // Refresh history
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to send message.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-pop">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">Broadcast Message</h2>
            <p className="text-indigo-200 text-sm">Send SMS/Email to all parents or a specific class at once.</p>
          </div>
        </div>
      </div>

      {/* Message Form */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
        
        {msg.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 ${
            msg.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
              : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}>
            <span>{msg.type === 'success' ? '✅' : '⚠️'}</span>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target Type */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Send To</label>
              <select
                value={targetType}
                onChange={(e) => { setTargetType(e.target.value); setTargetClass(''); }}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white font-medium cursor-pointer"
              >
                <option value="all">🌍 All Students (Saare Parents)</option>
                <option value="class">🎓 Specific Class</option>
              </select>
            </div>

            {/* Specific Class (Conditional) */}
            {targetType === 'class' && (
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Select Class</label>
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white font-medium cursor-pointer"
                  required
                >
                  <option value="">-- Select Class --</option>
                  {classes.map((cls, idx) => (
                    <option key={idx} value={cls}>Class {cls}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Message Box */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="5"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white resize-none placeholder:text-slate-400"
              placeholder="Type your message here... (e.g., Kal school chhutti hai)"
              required
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-right">{message.length} characters</p>
          </div>

          {/* Send Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending Messages...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  Send Broadcast Message
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* History Section */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">Message History</h3>
          </div>
          <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full font-bold text-xs border border-indigo-200 dark:border-indigo-800">
            Last 50 Messages
          </span>
        </div>

        {historyLoading ? (
          <div className="p-10 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="p-10 text-center text-slate-500 dark:text-slate-400">
            <p className="text-4xl mb-3">📭</p>
            <p>Abhi tak koi broadcast message nahi bheja gaya.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white dark:bg-slate-900 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-5 font-bold">Date & Time</th>
                  <th className="p-5 font-bold">Message</th>
                  <th className="p-5 font-bold">Target</th>
                  <th className="p-5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {history.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                    <td className="p-5 text-slate-600 dark:text-slate-300 font-medium text-sm whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="p-5 text-slate-800 dark:text-white font-medium max-w-xs truncate" title={item.message}>
                      {item.message}
                    </td>
                    <td className="p-5">
                      {item.targetType === 'all' ? (
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
                          All Students
                        </span>
                      ) : (
                        <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-full text-xs font-bold">
                          Class {item.targetClass}
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
        )}
      </div>
    </div>
  );
};

export default Broadcast;