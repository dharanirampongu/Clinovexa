import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Timeline from '../../components/common/Timeline';
import AiSummaryModal from '../../components/common/AiSummaryModal';
import api from '../../services/api';
import { 
  Stethoscope, 
  Clock, 
  FileText, 
  Pill, 
  FlaskConical, 
  Sparkles, 
  Plus, 
  CheckCircle, 
  Activity, 
  User, 
  ChevronRight,
  Eye
} from 'lucide-react';

const DoctorDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('workstation');
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [patientTimeline, setPatientTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Modals
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);

  // AI Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiContent, setAiContent] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);

  // SOAP Note Form State
  const [soapNote, setSoapNote] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    vitals: { bp: '120/80', pulse: '72', temp: '98.6', weight: '70', spo2: '98' }
  });

  // Prescription Form State
  const [prescription, setPrescription] = useState({
    medications: [{ name: '', dosage: '', frequency: 'Once daily', duration: '7 days', instructions: '' }],
    followUpDate: '',
    generalInstructions: ''
  });

  // Lab Order Form State
  const [labOrder, setLabOrder] = useState({
    testName: '',
    priority: 'ROUTINE',
    notes: ''
  });

  useEffect(() => {
    const hash = location.hash ? location.hash.replace('#', '') : 'workstation';
    if (['workstation', 'queue', 'notes', 'labs'].includes(hash)) {
      setActiveTab(hash);
    } else {
      setActiveTab('workstation');
    }
  }, [location.hash]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/doctor/dashboard#${tabId}`);
  };

  const [labResults, setLabResults] = useState([]);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [selectedLabReport, setSelectedLabReport] = useState(null);

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      const [apptsRes, servicesRes, labRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/admin/services'),
        api.get('/lab/results')
      ]);
      setAppointments(apptsRes.data || []);
      setServices((servicesRes.data || []).filter(s => s.category === 'LABORATORY'));
      setLabResults(labRes.data || []);
    } catch (err) {
      console.error('Failed to load doctor workstation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const handleSelectAppt = async (appt) => {
    setSelectedAppt(appt);
    if (appt.patient?._id) {
      try {
        const timelineRes = await api.get(`/clinical/patients/${appt.patient._id}/timeline`);
        setPatientTimeline(timelineRes.data || []);
      } catch (err) {
        console.error('Failed to load patient timeline:', err);
      }
    }
  };

  const handleViewPdf = (lab) => {
    setSelectedLabReport(lab);
    const token = localStorage.getItem('clinovexa_token');
    const viewUrl = `${api.defaults.baseURL || '/api'}/lab/results/${lab._id}/pdf?token=${token}`;
    setPdfUrl(viewUrl);
    setIsPdfModalOpen(true);
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return alert('Please select a patient appointment first.');

    try {
      await api.post('/clinical/notes', {
        appointmentId: selectedAppt._id,
        patientId: selectedAppt.patient?._id,
        ...soapNote
      });
      setMessage('Clinical Note saved & AI Summary generated!');
      setIsNoteModalOpen(false);
      fetchDoctorData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save note');
    }
  };

  const handleGenerateAiSummary = async () => {
    if (!soapNote.subjective && !soapNote.assessment) {
      return alert('Please fill in Subjective and Assessment fields first.');
    }
    setGeneratingAi(true);
    try {
      const res = await api.post('/ai/summarize-clinical-note', {
        vitals: soapNote.vitals,
        subjective: soapNote.subjective,
        objective: soapNote.objective,
        assessment: soapNote.assessment,
        plan: soapNote.plan
      });
      setAiContent(res.summary);
      setIsAiModalOpen(true);
    } catch (err) {
      alert(err.message || 'Failed to generate AI summary');
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleCreateRx = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return alert('Please select an appointment.');

    try {
      await api.post('/clinical/prescriptions', {
        appointmentId: selectedAppt._id,
        patientId: selectedAppt.patient?._id,
        ...prescription
      });
      setMessage('Prescription issued successfully!');
      setIsRxModalOpen(false);
      fetchDoctorData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to issue prescription');
    }
  };

  const handleCreateLabOrder = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return alert('Please select an appointment.');

    try {
      const targetService = services.find(s => s.name === labOrder.testName) || services[0];
      await api.post('/lab/orders', {
        patientId: selectedAppt.patient?._id,
        appointmentId: selectedAppt._id,
        tests: [{ service: targetService?._id, testName: labOrder.testName || 'Complete Blood Count (CBC)' }],
        priority: labOrder.priority,
        notes: labOrder.notes
      });
      setMessage('Lab test ordered successfully!');
      setIsLabModalOpen(false);
      fetchDoctorData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to create lab order');
    }
  };

  const handleAddMedicationRow = () => {
    setPrescription({
      ...prescription,
      medications: [...prescription.medications, { name: '', dosage: '', frequency: 'Once daily', duration: '7 days', instructions: '' }]
    });
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              Doctor Clinical Workstation
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Review active patient queue, examine EMR timeline, record SOAP notes with AI summaries, issue prescriptions, and order lab diagnostics.</p>
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
            { id: 'workstation', label: 'Doctor Workstation', icon: Stethoscope },
            { id: 'queue', label: 'Patient Queue', icon: Clock },
            { id: 'notes', label: 'Clinical Notes', icon: FileText },
            { id: 'labs', label: 'Lab Orders', icon: FlaskConical }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'workstation' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Queue Column */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  Active Queue ({appointments.length})
                </h3>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">Loading patient queue...</div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appt) => {
                    const isSelected = selectedAppt?._id === appt._id;
                    return (
                      <div
                        key={appt._id}
                        onClick={() => handleSelectAppt(appt)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                            : 'glass-panel border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">Queue #{appt.queueNumber || 1}</span>
                          <Badge status={appt.status} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{appt.patient?.user?.name || appt.patient?.name || 'Patient'}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{appt.startTime} - {appt.endTime} | {appt.reasonForVisit}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Consultation Workarea Column */}
            <div className="lg:col-span-2 space-y-6">
              {selectedAppt ? (
                <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
                  {/* Active Patient Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-extrabold text-lg">
                        {selectedAppt.patient?.user?.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{selectedAppt.patient?.user?.name || 'Selected Patient'}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Gender: {selectedAppt.patient?.gender || 'N/A'} | Blood Group: {selectedAppt.patient?.bloodGroup || 'O+'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsTimelineModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 flex items-center space-x-1.5 transition-all"
                    >
                      <Eye className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>View Patient EMR</span>
                    </button>
                  </div>

                  {/* Clinical Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setIsNoteModalOpen(true)}
                      className="p-4 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 font-bold text-xs flex flex-col items-center space-y-2 transition-all"
                    >
                      <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      <span>Create SOAP Note</span>
                    </button>

                    <button
                      onClick={() => setIsRxModalOpen(true)}
                      className="p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex flex-col items-center space-y-2 transition-all"
                    >
                      <Pill className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      <span>Issue Prescription</span>
                    </button>

                    <button
                      onClick={() => setIsLabModalOpen(true)}
                      className="p-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-xs flex flex-col items-center space-y-2 transition-all"
                    >
                      <FlaskConical className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      <span>Order Lab Test</span>
                    </button>
                  </div>

                  {/* Patient Summary / Reason */}
                  <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Chief Complaint for Today's Visit</span>
                    <p className="text-slate-800 dark:text-slate-200 text-sm font-medium">{selectedAppt.reasonForVisit}</p>
                  </div>
                </div>
              ) : (
                <div className="glass-panel p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 space-y-3">
                  <Stethoscope className="w-10 h-10 mx-auto opacity-40 text-cyan-600 dark:text-cyan-400" />
                  <p className="text-sm font-semibold">Select a patient from the queue to start consultation.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                Comprehensive Doctor Patient Queue ({appointments.length})
              </h3>
            </div>
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">Loading queue...</div>
            ) : (
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Queue #</th>
                    <th className="p-3.5">Patient Name</th>
                    <th className="p-3.5">Time Slot</th>
                    <th className="p-3.5">Reason for Visit</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {appointments.map((appt) => (
                    <tr key={appt._id} className="hover:bg-slate-100/60 dark:hover:bg-slate-900/40 transition-all">
                      <td className="p-3.5 font-bold text-cyan-600 dark:text-cyan-400">Queue #{appt.queueNumber || 1}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{appt.patient?.user?.name || appt.patient?.name || 'Patient'}</td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400">{appt.startTime} - {appt.endTime}</td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300">{appt.reasonForVisit}</td>
                      <td className="p-3.5"><Badge status={appt.status} /></td>
                      <td className="p-3.5">
                        <button
                          onClick={() => {
                            handleSelectAppt(appt);
                            handleTabChange('workstation');
                          }}
                          className="px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 font-bold text-xs"
                        >
                          Start Consultation
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Clinical SOAP Notes & Documentation
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Record structured SOAP notes with integrated AI clinical summaries for consultations.</p>
              </div>
              <button
                onClick={() => {
                  if (!selectedAppt && appointments.length > 0) handleSelectAppt(appointments[0]);
                  setIsNoteModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create SOAP Note</span>
              </button>
            </div>

            {selectedAppt ? (
              <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Active Patient Context</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedAppt.patient?.user?.name || 'Selected Patient'}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Chief Complaint: {selectedAppt.reasonForVisit}</p>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                Select a patient from the queue in Doctor Workstation to associate clinical notes.
              </div>
            )}
          </div>
        )}

        {activeTab === 'labs' && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  Physician Diagnostic Lab Orders
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Order diagnostic laboratory investigations and track result processing status.</p>
              </div>
              <button
                onClick={() => {
                  if (!selectedAppt && appointments.length > 0) handleSelectAppt(appointments[0]);
                  setIsLabModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Dispatch Lab Order</span>
              </button>
            </div>

            {selectedAppt ? (
              <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Lab Ordering for Patient</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedAppt.patient?.user?.name || 'Selected Patient'}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Reason: {selectedAppt.reasonForVisit}</p>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                Select a patient from the queue in Doctor Workstation to order diagnostic lab investigations.
              </div>
            )}

            {/* Verified Lab Reports List for Doctor Review */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Verified Laboratory Reports for Review</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {labResults.map((result) => (
                  <div key={result._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{result.testName}</span>
                        <Badge status={result.status} />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">Patient: {result.patient?.user?.name || 'Patient'}</p>
                    </div>
                    <button
                      onClick={() => handleViewPdf(result)}
                      className="w-full mt-2 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center justify-center space-x-1 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View PDF Report</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal: PDF Viewer for Doctors */}
        <Modal 
          isOpen={isPdfModalOpen} 
          onClose={() => setIsPdfModalOpen(false)} 
          title={`Laboratory PDF Report - ${selectedLabReport?.testName || ''}`}
          maxWidth="max-w-4xl"
        >
          <div className="w-full h-[550px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
            {pdfUrl && (
              <iframe
                src={pdfUrl}
                title="Doctor PDF Report Viewer"
                className="w-full h-full border-none"
              ></iframe>
            )}
          </div>
        </Modal>

        {/* Modal: SOAP Note + AI Clinical Summary */}
        <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title="Clinical SOAP Note Entry" maxWidth="max-w-3xl">
          <form onSubmit={handleCreateNote} className="space-y-4">
            {/* Vitals Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Patient Vitals</span>
              <div className="grid grid-cols-5 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400">BP (mmHg)</label>
                  <input
                    type="text"
                    value={soapNote.vitals.bp}
                    onChange={(e) => setSoapNote({ ...soapNote, vitals: { ...soapNote.vitals, bp: e.target.value } })}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400">Pulse (bpm)</label>
                  <input
                    type="text"
                    value={soapNote.vitals.pulse}
                    onChange={(e) => setSoapNote({ ...soapNote, vitals: { ...soapNote.vitals, pulse: e.target.value } })}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400">Temp (°F)</label>
                  <input
                    type="text"
                    value={soapNote.vitals.temp}
                    onChange={(e) => setSoapNote({ ...soapNote, vitals: { ...soapNote.vitals, temp: e.target.value } })}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400">Weight (kg)</label>
                  <input
                    type="text"
                    value={soapNote.vitals.weight}
                    onChange={(e) => setSoapNote({ ...soapNote, vitals: { ...soapNote.vitals, weight: e.target.value } })}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400">SpO2 (%)</label>
                  <input
                    type="text"
                    value={soapNote.vitals.spo2}
                    onChange={(e) => setSoapNote({ ...soapNote, vitals: { ...soapNote.vitals, spo2: e.target.value } })}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subjective (Symptoms & Complaints)</label>
              <textarea
                rows={2}
                required
                value={soapNote.subjective}
                onChange={(e) => setSoapNote({ ...soapNote, subjective: e.target.value })}
                placeholder="Patient reports mild chest tightness during physical exertion..."
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Objective (Physical Exam Findings)</label>
              <textarea
                rows={2}
                value={soapNote.objective}
                onChange={(e) => setSoapNote({ ...soapNote, objective: e.target.value })}
                placeholder="S1/S2 present, lungs clear to auscultation..."
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assessment (Clinical Diagnosis & Impressions)</label>
              <textarea
                rows={2}
                required
                value={soapNote.assessment}
                onChange={(e) => setSoapNote({ ...soapNote, assessment: e.target.value })}
                placeholder="Stage 1 Essential Hypertension with mild angina..."
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Plan (Treatment & Follow-up Instructions)</label>
              <textarea
                rows={2}
                value={soapNote.plan}
                onChange={(e) => setSoapNote({ ...soapNote, plan: e.target.value })}
                placeholder="Initiate low-salt diet, start Lisinopril 10mg, order lipid panel..."
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {/* AI Trigger Button */}
              <button
                type="button"
                onClick={handleGenerateAiSummary}
                disabled={generatingAi}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500/20 to-cyan-500/20 hover:from-teal-500/30 hover:to-cyan-500/30 text-teal-700 dark:text-teal-300 border border-teal-500/40 font-bold text-xs flex items-center space-x-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>{generatingAi ? 'Summarizing...' : 'Generate AI Summary (#1)'}</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all"
              >
                Save Clinical Note
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: Issue Prescription */}
        <Modal isOpen={isRxModalOpen} onClose={() => setIsRxModalOpen(false)} title="Issue Patient Prescription" maxWidth="max-w-3xl">
          <form onSubmit={handleCreateRx} className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Medication List</span>
                <button
                  type="button"
                  onClick={handleAddMedicationRow}
                  className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold"
                >
                  + Add Medication
                </button>
              </div>

              {prescription.medications.map((med, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-slate-400">Medication Name</label>
                      <input
                        type="text"
                        required
                        value={med.name}
                        onChange={(e) => {
                          const updated = [...prescription.medications];
                          updated[idx].name = e.target.value;
                          setPrescription({ ...prescription, medications: updated });
                        }}
                        placeholder="Lisinopril"
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-slate-400">Dosage</label>
                      <input
                        type="text"
                        required
                        value={med.dosage}
                        onChange={(e) => {
                          const updated = [...prescription.medications];
                          updated[idx].dosage = e.target.value;
                          setPrescription({ ...prescription, medications: updated });
                        }}
                        placeholder="10mg"
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-slate-400">Frequency</label>
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => {
                          const updated = [...prescription.medications];
                          updated[idx].frequency = e.target.value;
                          setPrescription({ ...prescription, medications: updated });
                        }}
                        placeholder="Once daily"
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-slate-400">Duration</label>
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => {
                          const updated = [...prescription.medications];
                          updated[idx].duration = e.target.value;
                          setPrescription({ ...prescription, medications: updated });
                        }}
                        placeholder="30 days"
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">General Care Instructions</label>
              <textarea
                rows={2}
                value={prescription.generalInstructions}
                onChange={(e) => setPrescription({ ...prescription, generalInstructions: e.target.value })}
                placeholder="Take with water. Maintain daily home BP logs."
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all"
            >
              Sign & Issue Prescription
            </button>
          </form>
        </Modal>

        {/* Modal: Order Lab Test */}
        <Modal isOpen={isLabModalOpen} onClose={() => setIsLabModalOpen(false)} title="Order Diagnostic Laboratory Test">
          <form onSubmit={handleCreateLabOrder} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Laboratory Investigation</label>
              <select
                required
                value={labOrder.testName}
                onChange={(e) => setLabOrder({ ...labOrder, testName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="">-- Choose Lab Test --</option>
                {services.map(s => (
                  <option key={s._id} value={s.name}>
                    {s.name} (${s.cost})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority Tier</label>
              <select
                value={labOrder.priority}
                onChange={(e) => setLabOrder({ ...labOrder, priority: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="ROUTINE">Routine</option>
                <option value="URGENT">Urgent</option>
                <option value="STAT">STAT / Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Clinical Indication / Notes for Tech</label>
              <textarea
                rows={2}
                value={labOrder.notes}
                onChange={(e) => setLabOrder({ ...labOrder, notes: e.target.value })}
                placeholder="Evaluate baseline lipid parameters..."
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all"
            >
              Dispatch Lab Order
            </button>
          </form>
        </Modal>

        {/* Modal: Patient EMR Timeline */}
        <Modal isOpen={isTimelineModalOpen} onClose={() => setIsTimelineModalOpen(false)} title="Patient EMR Medical Timeline" maxWidth="max-w-3xl">
          <Timeline events={patientTimeline} />
        </Modal>

        {/* AI Output Modal */}
        <AiSummaryModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          title="AI Clinical Summary (#1)"
          content={aiContent}
          type="clinical"
        />
      </div>
    </Layout>
  );
};

export default DoctorDashboard;
