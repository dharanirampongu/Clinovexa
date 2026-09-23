import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import api from '../../services/api';
import { 
  Users, 
  ShieldAlert, 
  Settings, 
  Plus, 
  Search, 
  CheckCircle, 
  TrendingUp, 
  Activity, 
  DollarSign, 
  FileText,
  UserPlus,
  ShieldCheck,
  Check
} from 'lucide-react';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [staffRecords, setStaffRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Service Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    category: 'CONSULTATION',
    cost: '',
    department: 'General',
    description: ''
  });

  // User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: 'Password123!',
    role: 'PATIENT',
    phone: '',
    specialization: '',
    department: 'General',
    consultationFee: 150
  });

  // Staff ID Modal State
  const [isStaffIdModalOpen, setIsStaffIdModalOpen] = useState(false);
  const [newStaffRecord, setNewStaffRecord] = useState({
    staffId: '',
    role: 'DOCTOR',
    name: '',
    email: '',
    department: 'Cardiology'
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    const hash = location.hash ? location.hash.replace('#', '') : 'overview';
    if (['overview', 'users', 'staff-ids', 'services', 'audit'].includes(hash)) {
      setActiveTab(hash);
    } else {
      setActiveTab('overview');
    }
  }, [location.hash]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/admin/dashboard#${tabId}`);
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, servicesRes, logsRes, staffRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/services'),
        api.get('/admin/audit-logs'),
        api.get('/admin/staff-records')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data || []);
      setServices(servicesRes.data || []);
      setAuditLogs(logsRes.data || []);
      setStaffRecords(staffRes.data || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/services', newService);
      setMessage('Service created successfully!');
      setIsServiceModalOpen(false);
      setNewService({ name: '', category: 'CONSULTATION', cost: '', department: 'General', description: '' });
      fetchAdminData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to create service');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUser);
      setMessage(`User ${newUser.name} created successfully!`);
      setIsUserModalOpen(false);
      setNewUser({
        name: '',
        email: '',
        password: 'Password123!',
        role: 'PATIENT',
        phone: '',
        specialization: '',
        department: 'General',
        consultationFee: 150
      });
      fetchAdminData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to create user');
    }
  };

  const handleCreateStaffRecord = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/staff-records', newStaffRecord);
      setMessage(`Staff ID ${newStaffRecord.staffId} authorized successfully!`);
      setIsStaffIdModalOpen(false);
      setNewStaffRecord({ staffId: '', role: 'DOCTOR', name: '', email: '', department: 'Cardiology' });
      fetchAdminData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to authorize Staff ID');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Clinic Administration & Governance
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Configure clinic services, manage Staff IDs, system accounts, and inspect audit logs.</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsStaffIdModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Issue Staff ID</span>
            </button>
            <button
              onClick={() => setIsServiceModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Service</span>
            </button>
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {message && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {[
            { id: 'overview', label: 'Stats Overview', icon: TrendingUp },
            { id: 'users', label: 'User Directory', icon: Users },
            { id: 'staff-ids', label: 'Authorized Staff IDs', icon: ShieldCheck },
            { id: 'services', label: 'Clinic Services', icon: Settings },
            { id: 'audit', label: 'Audit Logs', icon: ShieldAlert }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-600 dark:text-slate-400 text-xs">Loading administration records...</div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
                      <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{stats?.totalUsers || 0}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Registered across 5 role tiers</p>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span className="text-xs font-semibold uppercase tracking-wider">Appointments</span>
                      <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{stats?.totalAppointments || 0}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Scheduled & completed encounters</p>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span className="text-xs font-semibold uppercase tracking-wider">Lab Orders</span>
                      <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{stats?.totalLabOrders || 0}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Diagnostic investigations processed</p>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
                      <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">${stats?.totalRevenue || 0}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Billed consultation & lab fees</p>
                  </div>
                </div>

                {/* Role Breakdown Grid */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">User Distribution by Role</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                    {['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'LAB_TECH', 'PATIENT'].map(role => {
                      const count = users.filter(u => u.role === role).length;
                      return (
                        <div key={role} className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                          <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{count}</p>
                          <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{role}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users by name, email, or role..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>

                <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3.5">User</th>
                        <th className="p-3.5">Email</th>
                        <th className="p-3.5">Role</th>
                        <th className="p-3.5">Staff ID</th>
                        <th className="p-3.5">Phone</th>
                        <th className="p-3.5">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-100/60 dark:hover:bg-slate-900/40 transition-all">
                          <td className="p-3.5 font-bold text-slate-900 dark:text-white">{u.name}</td>
                          <td className="p-3.5 text-slate-500 dark:text-slate-400">{u.email}</td>
                          <td className="p-3.5">
                            <Badge status={u.role} />
                          </td>
                          <td className="p-3.5 font-mono text-amber-600 dark:text-amber-400 font-bold">{u.staffId || 'N/A'}</td>
                          <td className="p-3.5 text-slate-500 dark:text-slate-400">{u.phone || 'N/A'}</td>
                          <td className="p-3.5 text-slate-500 dark:text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Staff IDs Tab */}
            {activeTab === 'staff-ids' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Hospital Pre-Authorized Staff Records</h3>
                  <button
                    onClick={() => setIsStaffIdModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Authorize New Staff ID</span>
                  </button>
                </div>

                <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3.5">Staff ID</th>
                        <th className="p-3.5">Role Tier</th>
                        <th className="p-3.5">Authorized Name</th>
                        <th className="p-3.5">Authorized Email</th>
                        <th className="p-3.5">Department</th>
                        <th className="p-3.5">Claim Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                      {staffRecords.map((r) => (
                        <tr key={r._id} className="hover:bg-slate-100/60 dark:hover:bg-slate-900/40 transition-all">
                          <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">{r.staffId}</td>
                          <td className="p-3.5"><Badge status={r.role} /></td>
                          <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{r.name}</td>
                          <td className="p-3.5 text-slate-500 dark:text-slate-400">{r.email}</td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-400">{r.department}</td>
                          <td className="p-3.5">
                            {r.isClaimed ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                                Activated ({r.claimedBy?.name || 'Claimed'})
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                                Available for Reg
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((s) => (
                  <div key={s._id} className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                        {s.category}
                      </span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">${s.cost}</span>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{s.name}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{s.description || 'No description provided.'}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Department: {s.department || 'General'}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Audit Logs Tab */}
            {activeTab === 'audit' && (
              <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Action</th>
                      <th className="p-3.5">Entity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-100/60 dark:hover:bg-slate-900/40 transition-all">
                        <td className="p-3.5 text-slate-500 dark:text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="p-3.5 text-slate-900 dark:text-white font-sans font-semibold">{log.userName || log.user?.name || 'System'}</td>
                        <td className="p-3.5">
                          <Badge status={log.userRole || 'SYSTEM'} />
                        </td>
                        <td className="p-3.5 text-purple-700 dark:text-purple-400 font-bold">{log.action}</td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300">{log.entity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Modal: Authorize Staff ID */}
        <Modal isOpen={isStaffIdModalOpen} onClose={() => setIsStaffIdModalOpen(false)} title="Issue Pre-Authorized Hospital Staff ID">
          <form onSubmit={handleCreateStaffRecord} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Staff ID Code (e.g., DOC-1004)</label>
              <input
                type="text"
                required
                value={newStaffRecord.staffId}
                onChange={(e) => setNewStaffRecord({ ...newStaffRecord, staffId: e.target.value })}
                placeholder="DOC-1004"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 uppercase focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Role</label>
                <select
                  value={newStaffRecord.role}
                  onChange={(e) => setNewStaffRecord({ ...newStaffRecord, role: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  <option value="DOCTOR">Doctor</option>
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="LAB_TECH">Lab Technician</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={newStaffRecord.department}
                  onChange={(e) => setNewStaffRecord({ ...newStaffRecord, department: e.target.value })}
                  placeholder="Cardiology"
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Staff Member Full Name</label>
              <input
                type="text"
                required
                value={newStaffRecord.name}
                onChange={(e) => setNewStaffRecord({ ...newStaffRecord, name: e.target.value })}
                placeholder="Dr. Julian Bashir"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Authorized Email Address</label>
              <input
                type="email"
                required
                value={newStaffRecord.email}
                onChange={(e) => setNewStaffRecord({ ...newStaffRecord, email: e.target.value })}
                placeholder="doctor.bashir@clinovexa.com"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              Issue Pre-Authorized Staff Record
            </button>
          </form>
        </Modal>

        {/* Modal: Create Service */}
        <Modal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} title="Create New Clinic Service">
          <form onSubmit={handleCreateService} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Service Name</label>
              <input
                type="text"
                required
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                placeholder="e.g. Cardiology Consultation"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={newService.category}
                  onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="CONSULTATION">Consultation</option>
                  <option value="LABORATORY">Laboratory</option>
                  <option value="PROCEDURE">Procedure</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cost ($)</label>
                <input
                  type="number"
                  required
                  value={newService.cost}
                  onChange={(e) => setNewService({ ...newService, cost: e.target.value })}
                  placeholder="150"
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <input
                type="text"
                value={newService.department}
                onChange={(e) => setNewService({ ...newService, department: e.target.value })}
                placeholder="Cardiology"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                placeholder="Detailed clinical scope..."
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all"
            >
              Save Service Entry
            </button>
          </form>
        </Modal>

        {/* Modal: Create User */}
        <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title="Register New Staff / Patient Account">
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Dr. Jane Doe"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="doctor@clinovexa.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role Tier</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="PATIENT">Patient</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="LAB_TECH">Lab Technician</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                placeholder="+1-555-0199"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
            {newUser.role === 'DOCTOR' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={newUser.specialization}
                    onChange={(e) => setNewUser({ ...newUser, specialization: e.target.value })}
                    placeholder="Cardiology"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Fee ($)</label>
                  <input
                    type="number"
                    value={newUser.consultationFee}
                    onChange={(e) => setNewUser({ ...newUser, consultationFee: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all"
            >
              Create Account
            </button>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
