/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Q-SHIELD: Critical Infrastructure Network Topology View
 * Visualizes simulated quantum-secured links across operational technology (OT) SCADA networks
 */

import React from 'react';
import {
  Server,
  Zap,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Radio,
  Lock,
  Unlock,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import {
  CriticalInfrastructureScenario,
  SimulationSession,
} from '../types/qkd.ts';
import { SCENARIO_PRESETS } from '../services/bb84Simulation.ts';

interface NetworkViewProps {
  session: SimulationSession;
  scenario: CriticalInfrastructureScenario;
  onSelectScenario: (sc: CriticalInfrastructureScenario) => void;
  onRotateKey: () => void;
}

export const NetworkView: React.FC<NetworkViewProps> = ({
  session,
  scenario,
  onSelectScenario,
  onRotateKey,
}) => {
  const currentScenario = SCENARIO_PRESETS[scenario];
  const { metrics, parameters } = session;

  const isCompromised =
    metrics.securityStatus === 'POTENTIAL_EAVESDROPPING' ||
    metrics.securityStatus === 'KEY_REJECTED';

  return (
    <div className="space-y-6">
      {/* Scenario Selector & Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              Critical Infrastructure Quantum Mesh Network
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select an operational technology sector to monitor quantum key exchange and SCADA command integrity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Sector Preset:</span>
            <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {Object.values(SCENARIO_PRESETS).map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => onSelectScenario(sc.id)}
                  className={`px-3 py-1 text-xs rounded transition-colors cursor-pointer ${
                    scenario === sc.id
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sc.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Scenario Briefing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Sector Profile:</span>
            <p className="font-bold text-slate-200 mt-1">{currentScenario.name}</p>
            <p className="text-[11px] text-slate-400 mt-1">{currentScenario.assetDescription}</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Threat Vector & Impact:</span>
            <p className="font-bold text-rose-300 mt-1">{currentScenario.impactIfCompromised}</p>
            <p className="text-[11px] text-slate-400 mt-1">Simulated impact if unauthenticated commands are injected.</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Simulated SCADA Telemetry:</span>
            <p className="font-mono text-cyan-300 font-bold mt-1">"{currentScenario.sampleScadaCommand}"</p>
            <p className="text-[11px] text-slate-400 mt-1">Encrypted using shared quantum-derived One-Time Pad key.</p>
          </div>
        </div>
      </div>

      {/* Network Topology Visualization Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Live Link Architecture: Central Operations ⟷ Remote Substation
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={onRotateKey}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors cursor-pointer border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rotate Quantum Key</span>
            </button>
            <span
              className={`text-xs px-2.5 py-1 rounded font-mono font-bold ${
                isCompromised
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              Link Health: {isCompromised ? 'COMPROMISED / BLOCKED' : 'OPTIMAL (99.98%)'}
            </span>
          </div>
        </div>

        {/* Detailed Node to Node Graphical View */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 items-center">
          {/* Node 1: Control Center (Alice) */}
          <div className="lg:col-span-2 bg-slate-950 p-5 rounded-xl border border-cyan-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                ALICE · DISPATCH NODE
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100">{currentScenario.controlCenterName}</h4>
              <p className="text-xs text-slate-400 mt-0.5">Central SCADA Automation Host</p>
            </div>
            <div className="space-y-1.5 text-[11px] font-mono text-slate-300 bg-slate-900 p-3 rounded border border-slate-800">
              <p>Hardware: CW Laser + Polarizing Modulator</p>
              <p>Laser Source: 1550 nm Telecom Wavelength</p>
              <p>Entropy Pool: Hardware True RNG</p>
              <p>Buffer Key: {session.finalSecretKeyBin.substring(0, 16)}...</p>
            </div>
          </div>

          {/* Central Channel Transmission (Optical Fiber & Attack Sensor) */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-xl border border-slate-800 relative">
            <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
              <span>Dark Fiber Link #04</span>
              <span>25.4 km Distance</span>
            </div>

            {/* Fiber Line with Traveling Photons */}
            <div className="w-full h-3 bg-slate-900 rounded-full relative overflow-hidden border border-slate-850">
              <div
                className={`h-full ${
                  isCompromised
                    ? 'bg-gradient-to-r from-cyan-500 via-rose-500 to-blue-500'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                }`}
              />
            </div>

            {/* Eve Marker if Active */}
            {parameters.eveEnabled && (
              <div className="mt-3 px-3 py-1 rounded bg-purple-950/90 border border-purple-500 text-xs font-mono text-purple-200 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-purple-400" />
                <span>Simulated Attacker Probe (Eve: {Math.round(parameters.eveInterceptionRate * 100)}% tap)</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 w-full mt-4 text-[11px] font-mono text-slate-300">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500">Current QBER:</span>{' '}
                <span className={isCompromised ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {metrics.qberPercentage}%
                </span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500">Line Noise:</span>{' '}
                <span className="text-amber-400 font-bold">
                  {(parameters.channelNoise * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Node 2: Remote Station (Bob) */}
          <div className="lg:col-span-2 bg-slate-950 p-5 rounded-xl border border-blue-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-blue-400 uppercase">
                BOB · REMOTE SUBSTATION
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100">{currentScenario.substationName}</h4>
              <p className="text-xs text-slate-400 mt-0.5">Field Breaker & RTU Controller</p>
            </div>
            <div className="space-y-1.5 text-[11px] font-mono text-slate-300 bg-slate-900 p-3 rounded border border-slate-800">
              <p>Hardware: SNSPD Single-Photon Detector</p>
              <p>Cooling: Stirling Cryocooler (2.1 K)</p>
              <p>Classical Channel: Authenticated TLS</p>
              <p>Decrypted Key: {session.finalSecretKeyBin.substring(0, 16)}...</p>
            </div>
          </div>
        </div>

        {/* Real-time SCADA Payload Encryption Live Test */}
        <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
              {metrics.keyStatus === 'VALID_FOR_SIMULATION' ? (
                <Lock className="w-4 h-4 text-emerald-400" />
              ) : (
                <Unlock className="w-4 h-4 text-rose-400" />
              )}
              One-Time Pad SCADA Interlocking Test
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Last Key Rotation: {new Date(session.timestamp).toLocaleTimeString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="bg-slate-900 p-3 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px]">Plaintext SCADA Command:</span>
              <p className="text-slate-200 font-bold mt-1">"{session.encryptedSampleMessage?.plaintext}"</p>
            </div>

            <div className="bg-slate-900 p-3 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px]">Encrypted Ciphertext (Hex):</span>
              <p className="text-cyan-300 font-bold mt-1 truncate">
                {session.encryptedSampleMessage?.ciphertextHex}
              </p>
            </div>

            <div className="bg-slate-900 p-3 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px]">Bob Received Decryption:</span>
              <p
                className={`font-bold mt-1 ${
                  session.encryptedSampleMessage?.verified
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {session.encryptedSampleMessage?.decryptedText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
