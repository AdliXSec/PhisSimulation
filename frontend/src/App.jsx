import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import CustomCursor from './components/ui/CustomCursor';
import SpaceLoader from './components/ui/SpaceLoader';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import VerifyEmail from './features/auth/VerifyEmail';
import Dashboard from './features/dashboard/Dashboard';
import Campaigns from './features/campaigns/Campaigns';
import Employees from './features/employees/Employees';
import Departments from './features/departments/Departments';
import Reports from './features/reports/Reports';
import ApiKeys from './features/apikeys/ApiKeys';
import Profile from './features/profile/Profile';
import PasswordIntel from './features/intel/PasswordIntel';
import Osint from './features/osint/Osint';
import LandingPage from './features/tracking/LandingPage';
import EducationPage from './features/tracking/EducationPage';
import LandingHome from './features/public/LandingHome';
import TemplateLibrary from './features/templates/TemplateLibrary';
import LandingPageGallery from './features/templates/LandingPageGallery';
import ErrorBoundary from './components/ui/ErrorBoundary';
import './index.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

const getPageTitle = (pathname) => {
  if (pathname === '/') return 'AI Phising Simulation';
  if (pathname === '/login') return 'Login - PhiSim';
  if (pathname === '/register') return 'Register - PhiSim';
  if (pathname.startsWith('/auth/verify-email')) return 'Verify Email - PhiSim';
  if (pathname === '/dashboard') return 'Dashboard - PhiSim';
  if (pathname.startsWith('/dashboard/campaigns')) return 'Kampanye - PhiSim';
  if (pathname.startsWith('/dashboard/employees')) return 'Karyawan - PhiSim';
  if (pathname.startsWith('/dashboard/departments')) return 'Departemen - PhiSim';
  if (pathname.startsWith('/dashboard/templates')) return 'Galeri Email - PhiSim';
  if (pathname.startsWith('/dashboard/landing-pages')) return 'Galeri Landing Page - PhiSim';
  if (pathname.startsWith('/dashboard/reports')) return 'Laporan - PhiSim';
  if (pathname.startsWith('/dashboard/api-keys')) return 'API Keys - PhiSim';
  if (pathname.startsWith('/dashboard/profile')) return 'Profil - PhiSim';
  if (pathname.startsWith('/dashboard/intel')) return 'Threat Intel - PhiSim';
  if (pathname.startsWith('/dashboard/osint')) return 'OSINT & Soceng - PhiSim';
  if (pathname.startsWith('/landing')) return 'Security Notice - PhiSim';
  if (pathname.startsWith('/education')) return 'Security Education - PhiSim';
  return 'PhiSim - Security Platform';
};

function AppRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    document.title = getPageTitle(location.pathname);
  }, [location.pathname]);

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingHome />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/auth/verify-email" element={<VerifyEmail />} />
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
        <Route path="templates" element={<TemplateLibrary />} />
        <Route path="landing-pages" element={<LandingPageGallery />} />
        <Route path="reports" element={<Reports />} />
        <Route path="reports/:campaignId" element={<Reports />} />
        <Route path="api-keys" element={<ApiKeys />} />
        <Route path="profile" element={<Profile />} />
        <Route path="intel" element={<PasswordIntel />} />
        <Route path="osint" element={<Osint />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function MainApp() {
  const location = useLocation();
  const isDecoyRoute = location.pathname.startsWith('/landing') || location.pathname.startsWith('/education');
  
  const [appReady, setAppReady] = useState(isDecoyRoute);

  useEffect(() => {
    if (isDecoyRoute) {
      setAppReady(true);
    }
  }, [isDecoyRoute]);

  const shouldShowLoader = !appReady && !isDecoyRoute;
  const isContentVisible = appReady || isDecoyRoute;

  return (
    <>
      {/* Space Loader — shown until app is fully ready */}
      {shouldShowLoader && <SpaceLoader onComplete={() => setAppReady(true)} />}

      {/* App content renders behind the loader (pre-renders while user watches animation) */}
      <div style={{ visibility: isContentVisible ? 'visible' : 'hidden' }}>
        {!isDecoyRoute && <CustomCursor />}
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.875rem',
              boxShadow: 'var(--shadow-md)',
            },
          }}
        />
      </div>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <MainApp />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
