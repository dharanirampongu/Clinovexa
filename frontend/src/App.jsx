import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import { useAuth } from './hooks/useAuth';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Role Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import LabDashboard from './pages/lab/LabDashboard';
import PatientDashboard from './pages/patient/PatientDashboard';

const App = () => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Initializing Clinovexa Healthcare Portal...</p>
        </div>
      </div>
    );
  }

  const getHomeRedirect = () => {
    if (!user) return <Navigate to="/login" replace />;
    switch (user.role) {
      case 'ADMIN': return <Navigate to="/admin/dashboard" replace />;
      case 'DOCTOR': return <Navigate to="/doctor/dashboard" replace />;
      case 'RECEPTIONIST': return <Navigate to="/receptionist/dashboard" replace />;
      case 'LAB_TECH': return <Navigate to="/lab/dashboard" replace />;
      case 'PATIENT': return <Navigate to="/patient/dashboard" replace />;
      default: return <Navigate to="/login" replace />;
    }
  };

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={!token ? <Login /> : getHomeRedirect()} />
      <Route path="/register" element={!token ? <Register /> : getHomeRedirect()} />

      {/* Protected Role-Based Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Admin Routes */}
        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Doctor Routes */}
        <Route element={<RoleRoute allowedRoles={['DOCTOR']} />}>
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        </Route>

        {/* Receptionist Routes */}
        <Route element={<RoleRoute allowedRoles={['RECEPTIONIST']} />}>
          <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
        </Route>

        {/* Lab Technician Routes */}
        <Route element={<RoleRoute allowedRoles={['LAB_TECH']} />}>
          <Route path="/lab/dashboard" element={<LabDashboard />} />
        </Route>

        {/* Patient Routes */}
        <Route element={<RoleRoute allowedRoles={['PATIENT']} />}>
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
        </Route>
      </Route>

      {/* Default Catch-all */}
      <Route path="*" element={getHomeRedirect()} />
    </Routes>
  );
};

export default App;
