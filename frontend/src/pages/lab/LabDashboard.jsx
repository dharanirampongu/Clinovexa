import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import api from '../../services/api';
import { 
  FlaskConical, 
  Clock, 
  CheckCircle, 
  FileText, 
  Upload, 
  Eye, 
  Send, 
  CheckCheck,
  Plus,
  Download
} from 'lucide-react';

const LabDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('workstation');
  const [labOrders, setLabOrders] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Result Entry Modal State
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [resultData, setResultData] = useState({
    testName: 'Lipid Panel',
    parameterResults: [
      { parameter: 'Total Cholesterol', value: '235', unit: 'mg/dL', referenceRange: '< 200', isAbnormal: true },
      { parameter: 'Triglycerides', value: '175', unit: 'mg/dL', referenceRange: '< 150', isAbnormal: true },
      { parameter: 'HDL Cholesterol', value: '45', unit: 'mg/dL', referenceRange: '> 40', isAbnormal: false },
      { parameter: 'LDL Cholesterol', value: '155', unit: 'mg/dL', referenceRange: '< 100', isAbnormal: true }
    ],
    remarks: 'Mild elevation in total cholesterol and LDL parameters.'
  });

  // PDF Upload Modal State
  const [isPdfUploadModalOpen, setIsPdfUploadModalOpen] = useState(false);
  const [selectedResultForUpload, setSelectedResultForUpload] = useState(null);
  const [selectedPdfFile, setSelectedPdfFile] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // PDF Preview Modal State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState('');

  useEffect(() => {
    const hash = location.hash ? location.hash.replace('#', '') : 'workstation';
    if (['workstation', 'orders', 'results'].includes(hash)) {
      setActiveTab(hash);
    } else {
      setActiveTab('workstation');
    }
  }, [location.hash]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/lab/dashboard#${tabId}`);
  };

  const fetchLabData = async () => {
    setLoading(true);
    try {
      const [ordersRes, resultsRes] = await Promise.all([
        api.get('/lab/orders'),
        api.get('/lab/results')
      ]);
      setLabOrders(ordersRes.data || []);
      setLabResults(resultsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch lab workstation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabData();
  }, []);

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await api.patch(`/lab/orders/${orderId}/status`, { status });
      setMessage(`Lab Order status updated to ${status}`);
      fetchLabData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const handleOpenResultEntry = (order) => {
    setSelectedOrder(order);
    const testTitle = order.tests?.[0]?.testName || 'Lab Investigation';
    setResultData({
      testName: testTitle,
      parameterResults: [
        { parameter: `${testTitle} Primary Parameter`, value: '14.2', unit: 'g/dL', referenceRange: '12.0 - 16.0', isAbnormal: false },
        { parameter: `${testTitle} Secondary Parameter`, value: '220', unit: 'mg/dL', referenceRange: '< 200', isAbnormal: true }
      ],
      remarks: 'Automated run verified by workstation.'
    });
    setIsResultModalOpen(true);
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      await api.post('/lab/results', {
        labOrderId: selectedOrder._id,
        patientId: selectedOrder.patient?._id,
        testName: resultData.testName,
        parameterResults: resultData.parameterResults,
        remarks: resultData.remarks
      });
      setMessage('Lab test results recorded successfully!');
      setIsResultModalOpen(false);
      fetchLabData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save lab result');
    }
  };

  const handleOpenPdfUpload = (result) => {
    setSelectedResultForUpload(result);
    setSelectedPdfFile(null);
    setIsPdfUploadModalOpen(true);
  };

  const handleUploadPdfSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPdfFile || !selectedResultForUpload) return;

    if (selectedPdfFile.type !== 'application/pdf') {
      return alert('Only PDF files are allowed for lab reports.');
    }

    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append('pdf', selectedPdfFile);

      await api.post(`/lab/results/${selectedResultForUpload._id}/upload-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage('Official PDF Lab Report uploaded successfully!');
      setIsPdfUploadModalOpen(false);
      fetchLabData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to upload PDF report');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handlePublishReport = async (resultId) => {
    try {
      await api.post(`/lab/results/${resultId}/publish`);
      setMessage('Lab report published to patient portal & notification sent!');
      fetchLabData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to publish report');
    }
  };

  const handlePreviewPdf = (result) => {
    const token = localStorage.getItem('clinovexa_token');
    const viewUrl = `${api.defaults.baseURL || '/api'}/lab/results/${result._id}/pdf?token=${token}`;
    setPreviewPdfUrl(viewUrl);
    setIsPreviewModalOpen(true);
  };

  const handleAddParamRow = () => {
    setResultData({
      ...resultData,
      parameterResults: [
        ...resultData.parameterResults,
        { parameter: '', value: '', unit: '', referenceRange: '', isAbnormal: false }
      ]
    });
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              Laboratory Diagnostics Workstation
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Manage diagnostic pipeline: Sample Collection → Processing → Result Entry → PDF Report Upload → Publish to Patient.</p>
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
            { id: 'workstation', label: 'Lab Workstation', icon: FlaskConical },
            { id: 'orders', label: 'Pending Orders', icon: Clock },
            { id: 'results', label: 'Result & PDF Verification', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Pipeline Stage Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {['CREATED', 'SAMPLE_COLLECTED', 'PROCESSING', 'VERIFIED', 'RELEASED'].map((st) => {
            const count = labOrders.filter(o => o.status === st).length;
            return (
              <div key={st} className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 text-center">
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{count}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">{st.replace('_', ' ')}</p>
              </div>
            );
          })}
        </div>

        {/* Workstation & Orders Queue Table */}
        {(activeTab === 'workstation' || activeTab === 'orders') && (
          <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Diagnostic Order Workflow Queue</h3>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">Loading lab orders queue...</div>
            ) : (
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Patient</th>
                    <th className="p-3.5">Ordering Doctor</th>
                    <th className="p-3.5">Investigation Test</th>
                    <th className="p-3.5">Priority</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Workflow Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {labOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-100/60 dark:hover:bg-slate-900/40 transition-all">
                      <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">{order._id.substring(18)}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{order.patient?.user?.name || 'Patient'}</td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300">{order.doctor?.user?.name || 'Doctor'}</td>
                      <td className="p-3.5 text-amber-700 dark:text-amber-300 font-semibold">{order.tests?.[0]?.testName || 'Lab Test'}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.priority === 'STAT' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {order.priority || 'ROUTINE'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <Badge status={order.status} />
                      </td>
                      <td className="p-3.5 space-x-1.5">
                        {order.status === 'CREATED' && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'SAMPLE_COLLECTED')}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 font-semibold text-[11px]"
                          >
                            Collect Sample
                          </button>
                        )}

                        {order.status === 'SAMPLE_COLLECTED' && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'PROCESSING')}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-semibold text-[11px]"
                          >
                            Start Processing
                          </button>
                        )}

                        {order.status === 'PROCESSING' && (
                          <button
                            onClick={() => handleOpenResultEntry(order)}
                            className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-500/30 font-semibold text-[11px]"
                          >
                            Enter Results
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Results & PDF Upload / Publish Tab */}
        {activeTab === 'results' && (
          <div className="space-y-4">
            <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Lab Results & PDF Report Publishing</h3>
              </div>

              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Investigation</th>
                    <th className="p-3.5">Patient</th>
                    <th className="p-3.5">PDF Status</th>
                    <th className="p-3.5">Publish Status</th>
                    <th className="p-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {labResults.map((result) => (
                    <tr key={result._id} className="hover:bg-slate-100/60 dark:hover:bg-slate-900/40 transition-all">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{result.testName}</td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300">{result.patient?.user?.name || 'Patient'}</td>
                      <td className="p-3.5">
                        {result.pdfPath ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                            PDF Uploaded
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/30">
                            Auto-Generated PDF
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {result.isPublished ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                            Published to Patient
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
                            Draft / Unpublished
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 space-x-2 flex items-center">
                        <button
                          onClick={() => handleOpenPdfUpload(result)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 font-semibold text-[11px] flex items-center gap-1"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{result.pdfPath ? 'Replace PDF' : 'Upload PDF'}</span>
                        </button>

                        <button
                          onClick={() => handlePreviewPdf(result)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-semibold text-[11px] flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview PDF</span>
                        </button>

                        {!result.isPublished && (
                          <button
                            onClick={() => handlePublishReport(result._id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Publish Report</span>
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

        {/* Modal: Enter Test Results */}
        <Modal isOpen={isResultModalOpen} onClose={() => setIsResultModalOpen(false)} title="Record Laboratory Test Parameters" maxWidth="max-w-3xl">
          <form onSubmit={handleSaveResult} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white">Investigation: {resultData.testName}</span>
              <button
                type="button"
                onClick={handleAddParamRow}
                className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold"
              >
                + Add Parameter
              </button>
            </div>

            <div className="space-y-3">
              {resultData.parameterResults.map((param, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-5 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400">Parameter</label>
                    <input
                      type="text"
                      required
                      value={param.parameter}
                      onChange={(e) => {
                        const updated = [...resultData.parameterResults];
                        updated[idx].parameter = e.target.value;
                        setResultData({ ...resultData, parameterResults: updated });
                      }}
                      className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400">Measured Value</label>
                    <input
                      type="text"
                      required
                      value={param.value}
                      onChange={(e) => {
                        const updated = [...resultData.parameterResults];
                        updated[idx].value = e.target.value;
                        setResultData({ ...resultData, parameterResults: updated });
                      }}
                      className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400">Unit</label>
                    <input
                      type="text"
                      value={param.unit}
                      onChange={(e) => {
                        const updated = [...resultData.parameterResults];
                        updated[idx].unit = e.target.value;
                        setResultData({ ...resultData, parameterResults: updated });
                      }}
                      className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400">Reference Range</label>
                    <input
                      type="text"
                      value={param.referenceRange}
                      onChange={(e) => {
                        const updated = [...resultData.parameterResults];
                        updated[idx].referenceRange = e.target.value;
                        setResultData({ ...resultData, parameterResults: updated });
                      }}
                      className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={param.isAbnormal}
                        onChange={(e) => {
                          const updated = [...resultData.parameterResults];
                          updated[idx].isAbnormal = e.target.checked;
                          setResultData({ ...resultData, parameterResults: updated });
                        }}
                        className="rounded border-slate-300 dark:border-slate-700 text-rose-500 focus:ring-0"
                      />
                      <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">Abnormal</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Technician Remarks</label>
              <textarea
                rows={2}
                value={resultData.remarks}
                onChange={(e) => setResultData({ ...resultData, remarks: e.target.value })}
                placeholder="Automated run verified..."
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              Verify & Save Test Results
            </button>
          </form>
        </Modal>

        {/* Modal: Upload PDF Report */}
        <Modal isOpen={isPdfUploadModalOpen} onClose={() => setIsPdfUploadModalOpen(false)} title="Upload PDF Laboratory Report">
          <form onSubmit={handleUploadPdfSubmit} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <span className="font-bold text-slate-900 dark:text-white">Investigation: {selectedResultForUpload?.testName}</span>
              <p className="text-slate-500 dark:text-slate-400">Patient: {selectedResultForUpload?.patient?.user?.name}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Select PDF Report File (.pdf, max 10MB)</label>
              <input
                type="file"
                accept="application/pdf"
                required
                onChange={(e) => setSelectedPdfFile(e.target.files[0])}
                className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={uploadingPdf}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-50"
            >
              {uploadingPdf ? 'Uploading PDF File...' : 'Upload Official PDF Report'}
            </button>
          </form>
        </Modal>

        {/* Modal: PDF Preview Viewer */}
        <Modal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} title="PDF Laboratory Report Preview" maxWidth="max-w-4xl">
          <div className="w-full h-[550px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
            {previewPdfUrl && (
              <iframe
                src={previewPdfUrl}
                title="Lab Report PDF Preview"
                className="w-full h-full border-none"
              ></iframe>
            )}
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default LabDashboard;
