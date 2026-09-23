# Clinovexa REST API Specification

All API endpoints are prefixed with `/api` and return structured JSON responses:
```json
{
  "success": true,
  "data": {},
  "message": "Optional response summary message"
}
```

---

## 1. Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new patient account.
- `POST /api/auth/login` — Authenticate user and return JWT Bearer token.
- `GET /api/auth/me` — Return current authenticated user profile.

---

## 2. Administration (`/api/admin`) — Guarded by `ADMIN` role
- `GET /api/admin/stats` — Return clinic system metrics (total users, appointments, revenue, lab orders).
- `GET /api/admin/users` — List all registered users across all 5 roles.
- `POST /api/admin/users` — Create staff account (Doctor, Receptionist, Lab Tech, Admin).
- `GET /api/admin/services` — List clinic service catalog & pricing.
- `POST /api/admin/services` — Create new clinic service/procedure.
- `GET /api/admin/audit-logs` — Retrieve immutable audit logs feed.

---

## 3. Appointments (`/api/appointments`)
- `GET /api/appointments` — List appointments (`ADMIN`, `DOCTOR`, `RECEPTIONIST`).
- `GET /api/appointments/my-appointments` — List current patient's appointments (`PATIENT`).
- `POST /api/appointments` — Book new appointment slot (Enforces schedule conflict detection).
- `PATCH /api/appointments/:id/status` — Update appointment status (`SCHEDULED`, `CHECKED_IN`, `IN_CONSULTATION`, `COMPLETED`, `CANCELLED`).

---

## 4. Clinical EMR & Prescriptions (`/api/clinical`)
- `POST /api/clinical/notes` — Save SOAP clinical note (`DOCTOR`). Writes audit log entry.
- `GET /api/clinical/patients/:patientId/timeline` — Retrieve unified patient timeline.
- `POST /api/clinical/prescriptions` — Issue prescription (`DOCTOR`). Writes audit log entry.
- `GET /api/clinical/prescriptions/my-prescriptions` — View patient's prescriptions (`PATIENT`).

---

## 5. Laboratory Workflow (`/api/lab`)
- `GET /api/lab/orders` — List lab diagnostic orders.
- `POST /api/lab/orders` — Create new lab order (`DOCTOR`).
- `PATCH /api/lab/orders/:id/status` — Advance lab pipeline (`CREATED` → `SAMPLE_COLLECTED` → `PROCESSING` → `RELEASED`).
- `POST /api/lab/results` — Record parameter measurements & verify results (`LAB_TECH`, `DOCTOR`).
- `GET /api/lab/results/my-results` — View released lab results (`PATIENT`).

---

## 6. Billing & Invoices (`/api/billing`)
- `GET /api/billing/invoices` — List clinic invoices (`ADMIN`, `RECEPTIONIST`).
- `POST /api/billing/invoices` — Generate invoice for consultation/lab services (`RECEPTIONIST`).
- `PATCH /api/billing/invoices/:id/pay` — Mark invoice as paid (`RECEPTIONIST`).
- `GET /api/billing/invoices/my-invoices` — View patient invoices (`PATIENT`).

---

## 7. AI Integrations (`/api/ai`)
- `POST /api/ai/summarize-clinical-note` — Convert SOAP note into concise clinical summary for clinician review.
- `POST /api/ai/explain-prescription` — Explain medications & follow-up instructions in plain, non-diagnostic language for patients.
