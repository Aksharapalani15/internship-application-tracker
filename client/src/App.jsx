import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation,useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/common/ToastContainer';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import LoadingSpinner from './components/common/LoadingSpinner';

import DashboardPage from './pages/DashboardPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

/**
 * Route protection wrapper
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner size="lg" message="Verifying session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * Public route wrapper (redirects to /dashboard if already logged in)
 */
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/**
 * Authenticated Layout Shell
 */
function AuthenticatedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

const handleOpenAddModal = () => {
  console.log('DEBUG: Add Application clicked');
  setIsAddModalOpen(true);

  if (location.pathname !== '/applications') {
    navigate('/applications');
  }
};

  const getPageTitle = (pathname) => {
    if (pathname.includes('/applications')) return 'Internship Applications';
    if (pathname.includes('/profile')) return 'My Profile';
    return 'Dashboard';
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-wrapper">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenAddModal={handleOpenAddModal}
          title={getPageTitle(location.pathname)}
        />

        <main className="main-content">
          <Routes>
            <Route
  path="/dashboard"
  element={
    <DashboardPage
      onOpenAddModal={handleOpenAddModal}
    />
  }
/>
            <Route
              path="/applications"
              element={
                <ApplicationsPage
                  isAddModalOpen={isAddModalOpen}
                  onCloseAddModal={() => setIsAddModalOpen(false)}
                  onOpenAddModal={handleOpenAddModal}
                />
              }
            />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ToastContainer />
          <Routes>
            {/* Public Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Authenticated Application Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
