# Clinovexa — Intelligent Multi-Role Clinic Management System

Clinovexa is a capstone MERN-stack (MongoDB, Express, React, Node.js) Clinic Management Application designed for coordinated healthcare workflows across 5 distinct roles: **Clinic Admin**, **Doctor**, **Receptionist**, **Lab Technician**, and **Patient**.

---

## 🌟 Key Features

1. **Role-Based Workstations & Access Control (RBAC)**:
   - **Clinic Admin**: Manage users, services, billing rates, system stats, and view immutable audit logs.
   - **Doctor**: Manage patient queue, record SOAP notes, trigger AI Clinical Summaries, issue prescriptions, and order lab tests.
   - **Receptionist**: Register patients, schedule appointments with conflict detection, manage daily queue status, and handle billing counter.
   - **Lab Technician**: Manage multi-stage lab pipeline (`CREATED` → `SAMPLE_COLLECTED` → `PROCESSING` → `VERIFIED` → `RELEASED`), record parameters, and flag abnormal results.
   - **Patient**: View health portal, unified EMR timeline, appointments, prescriptions with plain-language AI instructions, lab reports, and invoice receipts.

2. **AI Assistance Features**:
   - **AI Integration #1**: Summarize structured SOAP visit notes into concise clinical summaries for physician review.
   - **AI Integration #2**: Translate prescription dosages & follow-up instructions into clear, non-diagnostic plain language for patients.

3. **Audit Logging & Security**:
   - Every mutating operation (clinical notes, prescriptions, lab results, invoices) is logged to an immutable `AuditLog` collection.
   - Server-side input validation on all write routes.
   - JWT-based authentication with role-aware route middleware.

---

## 🛠️ Project Structure

```
Clinovexa/
├── backend/
│   ├── src/
│   │   ├── config/ (db.js, env.js)
│   │   ├── controllers/ (auth, admin, user, appointment, clinical, lab, billing, ai)
│   │   ├── middleware/ (authMiddleware, rbacMiddleware, auditMiddleware, validateRequest, errorHandler)
│   │   ├── models/ (User, Patient, Doctor, Receptionist, LabTechnician, Service, Appointment, ClinicalNote, Prescription, LabOrder, LabResult, Invoice, AuditLog)
│   │   ├── routes/ (auth, admin, user, appointment, clinical, lab, billing, ai)
│   │   ├── services/ (conflictDetection, aiService)
│   │   └── tests/ (auth.test.js, rbac.test.js, appointments.test.js)
│   ├── seed.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/ (Navbar, Sidebar, Layout, Modal, Badge, Timeline, AiSummaryModal)
│   │   ├── context/ (AuthContext.jsx)
│   │   ├── hooks/ (useAuth.js)
│   │   ├── pages/ (Login, Register, AdminDashboard, DoctorDashboard, ReceptionistDashboard, LabDashboard, PatientDashboard)
│   │   ├── routes/ (ProtectedRoute.jsx, RoleRoute.jsx)
│   │   ├── services/ (api.js)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── docs/
    ├── API_SPEC.md
    └── ROLE_MATRIX.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://localhost:27017/clinovexa` or in-memory fallback enabled automatically)

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed     # Populate realistic demo accounts & sample workflow data
npm start        # Starts server on http://localhost:5000
```

### 3. Running Automated Tests
```bash
cd backend
npm test         # Runs Jest test suite covering Auth, RBAC, and Conflict Detection
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## 🔑 Pre-Configured Demo Accounts (Password for all: `Password123!`)

| Role | Email | Features / Scope |
| :--- | :--- | :--- |
| **Admin** | `admin@clinovexa.com` | User management, Services, System Stats, Audit Logs |
| **Doctor (Cardiology)** | `doctor.cardio@clinovexa.com` | EMR Queue, SOAP Notes, AI Clinical Summary, Prescriptions, Lab Orders |
| **Doctor (Neurology)** | `doctor.neuro@clinovexa.com` | Specialist queue, clinical notes, follow-up scheduler |
| **Receptionist** | `receptionist@clinovexa.com` | Patient Registration, Conflict Checking, Queue Toggles, Counter Invoicing |
| **Lab Technician** | `labtech@clinovexa.com` | Sample Collection, Test Parameters, Result Entry, Verification & Release |
| **Patient 1** | `patient1@clinovexa.com` | Health Portal, EMR Timeline, AI Prescription Explainer, Lab Reports |
| **Patient 2** | `patient2@clinovexa.com` | Appointment History & Receipts |
