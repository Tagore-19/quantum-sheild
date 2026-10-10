/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Q-SHIELD: Key Management Demonstration View
 * Post-processing visualization: Raw Bits → Sifted Key → Error Estimation → Final Key
 */

import React, { useState } from 'react';
import {
  Key,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  RotateCcw,
  Info,
  Clock,
  Layers,
  FileCode,
  Lock,
} from 'lucide-react';
import { SimulationSession } from '../types/qkd.ts';

interface KeyManagementViewProps {
  session: SimulationSession;
  onRotateKey: () => void;
  isSimulating: boolean;
}

export const KeyManagementView: React.FC<KeyManagementViewProps> = ({
  session,
  onRotateKey,
  isSimulating,
}) => {
  const { metrics, parameters } = session;
  const [copiedKey, setCopiedKey] = useState(false);
  const [keyDisplayFormat, setKeyDisplayFormat] = useState<'HEX' | 'BIN'>('HEX');

  const handleCopy = () => {
    const textToCopy = keyDisplayFormat === 'HEX' ? session.finalSecretKeyHex : session.finalSecretKeyBin;
    navigator.clipboard.writeText(textToCopy);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const isRejected = metrics.keyStatus === 'REJECTED';

  return (
    <div className="space-y-6">
      {/* Educational Prototype Disclaimer */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-100 uppercase">
            Demonstration Key Management Only (Not Production Cryptographic Hardware)
          </p>
          <p className="text-slate-400 leading-relaxed">
            This module models the post-processing pipeline of QKD: raw bit acquisition, classical basis sifting, error estimation sampling, and simulation key generation. In production QKD, keys undergo formal Information Reconciliation (Cascade or LDPC error correction) and Privacy Amplification (universal hashing via Toeplitz matrices) under strict tamper-proof HSM physical controls.
          </p>
        </div>
      </div>

      {/* Primary Key Status Overview Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-lg border ${
                isRejected
                  ? 'bg-rose-950 text-rose-300 border-rose-700'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-700'
              }`}
            >
              <Key className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  Shared Simulation Secret Key Store
                </h2>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded font-mono font-bold border ${
                    isRejected
                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {metrics.keyStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Session ID: {session.sessionId} · Established: {new Date(session.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRotateKey}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>Rotate Quantum Key</span>
            </button>
          </div>
        </div>

        {/* 4 Stage Pipeline Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-5">
          {/* Stage 1: Raw Bit String */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase">1. Raw Alice Bit Stream</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-slate-200">
                {session.rawAliceBits.length} <span className="text-xs font-normal text-slate-500">bits</span>
              </span>
              <span className="text-[11px] font-mono text-cyan-400">100% Tx</span>
            </div>
            <p className="text-[11px] text-slate-400">Total random bits transmitted</p>
          </div>

          {/* Stage 2: Sifted Key */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase">2. Sifted Key (Basis Reconciled)</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-slate-200">
                {session.siftedKey.length} <span className="text-xs font-normal text-slate-500">bits</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                {metrics.siftingRatio}% yield
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Matching basis outcomes</p>
          </div>

          {/* Stage 3: Estimated Errors */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase">3. Estimated Errors (QBER Sample)</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-slate-200">
                {metrics.errorCount} <span className="text-xs font-normal text-slate-500">/ {metrics.sampleComparedCount}</span>
              </span>
              <span
                className={`text-[11px] font-mono font-bold ${
                  isRejected ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {metrics.qberPercentage}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Tested sample bits sacrificed</p>
          </div>

          {/* Stage 4: Final Key */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase">4. Final Usable Key Length</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-cyan-300">
                {metrics.finalKeyLength} <span className="text-xs font-normal text-slate-500">bits</span>
              </span>
              <span
                className={`text-[11px] font-mono font-bold ${
                  isRejected ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {metrics.keyStatus === 'VALID_FOR_SIMULATION' ? 'ACTIVE' : 'DISCARDED'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Ready for simulated OTP</p>
          </div>
        </div>
      </div>

      {/* Cryptographic Key Display Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Generated Key Material (Simulation Data Only)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800 text-[11px] font-mono">
              <button
                onClick={() => setKeyDisplayFormat('HEX')}
                className={`px-2.5 py-0.5 rounded cursor-pointer ${
                  keyDisplayFormat === 'HEX' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400'
                }`}
              >
                HEX
              </button>
              <button
                onClick={() => setKeyDisplayFormat('BIN')}
                className={`px-2.5 py-0.5 rounded cursor-pointer ${
                  keyDisplayFormat === 'BIN' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400'
                }`}
              >
                BINARY
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700 transition-colors cursor-pointer"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
            </button>
          </div>
        </div>

        {/* The Key Stream Content */}
        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs break-all leading-relaxed max-h-48 overflow-y-auto">
          {isRejected ? (
            <div className="text-rose-400 font-bold">
              [KEY DISCARDED: QBER EXCEEDED APPLICATION THRESHOLD — REJECTED TO PREVENT POTENTIAL COMPROMISE]
              <div className="text-slate-500 font-normal text-[11px] mt-2">
                Simulated raw bits were: {keyDisplayFormat === 'HEX' ? session.finalSecretKeyHex : session.finalSecretKeyBin}
              </div>
            </div>
          ) : (
            <div className="text-cyan-300 font-bold tracking-wider">
              {keyDisplayFormat === 'HEX' ? session.finalSecretKeyHex : session.finalSecretKeyBin}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Entropy: Shuffled true random generation</span>
          <span>Simulation Hash: SHA256-SIM-{session.sessionId.substring(0, 8)}</span>
        </div>
      </div>
    </div>
  );
};
