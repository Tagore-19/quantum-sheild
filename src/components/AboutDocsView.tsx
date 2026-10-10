/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Q-SHIELD: Hackathon Pitch Guide, Judge Q&A & Documentation View
 * 5-minute presentation script, anticipated judge Q&A, innovation points, and technical documentation
 */

import React, { useState } from 'react';
import {
  Zap,
  HelpCircle,
  FileText,
  Award,
  ChevronDown,
  ChevronUp,
  Shield,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Download,
  ExternalLink,
  Copy,
  Check,
  Package,
} from 'lucide-react';

export const AboutDocsView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'DOWNLOAD' | 'PROCEDURE' | 'PITCH' | 'QA' | 'INNOVATION' | 'LIMITATIONS'>('DOWNLOAD');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const judgeFaqs = [
    {
      q: 'Is this real quantum computing hardware or a software simulation?',
      a: 'This is a software-based educational simulation platform. We explicitly state throughout the UI and documentation that real-world QKD requires physical quantum-photonic hardware (single-photon emitters, superconducting nanowire detectors, low-loss dark fiber optics), authenticated classical communication, physical security, and finite-key security analysis. We simulate the exact quantum physics—polarization states, Born rule measurement collapse, conjugate bases, and QBER derivation.',
    },
    {
      q: 'Why does an eavesdropper inevitably increase the Quantum Bit Error Rate (QBER)?',
      a: 'By the fundamental No-Cloning Theorem of quantum mechanics, Eve cannot copy an unknown quantum state without disturbing it. To gain information, Eve must measure the photon. Because she cannot know Alice\'s basis in advance, she guesses randomly between Z and X bases. When she guesses wrong (50% of the time), her measurement collapses the photon into the wrong basis. When Bob measures in Alice\'s original basis, quantum mechanics dictates he has a 50% chance of getting the wrong bit. Therefore: 0.5 × 0.5 = 25% error on sifted bits when Eve intercepts 100% of qubits.',
    },
    {
      q: 'Why did you select 11% as the default BB84 security threshold?',
      a: 'In BB84 asymptotic security proofs (such as the landmark Shor-Preskill proof), 11.0% is the theoretical maximum error rate under which Alice and Bob still share more mutual information with each other than Eve can obtain. Above 11%, information reconciliation and privacy amplification cannot mathematically extract an unconditionally secure secret key. We also make the threshold fully configurable to account for practical optical noise margins.',
    },
    {
      q: 'How does Q-SHIELD integrate with Critical Infrastructure (SCADA/OT networks)?',
      a: 'We demonstrate how quantum-generated keys are fed into an Operational Technology (OT) encryption layer to secure critical SCADA telemetry—such as tripping high-voltage circuit breakers or adjusting municipal water valves. When Q-SHIELD detects an anomalous QBER spike, it immediately flags the session as UNTRUSTED, blocks compromised command dispatch, and triggers automated re-keying.',
    },
    {
      q: 'Does Q-SHIELD work completely offline without internet or external AI API keys?',
      a: 'Yes! Q-SHIELD has an offline-first architecture. The core BB84 quantum physics engine, threat detection algorithms, SVG charting, and rule-based security evaluations run 100% locally with zero cloud dependencies. The Gemini AI Security Analyst is an optional enhancement layer with automatic offline fallback.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                PROBLEM STATEMENT VNQFF-07
              </span>
              <span className="text-xs text-slate-400">Hackathon Pitch & Evaluation Dossier</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-1 font-sans">
              Q-SHIELD: Quantum Key Distribution for Critical Infrastructure
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              "Q-SHIELD is a simulation-based quantum-security monitoring platform that demonstrates BB84 Quantum Key Distribution for critical-infrastructure communication and identifies simulated eavesdropping through QBER-based monitoring."
            </p>
          </div>

          <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveSection('DOWNLOAD')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'DOWNLOAD'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              Download Package
            </button>
            <button
              onClick={() => setActiveSection('PROCEDURE')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'PROCEDURE'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Step-by-Step Prototype Guide
            </button>
            <button
              onClick={() => setActiveSection('PITCH')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                activeSection === 'PITCH'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              5-Min Pitch Script
            </button>
            <button
              onClick={() => setActiveSection('QA')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                activeSection === 'QA'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Judge Q&A
            </button>
            <button
              onClick={() => setActiveSection('INNOVATION')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                activeSection === 'INNOVATION'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Innovations
            </button>
            <button
              onClick={() => setActiveSection('LIMITATIONS')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                activeSection === 'LIMITATIONS'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Limitations & Scope
            </button>
          </div>
        </div>
      </div>

      {/* Content Sections */}

      {/* 0. DOWNLOAD & REPOSITORY BUNDLE SECTION */}
      {activeSection === 'DOWNLOAD' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  📦 Project Deliverable Exports
                </span>
                <h3 className="text-lg font-bold text-slate-100 mt-1">
                  Download Complete Q-SHIELD Software & Documentation
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Download the full working codebase, test suites, and pitch documents for hackathon offline evaluation or local development.
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href="/api/download/project-zip"
                  download="q-shield-quantum-prototype.zip"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-950/40 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Project ZIP</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: Full Source Code */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-sm flex items-center gap-2">
                      <Package className="w-4 h-4 text-cyan-400" /> Full Source Code (.ZIP)
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      ~1.2 MB
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Complete working repository with all React components, Express backend, BB84 simulation engine, AES-256-GCM encryption, automated verification tests, and Vite configuration.
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 mt-3 list-disc pl-4">
                    <li>`src/services/bb84Simulation.ts` (Quantum BB84 physics)</li>
                    <li>`src/services/cryptoAesGcm.ts` (AES-256-GCM / OTP layer)</li>
                    <li>`server.ts` (REST APIs + offline telemetry evaluator)</li>
                    <li>`tests/bb84.test.ts` (Automated scientific test suite)</li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <a
                    href="/api/download/project-zip"
                    download="q-shield-quantum-prototype.zip"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download q-shield-quantum-prototype.zip
                  </a>
                </div>
              </div>

              {/* Option B: Documentation & Pitch Dossier */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400" /> Hackathon Pitch Dossier (.ZIP)
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      Markdown & Specs
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Complete set of pitch scripts, anticipated judge Q&A, system architecture diagrams, API specifications, and problem statement documentation.
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 mt-3 list-disc pl-4">
                    <li>`README.md` & `HACKATHON_DEMO.md`</li>
                    <li>`ARCHITECTURE.md` & `API.md`</li>
                    <li>`LIMITATIONS.md` & `FUTURE_SCOPE.md`</li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <a
                    href="/api/download/docs-bundle"
                    download="q-shield-docs-and-pitch.zip"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download q-shield-docs-and-pitch.zip
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Setup Instructions */}
            <div className="mt-5 p-4 rounded-lg bg-slate-950 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                🚀 How to Run Locally After Unzipping
              </h4>
              <div className="bg-slate-900 rounded p-3 font-mono text-xs text-cyan-300 flex items-center justify-between">
                <code>git clone &lt;repo&gt; &amp;&amp; npm install &amp;&amp; npm run dev</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('npm install && npm run dev');
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="p-1 hover:text-white transition-colors cursor-pointer text-slate-400"
                  title="Copy command"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Runs on `http://localhost:3000` with full full-stack Vite server, REST APIs, and automated offline simulation engine.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 0.5 STEP-BY-STEP PROCEDURE OF WORKING PROTOTYPE */}
      {activeSection === 'PROCEDURE' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Implementation Guide
            </span>
            <h3 className="text-base font-bold text-slate-100 mt-0.5">
              Step-by-Step Procedure of the Working Q-SHIELD BB84 Prototype
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Follow this step-by-step walkthrough to see exactly how Alice, Eve, and Bob execute quantum key distribution with real example data.
            </p>
          </div>

          {/* Procedure Steps */}
          <div className="space-y-4 text-xs text-slate-300">
            {/* Step 1 */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                  1
                </span>
                <h4 className="font-bold text-slate-100 text-sm">
                  Alice Generates Random Classical Bits and Polarization Bases
                </h4>
              </div>
              <p className="text-slate-300 leading-relaxed pl-8">
                Alice (Control Center) generates an unbiased sequence of classical bits [0, 1] and randomly assigns each bit to one of two mutually unbiased bases:
                computational basis <strong>Z</strong> (|0⟩, |1⟩) or diagonal basis <strong>X</strong> (|+⟩, |–⟩).
              </p>
              <div className="ml-8 p-3 rounded bg-slate-900 border border-slate-800 font-mono text-xs">
                <div className="text-cyan-400 font-bold mb-1">Example Data (First 8 Qubits):</div>
                <div>Alice's Bits : [ 0,  1,  1,  0,  1,  0,  0,  1 ]</div>
                <div>Alice's Bases: [ Z,  Z,  X,  X,  Z,  X,  Z,  X ]</div>
                <div>Polarization : [ |0⟩, |1⟩, |–⟩, |+⟩, |1⟩, |+⟩, |0⟩, |–⟩ ]</div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                  2
                </span>
                <h4 className="font-bold text-slate-100 text-sm">
                  Simulated Quantum Transmission & Intercept-Resend Attack (Eve)
                </h4>
              </div>
              <p className="text-slate-300 leading-relaxed pl-8">
                The single photons traverse the optical fiber link. If simulated eavesdropping is enabled:
                Eve intercepts the photon, picks a random measurement basis ($Z$ or $X$), and performs a projective quantum measurement.
                By the <strong>No-Cloning Theorem</strong>, Eve cannot measure without collapsing the superposition. She then prepares a new photon in her measured state and resends it to Bob.
              </p>
              <div className="ml-8 p-3 rounded bg-slate-900 border border-slate-800 font-mono text-xs">
                <div className="text-amber-400 font-bold mb-1">Eavesdropper Interception Mechanics:</div>
                <div>Eve's Basis Choice : [ X,  Z,  Z,  X,  X,  X,  Z,  Z ]</div>
                <div>Basis Match w/ Alice: [ No, Yes, No, Yes, No, Yes, Yes, No ]</div>
                <div className="text-rose-400 mt-1">
                  ⚡ When Eve guesses the wrong basis (50% probability), she permanently collapses the state. This creates a 50% probability of Bob measuring an error even when Bob uses Alice's original basis ($0.5 \times 0.5 = 25\%$ error rate).
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                  3
                </span>
                <h4 className="font-bold text-slate-100 text-sm">
                  Bob Selects Random Measurement Bases and Records Outcomes
                </h4>
              </div>
              <p className="text-slate-300 leading-relaxed pl-8">
                Bob (Remote Substation) independently and randomly selects a measurement basis for each incoming photon without knowing Alice's basis.
              </p>
              <div className="ml-8 p-3 rounded bg-slate-900 border border-slate-800 font-mono text-xs">
                <div>Bob's Bases : [ Z,  X,  X,  Z,  Z,  X,  X,  X ]</div>
                <div>Bob's Result: [ 0,  0,  1,  1,  1,  0,  1,  1 ]</div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                  4
                </span>
                <h4 className="font-bold text-slate-100 text-sm">
                  Basis Reconciliation (Sifting) Over Authenticated Classical Channel
                </h4>
              </div>
              <p className="text-slate-300 leading-relaxed pl-8">
                Alice and Bob publicly broadcast which bases they used (NOT their bit values).
                They discard all positions where their bases did not match, retaining the <strong>Sifted Key</strong> ($\approx 50\%$ sifting ratio).
              </p>
              <div className="ml-8 p-3 rounded bg-slate-900 border border-slate-800 font-mono text-xs">
                <div>Alice's Bases: [ Z,  Z,  X,  X,  Z,  X,  Z,  X ]</div>
                <div>Bob's Bases  : [ Z,  X,  X,  Z,  Z,  X,  X,  X ]</div>
                <div>Match Status : [ ✓,  ✗,  ✓,  ✗,  ✓,  ✓,  ✗,  ✓ ]  → 5 matches out of 8</div>
                <div className="text-cyan-400 mt-1">
                  Alice Sifted Bits: [ 0,  -,  1,  -,  1,  0,  -,  1 ] → Raw key: 01101
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                  5
                </span>
                <h4 className="font-bold text-slate-100 text-sm">
                  QBER Estimation & Security Status Determination
                </h4>
              </div>
              <p className="text-slate-300 leading-relaxed pl-8">
                Alice and Bob publicly compare a random sample of their sifted bits (e.g., 20% or a configured check size) to calculate the Quantum Bit Error Rate (QBER):
                <code className="block my-1.5 px-3 py-1 bg-slate-900 rounded border border-slate-800 text-cyan-300 font-mono text-[11px]">
                  QBER = (Mismatches in compared sample) / (Total compared sample bits)
                </code>
                The sampled bits are immediately discarded from the final key to preserve secrecy.
              </p>
              <div className="ml-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded bg-emerald-950/40 border border-emerald-500/40 font-mono">
                  <div className="text-emerald-400 font-bold">CASE A: No Eavesdropping</div>
                  <div className="text-slate-300 mt-1">Measured QBER: 0.0% (Noise &lt; 1%)</div>
                  <div className="text-slate-300">Threshold: 11.0%</div>
                  <div className="text-emerald-400 font-bold mt-1">Decision: SECURE (Key Accepted)</div>
                </div>
                <div className="p-3 rounded bg-rose-950/40 border border-rose-500/40 font-mono">
                  <div className="text-rose-400 font-bold">CASE B: Eve 100% Intercept</div>
                  <div className="text-slate-300 mt-1">Measured QBER: ~25.0%</div>
                  <div className="text-slate-300">Threshold: 11.0%</div>
                  <div className="text-rose-400 font-bold mt-1">Decision: COMPROMISED (Key Rejected)</div>
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                  6
                </span>
                <h4 className="font-bold text-slate-100 text-sm">
                  Critical-Infrastructure SCADA Command Encryption & Enforcement
                </h4>
              </div>
              <p className="text-slate-300 leading-relaxed pl-8">
                If the key is accepted, it is used with AES-256-GCM / One-Time Pad to encrypt operational SCADA commands (e.g. <code>TRIP_BREAKER_400KV_BUS_B</code>).
                If the key is rejected due to QBER exceeding the threshold (&gt; 11%), the transmission is immediately blocked, raising a high-priority security incident and triggering automated key renegotiation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 1. Pitch Script */}
      {activeSection === 'PITCH' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              5-Minute Winning Hackathon Pitch Structure & Script
            </h3>
            <span className="text-xs font-mono text-slate-400">Total Time: ~300 Seconds</span>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-slate-300">
            {/* Minute 1 */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-mono text-cyan-400 font-bold">
                [00:00 - 01:00] THE PROBLEM: THE QUANTUM THREAT TO CRITICAL INFRASTRUCTURE
              </span>
              <p className="text-slate-200">
                "Judges, our electric grids, water purification systems, and transport networks rely on SCADA control networks secured by classical cryptography like RSA and ECC. But with the advent of quantum computers running Shor’s algorithm, these algorithms can be broken, exposing vital infrastructure to catastrophic tampering. Furthermore, bad actors are collecting encrypted traffic today to decrypt it later—the 'Harvest Now, Decrypt Later' threat."
              </p>
            </div>

            {/* Minute 2 */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-mono text-cyan-400 font-bold">
                [01:00 - 02:00] OUR PROPOSED SOLUTION: Q-SHIELD
              </span>
              <p className="text-slate-200">
                "Enter Q-SHIELD. Q-SHIELD is a quantum-secure communication monitoring and threat detection platform built specifically for critical infrastructure. By simulating the BB84 Quantum Key Distribution protocol in software, Q-SHIELD enables control centers like Alice to negotiate shared, provably secure encryption keys with remote substations like Bob across optical links."
              </p>
            </div>

            {/* Minute 3 */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-mono text-cyan-400 font-bold">
                [02:00 - 03:30] LIVE DEMO & SCIENTIFIC PRINCIPLE: DETECTING EVE
              </span>
              <p className="text-slate-200">
                "Watch what happens in our 1-Click Demo: In nominal operations, Alice and Bob exchange photons with low baseline noise (~0-1% QBER). The key is established, and SCADA commands are safely encrypted with One-Time Pad.
                Now, we activate a simulated attacker, Eve, who intercepts the optical fiber. By the fundamental No-Cloning Theorem, Eve cannot copy the photons—she must measure them. Because she guesses the basis wrong 50% of the time, her measurement collapses the states, introducing a 25% error on intercepted qubits.
                Our QBER Engine immediately detects this spike (jumping to ~12-14%), crosses our 11% threshold, and automatically REJECTS the compromised key, blocking transmission!"
              </p>
            </div>

            {/* Minute 4 */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-mono text-cyan-400 font-bold">
                [03:30 - 04:30] SYSTEM ARCHITECTURE & INNOVATIONS
              </span>
              <p className="text-slate-200">
                "Q-SHIELD features a clean full-stack architecture: React and TypeScript frontend, Express REST backend, an exact state-vector quantum simulation engine, and an optional AI Security Analyst. Every single qubit can be microscopically inspected to see the wave-function collapse math in real time."
              </p>
            </div>

            {/* Minute 5 */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-mono text-cyan-400 font-bold">
                [04:30 - 05:00] CONCLUSION & IMPACT
              </span>
              <p className="text-slate-200">
                "Q-SHIELD bridges the gap between complex quantum physics and practical critical-infrastructure defense, proving that quantum mechanics can not only secure our communications, but actively expose any intruder trying to listen in. Thank you, and we welcome your questions!"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Judge Q&A */}
      {activeSection === 'QA' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              Anticipated Judge Questions & Bulletproof Answers
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review these questions to answer technical and architectural inquiries from judges with complete authority.
            </p>
          </div>

          <div className="space-y-3">
            {judgeFaqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-slate-200 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-cyan-400 font-mono">Q{idx + 1}:</span>
                      {faq.q}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-850 bg-slate-900/50">
                      <p className="text-cyan-100 font-sans font-medium mb-1">Recommended Response:</p>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Innovation Points */}
      {activeSection === 'INNOVATION' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Key Technical Innovations & Differentiators
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <h4 className="font-bold text-cyan-300">1. Microscopic Qubit Inspector</h4>
              <p className="text-slate-300 leading-relaxed">
                Unlike shallow simulators that merely display random numbers, Q-SHIELD simulates individual photon polarization state vectors across Z and X bases, allowing users to inspect the exact wave-function collapse mathematics for any specific qubit.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <h4 className="font-bold text-purple-300">2. Real Intercept-Resend Attack Physics</h4>
              <p className="text-slate-300 leading-relaxed">
                Faithfully reproduces the 25% error invariant discovered by Bennett and Brassard. When Eve taps the line and collapses the state, Bob receives an uncorrelated outcome half of the time, resulting in an exact mathematical elevation of QBER.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <h4 className="font-bold text-emerald-300">3. Critical-Infrastructure SCADA Integration</h4>
              <p className="text-slate-300 leading-relaxed">
                Demonstrates how quantum keys protect actual operational technology (Power Grids, Water Treatment, Transportation, Nuclear Cooling) by feeding verified keys into simulated One-Time Pad encrypted SCADA commands.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-300">4. Automated 1-Click Demo & AI Security Analyst</h4>
              <p className="text-slate-300 leading-relaxed">
                Provides a zero-effort automated presentation workflow for judges, combined with an AI interpretation engine using Gemini 3.8 Flash with a guaranteed offline deterministic fallback.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Limitations & Scope */}
      {activeSection === 'LIMITATIONS' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Engineering Limitations & Future Scope
          </h3>

          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-slate-100">Prototype Assumptions & Limitations:</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Software simulation of quantum states using classical PRNG rather than true hardware photon sources.</li>
                <li>Simulates direct point-to-point fiber; does not model complex optical switching or quantum repeaters.</li>
                <li>Models single-photon pulses; does not model multi-photon emissions requiring Decoy State analysis.</li>
                <li>Classical channel authentication is simulated; in production, Wegman-Carter polynomial hashing is required.</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-cyan-300">Future Product Roadmap:</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Integration with Qiskit Aer backend and quantum cloud hardware (IBM Quantum / IonQ).</li>
                <li>Decoy-state BB84 and Continuous-Variable QKD (CV-QKD) support.</li>
                <li>Hardware Security Module (HSM) PKCS#11 key management integration.</li>
                <li>Real-world OT protocol integration (IEC 60870-5-104 and DNP3 secure authentication).</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
