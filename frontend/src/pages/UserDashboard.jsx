/**
 * pages/UserDashboard.jsx — User complaint history with light/dark support
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import ComplaintCard from '../components/ComplaintCard';
import api from '../utils/api';

const STATUS_FILTERS = ['all', 'open', 'assigned', 'resolved'];

// Icon components — no emojis
const IconPlus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);
const IconClipboard = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);
const IconAlertCircle = () => (
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
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconInbox = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);

export default function UserDashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

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

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);

  const stats = {
    total:    complaints.length,
    open:     complaints.filter(c => c.status === 'open').length,
    assigned: complaints.filter(c => c.status === 'assigned').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  const statCards = [
    {
      label: 'Total',
      value: stats.total,
      icon: <IconClipboard />,
      valueColor: isDark ? 'text-gray-200' : 'text-slate-700',
      iconBg:  isDark ? 'bg-gray-700/50 text-gray-400' : 'bg-slate-100 text-slate-500',
      cardCls: 'stat-card-total',
    },
    {
      label: 'Open',
      value: stats.open,
      icon: <IconAlertCircle />,
      valueColor: isDark ? 'text-red-400' : 'text-red-600',
      iconBg:  isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500',
      cardCls: 'stat-card-open',
    },
    {
      label: 'Assigned',
      value: stats.assigned,
      icon: <IconTruck />,
      valueColor: isDark ? 'text-amber-400' : 'text-amber-600',
      iconBg:  isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-500',
      cardCls: 'stat-card-assigned',
    },
    {
      label: 'Resolved',
      value: stats.resolved,
      icon: <IconCheck />,
      valueColor: isDark ? 'text-brand-400' : 'text-green-600',
      iconBg:  isDark ? 'bg-brand-500/10 text-brand-400' : 'bg-green-50 text-green-600',
      cardCls: 'stat-card-resolved',
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* ── Header ───────────────────────────────── */}
        <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className={`text-sm font-medium mb-1 ${isDark ? 'text-brand-400' : 'text-green-600'} uppercase tracking-widest font-mono`}>
              Welcome back
            </p>
            <h1 className={`font-display text-4xl font-bold page-title`}>
              {user?.name}
            </h1>
            <p className="page-subtitle mt-1 text-sm">
              Here's an overview of your submitted reports
            </p>
          </div>
          <Link to="/report" className="btn-primary flex items-center gap-2 mt-1">
            <IconPlus />
            Report Garbage
          </Link>
        </div>

        {/* ── Stats ────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {statCards.map(stat => (
            <div key={stat.label} className={`card ${stat.cardCls} border`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                  {stat.icon}
                </span>
                <span className={`text-xs font-mono uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  {stat.label}
                </span>
              </div>
              <div className={`font-display text-4xl font-bold ${stat.valueColor}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter tabs ──────────────────────────── */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className={`text-xs font-mono uppercase tracking-widest mr-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            Filter
          </span>
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium font-mono uppercase tracking-wide transition-all ${
                filter === s ? 'filter-pill-active' : 'filter-pill-inactive'
              }`}
            >
              {s}&nbsp;
              <span className="opacity-60">
                {s === 'all' ? stats.total : (stats[s] || 0)}
              </span>
            </button>
          ))}
        </div>

        {/* ── Divider ──────────────────────────────── */}
        <div className="divider h-px mb-8" />

        {/* ── Content ──────────────────────────────── */}
        {error && (
          <div className={`rounded-xl px-4 py-3 text-sm mb-6 ${isDark ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-600 border border-red-200'}`}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card">
                <div className="skeleton rounded-xl aspect-video mb-4" />
                <div className="space-y-2.5">
                  <div className="skeleton h-4 rounded-lg w-3/4" />
                  <div className="skeleton h-3 rounded-lg w-1/2" />
                  <div className="skeleton h-3 rounded-lg w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 ${isDark ? 'bg-dark-700 text-gray-600' : 'bg-green-50 text-green-300'}`}>
              <IconInbox />
            </div>
            <p className={`font-display text-xl font-semibold mb-1 page-title`}>
              {filter === 'all' ? 'No reports yet' : `No ${filter} reports`}
            </p>
            <p className="page-subtitle text-sm mb-6">
              {filter === 'all' ? 'Be the first to report a garbage issue in your area.' : `All ${filter} complaints will appear here.`}
            </p>
            {filter === 'all' && (
              <Link to="/report" className="btn-primary flex items-center gap-2">
                <IconPlus /> File First Report
              </Link>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(c => (
              <ComplaintCard key={c._id} complaint={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}