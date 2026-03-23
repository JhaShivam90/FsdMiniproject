/**
 * pages/AdminDashboard.jsx — Admin view showing all complaints with map + status controls
 * Admins can update status: open → assigned → resolved (simulates truck assignment)
 */

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ComplaintCard from '../components/ComplaintCard';
import ComplaintsMap from '../components/ComplaintsMap';
import api from '../utils/api';

const STATUS_FILTERS = ['all', 'open', 'assigned', 'resolved'];

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('grid'); // 'grid' or 'map'
  const [updating, setUpdating] = useState(null); // ID of complaint being updated
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints/all');
      setComplaints(res.data.complaints);
    } catch (err) {
      setError('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  // Update a complaint's status via PATCH API
  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id);
    try {
      const res = await api.patch(`/complaints/${id}`, { status: newStatus });
      // Update local state to avoid full refetch
      setComplaints(prev =>
        prev.map(c => c._id === id ? { ...c, status: newStatus } : c)
      );
      showToast(`✓ Status updated to "${newStatus}"`);
    } catch (err) {
      showToast('❌ Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const filtered = filter === 'all'
    ? complaints
    : complaints.filter(c => c.status === filter);

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'open').length,
    assigned: complaints.filter(c => c.status === 'assigned').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  // For map view, show only complaints with valid coordinates
  const mappable = filtered.filter(c => c.location?.latitude && c.location?.longitude);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-dark-700 border border-brand-500/30 text-gray-200 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-slide-up">
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage and resolve all garbage complaints</p>
          </div>
          <button onClick={fetchAll} className="btn-secondary flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: '📋', color: 'text-gray-300', bg: 'bg-dark-700' },
            { label: 'Open', value: stats.open, icon: '🔴', color: 'text-red-400', bg: 'bg-red-500/5' },
            { label: 'Assigned', value: stats.assigned, icon: '🟡', color: 'text-amber-400', bg: 'bg-amber-500/5' },
            { label: 'Resolved', value: stats.resolved, icon: '🟢', color: 'text-brand-400', bg: 'bg-brand-500/5' },
          ].map(stat => (
            <div key={stat.label} className={`card ${stat.bg} text-center border-white/5`}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`font-display text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 font-mono uppercase tracking-wide mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar showing resolution rate */}
        {stats.total > 0 && (
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Resolution Progress</span>
              <span className="text-sm font-mono text-brand-400">
                {Math.round((stats.resolved / stats.total) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-700"
                style={{ width: `${(stats.resolved / stats.total) * 100}%` }}
              />
            </div>
            <div className="flex gap-4 mt-2 text-xs text-gray-600 font-mono">
              <span className="text-red-400">{stats.open} open</span>
              <span className="text-amber-400">{stats.assigned} assigned</span>
              <span className="text-brand-400">{stats.resolved} resolved</span>
            </div>
          </div>
        )}

        {/* Filter + View toggle */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          {/* Status filters */}
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium font-mono uppercase tracking-wide transition-all ${
                  filter === s
                    ? 'bg-brand-500 text-white'
                    : 'bg-dark-700 text-gray-400 hover:text-gray-200'
                }`}
              >
                {s} ({s === 'all' ? stats.total : (stats[s] || 0)})
              </button>
            ))}
          </div>

          {/* Grid / Map toggle */}
          <div className="flex bg-dark-700 rounded-xl p-1">
            <button
              onClick={() => setView('grid')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                view === 'grid' ? 'bg-brand-500 text-white' : 'text-gray-400'
              }`}
            >
              ⊞ Grid
            </button>
            <button
              onClick={() => setView('map')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                view === 'map' ? 'bg-brand-500 text-white' : 'text-gray-400'
              }`}
            >
              🗺 Map
            </button>
          </div>
        </div>

        {/* Error */}
        {error && <div className="text-center py-10 text-red-400">{error}</div>}

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="bg-dark-700 rounded-xl aspect-video mb-4" />
                <div className="space-y-2">
                  <div className="bg-dark-700 h-4 rounded w-3/4" />
                  <div className="bg-dark-700 h-3 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <div className="text-5xl mb-4">📭</div>
            <p className="font-display text-lg">No {filter !== 'all' ? filter : ''} complaints found</p>
          </div>
        ) : view === 'map' ? (
          /* Map View */
          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              Showing {mappable.length} of {filtered.length} complaints on map
            </div>
            <ComplaintsMap complaints={mappable} />
            <div className="flex gap-4 text-xs font-mono text-gray-500 mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Open
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Assigned
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-brand-500 inline-block" /> Resolved
              </span>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(c => (
              <div key={c._id} className={updating === c._id ? 'opacity-50 pointer-events-none' : ''}>
                <ComplaintCard
                  complaint={c}
                  isAdmin={true}
                  onStatusChange={handleStatusChange}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
