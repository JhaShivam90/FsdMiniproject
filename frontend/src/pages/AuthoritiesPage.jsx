import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

const IconSpinner = () => (
  <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const IconStar = ({ fill = "currentColor" }) => (
  <svg className="w-5 h-5" fill={fill} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

export default function AuthoritiesPage() {
  const { isDark } = useTheme();
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const res = await api.get('/authorities');
        // Sort by highest rating score first
        const sorted = res.data.authorities.sort((a, b) => {
          const scoreA = a.authorityDetails?.rating?.score || 0;
          const scoreB = b.authorityDetails?.rating?.score || 0;
          return scoreB - scoreA;
        });
        setAuthorities(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuth();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <p className={`text-sm font-medium mb-1 ${isDark ? 'text-brand-400' : 'text-green-600'} uppercase tracking-widest font-mono`}>
            Leaderboard
          </p>
          <h1 className="font-display text-4xl font-bold page-title">Municipal Authorities</h1>
          <p className="page-subtitle mt-1 text-sm">
            View public ratings for local municipal offices handling garbage complaints.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-brand-400">
            <IconSpinner />
          </div>
        ) : authorities.length === 0 ? (
          <p className={`text-center py-20 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No authorities registered yet.</p>
        ) : (
          <div className="space-y-4">
            {authorities.map((auth, idx) => {
              const details = auth.authorityDetails || {};
              const rating = details.rating || { score: 0, count: 0 };
              
              return (
                <div key={auth._id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                  isDark ? 'bg-dark-800 border-white/5 hover:border-gray-700' : 'bg-white border-gray-100 shadow-xl shadow-green-900/5 hover:border-green-200'
                }`}>
                  <div className="flex items-center gap-5">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-lg ${
                      idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                      idx === 1 ? 'bg-gray-300 text-gray-800' :
                      idx === 2 ? 'bg-amber-600 text-orange-100' :
                      isDark ? 'bg-dark-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <h3 className={`font-semibold text-lg ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                        {details.name || auth.name}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {details.address || 'Location not specified'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 mb-1">
                      <span className={`font-bold font-mono text-xl ${isDark ? 'text-brand-400' : 'text-green-600'}`}>
                        {rating.score.toFixed(1)}
                      </span>
                      <IconStar fill="currentColor" className="w-5 h-5 text-yellow-400" />
                    </div>
                    <p className={`text-xs font-medium ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                      {rating.count} review{rating.count !== 1 && 's'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
