import React, { useEffect, useRef, useState } from 'react';
import ChartJS from 'chart.js/auto';
import { CheckResult, Incident } from '../server/types.ts';
import { Activity, AlertTriangle } from 'lucide-react';

interface MonitoringChartProps {
  checkResults?: CheckResult[];
  incidents?: Incident[];
}

export const MonitoringChart: React.FC<MonitoringChartProps> = ({
  checkResults = [],
  incidents = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);
  const [viewMode, setViewMode] = useState<'success_rate' | 'changes' | 'incidents' | 'latency'>('success_rate');
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy existing chart on canvas if present
    try {
      const existingChart = ChartJS.getChart(canvasRef.current);
      if (existingChart) {
        existingChart.destroy();
      }
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    } catch (cleanupErr) {
      console.warn('Chart cleanup warning:', cleanupErr);
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const safeResults = Array.isArray(checkResults) ? checkResults : [];
    const safeIncidents = Array.isArray(incidents) ? incidents : [];

    const sorted = [...safeResults].sort(
      (a, b) => new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime()
    );

    const labels = sorted.map((c) => {
      try {
        const d = new Date(c.checkedAt);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch {
        return '';
      }
    });

    let datasets: any[] = [];
    let chartType: 'line' | 'bar' = 'bar';

    if (viewMode === 'success_rate') {
      chartType = 'bar';
      const successData = sorted.map((c) => (c.success ? 1 : 0));
      const failData = sorted.map((c) => (!c.success ? 1 : 0));
      datasets = [
        {
          label: 'Pass (Healthy)',
          data: successData,
          backgroundColor: '#16A34A',
          borderRadius: 3,
          barPercentage: 0.65,
        },
        {
          label: 'Fail (Alert Raised)',
          data: failData,
          backgroundColor: '#DC2626',
          borderRadius: 3,
          barPercentage: 0.65,
        },
      ];
    } else if (viewMode === 'changes') {
      chartType = 'bar';
      const changesData = sorted.map((c) => c.changesFoundCount || 0);
      datasets = [
        {
          label: 'Detected Changes',
          data: changesData,
          backgroundColor: '#D97706',
          borderRadius: 3,
          barPercentage: 0.55,
        },
      ];
    } else if (viewMode === 'incidents') {
      chartType = 'bar';
      const openCount = safeIncidents.filter((i) => i.status !== 'resolved').length;
      const ackCount = safeIncidents.filter((i) => i.status === 'acknowledged').length;
      const resCount = safeIncidents.filter((i) => i.status === 'resolved').length;

      datasets = [
        {
          label: 'Open Anomalies',
          data: [openCount],
          backgroundColor: '#DC2626',
          borderRadius: 3,
          barPercentage: 0.45,
        },
        {
          label: 'Acknowledged',
          data: [ackCount],
          backgroundColor: '#D97706',
          borderRadius: 3,
          barPercentage: 0.45,
        },
        {
          label: 'Resolved',
          data: [resCount],
          backgroundColor: '#16A34A',
          borderRadius: 3,
          barPercentage: 0.45,
        },
      ];
    } else if (viewMode === 'latency') {
      chartType = 'line';
      const latencyData = sorted.map((c) => c.responseTimeMs || 0);
      datasets = [
        {
          label: 'Response Latency (ms)',
          data: latencyData,
          borderColor: '#4F46E5',
          backgroundColor: 'rgba(79, 70, 229, 0.06)',
          borderWidth: 2,
          pointRadius: 2.5,
          pointHoverRadius: 5,
          pointBackgroundColor: '#4F46E5',
          fill: true,
          tension: 0.25,
        },
      ];
    }

    try {
      setRenderError(null);
      chartInstanceRef.current = new ChartJS(ctx, {
        type: chartType,
        data: {
          labels: viewMode === 'incidents' ? ['Workspace Incidents'] : (labels.length ? labels : ['Current']),
          datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                boxWidth: 8,
                boxHeight: 8,
                usePointStyle: true,
                pointStyle: 'circle',
                font: { family: 'Inter', size: 11, weight: 500 },
                color: '#64748B',
                padding: 12,
              },
            },
            tooltip: {
              backgroundColor: '#0F172A',
              titleColor: '#F8FAFC',
              bodyColor: '#E2E8F0',
              padding: 10,
              cornerRadius: 6,
              boxPadding: 4,
              usePointStyle: true,
              titleFont: { family: 'Inter', size: 11, weight: 600 },
              bodyFont: { family: 'Inter', size: 11 },
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                font: { family: 'Inter', size: 10 },
                color: '#94A3B8',
                maxTicksLimit: 8,
              },
              border: {
                color: '#E2E8F0',
              },
            },
            y: {
              grid: {
                color: 'rgba(241, 245, 249, 0.8)',
              },
              border: {
                dash: [4, 4],
                color: 'transparent',
              },
              ticks: {
                font: { family: 'Inter', size: 10 },
                color: '#94A3B8',
                stepSize: viewMode === 'success_rate' || viewMode === 'incidents' ? 1 : undefined,
              },
              beginAtZero: true,
            },
          },
        },
      });
    } catch (err: any) {
      console.error('Chart.js render error:', err);
      setRenderError(err?.message || 'Failed to render telemetry chart');
    }

    return () => {
      try {
        if (canvasRef.current) {
          const c = ChartJS.getChart(canvasRef.current);
          if (c) c.destroy();
        }
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
          chartInstanceRef.current = null;
        }
      } catch (e) {
        // cleanup ignore
      }
    };
  }, [checkResults, incidents, viewMode]);

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-3 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Monitoring Trends & Telemetry</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Database-backed check stability, detected changes, and incident status
          </p>
        </div>

        {/* Minimalist Segmented Control */}
        <div className="inline-flex items-center bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/60 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setViewMode('success_rate')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'success_rate'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pass / Fail
          </button>
          <button
            onClick={() => setViewMode('changes')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'changes'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Changes
          </button>
          <button
            onClick={() => setViewMode('incidents')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'incidents'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Incidents
          </button>
          <button
            onClick={() => setViewMode('latency')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'latency'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Latency
          </button>
        </div>
      </div>

      {renderError ? (
        <div className="h-60 w-full flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-slate-200 text-center p-4">
          <AlertTriangle className="w-7 h-7 text-amber-500 mb-2" />
          <p className="text-xs font-semibold text-slate-800">Chart rendering fallback</p>
          <p className="text-[11px] text-slate-500">{renderError}</p>
        </div>
      ) : (
        <div className="relative h-60 w-full">
          <canvas ref={canvasRef} />
        </div>
      )}
    </div>
  );
};
