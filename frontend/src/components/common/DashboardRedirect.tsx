import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();

  // Redirect to role-specific dashboard
  if (user?.role === 'client') {
    return <Navigate to="/client/dashboard" replace />;
  }

  if (user?.role === 'therapist') {
    return <Navigate to="/therapist/dashboard" replace />;
  }

  // Fallback to home if no role found
  return <Navigate to="/" replace />;
};

export default DashboardRedirect;
