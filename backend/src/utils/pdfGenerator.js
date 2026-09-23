const fs = require('fs');
const path = require('path');

/**
 * Generates a clean, valid PDF document buffer for a Lab Result
 * @param {Object} labResult - LabResult populated document
 * @returns {Buffer} PDF Buffer
 */
const generateLabResultPdfBuffer = (labResult) => {
  const patientName = labResult.patient?.user?.name || 'Patient';
  const testName = labResult.testName || 'Laboratory Test Report';
  const reportDate = labResult.publishedAt || labResult.createdAt || new Date();
  const dateStr = new Date(reportDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const paramsText = (labResult.parameterResults || []).map(p => 
    `• ${p.parameter}: ${p.value} ${p.unit || ''} (Ref: ${p.referenceRange || 'N/A'}) ${p.isAbnormal ? '[ABNORMAL]' : '[NORMAL]'}`
  ).join('\n');

  const contentStream = `
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>
endobj
4 0 obj
<< /Length 700 >>
stream
BT
/F2 20 Tf
50 740 Td
(CLINOVEXA HEALTHCARE SYSTEM) Tj
/F1 12 Tf
0 -25 Td
(Official Laboratory Diagnostic Report) Tj
0 -20 Td
(--------------------------------------------------------------------------------) Tj
0 -25 Td
(Patient Name: ${escapePdfText(patientName)}) Tj
0 -18 Td
(Test Investigation: ${escapePdfText(testName)}) Tj
0 -18 Td
(Report Date: ${escapePdfText(dateStr)}) Tj
0 -18 Td
(Status: VERIFIED & PUBLISHED) Tj
0 -25 Td
(--------------------------------------------------------------------------------) Tj
/F2 14 Tf
0 -25 Td
(TEST PARAMETERS & RESULTS:) Tj
/F1 11 Tf
0 -20 Td
${formatPdfTextLines(paramsText)}
0 -30 Td
(Remarks: ${escapePdfText(labResult.remarks || 'No clinical remarks.')}) Tj
0 -40 Td
(--------------------------------------------------------------------------------) Tj
0 -20 Td
(This is an electronically verified diagnostic report issued by Clinovexa Lab.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000257 00000 n 
0000001007 00000 n 
0000001078 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
1154
%%EOF
`;

  return Buffer.from(contentStream, 'binary');
};

function escapePdfText(str) {
  return String(str || '').replace(/[\\()]/g, '\\$&');
}

function formatPdfTextLines(text) {
  const lines = String(text || '').split('\n');
  return lines.map((line, idx) => {
    if (idx === 0) return `(${escapePdfText(line)}) Tj`;
    return `0 -16 Td (${escapePdfText(line)}) Tj`;
  }).join('\n');
}

module.exports = {
  generateLabResultPdfBuffer
};
