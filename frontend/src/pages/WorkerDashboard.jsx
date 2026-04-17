import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const IconSpinner = () => (
  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

export default function WorkerDashboard() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [uploadingId, setUploadingId] = useState(null);
  const fileInputRef = useRef({});

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/complaints/worker');
      setComplaints(res.data.complaints);
    } catch {
      setError('Failed to fetch assigned tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (complaintId, file) => {
    if (!file) return;
    setUploadingId(complaintId);
    try {
      const formData = new FormData();
      formData.append('image', file);
      await api.post(`/complaints/${complaintId}/worker-submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchTasks(); // refresh after success
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to submit proof');
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <p className={`text-sm font-medium mb-1 ${isDark ? 'text-brand-400' : 'text-green-600'} uppercase tracking-widest font-mono`}>
            Driver Console
          </p>
          <h1 className="font-display text-4xl font-bold page-title">Assigned Tasks</h1>
          <p className="page-subtitle mt-1 text-sm">
            View locations and submit cleanup photos.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-200 mb-6 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20 text-brand-400">
            <IconSpinner />
          </div>
        ) : complaints.length === 0 ? (
          <div className={`text-center py-24 rounded-2xl border ${isDark ? 'border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No pending tasks right now. Relax!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {complaints.map(c => {
              const isAssigned = c.status === 'assigned';
              const isPending = c.status === 'pending_verification';
              const isResolved = c.status === 'resolved';

              return (
                <div key={c._id} className={`card border p-5 ${isDark ? 'bg-dark-800 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className="flex flex-col sm:flex-row gap-5">
                    {/* Before Image */}
                    <div className="w-full sm:w-1/3 aspect-video sm:aspect-square bg-gray-100 dark:bg-dark-900 rounded-xl overflow-hidden relative">
                      <img src={c.imageUrl} alt="Garbage" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-mono text-white uppercase tracking-wider">
                        Before
                      </div>
                    </div>

                    {/* Details */}
                    <div className="w-full sm:w-2/3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-xs font-mono text-gray-400">Task #{c._id.slice(-6)}</p>
                          <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                            isAssigned ? 'bg-amber-100 text-amber-700' :
                            isPending ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {isAssigned ? 'Actively Assigned' : (isPending ? 'Waiting Verification' : 'Resolved')}
                          </span>
                        </div>
                        
                        <p className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                          Location: {c.location?.address || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500 font-mono mb-4">
                          {c.location?.latitude?.toFixed(5)}, {c.location?.longitude?.toFixed(5)}
                        </p>

                        <a 
                          href={`https://maps.google.com/?q=${c.location?.latitude},${c.location?.longitude}`}
                          target="_blank" rel="noreferrer"
                          className="text-sm font-medium text-brand-500 hover:underline"
                        >
                          Open in Google Maps
                        </a>
                      </div>

                      {/* Action Area */}
                      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                        {isAssigned && (
                          <div className="flex items-center gap-3">
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              ref={el => fileInputRef.current[c._id] = el}
                              onChange={(e) => handleUploadSubmit(c._id, e.target.files[0])}
                            />
                            <button 
                              onClick={() => fileInputRef.current[c._id].click()}
                              disabled={uploadingId === c._id}
                              className="btn-primary w-full sm:w-auto"
                            >
                              {uploadingId === c._id ? (
                                <span className="flex items-center gap-2"><IconSpinner /> Uploading...</span>
                              ) : (
                                'Click After Photo & Submit'
                              )}
                            </button>
                          </div>
                        )}

                        {(isPending || isResolved) && c.afterImageUrl && (
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-lg overflow-hidden border">
                              <img src={c.afterImageUrl} alt="After" className="w-full h-full object-cover" />
                            </div>
                            <div className="text-sm text-gray-500">
                              Proof submitted successfully. <br/>
                              {isPending ? 'Ward office will verify soon.' : 'Ward office verified your work. Great job!'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
