import React from 'react';
import { Zap, Play, CheckCircle2, AlertOctagon, Timer, Type, MousePointerClick, X } from 'lucide-react';

interface LiveSimulatorBarProps {
  currentScenario: string;
  onSetScenario: (scenario: 'healthy' | 'cta_missing' | 'title_changed' | 'server_error' | 'latency_spike') => void;
  onRunCheck: () => void;
  checking: boolean;
  onClose?: () => void;
}

export const LiveSimulatorBar: React.FC<LiveSimulatorBarProps> = ({
  currentScenario,
  onSetScenario,
  onRunCheck,
  checking,
  onClose,
}) => {
  const scenarios = [
    {
      id: 'healthy',
      label: 'Healthy Baseline',
      icon: CheckCircle2,
      desc: '200 OK, CTA Present, Baseline Verified',
    },
    {
      id: 'cta_missing',
      label: 'CTA Missing',
      icon: MousePointerClick,
      desc: 'Element #add-to-cart-button missing in DOM',
    },
    {
      id: 'server_error',
      label: '500 Outage',
      icon: AlertOctagon,
      desc: 'HTTP 500 Internal Server Error',
    },
    {
      id: 'title_changed',
      label: 'Title Altered',
      icon: Type,
      desc: 'Marketing campaign promo altered in <title>',
    },
    {
      id: 'latency_spike',
      label: 'Latency Spike',
      icon: Timer,
      desc: 'Response time drops to ~3800ms',
    },
  ];

  return (
    <div className="bg-[#0F172A] border-b border-slate-800 text-slate-200 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Info */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 flex-shrink-0">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs tracking-tight text-white">
                Live Scenario Injector
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Target: Apex Storefront
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Simulate real-world website regressions and watch SiteSentinel catch them
            </p>
          </div>
        </div>

        {/* Center: Scenario Selectors */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {scenarios.map((sc) => {
            const isSelected = currentScenario === sc.id;
            const Icon = sc.icon;
            return (
              <button
                key={sc.id}
                onClick={() => onSetScenario(sc.id as any)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-slate-800 text-white border border-slate-600 shadow-xs'
                    : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
                title={sc.desc}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{sc.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Run Check Now button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRunCheck}
            disabled={checking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-xs transition-colors disabled:opacity-50"
          >
            <Play className={`w-3 h-3 fill-current ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Analyzing...' : 'Run Check'}</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close injector bar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
