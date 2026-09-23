import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const ROLES_LIST = [
  { id: 'ADMIN', label: 'Admin' },
  { id: 'DOCTOR', label: 'Doctor' },
  { id: 'RECEPTIONIST', label: 'Receptionist' },
  { id: 'LAB_TECH', label: 'Lab Technician' },
  { id: 'PATIENT', label: 'Patient' }
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('PATIENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleRedirect = (role) => {
    switch (role) {
      case 'ADMIN': navigate('/admin/dashboard'); break;
      case 'DOCTOR': navigate('/doctor/dashboard'); break;
      case 'RECEPTIONIST': navigate('/receptionist/dashboard'); break;
      case 'LAB_TECH': navigate('/lab/dashboard'); break;
      case 'PATIENT': navigate('/patient/dashboard'); break;
      default: navigate('/patient/dashboard'); break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password, selectedRole);
      handleRoleRedirect(user.role);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    const targetEmail = email.trim() || prompt('Enter your Google Account email address for Clinovexa sign-in:');
    if (!targetEmail) return;

    setGoogleLoading(true);
    try {
      const res = await api.post('/auth/google', {
        email: targetEmail,
        googleId: `google_${Date.now()}`,
        role: selectedRole,
        name: targetEmail.split('@')[0]
      });

      if (res.token) {
        localStorage.setItem('clinovexa_token', res.token);
        window.location.href = '/';
      }
    } catch (err) {
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-teal-600 dark:text-teal-400 mb-2 shadow-xl shadow-teal-500/10">
            <Activity className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Sign In to Clinovexa</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Empowering intelligent clinic management & patient care</p>
        </div>

        {/* Login Form Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start space-x-3 text-rose-600 dark:text-rose-400 text-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@clinovexa.com"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Sign In As Portal
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {ROLES_LIST.slice(0, 3).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedRole === r.id
                        ? 'bg-teal-500/10 dark:bg-teal-500/20 border-teal-500 text-teal-600 dark:text-teal-400 shadow-sm shadow-teal-500/10 ring-1 ring-teal-500'
                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ROLES_LIST.slice(3).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedRole === r.id
                        ? 'bg-teal-500/10 dark:bg-teal-500/20 border-teal-500 text-teal-600 dark:text-teal-400 shadow-sm shadow-teal-500/10 ring-1 ring-teal-500'
                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Google Sign-In Divider & Button */}
          <div className="relative border-t border-slate-200 dark:border-slate-800 pt-4 text-center">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Or Authentication Option
            </span>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs flex items-center justify-center space-x-2.5 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Need an account?{' '}
          <Link to="/register" className="text-teal-600 dark:text-teal-400 hover:underline font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
