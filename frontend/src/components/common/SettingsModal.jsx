import React from 'react';
import Modal from './Modal';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Shield, Bell, Check, Sparkles, Monitor } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose }) => {
  const { theme, setTheme, isDark } = useTheme();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Clinovexa Workstation Settings" maxWidth="max-w-xl">
      <div className="space-y-6 text-slate-800 dark:text-slate-100">
        {/* Appearance & Theme Section */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Monitor className="w-4 h-4 text-teal-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Appearance & Interface Theme
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Dark Mode Card */}
            <div
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                isDark
                  ? 'bg-slate-900 border-teal-500 text-white shadow-lg shadow-teal-500/10'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-slate-800 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 text-teal-400">
                  <Moon className="w-5 h-5" />
                </div>
                {isDark && (
                  <span className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Dark Mode</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">High-contrast cyber slate theme for clinical low-light environments.</p>
              </div>
            </div>

            {/* Light Mode Card */}
            <div
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                !isDark
                  ? 'bg-white border-teal-500 text-slate-900 shadow-md shadow-teal-500/10'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
                  <Sun className="w-5 h-5" />
                </div>
                {!isDark && (
                  <span className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-xs">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Light Mode</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Clean clinical white interface optimized for bright day shifts.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Governance */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-teal-600 dark:text-teal-400">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">HIPAA & Security Compliance</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Session is protected by 256-bit AES encryption. Immutable audit trail logging is active for all patient care record modifications.
          </p>
        </div>

        {/* AI & Notification Preferences */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">AI Intelligence Assistance</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Automatic SOAP note summarization and plain-language patient explainer models are enabled across all workstations.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-500/20 transition-all"
        >
          Save & Apply Settings
        </button>
      </div>
    </Modal>
  );
};

export default SettingsModal;
