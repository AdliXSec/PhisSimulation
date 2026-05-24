import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Dashboard from './features/dashboard/Dashboard';
import Campaigns from './features/campaigns/Campaigns';
import Employees from './features/employees/Employees';
import Departments from './features/departments/Departments';
import Reports from './features/reports/Reports';
import ApiKeys from './features/apikeys/ApiKeys';
import Profile from './features/profile/Profile';
import LandingPage from './features/tracking/LandingPage';
import EducationPage from './features/tracking/EducationPage';
import LandingHome from './features/public/LandingHome';
import './index.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingHome />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/landing/:token" element={<LandingPage />} />
      <Route path="/education/:token" element={<EducationPage />} />

      {/* Protected dashboard routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="employees" element={<Employees />} />
        <Route path="departments" element={<Departments />} />
        <Route path="reports" element={<Reports />} />
        <Route path="reports/:campaignId" element={<Reports />} />
        <Route path="api-keys" element={<ApiKeys />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(6, 10, 20, 0.95)',
              color: '#e0e6f0',
              border: '1px solid rgba(0, 240, 255, 0.12)',
              borderRadius: '8px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.875rem',
              boxShadow: '0 0 20px rgba(0, 0, 0, 0.4)',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
