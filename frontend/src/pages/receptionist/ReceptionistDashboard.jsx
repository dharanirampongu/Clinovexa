import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import api from '../../services/api';
import { 
  Calendar, 
  UserPlus, 
  Clock, 
  Receipt, 
  Plus, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  UserCheck, 
  DollarSign, 
  AlertTriangle,
  Stethoscope
} from 'lucide-react';

const ReceptionistDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('queue');
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [conflictWarning, setConflictWarning] = useState('');

  // Booking Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    patientId: '',
    doctorId: '',
    serviceId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '09:30',
    reasonForVisit: 'General Consultation'
  });

  // Patient Register Modal State
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '1995-01-01',
    gender: 'Male',
    bloodGroup: 'O+',
    address: ''
  });

  // Invoice Modal State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    patientId: '',
    appointmentId: '',
    subtotal: 150,
    discount: 0,
    items: [{ description: 'General Consultation', category: 'Consultation', quantity: 1, unitPrice: 150, amount: 150 }]
  });

  useEffect(() => {
    const hash = location.hash ? location.hash.replace('#', '') : 'queue';
    if (['queue', 'appointments', 'patients', 'billing'].includes(hash)) {
      setActiveTab(hash);
    } else {
      setActiveTab('queue');
    }
  }, [location.hash]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/receptionist/dashboard#${tabId}`);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apptsRes, patientsRes, doctorsRes, servicesRes, invoicesRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/users/patients'),
        api.get('/users/doctors'),
        api.get('/admin/services'),
        api.get('/billing/invoices')
      ]);
      setAppointments(apptsRes.data || []);
      setPatients(patientsRes.data || []);
      setDoctors(doctorsRes.data || []);
      setServices(servicesRes.data || []);
      setInvoices(invoicesRes.data || []);
    } catch (err) {
      console.error('Failed to load receptionist data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (appointmentId, status) => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status });
      setMessage(`Appointment updated to ${status}`);
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setConflictWarning('');
    try {
      await api.post('/appointments', bookingData);
      setMessage('Appointment booked successfully!');
      setIsBookModalOpen(false);
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('conflict')) {
        setConflictWarning(err.message);
      } else {
        alert(err.message || 'Failed to book appointment');
      }
    }
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/patients', newPatient);
      setMessage(`Patient ${newPatient.name} registered successfully!`);
      setIsPatientModalOpen(false);
      setNewPatient({ name: '', email: '', phone: '', dob: '1995-01-01', gender: 'Male', bloodGroup: 'O+', address: '' });
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to register patient');
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      await api.post('/billing/invoices', invoiceData);
      setMessage('Invoice generated successfully!');
      setIsInvoiceModalOpen(false);
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to create invoice');
    }
  };

  const handleMarkPaid = async (invoiceId) => {
    try {
      await api.patch(`/billing/invoices/${invoiceId}/pay`, { paymentMethod: 'CARD' });
      setMessage('Invoice marked as PAID');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to process payment');
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              Reception & Patient Coordination Desk
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Register incoming patients, schedule doctor visits, manage daily queues, and process invoices.</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPatientModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 flex items-center space-x-1.5 transition-all"
            >
              <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Register Patient</span>
            </button>
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center space-x-1.5 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Visit</span>
            </button>
          </div>
        </div>

        {message && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {[
            { id: 'queue', label: "Today's Patient Queue", icon: Clock },
            { id: 'appointments', label: 'Appointments & Calendar', icon: Calendar },
            { id: 'patients', label: 'Patient Directory', icon: UserCheck },
            { id: 'billing', label: 'Billing & Counter', icon: Receipt }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30'
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
          <div className="p-12 text-center text-slate-600 dark:text-slate-400 text-xs">Loading queue & scheduling data...</div>
        ) : (
          <>
            {/* Queue Tab */}
            {activeTab === 'queue' && (
              <div className="space-y-4">
                <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3.5">Queue #</th>
                        <th className="p-3.5">Patient</th>
                        <th className="p-3.5">Doctor</th>
                        <th className="p-3.5">Time Slot</th>
                        <th className="p-3.5">Reason for Visit</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                      {appointments.map((appt) => (
                        <tr key={appt._id} className="hover:bg-slate-100/60 dark:hover:bg-slate-900/40 transition-all">
                          <td className="p-3.5 font-black text-indigo-600 dark:text-indigo-400">#{appt.queueNumber || '1'}</td>
                          <td className="p-3.5 font-bold text-slate-900 dark:text-white">{appt.patient?.user?.name || appt.patient?.name || 'Patient'}</td>
                          <td className="p-3.5 text-slate-700 dark:text-slate-300">{appt.doctor?.user?.name || 'Doctor'}</td>
                          <td className="p-3.5 text-slate-500 dark:text-slate-400">{appt.startTime} - {appt.endTime}</td>
                          <td className="p-3.5 text-slate-700 dark:text-slate-300 truncate max-w-xs">{appt.reasonForVisit}</td>
                          <td className="p-3.5">
                            <Badge status={appt.status} />
                          </td>
                          <td className="p-3.5 space-x-1.5">
                            {appt.status === 'SCHEDULED' && (
                              <button
                                onClick={() => handleStatusChange(appt._id, 'CHECKED_IN')}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 font-semibold text-[11px]"
                              >
                                Check In
                              </button>
                            )}
                            {appt.status === 'CHECKED_IN' && (
                              <button
                                onClick={() => handleStatusChange(appt._id, 'IN_CONSULTATION')}
                                className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 font-semibold text-[11px]"
                              >
                                Send to Doctor
                              </button>
                            )}
                            {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                              <button
                                onClick={() => handleStatusChange(appt._id, 'CANCELLED')}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 font-semibold text-[11px]"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Appointments & Calendar Tab */}
            {activeTab === 'appointments' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Appointment Master Schedule</h3>
                  <button
                    onClick={() => setIsBookModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Schedule Visit</span>
                  </button>
                </div>
                <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3.5">Date</th>
                        <th className="p-3.5">Time Slot</th>
                        <th className="p-3.5">Patient Name</th>
                        <th className="p-3.5">Assigned Doctor</th>
                        <th className="p-3.5">Reason for Visit</th>
                        <th className="p-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                      {appointments.map((appt) => (
                        <tr key={appt._id} className="hover:bg-slate-100/60 dark:hover:bg-slate-900/40 transition-all">
                          <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">{new Date(appt.appointmentDate).toLocaleDateString()}</td>
                          <td className="p-3.5 text-slate-700 dark:text-slate-300">{appt.startTime} - {appt.endTime}</td>
                          <td className="p-3.5 font-bold text-slate-900 dark:text-white">{appt.patient?.user?.name || appt.patient?.name || 'Patient'}</td>
                          <td className="p-3.5 text-slate-700 dark:text-slate-300">{appt.doctor?.user?.name || 'Doctor'}</td>
                          <td className="p-3.5 text-slate-700 dark:text-slate-300">{appt.reasonForVisit}</td>
                          <td className="p-3.5"><Badge status={appt.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Patients Tab */}
            {activeTab === 'patients' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {patients.map((p) => (
                  <div key={p._id} className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{p.user?.name || 'Patient'}</h4>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {p.bloodGroup || 'Blood Type N/A'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <p>Email: {p.user?.email || 'N/A'}</p>
                      <p>Gender: {p.gender} | DOB: {p.dob ? new Date(p.dob).toLocaleDateString() : 'N/A'}</p>
                      <p>Allergies: {p.allergies?.length > 0 ? p.allergies.join(', ') : 'None documented'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsInvoiceModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Invoice</span>
                  </button>
                </div>

                <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3.5">Invoice #</th>
                        <th className="p-3.5">Patient</th>
                        <th className="p-3.5">Subtotal</th>
                        <th className="p-3.5">Total Amount</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                      {invoices.map((inv) => (
                        <tr key={inv._id} className="hover:bg-slate-100/60 dark:hover:bg-slate-900/40 transition-all">
                          <td className="p-3.5 font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</td>
                          <td className="p-3.5 text-slate-700 dark:text-slate-300">{inv.patient?.user?.name || 'Patient'}</td>
                          <td className="p-3.5 text-slate-500 dark:text-slate-400">${inv.subtotal}</td>
                          <td className="p-3.5 font-black text-emerald-600 dark:text-emerald-400">${inv.total}</td>
                          <td className="p-3.5">
                            <Badge status={inv.status} />
                          </td>
                          <td className="p-3.5">
                            {inv.status === 'PENDING' && (
                              <button
                                onClick={() => handleMarkPaid(inv._id)}
                                className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 font-bold text-[11px]"
                              >
                                Mark Paid
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal: Schedule Appointment */}
        <Modal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} title="Schedule Doctor Appointment">
          {conflictWarning && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2 text-rose-600 dark:text-rose-400 text-xs">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Appointment Conflict Warning</span>
                <span>{conflictWarning}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleBookAppointment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Patient</label>
              <select
                required
                value={bookingData.patientId}
                onChange={(e) => setBookingData({ ...bookingData, patientId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Choose Patient --</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.user?.name} ({p.user?.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Doctor</label>
              <select
                required
                value={bookingData.doctorId}
                onChange={(e) => setBookingData({ ...bookingData, doctorId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Choose Doctor --</option>
                {doctors.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.user?.name} ({d.specialization}) - ${d.consultationFee}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={bookingData.appointmentDate}
                  onChange={(e) => setBookingData({ ...bookingData, appointmentDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                <input
                  type="text"
                  required
                  value={bookingData.startTime}
                  onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                  placeholder="09:00"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                <input
                  type="text"
                  required
                  value={bookingData.endTime}
                  onChange={(e) => setBookingData({ ...bookingData, endTime: e.target.value })}
                  placeholder="09:30"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason for Visit</label>
              <textarea
                rows={2}
                required
                value={bookingData.reasonForVisit}
                onChange={(e) => setBookingData({ ...bookingData, reasonForVisit: e.target.value })}
                placeholder="Chief complaints or routine evaluation"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all"
            >
              Confirm Appointment Booking
            </button>
          </form>
        </Modal>

        {/* Modal: Register Patient */}
        <Modal isOpen={isPatientModalOpen} onClose={() => setIsPatientModalOpen(false)} title="Register Patient Entry">
          <form onSubmit={handleRegisterPatient} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                placeholder="Sarah Connor"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  placeholder="sarah@example.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  placeholder="+1-555-0199"
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={newPatient.dob}
                  onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                <select
                  value={newPatient.gender}
                  onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                <select
                  value={newPatient.bloodGroup}
                  onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  <option value="O+">O+</option>
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="AB+">AB+</option>
                  <option value="O-">O-</option>
                  <option value="A-">A-</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all"
            >
              Complete Registration
            </button>
          </form>
        </Modal>

        {/* Modal: Create Invoice */}
        <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="Generate Patient Invoice">
          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Patient</label>
              <select
                required
                value={invoiceData.patientId}
                onChange={(e) => setInvoiceData({ ...invoiceData, patientId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="">-- Choose Patient --</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.user?.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subtotal Amount ($)</label>
                <input
                  type="number"
                  required
                  value={invoiceData.subtotal}
                  onChange={(e) => setInvoiceData({ ...invoiceData, subtotal: parseFloat(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Discount ($)</label>
                <input
                  type="number"
                  value={invoiceData.discount}
                  onChange={(e) => setInvoiceData({ ...invoiceData, discount: parseFloat(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all"
            >
              Issue Invoice
            </button>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default ReceptionistDashboard;
