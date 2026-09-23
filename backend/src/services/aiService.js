/**
 * AI Service Module for Clinovexa
 * Handles:
 * 1. AI Clinical Note Summaries for Doctors.
 * 2. AI Prescription Assistant for Patients (Grounded, Educational, Safe).
 */

const generateClinicalSummary = async ({ subjective, objective, assessment, plan, vitals }) => {
  const vitalsText = vitals
    ? `BP: ${vitals.bp || 'N/A'}, HR: ${vitals.pulse || 'N/A'} bpm, Temp: ${vitals.temp || 'N/A'}°F, SpO2: ${vitals.spo2 || 'N/A'}%`
    : 'Vitals not recorded';

  const summary = `
[CLINICAL EXECUTIVE SUMMARY]
• Patient Presentation: ${subjective || 'No chief complaint noted.'}
• Vitals & Exam: ${vitalsText}. ${objective || ''}
• Assessment/Impression: ${assessment || 'Pending assessment.'}
• Plan of Care: ${plan || 'Routine follow-up.'}
  `.trim();

  return summary;
};

const generatePatientExplanation = async ({ medications = [], generalInstructions = '', followUpDate = null, question = '' }) => {
  let medDetailsList = [];
  if (medications && medications.length > 0) {
    medDetailsList = medications.map((m, idx) => {
      let extra = '';
      if (m.name.toLowerCase().includes('amoxicillin')) extra = 'Used for bacterial infections.';
      else if (m.name.toLowerCase().includes('lisinopril')) extra = 'Used for high blood pressure & heart protection.';
      else if (m.name.toLowerCase().includes('atorvastatin')) extra = 'Used to lower cholesterol.';
      else if (m.name.toLowerCase().includes('metformin')) extra = 'Used for blood sugar management.';
      else extra = 'Take strictly as directed by your physician.';

      return `${idx + 1}. **${m.name}** (${m.dosage})
   - **Frequency:** ${m.frequency}
   - **Duration:** ${m.duration}
   - **Instructions:** ${m.instructions || 'Take with water.'}
   - **General Purpose:** ${extra}`;
    });
  }

  const medText = medDetailsList.length > 0 ? medDetailsList.join('\n\n') : 'No active medications found on this prescription.';

  let answerHeader = '';
  let specificAnswer = '';

  const qLower = (question || '').toLowerCase();

  if (qLower.includes('purpose') || qLower.includes('for') || qLower.includes('what is this medicine')) {
    answerHeader = '### 💡 What Is This Medicine For?';
    specificAnswer = `Your doctor has prescribed:
${medText}

These medications treat specific conditions diagnosed during your clinic visit. Take them according to the full duration ordered by your doctor.`;
  } else if (qLower.includes('how') || qLower.includes('take') || qLower.includes('instructions')) {
    answerHeader = '### 📋 How Should You Take Your Medication?';
    specificAnswer = `Here are your doctor's exact administration guidelines:
${medText}

${generalInstructions ? `**Doctor's Special Instructions:** ${generalInstructions}` : ''}`;
  } else if (qLower.includes('dosage') || qLower.includes('often') || qLower.includes('frequency')) {
    answerHeader = '### ⏱️ Dosage & Schedule Breakdown';
    specificAnswer = `Here is your specific dosage schedule:
${medText}`;
  } else if (question && question.trim().length > 0) {
    answerHeader = `### ❓ Answering Your Question: "${question.trim()}"`;
    specificAnswer = `Based on your official prescription on record:
${medText}

${generalInstructions ? `**Doctor Note:** ${generalInstructions}` : ''}

If you have questions beyond this prescription, please contact your doctor or pharmacist directly.`;
  } else {
    answerHeader = '### 🩺 AI Prescription Assistant - Care Summary';
    specificAnswer = `Here is a plain-language summary of your doctor's prescription:

${medText}

${generalInstructions ? `**General Instructions:** ${generalInstructions}` : ''}
${followUpDate ? `**Follow-Up Date:** ${new Date(followUpDate).toLocaleDateString()}` : ''}`;
  }

  const disclaimer = `

---
> ⚠️ **AI Safety Disclaimer**: AI-generated information is for educational purposes only and does not replace advice from your doctor or pharmacist. Never change your medication dose or stop taking prescribed medicine without consulting your doctor. If you experience severe symptoms or a medical emergency, contact emergency medical services immediately.`;

  return `${answerHeader}\n\n${specificAnswer}${disclaimer}`.trim();
};

module.exports = {
  generateClinicalSummary,
  generatePatientExplanation
};
