/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * QUANTUM-SHIELD: 7-Panel Core Dashboard Layout
 * Fulfills all 7 panels and honesty/labelling requirements:
 * 1. Controls
 * 2. BB84 Flow & Quantum Gate Visualization
 * 3. QBER Gauge & History Chart
 * 4. Key Status & Privacy Amplification (SHA-256 -> AES-256)
 * 5. Encrypted Command Console (AES-256-GCM + Tamper Detection)
 * 6. Event Log & Security Alerts
 * 7. AI Anomaly Monitor (Isolation Forest)
 */

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Radio,
  Play,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Unlock,
  Activity,
  FileText,
  Sparkles,
  Info,
  Server,
  Zap,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  deriveAes256KeyFromBits,
  encryptCommandAesGcm,
  decryptCommandAesGcm,
  AesGcmEncryptedPayload,
} from '../services/cryptoAesGcm.ts';
import { evaluateSessionAnomaly, AnomalyEvaluation } from '../services/anomalyMonitor.ts';
import { SimulationSession, SimulationParameters, SecurityEvent } from '../types/qkd.ts';

interface QuantumShield7PanelsProps {
  session: SimulationSession;
  parameters: SimulationParameters;
  onRunSimulation: (customParams?: SimulationParameters) => void;
  onUpdateParameters: (params: Partial<SimulationParameters>) => void;
  events: SecurityEvent[];
  isSimulating: boolean;
}

export const QuantumShield7Panels: React.FC<QuantumShield7PanelsProps> = ({
  session,
  parameters,
  onRunSimulation,
  onUpdateParameters,
  events,
  isSimulating,
}) => {
  const { metrics, qubits } = session;

  // Panel 1: Backend Choice
  const [backendChoice, setBackendChoice] = useState<'AerSimulator' | 'IBM_Quantum_Sim'>('AerSimulator');

  // Panel 3: History across runs
  const [historyRuns, setHistoryRuns] = useState<
    { id: number; qber: number; threshold: number; eveEnabled: boolean }[]
  >([
    { id: 1, qber: metrics.qberPercentage, threshold: parameters.securityThreshold * 100, eveEnabled: parameters.eveEnabled }
  ]);

  // Panel 4 & 5: Crypto Keys & AES-256-GCM Command Console
  const [aesKeyHex, setAesKeyHex] = useState<string>('DERIVING...');
  const [aesKeyFingerprint, setAesKeyFingerprint] = useState<string>('KEY-7F3A2B1C');
  const [activeCryptoKey, setActiveCryptoKey] = useState<CryptoKey | null>(null);

  const [commandInput, setCommandInput] = useState<string>('Reduce power output to 70%');
  const [encryptedPayload, setEncryptedPayload] = useState<AesGcmEncryptedPayload | null>(null);
  const [bobDecryptionResult, setBobDecryptionResult] = useState<string>('Awaiting command transmission...');
  const [isDecryptionSuccess, setIsDecryptionSuccess] = useState<boolean | null>(null);
  const [authFailuresCount, setAuthFailuresCount] = useState<number>(0);

  // Panel 7: AI Anomaly Monitor
  const [anomalyData, setAnomalyData] = useState<AnomalyEvaluation>(() =>
    evaluateSessionAnomaly(metrics.qber, metrics.siftedBitsCount, metrics.keyStatus === 'VALID_FOR_SIMULATION' ? 0.0 : 1.0, 0)
  );

  // Update cryptographic key when simulation completes
  useEffect(() => {
    async function updateKey() {
      if (metrics.keyStatus === 'VALID_FOR_SIMULATION' && session.finalSecretKeyBin.length > 0) {
        const keyData = await deriveAes256KeyFromBits(session.finalSecretKeyBin);
        setActiveCryptoKey(keyData.cryptoKey);
        setAesKeyHex(keyData.keyHex);
        setAesKeyFingerprint(keyData.fingerprint);
      } else {
        setActiveCryptoKey(null);
        setAesKeyHex('REJECTED_SUSPICIOUS_KEY');
        setAesKeyFingerprint('SUSPICIOUS_BLOCKED');
      }

      // Update AI Anomaly Evaluation
      const anomaly = evaluateSessionAnomaly(
        metrics.qber,
        metrics.siftedBitsCount,
        metrics.keyStatus === 'VALID_FOR_SIMULATION' ? 0.0 : 1.0,
        authFailuresCount
      );
      setAnomalyData(anomaly);

      // Record History
      setHistoryRuns((prev) => [
        ...prev.slice(-9),
        {
          id: prev.length + 1,
          qber: metrics.qberPercentage,
          threshold: parameters.securityThreshold * 100,
          eveEnabled: parameters.eveEnabled,
        },
      ]);
    }
    updateKey();
  }, [session.sessionId]);

  // Handle AES-256-GCM Command Encryption
  const handleEncryptAndSend = async () => {
    if (!activeCryptoKey || metrics.keyStatus !== 'VALID_FOR_SIMULATION') {
      setIsDecryptionSuccess(false);
      setBobDecryptionResult('⚠️ Command blocked: suspicious key. (Security policy prevented transmission)');
      setAuthFailuresCount((prev) => prev + 1);
      return;
    }

    try {
      const payload = await encryptCommandAesGcm(activeCryptoKey, commandInput);
      setEncryptedPayload(payload);

      // Bob decrypts payload
      const result = await decryptCommandAesGcm(
        activeCryptoKey,
        payload.nonceHex,
        payload.ciphertextHex,
        payload.tagHex
      );

      setIsDecryptionSuccess(result.success);
      setBobDecryptionResult(
        result.success
          ? `✓ Bob Verified & Executed: "${result.message}" (Integrity Confirmed)`
          : `❌ ${result.message}`
      );
    } catch (err: any) {
      setIsDecryptionSuccess(false);
      setBobDecryptionResult(`❌ Decryption error: ${err?.message}`);
    }
  };

  // Handle Tamper Simulation (Corrupts one byte in ciphertext)
  const handleTamperCiphertext = async () => {
    if (!encryptedPayload || !activeCryptoKey) {
      alert('Please encrypt and send a command first before testing tampering.');
      return;
    }

    const originalHex = encryptedPayload.ciphertextHex;
    // Corrupt first byte
    const corruptedByte = originalHex.substring(0, 2) === 'FF' ? '00' : 'FF';
    const tamperedHex = corruptedByte + originalHex.substring(2);

    const tamperedPayload = {
      ...encryptedPayload,
      ciphertextHex: tamperedHex,
    };
    setEncryptedPayload(tamperedPayload);

    // Bob attempts to decrypt the tampered message
    const result = await decryptCommandAesGcm(
      activeCryptoKey,
      tamperedPayload.nonceHex,
      tamperedPayload.ciphertextHex,
      tamperedPayload.tagHex
    );

    setIsDecryptionSuccess(result.success);
    setBobDecryptionResult(
      result.success
        ? `✓ Decrypted: "${result.message}"`
        : `❌ Integrity check failed: authentication tag verification failed. (Tampering detected!)`
    );
    setAuthFailuresCount((prev) => prev + 1);
  };

  const isSuspicious = metrics.keyStatus !== 'VALID_FOR_SIMULATION';

  return (
    <div className="space-y-6">
      {/* Honesty & Labelling Banner */}
      <div className="bg-slate-900 border border-cyan-800/80 rounded-xl p-4 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-cyan-200 uppercase tracking-wide">
              QUANTUM-SHIELD: Honesty & Educational Labelling Framework
            </span>
            <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono text-[10px] border border-indigo-800">
              Simulation Mode
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            <strong>Simulation Scope:</strong> This prototype simulates BB84 single-photon polarization state encoding and QBER eavesdropping detection in software. QKD only distributes cryptographic keys; <strong>AES-256-GCM</strong> provides authenticated encryption for SCADA messages. The remote substation is simulated and does not control live power grid assets.
          </p>
        </div>
      </div>

      {/* 7-PANEL CORE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* PANEL 1: CONTROLS */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-100">Panel 1: Controls & Backend</h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
              {backendChoice}
            </span>
          </div>

          {/* Qubit Count */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Number of Qubits (N):</span>
              <span className="font-mono text-cyan-300 font-bold">{parameters.qubitCount}</span>
            </div>
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={parameters.qubitCount}
              onChange={(e) => onUpdateParameters({ qubitCount: parseInt(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer bg-slate-800 h-1.5 rounded"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>50</span>
              <span>100 (Default)</span>
              <span>500</span>
              <span>1000</span>
            </div>
          </div>

          {/* Eve Toggle */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200">Eve Intercept-Resend Attack</span>
                <p className="text-[10px] text-slate-400">Adversary measures & reprepairs states</p>
              </div>
              <button
                onClick={() => onUpdateParameters({ eveEnabled: !parameters.eveEnabled, eveInterceptionRate: 0.5 })}
                className={`px-3 py-1 rounded text-xs font-bold border transition-colors cursor-pointer ${
                  parameters.eveEnabled
                    ? 'bg-rose-950 text-rose-300 border-rose-700'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                {parameters.eveEnabled ? 'EVE: ACTIVE' : 'EVE: OFF'}
              </button>
            </div>
          </div>

          {/* Educational Security Threshold */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">QBER Security Threshold:</span>
              <span className="font-mono text-rose-300 font-bold">
                {(parameters.securityThreshold * 100).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.25"
              step="0.01"
              value={parameters.securityThreshold}
              onChange={(e) => onUpdateParameters({ securityThreshold: parseFloat(e.target.value) })}
              className="w-full accent-rose-400 cursor-pointer bg-slate-800 h-1.5 rounded"
            />
            <p className="text-[10px] text-slate-500 mt-0.5">
              Educational threshold: Shor-Preskill asymptotic bound is ~11.0%.
            </p>
          </div>

          {/* Backend Selector */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Quantum Simulator Backend:</label>
            <select
              value={backendChoice}
              onChange={(e) => setBackendChoice(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="AerSimulator">Qiskit AerSimulator (Local Quantum Simulator - Default)</option>
              <option value="IBM_Quantum_Sim">IBM Quantum Cloud Backend (Simulated)</option>
            </select>
          </div>

          {/* Run Action */}
          <button
            onClick={() => onRunSimulation()}
            disabled={isSimulating}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-md shadow-cyan-950/40 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isSimulating ? 'Executing Circuits on Simulator...' : 'Run BB84 Simulation'}</span>
          </button>
        </div>

        {/* PANEL 2: BB84 FLOW & QUANTUM GATES */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-100">Panel 2: BB84 Flow & Quantum Gate Circuit</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              X Gate (Bit 1), H Gate (X Basis)
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Microscopic quantum circuit execution for individual photons (shots=1 per qubit):
          </p>

          <div className="overflow-x-auto max-h-56 border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs font-mono text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">Alice Bit</th>
                  <th className="p-2">Alice Basis</th>
                  <th className="p-2">State</th>
                  <th className="p-2">Eve Basis</th>
                  <th className="p-2">Eve Meas</th>
                  <th className="p-2">Bob Basis</th>
                  <th className="p-2">Bob Meas</th>
                  <th className="p-2">Basis Match</th>
                  <th className="p-2">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-[11px]">
                {qubits.slice(0, 15).map((q) => (
                  <tr
                    key={q.index}
                    className={q.bitError ? 'bg-rose-950/30' : q.basisMatched ? 'bg-emerald-950/15' : ''}
                  >
                    <td className="p-2 text-slate-500">{q.index}</td>
                    <td className="p-2 font-bold text-cyan-400">{q.aliceBit}</td>
                    <td className="p-2 text-slate-300">{q.aliceBasis}</td>
                    <td className="p-2 text-cyan-200">{q.aliceState}</td>
                    <td className="p-2 text-purple-300">{q.eveBasis || '—'}</td>
                    <td className="p-2 text-purple-300">{q.eveMeasuredBit !== null ? q.eveMeasuredBit : '—'}</td>
                    <td className="p-2 text-slate-300">{q.bobBasis}</td>
                    <td className="p-2 font-bold text-blue-400">{q.bobMeasuredBit}</td>
                    <td className="p-2">
                      <span className={q.basisMatched ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {q.basisMatched ? 'MATCH' : 'DISCARD'}
                      </span>
                    </td>
                    <td className="p-2">
                      {q.bitError ? (
                        <span className="text-rose-400 font-bold">ERROR</span>
                      ) : q.basisMatched ? (
                        <span className="text-emerald-400">OK</span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Showing first 15 of {parameters.qubitCount} qubits</span>
            <span>Basis matching filter: kept {metrics.siftedBitsCount} bits (~{metrics.siftingRatio}%)</span>
          </div>
        </div>

        {/* PANEL 3: QBER GAUGE & HISTORY CHART */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-100">Panel 3: QBER Gauge & Multi-Run Chart</h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
              Threshold: {(parameters.securityThreshold * 100).toFixed(1)}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            {/* Visual Gauge */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Observed QBER</span>
              <div
                className={`text-3xl font-extrabold font-mono mt-1 ${
                  isSuspicious ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {metrics.qberPercentage}%
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                Errors: {metrics.errorCount} / {metrics.sampleComparedCount} sample
              </div>
              <div className="mt-2 w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${isSuspicious ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, (metrics.qber / 0.3) * 100)}%` }}
                />
              </div>
            </div>

            {/* Status Summary */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Detection Verdict:</span>
              <div
                className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-xs ${
                  isSuspicious
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {isSuspicious ? '⚠️ EAVESDROPPING / SUSPICIOUS' : '✓ CHANNEL SECURE'}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                {isSuspicious
                  ? 'Error rate exceeded threshold. Generated key marked untrusted.'
                  : 'Error rate within safe bounds. Key validated for AES encryption.'}
              </p>
            </div>
          </div>

          {/* SVG History Chart across Runs */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block mb-2">QBER History Across Runs:</span>
            <div className="h-28 flex items-end gap-2 pt-2 border-b border-slate-800 pb-1">
              {historyRuns.map((run, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className={`w-full rounded-t transition-all ${
                      run.qber > run.threshold ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ height: `${Math.max(8, Math.min(100, (run.qber / 30) * 100))}%` }}
                  />
                  <span className="text-[9px] font-mono text-slate-500">R{run.id}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
              <span>● Green: Secure (QBER &lt; 11%)</span>
              <span>● Red: Attack / Suspicious</span>
            </div>
          </div>
        </div>

        {/* PANEL 4: KEY STATUS & PRIVACY AMPLIFICATION */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-100">Panel 4: Key Status & Privacy Amplification</h2>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                isSuspicious
                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              {metrics.keyStatus}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-xl font-bold font-mono text-slate-200">{metrics.siftedBitsCount}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Sifted Length</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-xl font-bold font-mono text-slate-200">{metrics.sampleComparedCount}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Compared Sample</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-xl font-bold font-mono text-cyan-300">{metrics.finalKeyLength}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Final Secret Bits</p>
            </div>
          </div>

          {/* Derived 256-Bit AES Key */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                Derived 256-Bit AES Key (SHA-256 Digest of Reconciled Key):
              </span>
              <span className="text-[10px] font-mono text-cyan-400">{aesKeyFingerprint}</span>
            </div>
            <div className="font-mono text-xs text-cyan-300 break-all bg-slate-900 p-2.5 rounded border border-slate-850">
              {aesKeyHex}
            </div>
          </div>
        </div>

        {/* PANEL 5: ENCRYPTED COMMAND CONSOLE (AES-256-GCM) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-100">Panel 5: Command Console (AES-256-GCM)</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Authenticated AEAD Stream</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Critical Infrastructure SCADA Command:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="e.g. Reduce power output to 70%"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleEncryptAndSend}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                🔒 Encrypt & Send
              </button>
              <button
                onClick={handleTamperCiphertext}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                title="Simulate attacker modifying a byte of the in-flight ciphertext"
              >
                ⚠️ Test Tamper
              </button>
            </div>
          </div>

          {/* Cryptographic AEAD Payload Details */}
          {encryptedPayload && (
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500">96-Bit Nonce (Hex):</span>
                <p className="text-slate-300 truncate mt-0.5">{encryptedPayload.nonceHex}</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500">128-Bit Auth Tag (Hex):</span>
                <p className="text-slate-300 truncate mt-0.5">{encryptedPayload.tagHex}</p>
              </div>
              <div className="col-span-2 bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500">Ciphertext (Hex):</span>
                <p className="text-cyan-300 break-all text-[11px] mt-0.5">{encryptedPayload.ciphertextHex}</p>
              </div>
            </div>
          )}

          {/* Bob Decryption Result Display */}
          <div
            className={`p-3 rounded-lg border text-xs font-mono ${
              isDecryptionSuccess === true
                ? 'bg-emerald-950/40 border-emerald-700 text-emerald-200'
                : isDecryptionSuccess === false
                ? 'bg-rose-950/40 border-rose-700 text-rose-200'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <span className="text-[10px] text-slate-500 uppercase block mb-0.5">
              Substation Bob Decryption & Integrity Verification:
            </span>
            <p className="font-bold">{bobDecryptionResult}</p>
          </div>
        </div>

        {/* PANEL 6: EVENT LOG & SECURITY ALERTS */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-100">Panel 6: Event Log & Security Alerts</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Real-Time Ledger</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {events.slice(0, 6).map((ev) => (
              <div
                key={ev.id}
                className="p-2.5 rounded bg-slate-950 border border-slate-850 text-xs flex items-start justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        ev.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300'
                          : ev.severity === 'WARNING'
                          ? 'bg-amber-950 text-amber-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {ev.severity}
                    </span>
                    <span className="font-mono text-slate-300 font-semibold">{ev.eventType}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">{ev.description}</p>
                </div>
                <span className="text-[9px] font-mono text-slate-500 whitespace-nowrap">
                  {new Date(ev.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL 7: AI ANOMALY MONITOR (ISOLATION FOREST) */}
        <div className="lg:col-span-12 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-slate-100">
                Panel 7: AI Anomaly Monitor (scikit-learn Isolation Forest)
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              Multi-Variate Feature Vector
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Score Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Model Classification</span>
              <div
                className={`text-2xl font-extrabold font-mono mt-1 ${
                  anomalyData.isAnomaly ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {anomalyData.label.toUpperCase()}
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-1">
                Score: {anomalyData.anomalyScore >= 0 ? '+' : ''}{anomalyData.anomalyScore}
              </div>
            </div>

            {/* Feature Breakdown */}
            <div className="md:col-span-3 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">
                Session Feature Vector Evaluated Against Normal Baseline:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-slate-300">
                <div className="bg-slate-900 p-2 rounded">
                  <span className="text-slate-500">QBER:</span> {anomalyData.features.qber}%
                </div>
                <div className="bg-slate-900 p-2 rounded">
                  <span className="text-slate-500">Sifted Length:</span> {anomalyData.features.siftedLength}
                </div>
                <div className="bg-slate-900 p-2 rounded">
                  <span className="text-slate-500">Rejection Rate:</span> {anomalyData.features.rejectionRate}%
                </div>
                <div className="bg-slate-900 p-2 rounded">
                  <span className="text-slate-500">Auth Failures:</span> {anomalyData.features.authFailures}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                {anomalyData.note}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
