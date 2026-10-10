/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Q-SHIELD: Interactive BB84 Quantum Key Distribution Simulator
 * Step-by-step pipeline, particle channel visualization, and qubit inspector table
 */

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  Zap,
  Filter,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  Key,
} from 'lucide-react';
import {
  SimulationParameters,
  SimulationSession,
  QubitTransmission,
} from '../types/qkd.ts';

interface QKDSimulatorViewProps {
  session: SimulationSession;
  parameters: SimulationParameters;
  onUpdateParameters: (params: Partial<SimulationParameters>) => void;
  onRunSimulation: () => void;
  onResetSimulation: () => void;
  isSimulating: boolean;
}

export const QKDSimulatorView: React.FC<QKDSimulatorViewProps> = ({
  session,
  parameters,
  onUpdateParameters,
  onRunSimulation,
  onResetSimulation,
  isSimulating,
}) => {
  const { metrics, qubits } = session;

  // Interactive table filters
  const [tableFilter, setTableFilter] = useState<'ALL' | 'KEPT' | 'DISCARDED' | 'ERRORS' | 'EVE'>('ALL');
  const [searchIndex, setSearchIndex] = useState('');
  const [selectedQubit, setSelectedQubit] = useState<QubitTransmission | null>(null);

  // Animation Step Simulation
  const [activePipelineStep, setActivePipelineStep] = useState<number>(10);
  const [isStepping, setIsStepping] = useState<boolean>(false);

  const pipelineSteps = [
    { id: 1, label: 'Alice Random Bits', desc: '0 or 1 generated from entropy source' },
    { id: 2, label: 'Basis Selection', desc: 'Alice randomly chooses Z or X basis' },
    { id: 3, label: 'State Encoding', desc: '|0⟩, |1⟩ (Z) or |+⟩, |–⟩ (X) polarization' },
    { id: 4, label: 'Quantum Channel', desc: 'Photons travel through dark optical fiber' },
    { id: 5, label: parameters.eveEnabled ? 'Eve Intercept-Resend' : 'Direct Channel', desc: parameters.eveEnabled ? 'Eve measures & collapses quantum state' : 'Channel noise applied' },
    { id: 6, label: 'Bob Measurement', desc: 'Bob measures in randomly chosen Z or X basis' },
    { id: 7, label: 'Basis Reconciliation', desc: 'Alice & Bob announce bases publicly' },
    { id: 8, label: 'Sifting Process', desc: 'Discard incompatible basis measurements' },
    { id: 9, label: 'QBER Estimation', desc: 'Compare subset of sifted bits for errors' },
    { id: 10, label: 'Final Secret Key', desc: metrics.keyStatus === 'VALID_FOR_SIMULATION' ? 'Validated shared simulation key' : 'Key rejected due to errors' },
  ];

  // Auto-step through the pipeline
  useEffect(() => {
    let timer: any;
    if (isStepping) {
      timer = setInterval(() => {
        setActivePipelineStep((prev) => {
          if (prev >= 10) {
            setIsStepping(false);
            return 10;
          }
          return prev + 1;
        });
      }, 700);
    }
    return () => clearInterval(timer);
  }, [isStepping]);

  const handleStartAnimatedRun = () => {
    setActivePipelineStep(1);
    setIsStepping(true);
    onRunSimulation();
  };

  const handleStepForward = () => {
    setActivePipelineStep((prev) => Math.min(10, prev + 1));
  };

  const filteredQubits = qubits.filter((q) => {
    if (searchIndex && !q.index.toString().includes(searchIndex)) return false;
    if (tableFilter === 'KEPT') return q.basisMatched;
    if (tableFilter === 'DISCARDED') return !q.basisMatched;
    if (tableFilter === 'ERRORS') return q.bitError;
    if (tableFilter === 'EVE') return q.interceptedByEve;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header: Controls Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              BB84 Protocol Simulator Control Center
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure quantum channel physics, Eve intercept-resend attack rate, and application security thresholds.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleStartAnimatedRun}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-md shadow-cyan-950/40 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isSimulating ? 'Simulating...' : 'Start Simulation'}</span>
            </button>

            <button
              onClick={() => setIsStepping(!isStepping)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              {isStepping ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isStepping ? 'Pause' : 'Auto-Step'}</span>
            </button>

            <button
              onClick={handleStepForward}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next Step</span>
            </button>

            <button
              onClick={() => {
                onUpdateParameters({ eveEnabled: true, eveInterceptionRate: 0.5 });
                setTimeout(onRunSimulation, 50);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-200 text-xs border border-rose-800/80 transition-colors cursor-pointer font-semibold"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Run Attack (50%)</span>
            </button>

            <button
              onClick={onResetSimulation}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs border border-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Configuration Sliders & Knobs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 pt-5">
          {/* 1. Qubit Count */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Qubits Sent</span>
              <span className="font-mono text-cyan-300 font-bold">{parameters.qubitCount}</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[50, 100, 500, 1000].map((num) => (
                <button
                  key={num}
                  onClick={() => onUpdateParameters({ qubitCount: num })}
                  className={`py-1 text-xs font-mono rounded cursor-pointer transition-colors ${
                    parameters.qubitCount === num
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Number of photons in pulse train</p>
          </div>

          {/* 2. Channel Noise */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Channel Noise</span>
              <span className="font-mono text-amber-300 font-bold">
                {(parameters.channelNoise * 100).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.2"
              step="0.01"
              value={parameters.channelNoise}
              onChange={(e) => onUpdateParameters({ channelNoise: parseFloat(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer bg-slate-800 h-1.5 rounded"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>0% (Ideal)</span>
              <span>10%</span>
              <span>20% (High)</span>
            </div>
          </div>

          {/* 3. Eve Toggle */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Eve Intercept-Resend</span>
              <span
                className={`font-mono text-xs font-bold px-1.5 py-0.2 rounded ${
                  parameters.eveEnabled
                    ? 'bg-purple-950 text-purple-300 border border-purple-800'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {parameters.eveEnabled ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
            <button
              onClick={() => onUpdateParameters({ eveEnabled: !parameters.eveEnabled })}
              className={`w-full py-1.5 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                parameters.eveEnabled
                  ? 'bg-purple-900/60 border-purple-500 text-purple-200'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {parameters.eveEnabled ? 'Disable Eve' : 'Enable Eve'}
            </button>
            <p className="text-[10px] text-slate-400 mt-1">Simulates middle interceptor</p>
          </div>

          {/* 4. Eve Interception Rate Slider */}
          <div className={parameters.eveEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Interception Rate</span>
              <span className="font-mono text-purple-300 font-bold">
                {Math.round(parameters.eveInterceptionRate * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={parameters.eveInterceptionRate}
              onChange={(e) => onUpdateParameters({ eveInterceptionRate: parseFloat(e.target.value) })}
              className="w-full accent-purple-400 cursor-pointer bg-slate-800 h-1.5 rounded"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>10%</span>
              <span>50%</span>
              <span>100% (Full)</span>
            </div>
          </div>

          {/* 5. Security Threshold */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Security Threshold</span>
              <span className="font-mono text-rose-300 font-bold">
                {(parameters.securityThreshold * 100).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.25"
              step="0.01"
              value={parameters.securityThreshold}
              onChange={(e) => onUpdateParameters({ securityThreshold: parseFloat(e.target.value) })}
              className="w-full accent-rose-400 cursor-pointer bg-slate-800 h-1.5 rounded"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>5%</span>
              <span>11% (BB84 Std)</span>
              <span>20%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Visual Pipeline */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>BB84 Protocol Execution Pipeline</span>
            <span className="text-xs font-normal text-slate-400">
              (Current Step: {activePipelineStep}/10)
            </span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Click any step to inspect theory
          </span>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
          {pipelineSteps.map((step) => {
            const isCompleted = activePipelineStep >= step.id;
            const isCurrent = activePipelineStep === step.id;

            return (
              <button
                key={step.id}
                onClick={() => setActivePipelineStep(step.id)}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer relative ${
                  isCurrent
                    ? 'bg-cyan-950/70 border-cyan-500 shadow-md shadow-cyan-950/50'
                    : isCompleted
                    ? 'bg-slate-900/90 border-slate-700 text-slate-200'
                    : 'bg-slate-950/50 border-slate-850 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    0{step.id}
                  </span>
                  {isCompleted && <CheckCircle className="w-3 h-3 text-cyan-400" />}
                </div>
                <p className="text-xs font-semibold text-slate-100 mt-1 truncate">
                  {step.label}
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                  {step.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Step Highlight Box */}
        <div className="mt-4 p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <span className="text-cyan-400 font-bold font-mono">
              STAGE 0{activePipelineStep}: {pipelineSteps[activePipelineStep - 1]?.label}
            </span>
            <p className="text-slate-300 text-[11px] mt-0.5">
              {pipelineSteps[activePipelineStep - 1]?.desc}
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span>Sifted Yield: {metrics.siftingRatio}%</span>
            <span>·</span>
            <span>Measured QBER: {metrics.qberPercentage}%</span>
            <span>·</span>
            <span className={metrics.keyStatus === 'VALID_FOR_SIMULATION' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {metrics.keyStatus === 'VALID_FOR_SIMULATION' ? 'KEY SECURE' : 'KEY REJECTED'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Qubit Inspector Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-400" />
              Microscopic Qubit Inspector Table
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect individual photon polarization states, basis choices, Eve collapse interventions, and measurement outcomes.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
              <input
                type="text"
                placeholder="Search index..."
                value={searchIndex}
                onChange={(e) => setSearchIndex(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none w-24"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800 text-[11px]">
              <button
                onClick={() => setTableFilter('ALL')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  tableFilter === 'ALL' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({qubits.length})
              </button>
              <button
                onClick={() => setTableFilter('KEPT')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  tableFilter === 'KEPT' ? 'bg-emerald-950 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Kept ({metrics.siftedBitsCount})
              </button>
              <button
                onClick={() => setTableFilter('DISCARDED')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  tableFilter === 'DISCARDED' ? 'bg-slate-800 text-slate-200 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Discarded ({qubits.length - metrics.siftedBitsCount})
              </button>
              <button
                onClick={() => setTableFilter('ERRORS')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  tableFilter === 'ERRORS' ? 'bg-rose-950 text-rose-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Errors ({qubits.filter((q) => q.bitError).length})
              </button>
              {parameters.eveEnabled && (
                <button
                  onClick={() => setTableFilter('EVE')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    tableFilter === 'EVE' ? 'bg-purple-950 text-purple-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Eve Intercepted ({metrics.eveInterceptedCount})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto max-h-96 border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-slate-400 uppercase font-mono text-[10px] sticky top-0 border-b border-slate-800">
              <tr>
                <th className="p-2.5">#</th>
                <th className="p-2.5">Alice Bit</th>
                <th className="p-2.5">Alice Basis</th>
                <th className="p-2.5">Prepared State</th>
                <th className="p-2.5">Eve Intercept?</th>
                <th className="p-2.5">Eve Basis</th>
                <th className="p-2.5">Eve Result</th>
                <th className="p-2.5">Bob Basis</th>
                <th className="p-2.5">Bob Result</th>
                <th className="p-2.5">Basis Match</th>
                <th className="p-2.5">Error</th>
                <th className="p-2.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 font-mono">
              {filteredQubits.slice(0, 100).map((q) => {
                return (
                  <tr
                    key={q.index}
                    onClick={() => setSelectedQubit(q)}
                    className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${
                      q.bitError
                        ? 'bg-rose-950/20'
                        : q.basisMatched
                        ? 'bg-emerald-950/10'
                        : ''
                    }`}
                  >
                    <td className="p-2.5 text-slate-400">{q.index}</td>
                    <td className="p-2.5 font-bold text-cyan-400">{q.aliceBit}</td>
                    <td className="p-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {q.aliceBasis}
                      </span>
                    </td>
                    <td className="p-2.5 text-cyan-200 font-bold">{q.aliceState}</td>
                    <td className="p-2.5">
                      {q.interceptedByEve ? (
                        <span className="text-purple-400 font-bold">YES</span>
                      ) : (
                        <span className="text-slate-400">NO</span>
                      )}
                    </td>
                    <td className="p-2.5 text-purple-300">{q.eveBasis || '—'}</td>
                    <td className="p-2.5 text-purple-300">{q.eveMeasuredBit !== null ? q.eveMeasuredBit : '—'}</td>
                    <td className="p-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {q.bobBasis}
                      </span>
                    </td>
                    <td className="p-2.5 font-bold text-blue-400">{q.bobMeasuredBit}</td>
                    <td className="p-2.5">
                      {q.basisMatched ? (
                        <span className="text-emerald-400 font-bold">KEPT</span>
                      ) : (
                        <span className="text-slate-400">DISCARDED</span>
                      )}
                    </td>
                    <td className="p-2.5">
                      {q.bitError ? (
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> ERROR
                        </span>
                      ) : q.basisMatched ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> MATCH
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedQubit(q);
                        }}
                        className="text-cyan-400 hover:text-cyan-200 p-1 cursor-pointer"
                        title="View quantum collapse mathematics"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 font-mono">
          <span>Showing {Math.min(100, filteredQubits.length)} of {filteredQubits.length} matching qubits</span>
          <span>Click any row to inspect quantum physics details</span>
        </div>
      </div>

      {/* Single Qubit Deep-Dive Inspection Modal */}
      {selectedQubit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyan-400" />
                Quantum State Inspection: Qubit #{selectedQubit.index}
              </h3>
              <button
                onClick={() => setSelectedQubit(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                <span className="text-slate-400 uppercase text-[10px]">Alice's Side:</span>
                <p>Random Bit: <span className="font-bold text-cyan-400">{selectedQubit.aliceBit}</span></p>
                <p>Selected Basis: <span className="font-bold text-slate-200">{selectedQubit.aliceBasis}</span></p>
                <p>Prepared Polarization: <span className="font-bold text-cyan-300 text-sm">{selectedQubit.aliceState}</span></p>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                <span className="text-slate-400 uppercase text-[10px]">Bob's Side:</span>
                <p>Selected Basis: <span className="font-bold text-slate-200">{selectedQubit.bobBasis}</span></p>
                <p>Measured Result: <span className="font-bold text-blue-400">{selectedQubit.bobMeasuredBit}</span></p>
                <p>Basis Compatible: <span className={selectedQubit.basisMatched ? 'text-emerald-400 font-bold' : 'text-slate-400'}>{selectedQubit.basisMatched ? 'YES (Kept in key)' : 'NO (Discarded)'}</span></p>
              </div>
            </div>

            {selectedQubit.interceptedByEve && (
              <div className="bg-purple-950/40 border border-purple-800/80 rounded p-3 text-xs font-mono space-y-1 text-purple-200">
                <span className="text-purple-400 uppercase text-[10px] font-bold">Eve Intercept-Resend Event:</span>
                <p>Eve Basis Guess: <span className="font-bold">{selectedQubit.eveBasis}</span> (Alice basis: {selectedQubit.aliceBasis})</p>
                <p>Eve Measurement: bit {selectedQubit.eveMeasuredBit} → State collapsed & resent: <span className="font-bold">{selectedQubit.eveResentState}</span></p>
                {selectedQubit.eveBasis !== selectedQubit.aliceBasis && (
                  <p className="text-rose-300 text-[11px] mt-1">
                    ⚠ Basis Mismatch! Eve's measurement collapsed Alice's state into a conjugate superposition, introducing a 50% probability of error in Bob's measurement!
                  </p>
                )}
              </div>
            )}

            <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded border border-slate-800">
              <span className="font-bold text-slate-200">Physical Interpretation: </span>
              {selectedQubit.basisMatched ? (
                selectedQubit.bitError ? (
                  <span>
                    Alice and Bob measured in the same basis ({selectedQubit.aliceBasis}), but got conflicting bits ({selectedQubit.aliceBit} vs {selectedQubit.bobMeasuredBit}). This error was caused by {selectedQubit.interceptedByEve ? 'Eve collapsing the state during interception' : 'fiber noise'}. This error contributes directly to the measured QBER!
                  </span>
                ) : (
                  <span>
                    Alice and Bob measured in identical bases ({selectedQubit.aliceBasis}) and obtained matching bit {selectedQubit.aliceBit}. This bit successfully contributes to the sifted shared secret key!
                  </span>
                )
              ) : (
                <span>
                  Alice and Bob used different measurement bases ({selectedQubit.aliceBasis} vs {selectedQubit.bobBasis}). By quantum mechanics, Bob's measurement is completely uncorrelated. During the classical sifting announcement, both parties discard this bit.
                </span>
              )}
            </div>

            <div className="text-right pt-2">
              <button
                onClick={() => setSelectedQubit(null)}
                className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
