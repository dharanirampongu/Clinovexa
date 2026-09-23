const path = require('path');
const fs = require('fs');
const LabOrder = require('../models/LabOrder');
const LabResult = require('../models/LabResult');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');
const { generateLabResultPdfBuffer } = require('../utils/pdfGenerator');
const { logAudit } = require('../middleware/auditMiddleware');
const { LAB_ORDER_STATUS, LAB_RESULT_STATUS, ROLES } = require('../utils/constants');

// @desc    Get all Lab Orders
// @route   GET /api/lab/orders
// @access  Private
const getLabOrders = async (req, res, next) => {
  try {
    const { patientId, status } = req.query;
    const query = {};

    if (patientId) query.patient = patientId;
    if (status) query.status = status;

    if (req.user.role === ROLES.PATIENT) {
      const patient = await Patient.findOne({ user: req.user._id });
      if (patient) {
        query.patient = patient._id;
      } else {
        return res.json({ success: true, count: 0, data: [] });
      }
    }

    const orders = await LabOrder.find(query)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name phone gender dob' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .populate('tests.service')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Lab Order (Issued by Doctor or Admin)
// @route   POST /api/lab/orders
// @access  Private (Doctor, Admin)
const createLabOrder = async (req, res, next) => {
  try {
    const { patientId, appointmentId, tests, priority, notes } = req.body;

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor && req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ success: false, message: 'Only doctors can order lab tests' });
    }

    const doctorId = doctor ? doctor._id : req.body.doctorId;

    const labOrder = await LabOrder.create({
      patient: patientId,
      doctor: doctorId,
      appointment: appointmentId || null,
      tests: tests || [],
      priority: priority || 'ROUTINE',
      notes: notes || '',
      status: LAB_ORDER_STATUS.ORDERED
    });

    await logAudit(req, 'CREATE', 'LabOrder', labOrder._id, { patientId, testCount: tests?.length });

    res.status(201).json({ success: true, data: labOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Lab Order Status (e.g., SAMPLE_COLLECTED -> PROCESSING -> VERIFIED -> RELEASED)
// @route   PUT /api/lab/orders/:id/status
// @access  Private (LabTech, Doctor, Admin)
const updateLabOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await LabOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Lab Order not found' });
    }

    order.status = status;
    if (status === LAB_ORDER_STATUS.SAMPLE_COLLECTED) {
      order.sampleCollectedAt = new Date();
      order.sampleCollector = req.user._id;
    }

    await order.save();
    await logAudit(req, 'UPDATE_STATUS', 'LabOrder', order._id, { status });

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Lab Results
// @route   GET /api/lab/results
// @access  Private
const getLabResults = async (req, res, next) => {
  try {
    const { patientId, orderId } = req.query;
    const query = {};

    if (patientId) query.patient = patientId;
    if (orderId) query.labOrder = orderId;

    if (req.user.role === ROLES.PATIENT) {
      const patient = await Patient.findOne({ user: req.user._id });
      if (patient) {
        query.patient = patient._id;
        query.isPublished = true; // Only published results visible to patients
      } else {
        return res.json({ success: true, count: 0, data: [] });
      }
    }

    const results = await LabResult.find(query)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name' } })
      .populate({ path: 'technician', select: 'name' })
      .populate({ path: 'verifiedBy', select: 'name' })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    next(error);
  }
};

// @desc    Enter Lab Result values
// @route   POST /api/lab/results
// @access  Private (LabTech, Admin)
const createLabResult = async (req, res, next) => {
  try {
    const { labOrderId, patientId, testName, parameterResults, remarks } = req.body;

    const result = await LabResult.create({
      labOrder: labOrderId,
      patient: patientId,
      technician: req.user._id,
      testName,
      parameterResults: parameterResults || [],
      remarks: remarks || '',
      status: LAB_RESULT_STATUS.DRAFT
    });

    // Advance lab order status to PROCESSING
    await LabOrder.findByIdAndUpdate(labOrderId, { status: LAB_ORDER_STATUS.PROCESSING });

    await logAudit(req, 'CREATE', 'LabResult', result._id, { testName, labOrderId });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload PDF Report for Lab Result
// @route   POST /api/lab/results/:id/upload-pdf
// @access  Private (LabTech, Admin)
const uploadLabReportPdf = async (req, res, next) => {
  try {
    const result = await LabResult.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Lab Result not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    result.pdfPath = req.file.path;
    result.pdfOriginalName = req.file.originalname;
    await result.save();

    await logAudit(req, 'UPLOAD_PDF', 'LabResult', result._id, { fileName: req.file.originalname });

    res.json({
      success: true,
      message: 'PDF report uploaded successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish Lab Report to Patient
// @route   POST /api/lab/results/:id/publish
// @access  Private (LabTech, Admin, Doctor)
const publishLabReport = async (req, res, next) => {
  try {
    const result = await LabResult.findById(req.params.id).populate('patient');

    if (!result) {
      return res.status(404).json({ success: false, message: 'Lab Result not found' });
    }

    result.isPublished = true;
    result.publishedAt = new Date();
    result.status = LAB_RESULT_STATUS.RELEASED;
    result.verifiedBy = req.user._id;
    result.verifiedAt = new Date();
    await result.save();

    if (result.labOrder) {
      await LabOrder.findByIdAndUpdate(result.labOrder, { status: LAB_ORDER_STATUS.RELEASED });
    }

    // Trigger Notification for Patient
    try {
      if (result.patient && result.patient.user) {
        await Notification.create({
          user: result.patient.user,
          title: 'Your Laboratory Report is Available',
          message: `Your ${result.testName || 'laboratory'} report is now available in your patient portal.`,
          type: 'LAB_REPORT',
          link: '/patient/dashboard#labs'
        });
      }
    } catch (notifErr) {
      console.error('Failed to create lab publication notification:', notifErr);
    }

    await logAudit(req, 'PUBLISH_REPORT', 'LabResult', result._id, { testName: result.testName });

    res.json({
      success: true,
      message: 'Lab report published to patient portal successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Secure View/Download PDF for Lab Result
// @route   GET /api/lab/results/:id/pdf
// @access  Private (Patient [own], Doctor, LabTech, Admin)
const getLabReportPdf = async (req, res, next) => {
  try {
    const result = await LabResult.findById(req.params.id).populate({
      path: 'patient',
      populate: { path: 'user', select: 'name email' }
    });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Lab Result not found' });
    }

    // Permission Verification
    if (req.user.role === ROLES.PATIENT) {
      if (!result.patient || result.patient.user?._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You do not have permission to access this lab report' });
      }
      if (!result.isPublished) {
        return res.status(403).json({ success: false, message: 'This lab report has not been published by the laboratory yet.' });
      }
    }

    const isDownload = req.query.download === 'true';

    // If PDF file exists on disk
    if (result.pdfPath && fs.existsSync(result.pdfPath)) {
      const fileName = result.pdfOriginalName || `${result.testName.replace(/\s+/g, '_')}_Report.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      if (isDownload) {
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      } else {
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
      }
      return fs.createReadStream(result.pdfPath).pipe(res);
    }

    // Fallback: Generate clean, valid PDF buffer on the fly
    const pdfBuffer = generateLabResultPdfBuffer(result);
    const fileName = `${(result.testName || 'Lab_Report').replace(/\s+/g, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    if (isDownload) {
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    }
    return res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify and Release Lab Result to Patient
// @route   PUT /api/lab/results/:id/verify
// @access  Private (LabTech, Doctor, Admin)
const verifyAndReleaseLabResult = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const result = await LabResult.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Lab Result not found' });
    }

    const targetStatus = status || LAB_RESULT_STATUS.RELEASED;
    result.status = targetStatus;
    result.verifiedBy = req.user._id;
    result.verifiedAt = new Date();
    if (remarks) result.remarks = remarks;

    if (targetStatus === LAB_RESULT_STATUS.RELEASED) {
      result.isPublished = true;
      result.publishedAt = new Date();
    }

    await result.save();

    const orderStatus = targetStatus === LAB_RESULT_STATUS.RELEASED ? LAB_ORDER_STATUS.RELEASED : LAB_ORDER_STATUS.VERIFIED;
    if (result.labOrder) {
      await LabOrder.findByIdAndUpdate(result.labOrder, { status: orderStatus });
    }

    await logAudit(req, 'VERIFY_RELEASE', 'LabResult', result._id, { status: targetStatus });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLabOrders,
  createLabOrder,
  updateLabOrderStatus,
  getLabResults,
  createLabResult,
  uploadLabReportPdf,
  publishLabReport,
  getLabReportPdf,
  verifyAndReleaseLabResult
};
