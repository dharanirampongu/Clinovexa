const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');
const { ROLES, APPOINTMENT_STATUS, LAB_ORDER_STATUS, LAB_RESULT_STATUS, INVOICE_STATUS, SERVICE_CATEGORY } = require('./src/utils/constants');

// Models
const User = require('./src/models/User');
const Patient = require('./src/models/Patient');
const Doctor = require('./src/models/Doctor');
const Receptionist = require('./src/models/Receptionist');
const LabTechnician = require('./src/models/LabTechnician');
const Service = require('./src/models/Service');
const Appointment = require('./src/models/Appointment');
const ClinicalNote = require('./src/models/ClinicalNote');
const Prescription = require('./src/models/Prescription');
const LabOrder = require('./src/models/LabOrder');
const LabResult = require('./src/models/LabResult');
const Invoice = require('./src/models/Invoice');
const AuditLog = require('./src/models/AuditLog');
const StaffRecord = require('./src/models/StaffRecord');
const Notification = require('./src/models/Notification');

const seedData = async () => {
  try {
    await connectDB();
    logger.info('Clearing existing database collections...');

    await Promise.all([
      User.deleteMany({}),
      Patient.deleteMany({}),
      Doctor.deleteMany({}),
      Receptionist.deleteMany({}),
      LabTechnician.deleteMany({}),
      Service.deleteMany({}),
      Appointment.deleteMany({}),
      ClinicalNote.deleteMany({}),
      Prescription.deleteMany({}),
      LabOrder.deleteMany({}),
      LabResult.deleteMany({}),
      Invoice.deleteMany({}),
      AuditLog.deleteMany({}),
      StaffRecord.deleteMany({}),
      Notification.deleteMany({})
    ]);

    logger.info('Creating Services...');
    const services = await Service.create([
      { name: 'General Cardiology Consultation', category: SERVICE_CATEGORY.CONSULTATION, cost: 150, department: 'Cardiology', description: 'Comprehensive heart & cardiovascular evaluation' },
      { name: 'Neurology Consultation', category: SERVICE_CATEGORY.CONSULTATION, cost: 180, department: 'Neurology', description: 'Brain, spine, and nerve evaluation' },
      { name: 'Complete Blood Count (CBC)', category: SERVICE_CATEGORY.LABORATORY, cost: 50, department: 'Pathology', description: 'Hemoglobin, WBC, RBC, Platelet analysis' },
      { name: 'Comprehensive Metabolic Panel (CMP)', category: SERVICE_CATEGORY.LABORATORY, cost: 85, department: 'Biochemistry', description: 'Kidney function, liver function, glucose, electrolytes' },
      { name: 'Lipid Panel', category: SERVICE_CATEGORY.LABORATORY, cost: 60, department: 'Biochemistry', description: 'Cholesterol, Triglycerides, HDL, LDL' },
      { name: 'Electrocardiogram (ECG/EKG)', category: SERVICE_CATEGORY.PROCEDURE, cost: 120, department: 'Cardiology', description: 'Heart rhythm trace' }
    ]);

    logger.info('Creating Authorized Staff Records...');
    const staffRecords = await StaffRecord.create([
      { staffId: 'ADM-1001', role: ROLES.ADMIN, name: 'Eleanor Vance (Admin)', email: 'admin@clinovexa.com', department: 'Executive Administration', isClaimed: true },
      { staffId: 'DOC-1001', role: ROLES.DOCTOR, name: 'Dr. Arthur Pendelton', email: 'doctor.cardio@clinovexa.com', department: 'Cardiology', isClaimed: true },
      { staffId: 'DOC-1002', role: ROLES.DOCTOR, name: 'Dr. Sophia Martinez', email: 'doctor.neuro@clinovexa.com', department: 'Neurology', isClaimed: true },
      { staffId: 'REC-1001', role: ROLES.RECEPTIONIST, name: 'Hannah Abbott', email: 'receptionist@clinovexa.com', department: 'Front Desk', isClaimed: true },
      { staffId: 'LAB-1001', role: ROLES.LAB_TECH, name: 'Marcus Brody', email: 'labtech@clinovexa.com', department: 'Diagnostics Lab', isClaimed: true },

      // Unclaimed authorized staff IDs for new registration testing
      { staffId: 'ADM-1002', role: ROLES.ADMIN, name: 'Authorized Admin Candidate', email: 'newadmin@clinovexa.com', department: 'Operations Management', isClaimed: false },
      { staffId: 'DOC-1003', role: ROLES.DOCTOR, name: 'Dr. Julian Bashir', email: 'doctor.bashir@clinovexa.com', department: 'Genetics & Internal Medicine', isClaimed: false },
      { staffId: 'REC-1002', role: ROLES.RECEPTIONIST, name: 'Penny Higgins', email: 'receptionist.penny@clinovexa.com', department: 'Outpatient Reception', isClaimed: false },
      { staffId: 'LAB-1002', role: ROLES.LAB_TECH, name: 'Jemma Simmons', email: 'labtech.jemma@clinovexa.com', department: 'Biochemistry Lab', isClaimed: false }
    ]);

    logger.info('Creating Users across all 5 roles...');
    // 1. Admin
    const adminUser = await User.create({
      name: 'Eleanor Vance (Admin)',
      email: 'admin@clinovexa.com',
      password: 'Password123!',
      role: ROLES.ADMIN,
      staffId: 'ADM-1001',
      phone: '+1-555-0100'
    });
    staffRecords[0].claimedBy = adminUser._id;
    await staffRecords[0].save();

    // 2. Doctor 1 (Cardiologist)
    const doc1User = await User.create({
      name: 'Dr. Arthur Pendelton',
      email: 'doctor.cardio@clinovexa.com',
      password: 'Password123!',
      role: ROLES.DOCTOR,
      staffId: 'DOC-1001',
      phone: '+1-555-0101'
    });
    staffRecords[1].claimedBy = doc1User._id;
    await staffRecords[1].save();

    const doc1 = await Doctor.create({
      user: doc1User._id,
      specialization: 'Interventional Cardiology',
      department: 'Cardiology',
      licenseNumber: 'MD-CARD-88321',
      consultationFee: 150,
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: [{ startTime: '09:00', endTime: '17:00' }]
    });

    // 3. Doctor 2 (Neurologist)
    const doc2User = await User.create({
      name: 'Dr. Sophia Martinez',
      email: 'doctor.neuro@clinovexa.com',
      password: 'Password123!',
      role: ROLES.DOCTOR,
      staffId: 'DOC-1002',
      phone: '+1-555-0102'
    });
    staffRecords[2].claimedBy = doc2User._id;
    await staffRecords[2].save();

    const doc2 = await Doctor.create({
      user: doc2User._id,
      specialization: 'Clinical Neurology',
      department: 'Neurology',
      licenseNumber: 'MD-NEUR-44109',
      consultationFee: 180,
      workingDays: ['Monday', 'Wednesday', 'Friday'],
      timeSlots: [{ startTime: '10:00', endTime: '16:00' }]
    });

    // 4. Receptionist
    const recUser = await User.create({
      name: 'Hannah Abbott',
      email: 'receptionist@clinovexa.com',
      password: 'Password123!',
      role: ROLES.RECEPTIONIST,
      staffId: 'REC-1001',
      phone: '+1-555-0103'
    });
    staffRecords[3].claimedBy = recUser._id;
    await staffRecords[3].save();

    await Receptionist.create({
      user: recUser._id,
      employeeId: 'EMP-REC-01',
      deskNumber: 'Front Desk 1'
    });

    // 5. Lab Technician
    const labUser = await User.create({
      name: 'Marcus Brody',
      email: 'labtech@clinovexa.com',
      password: 'Password123!',
      role: ROLES.LAB_TECH,
      staffId: 'LAB-1001',
      phone: '+1-555-0104'
    });
    staffRecords[4].claimedBy = labUser._id;
    await staffRecords[4].save();

    await LabTechnician.create({
      user: labUser._id,
      employeeId: 'EMP-LAB-01',
      section: 'Hematology & Clinical Biochemistry'
    });

    // 6. Patients
    const pat1User = await User.create({
      name: 'James Walker',
      email: 'patient1@clinovexa.com',
      password: 'Password123!',
      role: ROLES.PATIENT,
      phone: '+1-555-0201'
    });
    const pat1 = await Patient.create({
      user: pat1User._id,
      dob: new Date('1982-05-14'),
      gender: 'Male',
      bloodGroup: 'O+',
      address: '742 Evergreen Terrace, Springfield',
      emergencyContact: { name: 'Sarah Walker', phone: '+1-555-0999', relation: 'Spouse' },
      allergies: ['Penicillin'],
      medicalHistory: ['Hypertension (2018)', 'Mild Hyperlipidemia']
    });

    const pat2User = await User.create({
      name: 'Clara Oswald',
      email: 'patient2@clinovexa.com',
      password: 'Password123!',
      role: ROLES.PATIENT,
      phone: '+1-555-0202'
    });
    const pat2 = await Patient.create({
      user: pat2User._id,
      dob: new Date('1991-11-23'),
      gender: 'Female',
      bloodGroup: 'A+',
      address: '10 Downing Street, London',
      allergies: ['Sulfa Drugs'],
      medicalHistory: ['Tension Headaches']
    });

    const pat3User = await User.create({
      name: 'Robert Langdon',
      email: 'patient3@clinovexa.com',
      password: 'Password123!',
      role: ROLES.PATIENT,
      phone: '+1-555-0203'
    });
    const pat3 = await Patient.create({
      user: pat3User._id,
      dob: new Date('1964-06-22'),
      gender: 'Male',
      bloodGroup: 'B-',
      address: '15 Harvard Yard, Cambridge, MA',
      allergies: [],
      medicalHistory: ['Asthma']
    });

    logger.info('Creating Appointments...');
    const today = new Date();
    const appt1 = await Appointment.create({
      patient: pat1._id,
      doctor: doc1._id,
      service: services[0]._id,
      appointmentDate: today,
      startTime: '09:30',
      endTime: '10:00',
      status: APPOINTMENT_STATUS.COMPLETED,
      reasonForVisit: 'Chest pain & shortness of breath during routine exertion',
      queueNumber: 1,
      createdBy: recUser._id
    });

    const appt2 = await Appointment.create({
      patient: pat2._id,
      doctor: doc2._id,
      service: services[1]._id,
      appointmentDate: today,
      startTime: '10:30',
      endTime: '11:00',
      status: APPOINTMENT_STATUS.CHECKED_IN,
      reasonForVisit: 'Recurrent migraine headaches with light sensitivity',
      queueNumber: 2,
      createdBy: recUser._id
    });

    const appt3 = await Appointment.create({
      patient: pat3._id,
      doctor: doc1._id,
      service: services[0]._id,
      appointmentDate: new Date(Date.now() + 86400000), // Tomorrow
      startTime: '11:00',
      endTime: '11:30',
      status: APPOINTMENT_STATUS.SCHEDULED,
      reasonForVisit: 'Annual cardiovascular risk screening',
      queueNumber: 1,
      createdBy: pat3User._id
    });

    logger.info('Creating Clinical Notes & Prescriptions...');
    const note1 = await ClinicalNote.create({
      appointment: appt1._id,
      patient: pat1._id,
      doctor: doc1._id,
      vitals: { bp: '138/88', pulse: 78, temp: 98.4, weight: 82, spo2: 97 },
      subjective: 'Patient reports mild substernal tightness when walking up 2 flights of stairs for past 2 weeks.',
      objective: 'S1/S2 present, no murmurs. Lungs clear to auscultation bilaterally. EKG shows normal sinus rhythm without acute ST changes.',
      assessment: 'Stage 1 Essential Hypertension with mild angina on exertion.',
      plan: '1. Initiate Low Sodium Diet.\n2. Start Lisinopril 10mg daily.\n3. Order Lipid Panel & CBC.\n4. Follow up in 2 weeks.',
      aiSummary: '[CLINICAL SUMMARY]\n• Subjective: Exertional substernal tightness x2 weeks.\n• Exam: Vitals BP 138/88, HR 78, SpO2 97%. Normal heart/lung exam.\n• Assessment: Stage 1 Hypertension with mild exertional angina.\n• Plan: Lisinopril 10mg PO QD, Lipid Panel & CBC, 2-week follow-up.'
    });

    const rx1 = await Prescription.create({
      appointment: appt1._id,
      patient: pat1._id,
      doctor: doc1._id,
      medications: [
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily in the morning', duration: '30 days', instructions: 'Take with a full glass of water. Avoid potassium supplements.' },
        { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily at bedtime', duration: '30 days', instructions: 'Take with or without food.' }
      ],
      followUpDate: new Date(Date.now() + 14 * 86400000),
      generalInstructions: 'Maintain low-salt diet. Monitor BP daily at home.',
      aiPatientExplanation: '### 🩺 How to Take Your Medications & Care Instructions\n\nHere is a simplified guide based on your doctor\'s instructions:\n\n1. **Lisinopril (10mg)**: Take 1 pill every morning with water. This helps lower blood pressure.\n2. **Atorvastatin (20mg)**: Take 1 pill every night at bedtime. This helps lower cholesterol.\n\n*Note: Stay on a low-salt diet and write down your blood pressure numbers daily.*'
    });

    logger.info('Creating Lab Orders & Results...');
    const labOrder1 = await LabOrder.create({
      patient: pat1._id,
      doctor: doc1._id,
      appointment: appt1._id,
      tests: [{ service: services[2]._id, testName: 'Complete Blood Count (CBC)' }, { service: services[4]._id, testName: 'Lipid Panel' }],
      status: LAB_ORDER_STATUS.RELEASED,
      priority: 'ROUTINE',
      notes: 'Evaluate baseline lipids and hemoglobin',
      sampleCollectedAt: new Date(Date.now() - 3600000),
      sampleCollector: labUser._id
    });

    await LabResult.create({
      labOrder: labOrder1._id,
      patient: pat1._id,
      technician: labUser._id,
      testName: 'Lipid Panel',
      parameterResults: [
        { parameter: 'Total Cholesterol', value: '235', unit: 'mg/dL', referenceRange: '< 200', isAbnormal: true },
        { parameter: 'Triglycerides', value: '175', unit: 'mg/dL', referenceRange: '< 150', isAbnormal: true },
        { parameter: 'HDL Cholesterol', value: '45', unit: 'mg/dL', referenceRange: '> 40', isAbnormal: false },
        { parameter: 'LDL Cholesterol', value: '155', unit: 'mg/dL', referenceRange: '< 100', isAbnormal: true }
      ],
      remarks: 'Mild elevation in total cholesterol and LDL. Result verified.',
      isPublished: true,
      publishedAt: new Date(),
      verifiedBy: doc1User._id,
      verifiedAt: new Date(),
      status: LAB_RESULT_STATUS.RELEASED
    });

    logger.info('Creating Notifications...');
    await Notification.create([
      {
        user: pat1User._id,
        title: 'New Prescription Available',
        message: 'Dr. Arthur Pendelton issued a new prescription with 2 medications.',
        type: 'PRESCRIPTION',
        read: false,
        link: '/patient/dashboard#prescriptions'
      },
      {
        user: pat1User._id,
        title: 'Your Laboratory Report is Available',
        message: 'Your Lipid Panel test report has been published by Laboratory Diagnostics.',
        type: 'LAB_REPORT',
        read: false,
        link: '/patient/dashboard#labs'
      },
      {
        user: pat1User._id,
        title: 'Appointment Scheduled',
        message: 'Cardiology appointment scheduled with Dr. Arthur Pendelton.',
        type: 'APPOINTMENT',
        read: true,
        link: '/patient/dashboard#appointments'
      }
    ]);

    logger.info('Creating Invoices...');
    await Invoice.create({
      patient: pat1._id,
      appointment: appt1._id,
      invoiceNumber: 'INV-2026-001',
      items: [
        { description: 'General Cardiology Consultation', category: 'Consultation', quantity: 1, unitPrice: 150, amount: 150 },
        { description: 'Lipid Panel Lab Test', category: 'Laboratory', quantity: 1, unitPrice: 60, amount: 60 }
      ],
      subtotal: 210,
      discount: 10,
      tax: 0,
      total: 200,
      status: INVOICE_STATUS.PAID,
      paymentMethod: 'CARD',
      paidAt: new Date(),
      createdBy: recUser._id
    });

    logger.info('Creating Audit Logs...');
    await AuditLog.create({
      user: adminUser._id,
      userName: adminUser.name,
      userRole: ROLES.ADMIN,
      action: 'SYSTEM_SEED',
      entity: 'System',
      details: { note: 'Initial seed data initialized successfully' }
    });

    logger.info('✅ Database Seeding Completed Successfully!');
    logger.info('==================================================');
    logger.info('DEMO ACCOUNTS (Password for all: Password123!):');
    logger.info('1. Admin:         admin@clinovexa.com');
    logger.info('2. Doctor 1:      doctor.cardio@clinovexa.com');
    logger.info('3. Doctor 2:      doctor.neuro@clinovexa.com');
    logger.info('4. Receptionist:  receptionist@clinovexa.com');
    logger.info('5. Lab Tech:      labtech@clinovexa.com');
    logger.info('6. Patient 1:     patient1@clinovexa.com');
    logger.info('7. Patient 2:     patient2@clinovexa.com');
    logger.info('8. Patient 3:     patient3@clinovexa.com');
    logger.info('==================================================');

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
