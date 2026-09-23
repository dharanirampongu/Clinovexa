import React from 'react';

const Badge = ({ status, type = 'default' }) => {
  const getStatusStyles = (val) => {
    switch (String(val).toUpperCase()) {
      // Appointments & Workflow
      case 'SCHEDULED':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30';
      case 'CHECKED_IN':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'IN_CONSULTATION':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'COMPLETED':
      case 'VERIFIED':
      case 'RELEASED':
      case 'PAID':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';

      // Lab statuses
      case 'CREATED':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
      case 'SAMPLE_COLLECTED':
        return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
      case 'PROCESSING':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';

      // Billing
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';

      // Roles
      case 'ADMIN':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'DOCTOR':
        return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
      case 'RECEPTIONIST':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
      case 'LAB_TECH':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'PATIENT':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';

      default:
        return 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyles(status)}`}>
      {String(status).replace('_', ' ')}
    </span>
  );
};

export default Badge;
