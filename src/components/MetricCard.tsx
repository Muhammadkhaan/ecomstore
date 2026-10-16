import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'critical' | 'neutral';
  };
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  onClick,
}) => {
  const renderIndicator = () => {
    if (!badge) return null;
    switch (badge.variant) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            {badge.text}
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            {badge.text}
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            {badge.text}
          </span>
        );
      case 'neutral':
      default:
        return (
          <span className="text-xs font-medium text-slate-500">
            {badge.text}
          </span>
        );
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-500">
          <Icon className="w-3.5 h-3.5 text-slate-600" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
          {value}
        </div>
        {renderIndicator()}
      </div>

      {subtitle && <p className="mt-2 text-xs text-slate-500 truncate leading-relaxed">{subtitle}</p>}
    </div>
  );
};
