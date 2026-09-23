# Clinovexa Role-Based Access Control (RBAC) Permission Matrix

This matrix defines the exact access controls enforced at both the API middleware layer (`rbacMiddleware.js`) and UI routing layer (`RoleRoute.jsx`).

| Feature / Domain | Clinic Admin | Doctor | Receptionist | Lab Technician | Patient |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Authentication & User Profile** |
| Register Patient Account | ✅ | ❌ | ✅ | ❌ | ✅ (Self) |
| Manage All User Accounts | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Clinic Services & Fees | ✅ | ❌ | ❌ | ❌ | ❌ |
| View System Audit Logs | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Appointments & Queue** |
| View Full Clinic Appointments | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Personal Appointments | ✅ | ✅ | ✅ | ❌ | ✅ |
| Schedule New Appointment | ✅ | ❌ | ✅ | ❌ | ✅ |
| Check In / Update Queue Status | ❌ | ✅ | ✅ | ❌ | ❌ |
| Conflict Detection Checking | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Electronic Medical Records (EMR)** |
| View Patient EMR Timeline | ✅ | ✅ | ❌ | ❌ | ✅ (Self) |
| Record SOAP Clinical Note | ❌ | ✅ | ❌ | ❌ | ❌ |
| AI Clinical Summary Generation (#1) | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Prescriptions & AI Guidance** |
| Issue Prescription Order | ❌ | ✅ | ❌ | ❌ | ❌ |
| View Prescription List | ✅ | ✅ | ❌ | ❌ | ✅ (Self) |
| AI Patient Instruction Explainer (#2)| ❌ | ✅ | ❌ | ❌ | ✅ |
| **Laboratory Workflow** |
| Create Diagnostic Lab Order | ❌ | ✅ | ❌ | ❌ | ❌ |
| Collect Sample & Process Order | ❌ | ❌ | ❌ | ✅ | ❌ |
| Enter Test Results & Parameters | ❌ | ❌ | ❌ | ✅ | ❌ |
| Verify & Release Lab Results | ❌ | ✅ | ❌ | ✅ | ❌ |
| View Released Lab Reports | ✅ | ✅ | ❌ | ✅ | ✅ (Self) |
| **Billing & Invoicing** |
| Generate Patient Invoice | ✅ | ❌ | ✅ | ❌ | ❌ |
| Process Payment & Mark Paid | ✅ | ❌ | ✅ | ❌ | ❌ |
| View Receipts & Invoices | ✅ | ❌ | ✅ | ❌ | ✅ (Self) |
