/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Q-SHIELD: Threat Monitor & Eavesdropping Attack Visualization
 * Specialized deep-dive into Eve's intercept-resend attack mechanics & QBER anomaly detection
 */

import React from 'react';
import {
  ShieldAlert,
  Radio,
  Eye,
  AlertTriangle,
  ArrowRight,
  Zap,
  Info,
  CheckCircle,
  XCircle,
  Activity,
  Play,
} from 'lucide-react';
import {
  SimulationSession,
  SimulationParameters,
} from '../types/qkd.ts';

interface ThreatMonitorViewProps {
  session: SimulationSession;
  parameters: SimulationParameters;
  onUpdateParameters: (params: Partial<SimulationParameters>) => void;
  onRunSimulation: () => void;
  isSimulating: boolean;
}

export const ThreatMonitorView: React.FC<ThreatMonitorViewProps> = ({
  session,
  parameters,
  onUpdateParameters,
  onRunSimulation,
  isSimulating,
}) => {
  const { metrics, qubits } = session;
  const isThreatDetected =
    metrics.securityStatus === 'POTENTIAL_EAVESDROPPING' ||
    metrics.securityStatus === 'KEY_REJECTED';

  // Calculate Eve statistics
  const interceptedList = qubits.filter((q) => q.interceptedByEve);
  const eveWrongBasisCount = interceptedList.filter(
    (q) => q.eveBasis !== q.aliceBasis
  ).length;
  const eveWrongBasisRatio =
    interceptedList.length > 0
      ? ((eveWrongBasisCount / interceptedList.length) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6">
      {/* Dynamic Security Threat Alert Banner */}
      {isThreatDetected ? (
        <div className="bg-rose-950/60 border-2 border-rose-500 rounded-xl p-5 text-rose-100 shadow-xl shadow-rose-950/50 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-900/80 rounded-lg text-rose-200 border border-rose-400 shrink-0">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold font-sans tracking-wide text-rose-200">
                  SECURITY ANOMALY DETECTED: ELEVATED QBER
                </h3>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-rose-900 border border-rose-600 font-bold">
                  QBER: {metrics.qberPercentage}% &gt; THRESHOLD {(parameters.securityThreshold * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-rose-100 leading-relaxed font-sans">
                "Potential eavesdropping detected in the simulation. The observed QBER exceeded the configured application threshold. The current generated key has been marked untrusted."
              </p>
              <div className="text-[11px] text-rose-300 font-mono pt-1">
                Policy Enforcement: Session marked compromised · Key discarded · SCADA telemetry ciphertext blocked · Physical link diagnostic requested.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/40 border border-emerald-600/50 rounded-xl p-5 text-emerald-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-900/60 rounded-lg text-emerald-200 border border-emerald-400 shrink-0">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-emerald-200">
                  Quantum Link Operating Nominal · Baseline Error Checked
                </h3>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-emerald-900/80 border border-emerald-600">
                  QBER: {metrics.qberPercentage}% ≤ {(parameters.securityThreshold * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                No statistically anomalous eavesdropping detected under the configured application threshold. Quantum state disturbances remain within standard optical tolerance limits.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Eve Control Console */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Radio className="w-5 h-5 text-purple-400" />
              Simulated Eve Intercept-Resend Attack Console
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate an adversary intercepting quantum channels, measuring qubits in randomly guessed bases, and resending states to Bob.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onUpdateParameters({ eveEnabled: !parameters.eveEnabled });
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                parameters.eveEnabled
                  ? 'bg-purple-900/80 border-purple-500 text-purple-100'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {parameters.eveEnabled ? 'Deactivate Eve' : 'Activate Eve'}
            </button>

            <button
              onClick={onRunSimulation}
              disabled={isSimulating}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-purple-950/50 disabled:opacity-50"
            >
              {isSimulating ? 'Analyzing...' : 'Execute Attack Run'}
            </button>
          </div>
        </div>

        {/* Attack Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Interception Probability (p_eve)</span>
              <span className="font-mono text-purple-300 font-bold">
                {Math.round(parameters.eveInterceptionRate * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.10"
              max="1.0"
              step="0.05"
              value={parameters.eveInterceptionRate}
              onChange={(e) => onUpdateParameters({ eveInterceptionRate: parseFloat(e.target.value), eveEnabled: true })}
              className="w-full accent-purple-400 cursor-pointer bg-slate-800 h-2 rounded"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>10% (Subtle probe)</span>
              <span>50% (Standard)</span>
              <span>100% (Full wiretap)</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Expected Theoretical QBER</span>
              <span className="font-mono text-cyan-300 font-bold">
                ~{metrics.theoreticalQber}%
              </span>
            </div>
            <div className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800 font-mono">
              Formula: QBER ≈ 0.25 · p_eve + 0.5 · p_noise
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Security Threshold Cutoff</span>
              <span className="font-mono text-rose-300 font-bold">
                {(parameters.securityThreshold * 100).toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800">
              Standard BB84 asymptotic limit is ~11.0%. If $QBER &gt; 11\%$, no secret key can be extracted.
            </div>
          </div>
        </div>
      </div>

      {/* Visual Attack Flow: Alice -> Eve -> Bob */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-purple-400" />
          Quantum Physics Attack Mechanism: Alice → Eve → Bob
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Box 1: Alice */}
          <div className="p-4 rounded-xl border border-cyan-800/80 bg-slate-950/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                1. Alice (Transmitter)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Prepared State
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Alice prepares single photons in random basis Z (|0⟩, |1⟩) or X (|+⟩, |–⟩).
            </p>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
              <p>Tx Qubits: {metrics.totalQubitsSent}</p>
              <p>Polarization: Z / X Random</p>
            </div>
          </div>

          {/* Box 2: Eve */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            parameters.eveEnabled
              ? 'border-purple-600 bg-purple-950/30'
              : 'border-slate-800 bg-slate-950/40 opacity-50'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-purple-300 uppercase">
                2. Eve (Interceptor)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900 text-purple-200 border border-purple-700">
                {parameters.eveEnabled ? 'Active Intercept-Resend' : 'Inactive'}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Eve intercepts photons, guesses basis $b_E$, measures the state (collapsing superposition), and resends her measurement outcome.
            </p>
            <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800 text-[11px] font-mono text-purple-200 space-y-1">
              <p>Intercepted: {metrics.eveInterceptedCount} ({Math.round(parameters.eveInterceptionRate * 100)}%)</p>
              <p>Wrong Basis Guesses: {eveWrongBasisCount} ({eveWrongBasisRatio}%)</p>
              <p>Corrupted States: {metrics.eveErrorsIntroduced}</p>
            </div>
          </div>

          {/* Box 3: Bob */}
          <div className="p-4 rounded-xl border border-blue-800/80 bg-slate-950/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-blue-400 uppercase">
                3. Bob (Receiver)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                Measured State
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Bob chooses basis $b_B$. When $b_A = b_B$ but Eve guessed wrong basis, Bob gets wrong bit with 50% probability!
            </p>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
              <p>Sifted Bits: {metrics.siftedBitsCount}</p>
              <p>Observed QBER: <span className={isThreatDetected ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{metrics.qberPercentage}%</span></p>
              <p>Decision: {metrics.keyStatus}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Physics Mathematical Explanation Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          The Physics of Eavesdropping: Why Eve Cannot Hide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="space-y-2 bg-slate-950 p-4 rounded-lg border border-slate-800">
            <h4 className="font-bold text-cyan-300">1. No-Cloning Theorem & Measurement Collapse</h4>
            <p>
              In classical computing, an eavesdropper can passively tap a wire, copy bits, and read communications without altering the signal. In quantum mechanics, the <strong>No-Cloning Theorem</strong> states that an unknown quantum state cannot be copied.
            </p>
            <p>
              To learn anything, Eve must measure the photon. Because she does not know Alice's basis, she guesses randomly between $Z$ and $X$.
            </p>
          </div>

          <div className="space-y-2 bg-slate-950 p-4 rounded-lg border border-slate-800">
            <h4 className="font-bold text-purple-300">2. The 25% Error Invariant</h4>
            <p>
              When Eve guesses the correct basis (50% probability), she measures accurately and resends the exact state, introducing 0% error.
            </p>
            <p>
              When Eve guesses the wrong basis (50% probability), her measurement projects the qubit into the orthogonal basis. When Bob measures in Alice's original basis, quantum collapse yields a random bit, causing a 50% chance of error:
            </p>
            <div className="font-mono text-cyan-300 text-[11px] bg-slate-900 p-2 rounded border border-slate-800">
              Error = P(Eve wrong basis) × P(Bob error | wrong basis) = 0.5 × 0.5 = 25%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
