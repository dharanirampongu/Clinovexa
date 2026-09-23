import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  FlaskConical, 
  Receipt, 
  ShieldAlert, 
  Stethoscope, 
  Clock, 
  Heart,
  Settings
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const getNavItems = () => {
    switch (user.role) {
      case 'ADMIN':
        return [
          { label: 'Admin Dashboard', path: '/admin/dashboard#overview', hash: '#overview', icon: LayoutDashboard },
          { label: 'User Directory', path: '/admin/dashboard#users', hash: '#users', icon: Users },
          { label: 'Authorized Staff IDs', path: '/admin/dashboard#staff-ids', hash: '#staff-ids', icon: ShieldAlert },
          { label: 'Clinic Services', path: '/admin/dashboard#services', hash: '#services', icon: Settings },
          { label: 'System Audit Log', path: '/admin/dashboard#audit', hash: '#audit', icon: ShieldAlert }
        ];
      case 'DOCTOR':
        return [
          { label: 'Doctor Workstation', path: '/doctor/dashboard#workstation', hash: '#workstation', icon: Stethoscope },
          { label: 'Patient Queue', path: '/doctor/dashboard#queue', hash: '#queue', icon: Clock },
          { label: 'Clinical Notes', path: '/doctor/dashboard#notes', hash: '#notes', icon: FileText },
          { label: 'Lab Orders', path: '/doctor/dashboard#labs', hash: '#labs', icon: FlaskConical }
        ];
      case 'RECEPTIONIST':
        return [
          { label: 'Reception Desk', path: '/receptionist/dashboard#queue', hash: '#queue', icon: LayoutDashboard },
          { label: 'Appointments & Calendar', path: '/receptionist/dashboard#appointments', hash: '#appointments', icon: Calendar },
          { label: 'Patient Registration', path: '/receptionist/dashboard#patients', hash: '#patients', icon: Users },
          { label: 'Billing Counter', path: '/receptionist/dashboard#billing', hash: '#billing', icon: Receipt }
        ];
      case 'LAB_TECH':
        return [
          { label: 'Lab Workstation', path: '/lab/dashboard#workstation', hash: '#workstation', icon: FlaskConical },
          { label: 'Pending Orders', path: '/lab/dashboard#orders', hash: '#orders', icon: Clock },
          { label: 'Result Verification', path: '/lab/dashboard#results', hash: '#results', icon: FileText }
        ];
      case 'PATIENT':
        return [
          { label: 'My Health Portal', path: '/patient/dashboard#overview', hash: '#overview', icon: Heart },
          { label: 'Appointments', path: '/patient/dashboard#appointments', hash: '#appointments', icon: Calendar },
          { label: 'Prescriptions & AI', path: '/patient/dashboard#prescriptions', hash: '#prescriptions', icon: FileText },
          { label: 'Lab Reports', path: '/patient/dashboard#labs', hash: '#labs', icon: FlaskConical },
          { label: 'Invoices & Receipts', path: '/patient/dashboard#invoices', hash: '#invoices', icon: Receipt }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const currentPath = location.pathname;
  const currentHash = location.hash;

  return (
    <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex transition-colors">
      <div className="space-y-6">
        <div className="px-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Navigation Menu</p>
        </div>
        <nav className="space-y-1.5">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const itemBasePath = item.path.split('#')[0];
            const isDefaultItem = idx === 0;
            const isActive = currentPath === itemBasePath && (
              currentHash === item.hash ||
              (currentHash === '' && isDefaultItem)
            );

            return (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500/15 to-cyan-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/30 shadow-md shadow-teal-500/5'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <p className="font-semibold text-slate-800 dark:text-slate-300">Clinovexa Security Active</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">HIPAA Compliant Session & Immutable Audit Logging Enabled</p>
      </div>
    </aside>
  );
};

export default Sidebar;
