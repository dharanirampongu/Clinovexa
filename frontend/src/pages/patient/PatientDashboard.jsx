import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Timeline from '../../components/common/Timeline';
import api from '../../services/api';
import { 
  Heart, 
  Calendar, 
  FileText, 
  Pill, 
  FlaskConical, 
  Receipt, 
  Sparkles, 
  Clock, 
  Download, 
  Eye,
  Send,
  AlertTriangle,
  Activity,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

const PRESET_QUESTIONS = [
  'What is this medicine for?',
  'How should I take it?',
  'Explain my dosage',
  'Explain the doctor\'s instructions'
];

const PatientDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Prescription Assistant Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedRx, setSelectedRx] = useState(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // PDF Viewer Modal
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [selectedLabReport, setSelectedLabReport] = useState(null);

  // Schedule Appointment Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    doctorId: '',
    appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '10:30',
    reasonForVisit: 'General Wellness Visit'
  });

  useEffect(() => {
    const hash = location.hash ? location.hash.replace('#', '') : 'overview';
    if (['overview', 'timeline', 'appointments', 'prescriptions', 'labs', 'invoices'].includes(hash)) {
      setActiveTab(hash);
    } else {
      setActiveTab('overview');
    }
  }, [location.hash]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/patient/dashboard#${tabId}`);
  };

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const [apptsRes, rxRes, labsRes, invRes, timelineRes, docsRes] = await Promise.all([
        api.get('/appointments/my-appointments'),
        api.get('/clinical/prescriptions/my-prescriptions'),
        api.get('/lab/results/my-results'),
        api.get('/billing/invoices/my-invoices'),
        api.get('/clinical/patient-me/timeline'),
        api.get('/users/doctors')
      ]);
      setAppointments(apptsRes.data || []);
      setPrescriptions(rxRes.data || []);
      setLabResults(labsRes.data || []);
      setInvoices(invRes.data || []);
      setTimeline(timelineRes.data || []);
      setDoctors(docsRes.data || []);
    } catch (err) {
      console.error('Failed to load patient health portal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, []);

  const handleOpenAiAssistant = (rx, presetQuery = '') => {
    setSelectedRx(rx);
    setCustomQuestion(presetQuery);
    setIsAiModalOpen(true);
    fetchAiExplanation(rx, presetQuery);
  };

  const fetchAiExplanation = async (rx, query) => {
    if (!rx) return;
    setAiLoading(true);
    try {
      const res = await api.post('/ai/explain-prescription', {
        medications: rx.medications,
        followUpDate: rx.followUpDate,
        generalInstructions: rx.generalInstructions,
        question: query
      });
      setAiResponse(res.explanation || 'No explanation generated.');
    } catch (err) {
      setAiResponse('AI prescription assistant is temporarily unavailable. Please try again later or consult your doctor/pharmacist.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAskQuestion = (e) => {
    e.preventDefault();
    if (!customQuestion.trim() || !selectedRx) return;
    fetchAiExplanation(selectedRx, customQuestion);
  };

  const handleViewPdf = (lab) => {
    setSelectedLabReport(lab);
    const token = localStorage.getItem('clinovexa_token');
    const viewUrl = `${api.defaults.baseURL || '/api'}/lab/results/${lab._id}/pdf?token=${token}`;
    setPdfUrl(viewUrl);
    setIsPdfModalOpen(true);
  };

  const handleDownloadPdf = (lab) => {
    const token = localStorage.getItem('clinovexa_token');
    const downloadUrl = `${api.defaults.baseURL || '/api'}/lab/results/${lab._id}/pdf?download=true&token=${token}`;
    window.open(downloadUrl, '_blank');
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/appointments', bookingData);
      alert('Appointment request submitted successfully!');
      setIsBookModalOpen(false);
      fetchPatientData();
    } catch (err) {
      alert(err.message || 'Failed to book appointment');
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
              Personal Health Portal
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Access your care timeline, prescriptions with plain-language AI assistant, lab reports, and billing receipts.</p>
          </div>

          <button
            onClick={() => setIsBookModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5 transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {[
            { id: 'overview', label: 'Health Overview', icon: Activity },
            { id: 'timeline', label: 'Medical Timeline', icon: Clock },
            { id: 'appointments', label: 'Appointments', icon: Calendar },
            { id: 'prescriptions', label: 'Prescriptions & AI', icon: Pill },
            { id: 'labs', label: 'Lab Reports', icon: FlaskConical },
            { id: 'invoices', label: 'Invoices', icon: Receipt }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
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
          <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">Loading patient portal records...</div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Appointments</span>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{appointments.length}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Scheduled & completed visits</p>
                  </div>
                  <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Prescriptions</span>
                    <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{prescriptions.length}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Medication plans on record</p>
                  </div>
                  <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Lab Reports</span>
                    <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{labResults.length}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Verified diagnostic reports</p>
                  </div>
                  <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Invoices</span>
                    <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{invoices.length}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Billing history receipts</p>
                  </div>
                </div>

                {/* Recent Prescriptions Preview */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">My Active Prescriptions</h3>
                  {prescriptions.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">No active prescriptions on record.</p>
                  ) : (
                    <div className="space-y-4">
                      {prescriptions.map((rx) => (
                        <div key={rx._id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-2">
                            <div>
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Prescribed by Dr. {rx.doctor?.user?.name || 'Physician'}</span>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">Date: {new Date(rx.createdAt).toLocaleDateString()}</p>
                            </div>
                            <button
                              onClick={() => handleOpenAiAssistant(rx)}
                              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm"
                            >
                              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <span>Explain With AI</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {rx.medications?.map((m, idx) => (
                              <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                                <p className="font-bold text-emerald-600 dark:text-emerald-400">{m.name} ({m.dosage})</p>
                                <p className="text-slate-700 dark:text-slate-300">Frequency: {m.frequency} | Duration: {m.duration}</p>
                                {m.instructions && <p className="text-slate-500 dark:text-slate-400 text-[11px] italic">"{m.instructions}"</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                <Timeline events={timeline} />
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3.5">Doctor</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Time Slot</th>
                      <th className="p-3.5">Reason for Visit</th>
                      <th className="p-3.5">Queue #</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {appointments.map((appt) => (
                      <tr key={appt._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">{appt.doctor?.user?.name || 'Doctor'}</td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-400">{new Date(appt.appointmentDate).toLocaleDateString()}</td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300">{appt.startTime} - {appt.endTime}</td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300">{appt.reasonForVisit}</td>
                        <td className="p-3.5 font-black text-emerald-600 dark:text-emerald-400">#{appt.queueNumber || 1}</td>
                        <td className="p-3.5">
                          <Badge status={appt.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Prescriptions Tab */}
            {activeTab === 'prescriptions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Pill className="w-5 h-5 text-emerald-500" />
                    My Prescriptions & AI Assistant
                  </h3>
                </div>

                {prescriptions.map((rx) => (
                  <div key={rx._id} className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-md">
                    <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
                      <div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Doctor: Dr. {rx.doctor?.user?.name || 'Physician'}</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Prescription Date: {new Date(rx.createdAt).toLocaleDateString()}</p>
                      </div>

                      <button
                        onClick={() => handleOpenAiAssistant(rx)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center space-x-2 shadow-md shadow-emerald-500/20 transition-all"
                      >
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>Explain With AI</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Medication Card Details</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {rx.medications?.map((m, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                            <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">{m.name} ({m.dosage})</p>
                            <p className="text-slate-700 dark:text-slate-300">Frequency: <span className="font-semibold">{m.frequency}</span></p>
                            <p className="text-slate-700 dark:text-slate-300">Duration: <span className="font-semibold">{m.duration}</span></p>
                            {m.instructions && <p className="text-slate-500 dark:text-slate-400 text-[11px] italic mt-1">Instructions: "{m.instructions}"</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Lab Reports Tab */}
            {activeTab === 'labs' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-amber-500" />
                    My Diagnostic Lab Reports
                  </h3>
                </div>

                {labResults.length === 0 ? (
                  <div className="glass-panel p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                    No verified lab reports published yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {labResults.map((result) => (
                      <div key={result._id} className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-md flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-extrabold text-amber-600 dark:text-amber-400">{result.testName}</h4>
                            <Badge status={result.status} />
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Date: {new Date(result.publishedAt || result.createdAt).toLocaleDateString()}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300">Uploaded by: <span className="font-semibold">{result.technician?.name || 'Laboratory Diagnostics'}</span></p>
                        </div>

                        <div className="flex items-center space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                          <button
                            onClick={() => handleViewPdf(result)}
                            className="flex-1 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
                          >
                            <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span>View PDF</span>
                          </button>
                          <button
                            onClick={() => handleDownloadPdf(result)}
                            className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
                          >
                            <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            <span>Download PDF</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3.5">Invoice #</th>
                      <th className="p-3.5">Date Issued</th>
                      <th className="p-3.5">Subtotal</th>
                      <th className="p-3.5">Total Amount</th>
                      <th className="p-3.5">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {invoices.map((inv) => (
                      <tr key={inv._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-400">{new Date(inv.createdAt).toLocaleDateString()}</td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-400">${inv.subtotal}</td>
                        <td className="p-3.5 font-black text-emerald-600 dark:text-emerald-400">${inv.total}</td>
                        <td className="p-3.5">
                          <Badge status={inv.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Modal: AI Prescription Assistant */}
        <Modal 
          isOpen={isAiModalOpen} 
          onClose={() => setIsAiModalOpen(false)} 
          title="AI Prescription Assistant" 
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs space-y-1">
              <p className="font-bold text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-500" />
                <span>AI Patient Educational Assistant</span>
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                I'm here to help you understand your doctor's prescription in plain language.
              </p>
            </div>

            {selectedRx && (
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider block">Selected Prescription:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedRx.medications?.map((m, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-semibold text-emerald-600 dark:text-emerald-400">
                      {m.name} {m.dosage} - {m.frequency} ({m.duration})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Questions Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">What would you like to know?</span>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCustomQuestion(q);
                      fetchAiExplanation(selectedRx, q);
                    }}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-teal-500/10 dark:hover:bg-teal-500/20 border border-slate-200 dark:border-slate-800 hover:border-teal-500 text-xs font-semibold text-slate-800 dark:text-slate-200 text-left transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Ask Custom Question Input Form */}
            <form onSubmit={handleAskQuestion} className="flex gap-2">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Ask a question about this prescription..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                disabled={aiLoading || !customQuestion.trim()}
                className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 disabled:opacity-50 transition-all"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* AI Explanation Output Area */}
            <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 text-xs space-y-3 min-h-[140px] font-sans">
              {aiLoading ? (
                <div className="flex items-center justify-center py-8 space-x-2 text-teal-400">
                  <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing prescription details...</span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                  {aiResponse}
                </div>
              )}
            </div>

            {/* Visible Mandatory Safety Disclaimer */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] leading-snug font-medium flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>AI Safety Notice:</strong> AI-generated information is for educational purposes and does not replace advice from your doctor or pharmacist.
              </span>
            </div>
          </div>
        </Modal>

        {/* Modal: PDF Document Viewer */}
        <Modal 
          isOpen={isPdfModalOpen} 
          onClose={() => setIsPdfModalOpen(false)} 
          title={`Laboratory PDF Report - ${selectedLabReport?.testName || ''}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white">Investigation: {selectedLabReport?.testName}</span>
              <button
                onClick={() => handleDownloadPdf(selectedLabReport)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-bold flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report File</span>
              </button>
            </div>

            <div className="w-full h-[550px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
              {pdfUrl && (
                <iframe
                  src={pdfUrl}
                  title="Laboratory PDF Report Viewer"
                  className="w-full h-full border-none"
                ></iframe>
              )}
            </div>
          </div>
        </Modal>

        {/* Modal: Book Appointment */}
        <Modal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} title="Book Doctor Appointment">
          <form onSubmit={handleBookAppointment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Physician / Specialist</label>
              <select
                required
                value={bookingData.doctorId}
                onChange={(e) => setBookingData({ ...bookingData, doctorId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="">-- Select Doctor --</option>
                {doctors.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.user?.name} ({d.specialization}) - ${d.consultationFee}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Preferred Date</label>
                <input
                  type="date"
                  required
                  value={bookingData.appointmentDate}
                  onChange={(e) => setBookingData({ ...bookingData, appointmentDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                <input
                  type="text"
                  required
                  value={bookingData.startTime}
                  onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                  placeholder="10:00"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                <input
                  type="text"
                  required
                  value={bookingData.endTime}
                  onChange={(e) => setBookingData({ ...bookingData, endTime: e.target.value })}
                  placeholder="10:30"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
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
                placeholder="Reason for scheduling..."
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
            >
              Submit Appointment Request
            </button>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default PatientDashboard;
