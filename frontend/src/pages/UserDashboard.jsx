/**
 * pages/UserDashboard.jsx
 * Three-tab layout: Reports (grid) | My Map | Achievements
 * Map shows only the logged-in user's own complaints.
 * Achievements panel shows points, level, XP bar, and badges.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import ComplaintCard from '../components/ComplaintCard';
import ComplaintsMap from '../components/ComplaintsMap';
import AchievementsPanel from '../components/Achievementspanel';
import { calcPoints, getLevel } from '../utils/rewards';
import api from '../utils/api';

const STATUS_FILTERS = ['all', 'open', 'assigned', 'resolved'];

const IconPlus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);
const IconGrid = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);
const IconMap = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);
const IconTrophy = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);
const IconClipboard = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);
const IconAlert = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);
const IconTruck = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l1 1h1m8-1h3l3-3V9l-3-3h-3v10z" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconInbox = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);

const LEVEL_PILL = {
  gray:   { dark: 'bg-gray-700/50 text-gray-400',     light: 'bg-gray-100 text-gray-500 border border-gray-200' },
  blue:   { dark: 'bg-blue-500/15 text-blue-400',     light: 'bg-blue-50 text-blue-600 border border-blue-200' },
  green:  { dark: 'bg-green-500/15 text-green-400',   light: 'bg-green-50 text-green-700 border border-green-200' },
  amber:  { dark: 'bg-amber-500/15 text-amber-400',   light: 'bg-amber-50 text-amber-700 border border-amber-200' },
  orange: { dark: 'bg-orange-500/15 text-orange-400', light: 'bg-orange-50 text-orange-700 border border-orange-200' },
  purple: { dark: 'bg-purple-500/15 text-purple-400', light: 'bg-purple-50 text-purple-700 border border-purple-200' },
};

const TABS = [
  { id: 'reports',      label: 'My Reports',  Icon: IconGrid   },
  { id: 'map',          label: 'My Map',       Icon: IconMap    },
  { id: 'achievements', label: 'Achievements', Icon: IconTrophy },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('reports');

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints/user');
      setComplaints(res.data.complaints);
    } catch {
      setError('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const filtered  = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);
  const mappable  = complaints.filter(c => c.location?.latitude && c.location?.longitude);

  const stats = {
    total:    complaints.length,
    open:     complaints.filter(c => c.status === 'open').length,
    assigned: complaints.filter(c => c.status === 'assigned').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  const pts      = calcPoints(complaints);
  const level    = getLevel(pts);
  const mode     = isDark ? 'dark' : 'light';
  const lvlPill  = LEVEL_PILL[level.color] || LEVEL_PILL.gray;

  const statCards = [
    { label: 'Total',    value: stats.total,    icon: <IconClipboard />, valueColor: isDark ? 'text-gray-200'  : 'text-slate-700', iconBg: isDark ? 'bg-gray-700/50 text-gray-400'   : 'bg-slate-100 text-slate-500', cardCls: 'stat-card-total'    },
    { label: 'Open',     value: stats.open,     icon: <IconAlert />,     valueColor: isDark ? 'text-red-400'   : 'text-red-600',   iconBg: isDark ? 'bg-red-500/10 text-red-400'     : 'bg-red-50 text-red-500',     cardCls: 'stat-card-open'     },
    { label: 'Assigned', value: stats.assigned, icon: <IconTruck />,     valueColor: isDark ? 'text-amber-400' : 'text-amber-600', iconBg: isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-500', cardCls: 'stat-card-assigned' },
    { label: 'Resolved', value: stats.resolved, icon: <IconCheck />,     valueColor: isDark ? 'text-brand-400' : 'text-green-600', iconBg: isDark ? 'bg-brand-500/10 text-brand-400' : 'bg-green-50 text-green-600', cardCls: 'stat-card-resolved' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className={`text-xs font-mono uppercase tracking-widest mb-1 ${isDark ? 'text-brand-400' : 'text-green-600'}`}>
              Welcome back
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-4xl font-bold page-title">{user?.name}</h1>
              <span className={`text-xs font-bold font-mono uppercase tracking-wide px-3 py-1 rounded-full ${lvlPill[mode]}`}>
                {level.name} · {pts} pts
              </span>
            </div>
            <p className="page-subtitle mt-1 text-sm">Overview of your SwachhNet activity</p>
          </div>
          <Link to="/report" className="btn-primary flex items-center gap-2 mt-1">
            <IconPlus /> Report Garbage
          </Link>
        </div>

        {/* ── Stats ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {statCards.map(stat => (
            <div key={stat.label} className={`card ${stat.cardCls} border`}>
              <div className="flex items-center justify-between mb-3">
                {/* <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                  {stat.icon}
                </span> */}
                <span className={`text-xs font-mono uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  {stat.label}
                </span>
              </div>
              <div className={`font-display text-4xl font-bold ${stat.valueColor}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ──────────────────────────────────────────── */}
        <div className={`flex gap-1 p-1 rounded-xl mb-8 w-fit ${isDark ? 'bg-dark-700' : 'bg-gray-100'}`}>
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === id
                  ? isDark
                    ? 'bg-dark-900 text-white shadow'
                    : 'bg-white text-gray-900 shadow-sm'
                  : isDark
                    ? 'text-gray-500 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab: Reports ──────────────────────────────────── */}
        {activeTab === 'reports' && (
          <div>
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <span className={`text-xs font-mono uppercase tracking-widest mr-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Filter</span>
              {STATUS_FILTERS.map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium font-mono uppercase tracking-wide transition-all ${
                    filter === s ? 'filter-pill-active' : 'filter-pill-inactive'
                  }`}
                >
                  {s}&nbsp;<span className="opacity-60">{s === 'all' ? stats.total : (stats[s] || 0)}</span>
                </button>
              ))}
            </div>

            <div className="divider h-px mb-8" />

            {error && (
              <div className={`rounded-xl px-4 py-3 text-sm mb-6 ${isDark ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card border">
                    <div className="skeleton rounded-xl aspect-video mb-4" />
                    <div className="space-y-2.5">
                      <div className="skeleton h-4 rounded-lg w-3/4" />
                      <div className="skeleton h-3 rounded-lg w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 ${isDark ? 'bg-dark-700 text-gray-600' : 'bg-green-50 text-green-300'}`}>
                  <IconInbox />
                </div>
                <p className="font-display text-xl font-semibold page-title mb-1">
                  {filter === 'all' ? 'No reports yet' : `No ${filter} reports`}
                </p>
                <p className="page-subtitle text-sm mb-6">
                  {filter === 'all' ? 'Be the first to report a garbage issue in your area.' : `All ${filter} reports will appear here.`}
                </p>
                {filter === 'all' && (
                  <Link to="/report" className="btn-primary flex items-center gap-2">
                    <IconPlus /> File First Report
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(c => <ComplaintCard key={c._id} complaint={c} />)}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Map ──────────────────────────────────────── */}
        {activeTab === 'map' && (
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {mappable.length} of {complaints.length} reports have GPS coordinates
              </p>
              <div className={`flex gap-4 text-xs font-mono ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {[['bg-red-500','Open'],['bg-amber-500','Assigned'],['bg-green-500','Resolved']].map(([bg, label]) => (
                  <span key={label} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${bg} inline-block`} /> {label}
                  </span>
                ))}
              </div>
            </div>

            {mappable.length === 0 ? (
              <div className={`rounded-2xl flex flex-col items-center justify-center py-24 border ${isDark ? 'border-white/5 bg-dark-800' : 'border-green-100 bg-green-50'}`}>
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${isDark ? 'bg-dark-700 text-gray-600' : 'bg-white text-green-300 shadow-sm'}`}>
                  <IconMap />
                </div>
                <p className="font-display font-semibold page-title mb-1">No locations yet</p>
                <p className="page-subtitle text-sm">Submit a report with GPS to see it here.</p>
              </div>
            ) : (
              <div className={`rounded-2xl overflow-hidden border ${isDark ? 'border-white/5' : 'border-green-100 shadow-sm'}`}>
                <ComplaintsMap complaints={mappable} />
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Achievements ─────────────────────────────── */}
        {activeTab === 'achievements' && (
          <div>
            {loading ? (
              <div className="card border"><div className="skeleton h-40 rounded-xl" /></div>
            ) : (
              <AchievementsPanel complaints={complaints} />
            )}
          </div>
        )}

      </div>
    </div>
  );
}