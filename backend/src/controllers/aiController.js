const { generateClinicalSummary, generatePatientExplanation } = require('../services/aiService');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Generate clinical summary from visit notes for clinician review
// @route   POST /api/ai/summarize-note
// @access  Private (Doctor, Admin)
const summarizeNote = async (req, res, next) => {
  try {
    const { subjective, objective, assessment, plan, vitals } = req.body;

    const summary = await generateClinicalSummary({
      subjective,
      objective,
      assessment,
      plan,
      vitals
    });

    await logAudit(req, 'AI_GENERATE', 'ClinicalSummary', null, { type: 'NOTE_SUMMARY' });

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate plain language explanation of prescription/follow-up for patient
// @route   POST /api/ai/explain-prescription
// @access  Private (Doctor, Admin, Patient, Receptionist)
const explainPrescription = async (req, res, next) => {
  try {
    const { medications, generalInstructions, followUpDate, question } = req.body;

    const explanation = await generatePatientExplanation({
      medications,
      generalInstructions,
      followUpDate,
      question
    });

    await logAudit(req, 'AI_GENERATE', 'PrescriptionExplanation', null, { type: 'PATIENT_TRANSLATION', question });

    res.json({
      success: true,
      explanation
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  summarizeNote,
  explainPrescription
};
