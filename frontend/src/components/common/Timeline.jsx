import React from 'react';
import { Calendar, FileText, Pill, FlaskConical, DollarSign, Clock, User, CheckCircle2 } from 'lucide-react';
import Badge from './Badge';

const Timeline = ({ events = [] }) => {
  if (!events || events.length === 0) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm font-medium">No medical timeline events recorded yet.</p>
      </div>
    );
  }

  const getEventIcon = (type) => {
    switch (type) {
      case 'APPOINTMENT':
        return { icon: Calendar, color: 'bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30' };
      case 'CLINICAL_NOTE':
        return { icon: FileText, color: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30' };
      case 'PRESCRIPTION':
        return { icon: Pill, color: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
      case 'LAB_ORDER':
        return { icon: FlaskConical, color: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30' };
      case 'INVOICE':
        return { icon: DollarSign, color: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' };
      default:
        return { icon: Clock, color: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700' };
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-300 dark:before:bg-slate-800">
      {events.map((event, index) => {
        const meta = getEventIcon(event.type);
        const Icon = meta.icon;

        return (
          <div key={index} className="relative group">
            {/* Timeline Dot Icon */}
            <div className={`absolute -left-[31px] top-1 p-1.5 rounded-full border shadow-md transition-all ${meta.color}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>

            {/* Event Card */}
            <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {event.title || event.type.replace('_', ' ')}
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {new Date(event.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{event.subtitle}</p>

              {event.details && (
                <div className="text-xs text-slate-700 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 whitespace-pre-wrap">
                  {event.details}
                </div>
              )}

              {event.badge && (
                <div className="pt-1">
                  <Badge status={event.badge} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
