/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Q-SHIELD: Main Cybersecurity Dashboard
 * Real-time monitoring of quantum communication link & infrastructure telemetry
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Radio,
  Zap,
  Activity,
  ArrowRight,
  Info,
  Server,
  Lock,
  Unlock,
  AlertTriangle,
  Play,
  RotateCw,
  HelpCircle,
  Mic,
  Volume2,
  Download,
} from 'lucide-react';
import {
  SimulationSession,
  SecurityEvent,
  CriticalInfrastructureScenario,
  SimulationMode,
  SimulationParameters,
} from '../types/qkd.ts';
import { SCENARIO_PRESETS } from '../services/bb84Simulation.ts';
import { PresenterHUD } from './PresenterHUD.tsx';
import { DashboardExplainerModal } from './DashboardExplainerModal.tsx';

interface DashboardViewProps {
  session: SimulationSession;
  events: SecurityEvent[];
  scenario: CriticalInfrastructureScenario;
  onRunSimulation: (customParams?: SimulationParameters) => void;
  onSetMode: (mode: SimulationMode) => void;
  onNavigateTab: (tab: any) => void;
  onOpenDemo: () => void;
  isSimulating: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  session,
  events,
  scenario,
  onRunSimulation,
  onSetMode,
  onNavigateTab,
  onOpenDemo,
  isSimulating,
}) => {
  const { metrics, parameters, qubits } = session;
  const currentScenario = SCENARIO_PRESETS[scenario];

  // Stage Presentation & Explainer Modal States
  const [showPresenterHUD, setShowPresenterHUD] = useState<boolean>(true);
  const [showExplainerModal, setShowExplainerModal] = useState<boolean>(false);

  // Helper for security status visuals
  const isCompromised =
    metrics.securityStatus === 'POTENTIAL_EAVESDROPPING' ||
    metrics.securityStatus === 'KEY_REJECTED';
  const isWarning = metrics.securityStatus === 'WARNING';

  // Sample flying photons for visualization (first 5 qubits)
  const samplePhotons = qubits.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner: Presenter Mode Controller Toggle & Explainer Guide */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPresenterHUD(!showPresenterHUD)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              showPresenterHUD
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{showPresenterHUD ? 'Hide Pitch Controller' : '🎤 Open Hackathon Pitch Mode'}</span>
          </button>

          <button
            onClick={() => setShowExplainerModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/60 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>💡 How This Dashboard Works</span>
          </button>

          <a
            href="/api/download/project-zip"
            download="q-shield-quantum-prototype.zip"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-500/50 transition-colors cursor-pointer"
            title="Download full project source code as a ZIP archive"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>📦 Download ZIP</span>
          </a>
        </div>

        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3">
          <span>Target Sector: <strong className="text-slate-200">{currentScenario.name}</strong></span>
          <span>·</span>
          <span>QBER Threshold: <strong className="text-rose-400">{(parameters.securityThreshold * 100).toFixed(1)}%</strong></span>
        </div>
      </div>

      {/* Presenter Mode Teleprompter HUD */}
      {showPresenterHUD && (
        <PresenterHUD
          onExecuteStage={(params) => onRunSimulation(params)}
          onSetMode={onSetMode}
          qberPercentage={metrics.qberPercentage}
          securityStatus={metrics.securityStatus}
        />
      )}

      {/* Educational Prototype Disclaimer Banner */}
      <div className="rounded-lg border border-cyan-800/60 bg-cyan-950/40 p-3.5 text-xs text-cyan-200/90 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-cyan-100 uppercase tracking-wide">
            Scientific Simulation & Educational Prototype Disclaimer
          </p>
          <p className="leading-relaxed text-slate-300 text-[11px]">
            This platform simulates the quantum-physical mechanics of the <strong>BB84 protocol</strong>, single-photon measurement collapse, and <strong>Quantum Bit Error Rate (QBER)</strong> threat identification in software. It is an educational demonstration prototype. Practical real-world QKD deployments require dedicated quantum-photonic hardware (single-photon emitters, APD/SNSPD single-photon detectors), dark fiber or free-space optical channels, mathematically authenticated classical channels, physical tamper-proofing, and finite-key security margins.
          </p>
        </div>
      </div>

      {/* Hero Alert / Status Bar */}
      <div
        className={`rounded-xl border p-5 transition-all ${
          isCompromised
            ? 'bg-rose-950/40 border-rose-600/70 text-rose-100 shadow-lg shadow-rose-950/30'
            : isWarning
            ? 'bg-amber-950/40 border-amber-600/70 text-amber-100'
            : 'bg-slate-900/80 border-emerald-600/40 text-emerald-100'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-lg ${
                isCompromised
                  ? 'bg-rose-900/60 text-rose-300 border border-rose-500/50'
                  : isWarning
                  ? 'bg-amber-900/60 text-amber-300 border border-amber-500/50'
                  : 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/50'
              }`}
            >
              {isCompromised ? (
                <ShieldAlert className="w-7 h-7 animate-bounce" />
              ) : isWarning ? (
                <AlertTriangle className="w-7 h-7" />
              ) : (
                <ShieldCheck className="w-7 h-7" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold font-sans tracking-tight">
                  Status: {metrics.securityStatus.replace('_', ' ')}
                </h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-950/80 border border-slate-700">
                  QBER: {metrics.qberPercentage}% (Threshold: {(parameters.securityThreshold * 100).toFixed(1)}%)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                {isCompromised
                  ? 'Potential eavesdropping or severe channel corruption detected in the simulation. The observed QBER exceeded the configured application threshold. The generated key has been marked UNTRUSTED and rejected.'
                  : isWarning
                  ? 'Elevated quantum noise observed near security tolerance limits. Channel fidelity degraded, but key remains tentatively within verification bounds.'
                  : 'Quantum link operates nominally. Error rates remain strictly below the application security threshold. Valid simulation key established and ready for One-Time Pad SCADA encryption.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => onRunSimulation()}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-cyan-950/50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Simulating...' : 'Run Simulation'}</span>
            </button>
            <button
              onClick={onOpenDemo}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hackathon Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 Primary Dashboard Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Qubits Sent */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4">
          <p className="text-xs font-medium text-slate-400">Qubits Sent (Alice)</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {metrics.totalQubitsSent}
            </span>
            <span className="text-[11px] text-cyan-400 font-mono">100% Tx</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Single polarized photons</p>
        </div>

        {/* Card 2: Sifted Bits */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4">
          <p className="text-xs font-medium text-slate-400">Sifted Bits (Reconciled)</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {metrics.siftedBitsCount}
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">
              {metrics.siftingRatio}% yield
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Matching basis measurements</p>
        </div>

        {/* Card 3: Qubits Compared */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4">
          <p className="text-xs font-medium text-slate-400">Sample Tested for QBER</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {metrics.sampleComparedCount}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {metrics.errorCount} errors
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Publicly compared sample</p>
        </div>

        {/* Card 4: Final Key Length */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4">
          <p className="text-xs font-medium text-slate-400">Final Secret Key</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold font-mono text-cyan-300">
              {metrics.finalKeyLength} <span className="text-xs font-normal text-slate-400">bits</span>
            </span>
            <span
              className={`text-[11px] font-mono font-semibold ${
                metrics.keyStatus === 'VALID_FOR_SIMULATION'
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {metrics.keyStatus === 'VALID_FOR_SIMULATION' ? 'VALID' : 'REJECTED'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Unrevealed raw secret key</p>
        </div>

        {/* Card 5: QBER Rate */}
        <div
          className={`border rounded-lg p-4 ${
            isCompromised
              ? 'bg-rose-950/30 border-rose-700/60'
              : 'bg-slate-900/70 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400">Measured QBER</p>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              Limit: {(parameters.securityThreshold * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span
              className={`text-2xl font-bold font-mono ${
                isCompromised
                  ? 'text-rose-400'
                  : isWarning
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {metrics.qberPercentage}%
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Theory: ~{metrics.theoreticalQber}%
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                isCompromised
                  ? 'bg-rose-500'
                  : isWarning
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.min(100, (metrics.qber / (parameters.securityThreshold * 1.5)) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Card 6: Channel Noise */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4">
          <p className="text-xs font-medium text-slate-400">Simulated Fiber Noise</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {(parameters.channelNoise * 100).toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-400 font-mono">1550 nm dark fiber</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Birefringence & thermal drift</p>
        </div>

        {/* Card 7: Eve Activity */}
        <div
          className={`border rounded-lg p-4 ${
            parameters.eveEnabled
              ? 'bg-purple-950/30 border-purple-800/60'
              : 'bg-slate-900/70 border-slate-800'
          }`}
        >
          <p className="text-xs font-medium text-slate-400">Eve Intercept-Resend</p>
          <div className="flex items-baseline justify-between mt-2">
            <span
              className={`text-2xl font-bold font-mono ${
                parameters.eveEnabled ? 'text-purple-300' : 'text-slate-400'
              }`}
            >
              {parameters.eveEnabled ? `${Math.round(parameters.eveInterceptionRate * 100)}%` : 'OFF'}
            </span>
            <span className="text-[11px] text-purple-400 font-mono">
              {parameters.eveEnabled ? `${metrics.eveInterceptedCount} intercepted` : 'Inactive'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Simulated attacker probe</p>
        </div>

        {/* Card 8: Security Decision */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4">
          <p className="text-xs font-medium text-slate-400">Security Decision</p>
          <div className="flex items-baseline justify-between mt-2">
            <span
              className={`text-sm font-bold font-mono px-2 py-1 rounded ${
                metrics.keyStatus === 'VALID_FOR_SIMULATION'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}
            >
              {metrics.keyStatus === 'VALID_FOR_SIMULATION' ? 'KEY_ACCEPTED' : 'KEY_DISCARDED'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {metrics.executionTimeMs} ms simulation time
          </p>
        </div>
      </div>

      {/* Critical Infrastructure Communication Link Topology with Live Traveling Photons */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              Critical Infrastructure Link: {currentScenario.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Quantum-secure transmission channel connecting central SCADA dispatch to remote field substation
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('network')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            Full Topology <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Link Diagram with Traveling Photons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
          {/* Node Alice */}
          <div className="border border-slate-700/80 bg-slate-900/80 rounded-lg p-3 text-center">
            <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold">
              Alice (Transmitter)
            </span>
            <p className="font-bold text-sm text-slate-100 mt-1">{currentScenario.controlCenterName}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Single Photon Pulse Emitter (1550nm)</p>
            <div className="mt-2 text-[10px] font-mono text-slate-300 bg-slate-950 py-1 px-2 rounded border border-slate-800">
              Raw Tx: {session.rawAliceBits.substring(0, 16)}...
            </div>
          </div>

          {/* Quantum Channel & Live Photon Stream */}
          <div className="flex flex-col items-center justify-center py-2 px-2">
            <div className="flex items-center gap-2 w-full justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <div className="h-1 flex-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-500 relative rounded-full">
                {parameters.eveEnabled && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-purple-900/90 border border-purple-500 text-[10px] font-mono text-purple-200">
                    Eve ({Math.round(parameters.eveInterceptionRate * 100)}%)
                  </div>
                )}
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            </div>

            {/* Live Photon Particle Visualizer */}
            <div className="mt-3 flex items-center justify-center gap-1.5 w-full bg-slate-950/90 p-1.5 rounded-lg border border-slate-800">
              <span className="text-[9px] font-mono text-slate-400 mr-1">Photons:</span>
              {samplePhotons.map((p) => (
                <div
                  key={p.index}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                    p.bitError
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : p.interceptedByEve
                      ? 'bg-purple-950 text-purple-300 border border-purple-800'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  }`}
                  title={`Qubit #${p.index}: Alice=${p.aliceState}, Bob=${p.bobBasis}, Error=${p.bitError}`}
                >
                  <span>{p.aliceState}</span>
                  {p.interceptedByEve && <span className="text-[8px] text-purple-400">⚡</span>}
                </div>
              ))}
            </div>

            <p className="text-[11px] font-mono text-slate-400 mt-2 text-center">
              Quantum Optical Channel ({parameters.channelNoise > 0 ? `${(parameters.channelNoise * 100).toFixed(1)}% noise` : 'Noiseless'})
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400">
                Fiber: 25 km Dark Fiber
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[10px] font-mono text-slate-400">
                Wavelength: 1550nm
              </span>
            </div>
          </div>

          {/* Node Bob */}
          <div className="border border-slate-700/80 bg-slate-900/80 rounded-lg p-3 text-center">
            <span className="text-[10px] font-mono uppercase text-blue-400 font-semibold">
              Bob (Receiver)
            </span>
            <p className="font-bold text-sm text-slate-100 mt-1">{currentScenario.substationName}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Dual-Basis Avalanche Photodetector</p>
            <div className="mt-2 text-[10px] font-mono text-slate-300 bg-slate-950 py-1 px-2 rounded border border-slate-800">
              Raw Rx: {session.rawBobBits.substring(0, 16)}...
            </div>
          </div>
        </div>

        {/* One-Time Pad Encrypted SCADA Command Demo Preview */}
        <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {metrics.keyStatus === 'VALID_FOR_SIMULATION' ? (
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Unlock className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <div>
              <span className="font-mono text-slate-400">Protected SCADA Command: </span>
              <span className="font-mono font-semibold text-slate-200">
                "{currentScenario.sampleScadaCommand}"
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-mono">
              Ciphertext: {session.encryptedSampleMessage?.ciphertextHex.substring(0, 16)}...
            </span>
            <span
              className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                session.encryptedSampleMessage?.verified
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}
            >
              {session.encryptedSampleMessage?.verified ? 'OTP_VERIFIED' : 'OTP_BLOCKED'}
            </span>
          </div>
        </div>
      </div>

      {/* Mode Fast Switcher & Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preset Modes Explanations */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            Quick Application Modes
          </h3>
          <p className="text-xs text-slate-400">
            Switch between the three core demonstration scenarios:
          </p>

          <div className="space-y-2 mt-2">
            <button
              onClick={() => onSetMode('NORMAL')}
              className="w-full text-left p-3 rounded-lg border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">Mode A: Normal Secure Channel</span>
                <span className="text-[10px] font-mono text-slate-400">Eve OFF · 0-1% Noise</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Demonstrates clean BB84 key agreement with minimal optical fiber attenuation. Key accepted.
              </p>
            </button>

            <button
              onClick={() => onSetMode('NOISY')}
              className="w-full text-left p-3 rounded-lg border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/60 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">Mode B: Noisy Optical Channel</span>
                <span className="text-[10px] font-mono text-slate-400">Eve OFF · 5% Noise</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Shows physical environmental noise and thermal drift elevating QBER without an eavesdropper.
              </p>
            </button>

            <button
              onClick={() => onSetMode('ATTACK')}
              className="w-full text-left p-3 rounded-lg border border-slate-800 hover:border-rose-500/50 hover:bg-slate-800/60 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400">Mode C: Eavesdropping Attack</span>
                <span className="text-[10px] font-mono text-slate-400">Eve 50% Intercept-Resend</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Eve probes states, collapsing superpositions and triggering an alert when QBER &gt; 11%.
              </p>
            </button>
          </div>
        </div>

        {/* Security Event Log Feed */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Live Security Audit Log
              </h3>
              <button
                onClick={() => onNavigateTab('logs')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                All Events <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {events.slice(0, 5).map((ev) => (
                <div
                  key={ev.id}
                  className="p-2.5 rounded bg-slate-950/70 border border-slate-850 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          ev.severity === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : ev.severity === 'WARNING'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {ev.severity}
                      </span>
                      <span className="font-mono text-slate-200 font-semibold">
                        {ev.eventType}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {ev.description}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 mt-4 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Session ID: {session.sessionId}</span>
            <span>Execution Latency: {metrics.executionTimeMs} ms</span>
          </div>
        </div>
      </div>

      {/* Interactive Explainer Modal */}
      <DashboardExplainerModal
        isOpen={showExplainerModal}
        onClose={() => setShowExplainerModal(false)}
      />
    </div>
  );
};
