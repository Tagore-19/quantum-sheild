/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Q-SHIELD: Quantum Analytics & Telemetry Comparison
 * Interactive charts for QBER vs Eve Interception, noise correlation, and session history
 */

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Layers,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { SimulationSession } from '../types/qkd.ts';

interface AnalyticsViewProps {
  currentSession: SimulationSession;
  sessionsHistory: SimulationSession[];
  onSelectSession: (s: SimulationSession) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  currentSession,
  sessionsHistory,
  onSelectSession,
}) => {
  const [exportFormat, setExportFormat] = useState<'JSON' | 'CSV'>('JSON');

  // Synthetic or accumulated data points for QBER vs Eve Interception curve
  // Eve Interception from 0% to 100% -> Theoretical error: 0% to 25%
  const interceptionPoints = [
    { eveRate: 0, theoreticalQber: 0, label: '0%' },
    { eveRate: 20, theoreticalQber: 5.0, label: '20%' },
    { eveRate: 40, theoreticalQber: 10.0, label: '40%' },
    { eveRate: 60, theoreticalQber: 15.0, label: '60%' },
    { eveRate: 80, theoreticalQber: 20.0, label: '80%' },
    { eveRate: 100, theoreticalQber: 25.0, label: '100%' },
  ];

  // Aggregated session statistics
  const totalSessions = sessionsHistory.length;
  const secureSessions = sessionsHistory.filter(
    (s) => s.metrics.securityStatus === 'SECURE'
  ).length;
  const rejectedSessions = sessionsHistory.filter(
    (s) =>
      s.metrics.securityStatus === 'KEY_REJECTED' ||
      s.metrics.securityStatus === 'POTENTIAL_EAVESDROPPING'
  ).length;

  const handleExportData = () => {
    if (exportFormat === 'JSON') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessionsHistory, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `q-shield-telemetry-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      let csvContent = 'data:text/csv;charset=utf-8,SessionID,Timestamp,QubitsSent,SiftedBits,QBER_Percent,EveActive,EveRate,Noise,Status\n';
      sessionsHistory.forEach((s) => {
        csvContent += `${s.sessionId},${s.timestamp},${s.metrics.totalQubitsSent},${s.metrics.siftedBitsCount},${s.metrics.qberPercentage},${s.parameters.eveEnabled},${s.parameters.eveInterceptionRate},${s.parameters.channelNoise},${s.metrics.securityStatus}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `q-shield-telemetry-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Quantum Analytics & Telemetry Comparison
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare theoretical quantum mechanics predictions with observed simulation error rates and key yields.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as any)}
            className="bg-slate-950 border border-slate-750 rounded px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
          >
            <option value="JSON">Format: JSON</option>
            <option value="CSV">Format: CSV</option>
          </select>
          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Telemetry</span>
          </button>
        </div>
      </div>

      {/* Primary Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: QBER vs Eve Interception % */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                QBER vs. Eve Interception Rate (p_eve)
              </h3>
              <p className="text-xs text-slate-400">
                Comparing theoretical 25% curve against current simulation run
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
              Theoretical: QBER = 0.25 · p_eve
            </span>
          </div>

          {/* SVG Chart */}
          <div className="h-56 w-full relative pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 400 160">
              {/* Background grid lines */}
              <line x1="40" y1="20" x2="380" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="40" y1="60" x2="380" y2="60" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="40" y1="100" x2="380" y2="100" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="40" y1="140" x2="380" y2="140" stroke="#334155" />

              {/* Y-axis labels */}
              <text x="32" y="24" fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">30%</text>
              <text x="32" y="64" fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">20%</text>
              <text x="32" y="104" fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">10%</text>
              <text x="32" y="144" fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">0%</text>

              {/* Security threshold line (11%) */}
              <line
                x1="40"
                y1={140 - (currentSession.parameters.securityThreshold * 100 / 30) * 120}
                x2="380"
                y2={140 - (currentSession.parameters.securityThreshold * 100 / 30) * 120}
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <text
                x="375"
                y={136 - (currentSession.parameters.securityThreshold * 100 / 30) * 120}
                fill="#f43f5e"
                fontSize="8"
                textAnchor="end"
                fontFamily="monospace"
              >
                Threshold ({(currentSession.parameters.securityThreshold * 100).toFixed(0)}%)
              </text>

              {/* Theoretical linear curve path (0% to 25% QBER) */}
              {/* x goes from 40 to 380, y goes from 140 to 140 - (25/30)*120 = 40 */}
              <line x1="40" y1="140" x2="380" y2="40" stroke="#a855f7" strokeWidth="2" />

              {/* Theoretical markers */}
              {interceptionPoints.map((pt, idx) => {
                const cx = 40 + (idx / (interceptionPoints.length - 1)) * 340;
                const cy = 140 - (pt.theoreticalQber / 30) * 120;
                return (
                  <circle
                    key={pt.label}
                    cx={cx}
                    cy={cy}
                    r="3"
                    fill="#a855f7"
                  />
                );
              })}

              {/* Current Session Point Highlight */}
              {(() => {
                const eveRate = currentSession.parameters.eveEnabled ? currentSession.parameters.eveInterceptionRate : 0;
                const cx = 40 + eveRate * 340;
                const cy = Math.max(20, Math.min(140, 140 - (currentSession.metrics.qberPercentage / 30) * 120));
                return (
                  <g>
                    <circle cx={cx} cy={cy} r="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
                    <text x={cx} y={cy - 10} fill="#38bdf8" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                      Current: {currentSession.metrics.qberPercentage}%
                    </text>
                  </g>
                );
              })()}

              {/* X-axis labels */}
              <text x="40" y="155" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">0%</text>
              <text x="125" y="155" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">25%</text>
              <text x="210" y="155" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">50%</text>
              <text x="295" y="155" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">75%</text>
              <text x="380" y="155" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">100%</text>
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
              Theoretical BB84 Curve
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
              Active Simulation Data Point
            </span>
          </div>
        </div>

        {/* Chart 2: Key Generation & Session Health Distribution */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Session Acceptance vs Rejection Summary
              </h3>
              <p className="text-xs text-slate-400">
                Audited outcomes across historical simulation runs
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
              Total Runs: {totalSessions}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-950 p-4 rounded-lg border border-emerald-900/60 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Trusted Sessions</p>
                <p className="text-2xl font-bold font-mono text-emerald-300">{secureSessions}</p>
                <p className="text-[10px] text-slate-500 font-mono">QBER &lt; Threshold</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-rose-900/60 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-rose-950 text-rose-400 border border-rose-800">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Rejected Sessions</p>
                <p className="text-2xl font-bold font-mono text-rose-300">{rejectedSessions}</p>
                <p className="text-[10px] text-slate-500 font-mono">Eavesdropping or noise</p>
              </div>
            </div>
          </div>

          {/* Sifting Efficiency Explanation */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300">Sifting Yield Invariant:</span>
              <span className="font-mono text-cyan-300 font-bold">~50.0%</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Because Alice and Bob randomly choose between two conjugate bases ($Z$ and $X$), their choices match with probability $P(b_A = b_B) = 0.5$. Exactly ~50% of transmitted qubits survive classical sifting.
            </p>
          </div>
        </div>
      </div>

      {/* Session History Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          Simulation Run History & Parameter Registry
        </h3>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-2.5">Time</th>
                <th className="p-2.5">Session ID</th>
                <th className="p-2.5">Qubits</th>
                <th className="p-2.5">Eve Probe</th>
                <th className="p-2.5">Noise</th>
                <th className="p-2.5">Sifted</th>
                <th className="p-2.5">QBER</th>
                <th className="p-2.5">Key Status</th>
                <th className="p-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 font-mono">
              {sessionsHistory.map((s) => (
                <tr
                  key={s.sessionId}
                  className={`hover:bg-slate-800/50 transition-colors ${
                    s.sessionId === currentSession.sessionId ? 'bg-cyan-950/20' : ''
                  }`}
                >
                  <td className="p-2.5 text-slate-400">
                    {new Date(s.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-2.5 text-slate-300">{s.sessionId.substring(0, 14)}...</td>
                  <td className="p-2.5">{s.metrics.totalQubitsSent}</td>
                  <td className="p-2.5">
                    {s.parameters.eveEnabled
                      ? `${Math.round(s.parameters.eveInterceptionRate * 100)}%`
                      : 'OFF'}
                  </td>
                  <td className="p-2.5">{(s.parameters.channelNoise * 100).toFixed(1)}%</td>
                  <td className="p-2.5">{s.metrics.siftedBitsCount}</td>
                  <td className="p-2.5 font-bold">
                    <span
                      className={
                        s.metrics.securityStatus === 'SECURE'
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }
                    >
                      {s.metrics.qberPercentage}%
                    </span>
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        s.metrics.keyStatus === 'VALID_FOR_SIMULATION'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {s.metrics.keyStatus === 'VALID_FOR_SIMULATION' ? 'VALID' : 'REJECTED'}
                    </span>
                  </td>
                  <td className="p-2.5 text-right">
                    <button
                      onClick={() => onSelectSession(s)}
                      className="text-cyan-400 hover:text-cyan-200 text-xs cursor-pointer font-sans"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
