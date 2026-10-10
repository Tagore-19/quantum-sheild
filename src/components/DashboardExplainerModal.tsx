/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Q-SHIELD: "How This Dashboard Works" In-Depth Interactive Guide
 * Explains every dashboard card, telemetry metric, and physical quantum mechanism
 */

import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  Activity,
  Cpu,
  Eye,
  Lock,
  Radio,
  ShieldCheck,
  ShieldAlert,
  Server,
  Zap,
  CheckCircle,
} from 'lucide-react';

interface DashboardExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardExplainerModal: React.FC<DashboardExplainerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CARDS' | 'LINK' | 'DECISION'>('OVERVIEW');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-sans">
                Comprehensive Guide: How the Q-SHIELD Dashboard Works
              </h2>
              <p className="text-xs text-slate-400">
                A step-by-step breakdown of every card, metric, and quantum mechanism on screen
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigator */}
        <div className="flex gap-2 border-b border-slate-800 pb-2 shrink-0 text-xs font-medium">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'OVERVIEW'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. High-Level Flow
          </button>
          <button
            onClick={() => setActiveTab('CARDS')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'CARDS'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. The 8 Telemetry Cards
          </button>
          <button
            onClick={() => setActiveTab('LINK')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'LINK'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Quantum Link & SCADA
          </button>
          <button
            onClick={() => setActiveTab('DECISION')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'DECISION'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            4. The Security Decision Rule
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs text-slate-300 leading-relaxed">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-cyan-300">
                  What is this dashboard actually doing?
                </h3>
                <p>
                  The dashboard monitors an optical communication channel connecting a <strong>Central Control Center (Alice)</strong> to a <strong>Remote Substation (Bob)</strong> in a critical infrastructure setting (e.g., an electric power grid).
                </p>
                <p>
                  Instead of sending classical secret keys over vulnerable networks, Alice encodes random bits into single photons using polarization angles. Over an optical fiber, Bob measures these photons. They announce their bases over a public classical channel (sifting) to form a shared secret key.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                    Step 1: Transmission
                  </span>
                  <p className="font-semibold text-slate-200">Photon Polarization</p>
                  <p className="text-[11px] text-slate-400">
                    Alice fires photons in random Z (|0⟩, |1⟩) or X (|+⟩, |–⟩) bases across 25 km of dark fiber.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">
                    Step 2: Measurement
                  </span>
                  <p className="font-semibold text-slate-200">Wave Collapse</p>
                  <p className="text-[11px] text-slate-400">
                    Bob measures in random bases. If Eve taps the fiber, quantum collapse inevitably injects errors.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                    Step 3: Verification
                  </span>
                  <p className="font-semibold text-slate-200">QBER Threat Check</p>
                  <p className="text-[11px] text-slate-400">
                    If QBER &lt; 11%, the key is trusted and used to encrypt SCADA commands. If &gt; 11%, the key is rejected.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'CARDS' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">1. Qubits Sent</span>
                    <span className="font-mono text-cyan-400 text-[10px]">Alice Tx</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    The total number of polarized photon pulses emitted by Alice's laser transmitter (typically 100 to 1,000).
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">2. Sifted Bits</span>
                    <span className="font-mono text-emerald-400 text-[10px]">~50% Yield</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Measurements where Alice and Bob independently selected the exact same basis ($Z$ and $Z$, or $X$ and $X$). By probability, this is always approximately 50%.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">3. Qubits Compared</span>
                    <span className="font-mono text-slate-400 text-[10px]">Sample Subset</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    A sacrificed portion of the sifted key publicly revealed over the classical channel to test for eavesdropping without leaking the rest of the key.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">4. Final Key Length</span>
                    <span className="font-mono text-cyan-300 text-[10px]">Secret Key</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    The unrevealed sifted bits that form the final secret symmetric key used for One-Time Pad encryption.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">5. Measured QBER</span>
                    <span className="font-mono text-rose-400 text-[10px]">Error Rate (%)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Quantum Bit Error Rate = Discrepancies / Tested Bits. This is the central security metric.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">6. Channel Noise</span>
                    <span className="font-mono text-amber-400 text-[10px]">Fiber Loss</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Simulates physical attenuation and thermal phase drift in dark optical fiber cables.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">7. Eve Activity</span>
                    <span className="font-mono text-purple-400 text-[10px]">Attacker Probe</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Indicates whether an adversary is currently tapping the optical line and what percentage of photons she is intercepting.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">8. Security Decision</span>
                    <span className="font-mono text-emerald-300 text-[10px]">Policy Gate</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Automated OT policy decision: `KEY_ACCEPTED` (safe to encrypt SCADA traffic) or `KEY_DISCARDED` (link untrusted).
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'LINK' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-cyan-300">
                  The Critical Infrastructure SCADA Interlocking Test
                </h4>
                <p>
                  At the bottom of the link diagram, look at the <strong>Protected SCADA Command</strong>:
                </p>
                <div className="p-3 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300">
                  Plaintext: "TRIP_BREAKER_SYNC_400KV_BUS_B"
                </div>
                <p>
                  When QBER is low (&lt; 11%), the generated quantum key performs a <strong>One-Time Pad (OTP) XOR stream cipher</strong>. Bob decrypts the command, verifies its integrity, and displays <strong>OTP_VERIFIED</strong>.
                </p>
                <p className="text-rose-300">
                  When Eve attacks and QBER exceeds 11%, the platform marks the key untrusted. The ciphertext is blocked, Bob displays <strong>OTP_BLOCKED</strong>, and the breaker command is safely aborted rather than executed with a compromised key!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'DECISION' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-amber-300">
                  Why 11.0% Threshold? (The Math Behind the Cutoff)
                </h4>
                <p>
                  In the theoretical security analysis of the BB84 protocol (Shor & Preskill, 2000), <strong>11.0%</strong> is the asymptotic limit.
                </p>
                <p>
                  Below 11%, the mutual information between Alice and Bob $I(A; B)$ is strictly greater than the information Eve can possess $I(A; E)$. Through <strong>Information Reconciliation</strong> (error correction) and <strong>Privacy Amplification</strong> (hashing away Eve's partial knowledge), Alice and Bob can extract a 100% secret key.
                </p>
                <p>
                  Above 11%, Eve possesses more information than error correction can compensate for. Under unconditional quantum security theorems, <strong>no secret key can be extracted</strong>. Hence, Q-SHIELD automatically discards the key.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold cursor-pointer"
          >
            Got it, Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
