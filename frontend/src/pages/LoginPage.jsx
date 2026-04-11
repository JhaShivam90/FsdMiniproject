/**
 * pages/LoginPage.jsx — Login form with full light/dark mode support
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

const IconSpinner = () => (
  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const IconError = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

// Decorative leaf/civic SVG mark
const BrandMark = ({ isDark }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="14" fill={isDark ? 'rgba(34,197,94,0.12)' : '#dcfce7'} />
    <path
      d="M24 10C24 10 14 16 14 24C14 29.52 18.48 34 24 34C29.52 34 34 29.52 34 24C34 16 24 10 24 10Z"
      fill={isDark ? '#22c55e' : '#16a34a'}
      opacity="0.9"
    />
    <path
      d="M24 34V22M24 22L20 26M24 22L28 26"
      stroke={isDark ? '#0f1a0f' : '#f0fdf4'}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      const { token, user } = res.data;
      login(token, user);
      navigate(user.role === 'admin' ? '/admin' : user.role === 'worker' ? '/worker' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const labelCls = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl ${isDark ? 'bg-brand-500/6' : 'bg-green-200/50'}`} />
        <div className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl ${isDark ? 'bg-brand-700/5' : 'bg-emerald-200/40'}`} />
        {/* Light mode: subtle grid pattern */}
        {!isDark && (
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: 'linear-gradient(#16a34a 1px, transparent 1px), linear-gradient(90deg, #16a34a 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        )}
      </div>

      <div className="w-full max-w-md relative">

        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <BrandMark isDark={isDark} />
          </div>
          <h1 className={`font-display text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Welcome back
          </h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Sign in to your <span className={isDark ? 'text-brand-400' : 'text-green-600'}>SwachhNet</span> account
          </p>
        </div>

        {/* Card */}
        <div className={`rounded-2xl p-8 ${
          isDark
            ? 'bg-dark-800 border border-white/5'
            : 'bg-white border border-green-100 shadow-xl shadow-green-900/5'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Error */}
            {error && (
              <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${
                isDark
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                  : 'bg-red-50 border border-red-200 text-red-600'
              }`}>
                <IconError />
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="input"
              />
            </div>

            {/* Password */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="input"
              />
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
              {loading
                ? <span className="flex items-center justify-center gap-2"><IconSpinner /> Signing in...</span>
                : 'Sign In'
              }
            </button>
          </form>


          

          <p className={`mt-5 text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Don't have an account?{' '}
            <Link
              to="/register"
              className={`font-medium transition-colors ${isDark ? 'text-brand-400 hover:text-brand-300' : 'text-green-600 hover:text-green-700'}`}
            >
              Create one →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}