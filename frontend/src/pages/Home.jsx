import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Activity,
  Shield,
  Bot,
  FileText,
  Users,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Stethoscope,
  Building2,
  Microscope,
  UserCheck,
  Zap,
  Lock,
  Sparkles,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activePortalTab, setActivePortalTab] = useState('doctor');

  const portals = [
    {
      id: 'admin',
      title: 'Administrator Portal',
      role: 'ADMIN',
      icon: Building2,
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      description: 'Comprehensive oversight of hospital operations, financial analytics, department performance, and authorized Staff ID management.',
      features: [
        'Pre-authorize Hospital Staff IDs for secure onboarding',
        'Real-time revenue tracking & invoice summaries',
        'Department-wide audit logs and active user tracking',
        'System configuration & role permission management'
      ]
    },
    {
      id: 'doctor',
      title: 'Doctor Portal',
      role: 'DOCTOR',
      icon: Stethoscope,
      badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      description: 'Efficient clinical workflow management for physicians, from outpatient queues to digital prescriptions and SOAP notes.',
      features: [
        'Real-time daily patient queue & consultation scheduling',
        'SOAP clinical note entry (Subjective, Objective, Assessment, Plan)',
        'Digital prescription generation with automatic patient notifications',
        'Direct access to published lab test PDFs and patient history'
      ]
    },
    {
      id: 'receptionist',
      title: 'Reception Desk Portal',
      role: 'RECEPTIONIST',
      icon: Users,
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      description: 'Front-desk efficiency with intelligent slot conflict detection, fast patient check-in, and billing management.',
      features: [
        'Conflict-free appointment booking algorithm',
        'One-click patient check-in and queue status updates',
        'Patient profile creation & demographic management',
        'Invoice generation, payment recording & receipt printing'
      ]
    },
    {
      id: 'lab',
      title: 'Lab Technician Portal',
      role: 'LAB_TECH',
      icon: Microscope,
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      description: 'Streamlined diagnostic lab workflow from specimen intake to PDF report upload and instant publication.',
      features: [
        'Lab test order tracking (Pending, In-Progress, Completed)',
        'PDF lab report file upload with in-browser preview',
        'Automated notification dispatch upon report publication',
        'Specimen collection status tracking & range validations'
      ]
    },
    {
      id: 'patient',
      title: 'Patient Portal',
      role: 'PATIENT',
      icon: UserCheck,
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      description: 'Empowering patients with 24/7 access to their health records, AI prescription insights, and lab reports.',
      features: [
        'Interactive AI Prescription Assistant with safety guardrails',
        'Secure PDF lab report viewing and downloading',
        'Upcoming appointment schedules & historical medical timeline',
        'Billing receipts, active prescriptions & digital notifications'
      ]
    }
  ];

  const demoAccounts = [
    { role: 'Admin', email: 'admin@clinovexa.com', staffId: 'ADM-9988', color: 'border-purple-500/30' },
    { role: 'Doctor', email: 'dr.sarah@clinovexa.com', staffId: 'DOC-1024', color: 'border-teal-500/30' },
    { role: 'Receptionist', email: 'reception@clinovexa.com', staffId: 'REC-2048', color: 'border-blue-500/30' },
    { role: 'Lab Tech', email: 'lab@clinovexa.com', staffId: 'LAB-3096', color: 'border-amber-500/30' },
    { role: 'Patient', email: 'john.doe@example.com', staffId: 'Self-Registered', color: 'border-cyan-500/30' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-slate-950 relative overflow-hidden">
      {/* Background Decorative Glow Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-teal-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-2/3 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Navbar Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Activity className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-teal-400 bg-clip-text text-transparent">
                Clinovexa
              </span>
              <span className="text-[10px] block font-mono text-teal-400/80 tracking-widest uppercase font-semibold">
                Healthcare OS
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-teal-400 transition-colors">Features</a>
            <a href="#portals" className="hover:text-teal-400 transition-colors">Portals</a>
            <a href="#ai-assistant" className="hover:text-teal-400 transition-colors">AI Assistant</a>
            <a href="#security" className="hover:text-teal-400 transition-colors">Security</a>
            <a href="#demo" className="hover:text-teal-400 transition-colors">Demo Accounts</a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <button
                onClick={() => {
                  switch (user.role) {
                    case 'ADMIN': navigate('/admin/dashboard'); break;
                    case 'DOCTOR': navigate('/doctor/dashboard'); break;
                    case 'RECEPTIONIST': navigate('/receptionist/dashboard'); break;
                    case 'LAB_TECH': navigate('/lab/dashboard'); break;
                    case 'PATIENT': navigate('/patient/dashboard'); break;
                    default: navigate('/login');
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-semibold text-sm shadow-md shadow-teal-500/20 flex items-center space-x-2 transition-all"
              >
                <span>Go to Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-semibold text-sm shadow-md shadow-teal-500/20 flex items-center space-x-1.5 transition-all"
                >
                  <span>Register</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-medium mb-8 backdrop-blur-sm animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Unified Enterprise Hospital Management & Patient Portal</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-[1.1]">
          Modern Healthcare Management <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Powered by AI & Live Automation
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Clinovexa seamlessly connects hospital staff, lab technicians, physicians, and patients into a single secure platform with smart scheduling, digital prescriptions, PDF lab delivery, and AI guidance.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
          <button
            onClick={() => navigate(user ? '/patient/dashboard' : '/login')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-400 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-base shadow-xl shadow-teal-500/25 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <a
            href="#portals"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-base transition-all flex items-center justify-center space-x-2"
          >
            <span>Explore 5 Portals</span>
          </a>
        </div>

        {/* Key Platform Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="text-3xl font-bold text-white mb-1">5 Portals</div>
            <div className="text-xs text-slate-400 font-medium">Role-Based Access Control</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="text-3xl font-bold text-teal-400 mb-1">100%</div>
            <div className="text-xs text-slate-400 font-medium">Staff ID Verification Security</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="text-3xl font-bold text-cyan-400 mb-1">PDF Direct</div>
            <div className="text-xs text-slate-400 font-medium">Lab Upload & Auto Notifications</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="text-3xl font-bold text-purple-400 mb-1">24/7 AI</div>
            <div className="text-xs text-slate-400 font-medium">Prescription Safety Assistant</div>
          </div>
        </div>
      </section>

      {/* Portals Showcase Section */}
      <section id="portals" className="py-20 bg-slate-900/40 border-y border-slate-800/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              5 Dedicated Role Portals
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Every staff member and patient gets a tailored workspace designed explicitly for their daily workflow and data privileges.
            </p>
          </div>

          {/* Portal Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {portals.map((portal) => {
              const Icon = portal.icon;
              const isActive = activePortalTab === portal.id;
              return (
                <button
                  key={portal.id}
                  onClick={() => setActivePortalTab(portal.id)}
                  className={`flex items-center space-x-2.5 px-5 py-3 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 font-bold shadow-lg shadow-teal-500/20'
                      : 'bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{portal.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Portal Detail Card */}
          {portals.filter(p => p.id === activePortalTab).map((portal) => {
            const Icon = portal.icon;
            return (
              <div key={portal.id} className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-slate-800">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
                      <Icon className="w-7 h-7 text-teal-400" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-2xl font-bold text-white">{portal.title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${portal.badgeColor}`}>
                          {portal.role}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">{portal.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/login')}
                    className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-teal-400 font-semibold text-sm border border-slate-700/80 flex items-center space-x-2 transition-all"
                  >
                    <span>Login to {portal.role} Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {portal.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI Prescription Assistant Highlight Section */}
      <section id="ai-assistant" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium mb-6">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>Smart Clinical AI Guidance</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
              AI Prescription Assistant <br />
              <span className="text-purple-400">Clear Explanations for Patients</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed mb-8">
              Patients no longer need to wonder about complicated medical terminology. Clinovexa's built-in AI assistant breaks down prescription instructions, dosage intervals, and precautions in simple language with mandatory medical safety guardrails.
            </p>

            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-base">Instant Preset Queries</h4>
                  <p className="text-slate-400 text-sm">One-click answers for "What is this medicine for?", "How to take?", and "Dosage breakdown".</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-base">Educational Guardrails</h4>
                  <p className="text-slate-400 text-sm">Enforces strict medical disclaimer headers advising consultation with prescribing doctors.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive UI Mockup */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">AI Prescription Assistant</h5>
                  <span className="text-[11px] text-purple-400 font-mono">Prescription #RX-8849</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                Active AI Guardrail
              </span>
            </div>

            {/* Chat bubbles */}
            <div className="space-y-3 mb-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/80 text-slate-200 border border-slate-700/60 max-w-[85%] self-end ml-auto">
                💬 <strong>Patient:</strong> "How should I take Amoxicillin 500mg?"
              </div>

              <div className="p-3.5 rounded-xl bg-purple-950/40 text-slate-200 border border-purple-500/30 max-w-[95%]">
                <div className="font-bold text-purple-300 mb-1">🤖 AI Explanation:</div>
                <p className="text-slate-300 mb-2 leading-relaxed">
                  Take 1 capsule every 8 hours with a full glass of water. It is best taken at evenly spaced intervals around the clock.
                </p>
                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                  ⚠️ <em>Educational disclaimer: Always follow your doctor's exact written dosage instructions.</em>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                disabled
                value="What precautions should I take with this medicine?"
                className="w-full bg-slate-950 border border-slate-800 text-slate-400 text-xs rounded-lg px-3 py-2"
              />
              <button disabled className="px-3 py-2 bg-purple-600 text-white font-bold rounded-lg text-xs">
                Ask
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Authorization Section */}
      <section id="security" className="py-20 bg-slate-900/40 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-medium mb-4">
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              <span>Hospital Staff Authorization Protocol</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Strict Hospital Staff ID Validation
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              To prevent unauthorized access to clinical systems, staff registration requires a pre-authorized Hospital Staff ID issued by the Hospital Administrator.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Staff ID Verification</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Staff accounts (`ADMIN`, `DOCTOR`, `RECEPTIONIST`, `LAB_TECH`) cannot register without a valid, un-claimed Staff ID matching their role.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">JWT & Role Verification</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Attempting to access a portal with an incompatible user role displays exact error messages and redirects to the correct portal.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Secure PDF Streaming</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Lab report PDFs are protected by server-side authorization headers to ensure only authorized patients and physicians can view test files.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Credentials Section */}
      <section id="demo" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Instant Demo Credentials</h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mb-8">
            You can log into any portal using the pre-seeded credentials below (Password: <code className="text-teal-400 font-mono font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Password123!</code>).
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-5xl mx-auto mb-8">
            {demoAccounts.map((acc, idx) => (
              <div key={idx} className={`p-4 rounded-xl bg-slate-950/80 border ${acc.color} text-left`}>
                <div className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">{acc.role}</div>
                <div className="text-xs font-mono text-slate-200 truncate mb-1" title={acc.email}>{acc.email}</div>
                <div className="text-[11px] text-slate-500 font-mono">ID: {acc.staffId}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 inline-flex items-center space-x-2 transition-all"
          >
            <span>Sign In to Demo Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-10 bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-teal-400" />
            </div>
            <span className="font-semibold text-slate-300">Clinovexa Healthcare Platform</span>
          </div>

          <div className="flex items-center space-x-2 text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>All Systems Operational (v1.0.0)</span>
          </div>

          <p>© {new Date().getFullYear()} Clinovexa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
