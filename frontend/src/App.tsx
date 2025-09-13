import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import TherapistsPage from './pages/public/TherapistsPage';
import ClientDashboard from './pages/client/ClientDashboard';
import TherapistDashboard from './pages/therapist/TherapistDashboard';
import DashboardRedirect from './components/common/DashboardRedirect';
import NotFoundPage from './pages/NotFoundPage';
import './styles/variables.css';
import './styles/animations.css';
import './styles/responsive.css';
import './styles/accessibility.css';
import './utils/testHelpers'; // Load test utilities in development

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <NotificationProvider>
          <AuthProvider>
            <Layout>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/therapists" element={<TherapistsPage />} />

                {/* Protected routes - general */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardRedirect />
                    </ProtectedRoute>
                  }
                />

                {/* Protected routes - client only */}
                <Route
                  path="/client/dashboard"
                  element={
                    <ProtectedRoute requiredRole="client">
                      <ClientDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected routes - therapist only */}
                <Route
                  path="/therapist/dashboard"
                  element={
                    <ProtectedRoute requiredRole="therapist">
                      <TherapistDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
          </AuthProvider>
        </NotificationProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
