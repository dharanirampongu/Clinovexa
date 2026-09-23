import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import SettingsModal from './SettingsModal';
import api from '../../services/api';
import { 
  Activity, 
  LogOut, 
  User, 
  Bell, 
  Shield, 
  Stethoscope, 
  UserCheck, 
  FlaskConical, 
  HeartPulse, 
  Sun, 
  Moon, 
  Settings,
  Check,
  CheckCheck
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Notification state
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotifClick = async (notif) => {
    if (!notif.read) {
      try {
        await api.patch(`/notifications/${notif._id}/read`);
      } catch (e) {}
    }
    setIsNotifOpen(false);
    fetchNotifications();
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Clinic Admin', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30', icon: Shield };
      case 'DOCTOR':
        return { label: 'Doctor / Physician', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30', icon: Stethoscope };
      case 'RECEPTIONIST':
        return { label: 'Receptionist', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30', icon: UserCheck };
      case 'LAB_TECH':
        return { label: 'Lab Specialist', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30', icon: FlaskConical };
      case 'PATIENT':
        return { label: 'Patient Portal', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', icon: HeartPulse };
      default:
        return { label: role, color: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700', icon: User };
    }
  };

  const roleMeta = user ? getRoleBadge(user.role) : null;
  const RoleIcon = roleMeta ? roleMeta.icon : User;

  return (
    <>
      <header className="h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between transition-colors">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="p-2 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-slate-950 shadow-md shadow-teal-500/20">
            <Activity className="w-5 h-5 font-bold text-slate-950" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              CLINOVEXA <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 font-semibold border border-teal-500/30">v1.0</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">Intelligent Healthcare System</span>
          </div>
        </div>

        {/* User Actions & Profile Info */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Quick Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-teal-500 dark:hover:text-teal-400 transition-all flex items-center space-x-1.5 text-xs font-semibold"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
            <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Workstation Settings"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-teal-500 dark:hover:text-teal-400 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>

          {user && (
            <>
              {/* Notification Bell Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => {
                    setIsNotifOpen(!isNotifOpen);
                    if (!isNotifOpen) fetchNotifications();
                  }}
                  title="Notifications"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-teal-500 dark:hover:text-teal-400 transition-all relative"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse border-2 border-white dark:border-slate-950">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popup */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-fade-in">
                    <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/60">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-teal-500" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Notifications ({unreadCount} new)</span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                          No notifications at this time.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => handleNotifClick(n)}
                            className={`p-3.5 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                              !n.read 
                                ? 'bg-teal-500/5 dark:bg-teal-500/10 hover:bg-teal-500/10 dark:hover:bg-teal-500/20' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className={`w-2 h-2 rounded-full ${!n.read ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}></span>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</h4>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 pl-4">{n.message}</p>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 pl-4 block">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {!n.read && (
                              <button
                                onClick={(e) => handleMarkAsRead(n._id, e)}
                                title="Mark read"
                                className="p-1 rounded-lg text-slate-400 hover:text-teal-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Role Pill */}
              <div className={`hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${roleMeta.color}`}>
                <RoleIcon className="w-3.5 h-3.5" />
                <span>{roleMeta.label}</span>
              </div>

              {/* User Details */}
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold shadow-inner">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[140px]">{user.name}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">{user.email}</span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-rose-500/10 border border-slate-200 dark:border-slate-800 hover:border-rose-500/30 text-slate-600 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};

export default Navbar;
