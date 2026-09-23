import React, { useState } from 'react';
import Modal from './Modal';
import { Sparkles, Copy, Check, ShieldCheck, AlertTriangle } from 'lucide-react';

const AiSummaryModal = ({ isOpen, onClose, title, content, type = 'clinical' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'AI Medical Assistant Response'} maxWidth="max-w-3xl">
      {/* Safety Constraint Banner */}
      <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center space-x-3 text-xs text-teal-700 dark:text-teal-300">
        <ShieldCheck className="w-5 h-5 flex-shrink-0 text-teal-600 dark:text-teal-400" />
        <div>
          <span className="font-bold uppercase tracking-wider block text-teal-700 dark:text-teal-400">Strict Non-Diagnostic Constraint</span>
          <span>
            {type === 'clinical'
              ? 'AI generates concise clinical summaries for clinician review based strictly on doctor-entered SOAP notes.'
              : 'AI explains instructions in plain language without diagnosing or altering prescribed treatment.'}
          </span>
        </div>
      </div>

      {/* AI Output Content Container */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-500 dark:text-cyan-400 animate-pulse" />
            <span>Generated AI Output</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Output'}</span>
          </button>
        </div>

        <div className="text-sm leading-relaxed whitespace-pre-wrap font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80">
          {content || 'Generating AI insights...'}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all"
        >
          Close Assistant
        </button>
      </div>
    </Modal>
  );
};

export default AiSummaryModal;
