/**
 * App.jsx — Root component. ThemeProvider wraps everything so all pages
 * can read isDark/toggle. No other changes from original.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';  // ← new
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import ReportPage from './pages/ReportPage';
import AdminDashboard from './pages/AdminDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import AuthoritiesPage from './pages/AuthoritiesPage';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const WorkerRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'worker') return <Navigate to="/dashboard" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'worker') return <Navigate to="/worker" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login"     element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register"  element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      <Route path="/report"    element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
      <Route path="/authorities" element={<AuthoritiesPage />} />
      <Route path="/admin"     element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/worker"    element={<WorkerRoute><WorkerDashboard /></WorkerRoute>} />
      <Route path="*"          element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>        {/* ← wraps everything */}
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}