import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RoleRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to respective user role dashboard
    if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
    if (user?.role === 'RECEPTIONIST') return <Navigate to="/receptionist/dashboard" replace />;
    if (user?.role === 'LAB_TECH') return <Navigate to="/lab/dashboard" replace />;
    if (user?.role === 'PATIENT') return <Navigate to="/patient/dashboard" replace />;

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
