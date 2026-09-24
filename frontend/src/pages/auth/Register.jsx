import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Activity, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Calendar, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck, 
  Stethoscope, 
  UserCheck, 
  FlaskConical, 
  Heart,
  Award,
  Building,
  FileText
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

// Mirrors backend validation (backend/src/utils/phone.js): strip formatting,
// count digits, require 7-15. Frontend check is UX only — backend enforces.
const normalizePhoneClient = (input) => {
  if (input === undefined || input === null) return '';
  let value = String(input).trim();
  if (!value) return '';
  if (value.startsWith('00')) value = `+${value.slice(2)}`;
  const hasPlus = value.startsWith('+');
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return hasPlus ? `+${digits}` : digits;
};

const isValidPhoneClient = (input) => {
  const digits = normalizePhoneClient(input).replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
};

const ROLES_CONFIG = [
  {
    id: 'ADMIN',
    title: 'Admin',
    subtitle: 'System governance & clinic management',
    icon: ShieldCheck,
    buttonText: 'Create Admin Account →',
    staffIdPlaceholder: 'ADM-1002'
  },
  {
    id: 'DOCTOR',
    title: 'Doctor',
    subtitle: 'Physician care, prescriptions & encounters',
    icon: Stethoscope,
    buttonText: 'Create Doctor Account →',
    staffIdPlaceholder: 'DOC-1003'
  },
  {
    id: 'RECEPTIONIST',
    title: 'Receptionist',
    subtitle: 'Front desk scheduling & walk-in check-in',
    icon: UserCheck,
    buttonText: 'Create Receptionist Account →',
    staffIdPlaceholder: 'REC-1002'
  },
  {
    id: 'LAB_TECH',
    title: 'Lab Technician',
    subtitle: 'Diagnostic orders, test results & verification',
    icon: FlaskConical,
    buttonText: 'Create Lab Technician Account →',
    staffIdPlaceholder: 'LAB-1002'
  },
  {
    id: 'PATIENT',
    title: 'Patient',
    subtitle: 'Personal health portal, appointments & records',
    icon: Heart,
    buttonText: 'Create Patient Account →',
    staffIdPlaceholder: null
  }
];

const Register = () => {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('PATIENT');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    staffId: '',
    dob: '1995-05-15',
    gender: 'Select gender',
    bloodGroup: 'Select Blood Group',
    licenseNumber: '',
    specialization: 'General Medicine',
    qualification: 'MD / MBBS',
    yearsOfExperience: '5',
    employeeId: '',
    section: 'Clinical Diagnostics',
    certification: 'Certified Clinical Specialist',
    department: 'Administration'
  });
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'phone' && phoneError) setPhoneError('');
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleProceedToForm = (roleId) => {
    if (roleId) setSelectedRole(roleId);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // prevent duplicate submissions while processing
    setError('');
    setPhoneError('');

    // Client-side mobile validation (backend re-validates authoritatively)
    if (!formData.phone || !String(formData.phone).trim()) {
      setPhoneError('Mobile number is required.');
      setError('Please enter your mobile number.');
      return;
    }
    if (!isValidPhoneClient(formData.phone)) {
      setPhoneError('Please enter a valid mobile number (7-15 digits).');
      setError('Please enter a valid mobile number (7-15 digits).');
      return;
    }

    setLoading(true);

    try {
      const payload = { ...formData, role: selectedRole };
      const user = await register(payload);

      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (user.role === 'RECEPTIONIST') navigate('/receptionist/dashboard');
      else if (user.role === 'LAB_TECH') navigate('/lab/dashboard');
      else navigate('/patient/dashboard');
    } catch (err) {
      const fieldMessages = Array.isArray(err?.errors)
        ? err.errors.map((x) => x?.message).filter(Boolean)
        : [];
      const combined = [err?.message, ...fieldMessages].filter(Boolean).join(' ');
      const isPhoneConflict =
        /already registered/i.test(combined) && /mobile|phone/i.test(combined);
      const isPhoneValidation =
        /mobile|phone/i.test(combined) &&
        (/required|valid|7-15|digits/i.test(combined) || fieldMessages.length > 0);
      if (isPhoneConflict) {
        setPhoneError('This mobile number is already registered. Please use another mobile number or log in.');
        setError('This mobile number is already registered. Please use another mobile number or log in.');
      } else if (isPhoneValidation) {
        setPhoneError(fieldMessages[0] || err.message || 'Please enter a valid mobile number.');
        setError(fieldMessages[0] || err.message || 'Registration failed. Please check your inputs.');
      } else {
        setError(err.message || fieldMessages[0] || 'Registration failed. Please check your inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  const currentRoleObj = ROLES_CONFIG.find(r => r.id === selectedRole) || ROLES_CONFIG[4];
  const isStaffRole = selectedRole !== 'PATIENT';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-xl z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-teal-600 dark:text-teal-400 mb-1 shadow-xl shadow-teal-500/10">
            <Activity className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Create Your Clinovexa Account</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {step === 1 ? 'Select your role to get started' : `Complete your ${currentRoleObj.title} portal registration`}
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start space-x-3 text-rose-600 dark:text-rose-400 text-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-3">
                {ROLES_CONFIG.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <div
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      onDoubleClick={() => handleProceedToForm(role.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'bg-teal-500/10 dark:bg-teal-500/20 border-teal-500 ring-1 ring-teal-500 shadow-lg shadow-teal-500/10'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className={`p-2.5 rounded-xl ${
                          isSelected
                            ? 'bg-teal-500 text-slate-950 font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className={`text-sm font-bold ${
                            isSelected ? 'text-teal-600 dark:text-teal-400' : 'text-slate-900 dark:text-white'
                          }`}>
                            {role.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{role.subtitle}</p>
                        </div>
                      </div>

                      <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${
                        isSelected
                          ? 'bg-teal-500 text-slate-950 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {isSelected ? 'Selected' : 'Select'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => handleProceedToForm(selectedRole)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 flex items-center justify-center space-x-2 transition-all mt-4"
              >
                <span>Continue to {currentRoleObj.title} Registration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Role-Specific Form */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span> Change Role</span>
                </button>
                <div className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  <currentRoleObj.icon className="w-4 h-4 text-teal-500" />
                  <span>{currentRoleObj.title} Registration</span>
                </div>
              </div>

              {isStaffRole && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Hospital Staff Registration Restriction</span>
                  </p>
                  <p className="text-[11px]">
                    You must enter your hospital-issued Staff ID. Unclaimed test IDs available: 
                    <span className="font-mono font-bold ml-1">{currentRoleObj.staffIdPlaceholder}</span>
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Mandatory Staff ID for Hospital Staff Roles */}
                {isStaffRole && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Hospital / Staff ID (Required)
                    </label>
                    <div className="relative">
                      <FileText className="w-5 h-5 text-amber-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        name="staffId"
                        required
                        value={formData.staffId}
                        onChange={handleChange}
                        placeholder={`e.g. ${currentRoleObj.staffIdPlaceholder}`}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/50 text-slate-900 dark:text-slate-100 font-mono font-bold text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Common Fields: Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Common Fields: Password & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        name="password"
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 XXXXXXXXXX"
                        aria-invalid={Boolean(phoneError)}
                        className={`w-full pl-10 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border text-slate-900 dark:text-slate-100 text-sm focus:border-teal-500 focus:outline-none ${phoneError ? 'border-rose-500' : 'border-slate-300 dark:border-slate-800'}`}
                      />
                    </div>
                    {phoneError && (
                      <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{phoneError}</p>
                    )}
                  </div>
                </div>

                {/* PATIENT ROLE FIELDS */}
                {selectedRole === 'PATIENT' && (
                  <div className="space-y-4 pt-1">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">DOB</label>
                        <input
                          type="date"
                          name="dob"
                          required
                          value={formData.dob}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-teal-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-teal-500 focus:outline-none"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                        <select
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-teal-500 focus:outline-none"
                        >
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* DOCTOR ROLE FIELDS */}
                {selectedRole === 'DOCTOR' && (
                  <div className="space-y-4 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                          Medical License No.
                        </label>
                        <div className="relative">
                          <Award className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            name="licenseNumber"
                            required
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            placeholder="MD-884920"
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-teal-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                          Specialization
                        </label>
                        <input
                          type="text"
                          name="specialization"
                          required
                          value={formData.specialization}
                          onChange={handleChange}
                          placeholder="Cardiology / Internal Medicine"
                          className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>{currentRoleObj.buttonText}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 dark:text-teal-400 hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
