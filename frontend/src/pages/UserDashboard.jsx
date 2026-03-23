/**
 * pages/UserDashboard.jsx — Shows all complaints submitted by the logged-in user
 * Includes status filter tabs and stat summary cards.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ComplaintCard from '../components/ComplaintCard';
import api from '../utils/api';

const STATUS_FILTERS = ['all', 'open', 'assigned', 'resolved'];

export default function UserDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  // Fetch user's complaints on mount
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints/user');
      setComplaints(res.data.complaints);
    } catch (err) {
      setError('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  // Filter locally (avoid extra API calls)
  const filtered = filter === 'all'
    ? complaints
    : complaints.filter(c => c.status === filter);

  // Stats
  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'open').length,
    assigned: complaints.filter(c => c.status === 'assigned').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Welcome header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">
              My Reports
            </h1>
            <p className="text-gray-500 mt-1">
              Welcome back, <span className="text-brand-400">{user?.name}</span>
            </p>
          </div>
          <Link to="/report" className="btn-primary flex items-center gap-2">
            <span>🚨</span> Report Garbage
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: '📋', color: 'text-gray-300' },
            { label: 'Open', value: stats.open, icon: '⚠', color: 'text-red-400' },
            { label: 'Assigned', value: stats.assigned, icon: '🚛', color: 'text-amber-400' },
            { label: 'Resolved', value: stats.resolved, icon: '✓', color: 'text-brand-400' },
          ].map(stat => (
            <div key={stat.label} className="card text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`font-display text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 font-mono uppercase tracking-wide mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
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
              {s} {s === 'all' ? `(${stats.total})` : `(${stats[s] || 0})`}
            </button>
          ))}
        </div>

        {/* Content */}
        {error && (
          <div className="text-center py-12 text-red-400">{error}</div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
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
            <p className="text-lg font-display">
              {filter === 'all' ? 'No reports yet' : `No ${filter} complaints`}
            </p>
            {filter === 'all' && (
              <Link to="/report" className="btn-primary mt-4 inline-flex items-center gap-2">
                <span>🚨</span> File First Report
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
