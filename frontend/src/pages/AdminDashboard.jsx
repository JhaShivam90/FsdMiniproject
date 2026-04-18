/**
 * pages/AdminDashboard.jsx — Admin panel with light/dark support
 */

import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import ComplaintCard from '../components/ComplaintCard';
import ComplaintsMap from '../components/ComplaintsMap';
import api from '../utils/api';

const STATUS_FILTERS = ['all', 'open', 'assigned', 'resolved'];

const IconRefresh = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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
const IconCheck = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconTruck = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l1 1h1m8-1h3l3-3V9l-3-3h-3v10z" />
  </svg>
);
const IconAlert = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);
const IconClipboard = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);
const IconInbox = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);

export default function AdminDashboard() {
  const { isDark } = useTheme();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('grid');
  const [updating, setUpdating] = useState(null);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');
  const [error, setError] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints/all');
      setComplaints(res.data.complaints);
    } catch {
      setError('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === 'transferred') {
      // Remove complaint from the current admin's list
      setComplaints(prev => prev.filter(c => c._id !== id));
      showToast('Successfully transferred complaint to new ward.', 'success');
      return;
    }

    setUpdating(id);
    try {
      if (newStatus === 'assigned') {
        const res = await api.post(`/complaints/${id}/assign-truck`);
        setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: newStatus, workerId: res.data.complaint.workerId } : c));
        showToast(res.data.message || `Status updated to "${newStatus}"`, 'success');
      } else if (newStatus === 'resolved') {
        await api.patch(`/complaints/${id}/verify`);
        setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));
        showToast(`Verification complete. Status updated to "${newStatus}"`, 'success');
      }
    } catch(err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(''), 3000);
  };

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);
  const stats = {
    total:    complaints.length,
    open:     complaints.filter(c => c.status === 'open').length,
    assigned: complaints.filter(c => c.status === 'assigned').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };
  const mappable = filtered.filter(c => c.location?.latitude && c.location?.longitude);
  const resolutionPct = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  const statCards = [
    { label: 'Total',    value: stats.total,    icon: <IconClipboard />, valueColor: isDark ? 'text-gray-200' : 'text-slate-700', iconBg: isDark ? 'bg-gray-700/50 text-gray-400' : 'bg-slate-100 text-slate-500', cardCls: 'stat-card-total' },
    { label: 'Open',     value: stats.open,     icon: <IconAlert />,     valueColor: isDark ? 'text-red-400' : 'text-red-600',    iconBg: isDark ? 'bg-red-500/10 text-red-400'   : 'bg-red-50 text-red-500',    cardCls: 'stat-card-open' },
    { label: 'Pending / Assigned', value: stats.assigned + (complaints.filter(c => c.status === 'pending_verification').length), icon: <IconTruck />,     valueColor: isDark ? 'text-amber-400' : 'text-amber-600', iconBg: isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-500', cardCls: 'stat-card-assigned' },
    { label: 'Resolved', value: stats.resolved, icon: <IconCheck />,     valueColor: isDark ? 'text-brand-400' : 'text-green-600', iconBg: isDark ? 'bg-brand-500/10 text-brand-400' : 'bg-green-50 text-green-600', cardCls: 'stat-card-resolved' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className={`toast fixed bottom-6 right-6 z-50 border px-5 py-3 rounded-xl text-sm font-medium transition-all ${
          toastType === 'error'
            ? (isDark ? 'bg-red-900/80 border-red-500/30 text-red-300' : 'bg-red-50 border-red-200 text-red-700')
            : ''
        }`}>
          {toastType === 'success' ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {toast}
            </span>
          ) : toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* ── Header ───────────────────────────────── */}
        <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className={`text-sm font-medium mb-1 ${isDark ? 'text-brand-400' : 'text-green-600'} uppercase tracking-widest font-mono`}>
              Control Center
            </p>
            <h1 className="font-display text-4xl font-bold page-title">Admin Dashboard</h1>
            <p className="page-subtitle mt-1 text-sm">Manage and resolve all garbage complaints</p>
          </div>
          <button onClick={fetchAll} className="btn-secondary flex items-center gap-2 text-sm mt-1">
            <IconRefresh /> Refresh
          </button>
        </div>

        {/* ── Stats ────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
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

        {/* ── Resolution progress ───────────────────── */}
        {stats.total > 0 && (
          <div className="card mb-6 border">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Resolution rate
              </span>
              <span className={`text-sm font-mono font-semibold ${isDark ? 'text-brand-400' : 'text-green-600'}`}>
                {resolutionPct}%
              </span>
            </div>
            <div className="h-2 progress-track rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-700"
                style={{ width: `${resolutionPct}%` }}
              />
            </div>
            <div className={`flex gap-5 mt-3 text-xs font-mono ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              <span className={isDark ? 'text-red-400' : 'text-red-500'}>{stats.open} open</span>
              <span className={isDark ? 'text-amber-400' : 'text-amber-500'}>{stats.assigned} assigned</span>
              <span className={isDark ? 'text-brand-400' : 'text-green-600'}>{stats.resolved} resolved</span>
            </div>
          </div>
        )}

        {/* ── Controls row ─────────────────────────── */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          {/* Status filters */}
          <div className="flex items-center gap-2 flex-wrap">
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
                {s}&nbsp;<span className="opacity-60">{s === 'all' ? stats.total : complaints.filter(c => c.status === s).length}</span>
              </button>
            ))}
          </div>

          {/* Grid / Map toggle */}
          <div className="view-toggle-wrap flex rounded-xl p-1 gap-1">
            <button
              onClick={() => setView('grid')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                view === 'grid'
                  ? 'bg-brand-500 text-white'
                  : 'view-toggle-btn-inactive'
              }`}
            >
              <IconGrid /> Grid
            </button>
            <button
              onClick={() => setView('map')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                view === 'map'
                  ? 'bg-brand-500 text-white'
                  : 'view-toggle-btn-inactive'
              }`}
            >
              <IconMap /> Map
            </button>
          </div>
        </div>

        {/* ── Divider ──────────────────────────────── */}
        <div className="divider h-px mb-8" />

        {/* Error */}
        {error && (
          <div className={`rounded-xl px-4 py-3 text-sm mb-6 ${isDark ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-600 border border-red-200'}`}>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
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
              No {filter !== 'all' ? filter : ''} complaints
            </p>
            <p className="page-subtitle text-sm">Nothing to show for the current filter.</p>
          </div>
        ) : view === 'map' ? (
          <div className="space-y-4">
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Showing {mappable.length} of {filtered.length} complaints on map
            </p>
            <ComplaintsMap complaints={mappable} />
            <div className={`flex gap-5 text-xs font-mono mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Open
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Assigned
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Resolved
              </span>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(c => (
              <div key={c._id} className={updating === c._id ? 'opacity-50 pointer-events-none' : ''}>
                <ComplaintCard complaint={c} isAdmin onStatusChange={handleStatusChange} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}