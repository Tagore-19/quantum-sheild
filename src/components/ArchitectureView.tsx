/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Q-SHIELD: Interactive System Architecture View
 * Visual dataflow diagram with clickable components & technical specifications
 */

import React, { useState } from 'react';
import {
  Workflow,
  Globe,
  Server,
  Cpu,
  Radio,
  Eye,
  Activity,
  ShieldCheck,
  Database,
  ArrowDown,
  Info,
  CheckCircle,
} from 'lucide-react';

interface ArchNode {
  id: string;
  name: string;
  category: 'CLIENT' | 'API' | 'QUANTUM_CORE' | 'SECURITY' | 'STORAGE';
  icon: React.ReactNode;
  summary: string;
  technology: string;
  inputs: string;
  outputs: string;
  scientificNotes: string;
}

export const ArchitectureView: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('bb84');

  const nodes: ArchNode[] = [
    {
      id: 'ui',
      name: 'Client Web Dashboard (SPA)',
      category: 'CLIENT',
      icon: <Globe className="w-5 h-5 text-cyan-400" />,
      summary: 'Professional dark cybersecurity UI displaying real-time quantum telemetry, interactive pipeline controls, and attack radar.',
      technology: 'React 19, TypeScript, Tailwind CSS, Lucide Icons',
      inputs: 'User parameters (qubits, noise %, Eve %, threshold)',
      outputs: 'Visual telemetry, qubit inspector, OTP encrypted SCADA payloads',
      scientificNotes: 'Strictly presents simulation data; clearly labeled with educational prototype disclaimers.',
    },
    {
      id: 'api',
      name: 'REST API & Backend Server',
      category: 'API',
      icon: <Server className="w-5 h-5 text-blue-400" />,
      summary: 'High-performance Express/Node.js backend validating requests, managing sessions, and invoking quantum simulation pipelines.',
      technology: 'Express 4.21, TypeScript, tsx, REST JSON',
      inputs: 'POST /api/simulation/run, POST /api/qkd/bb84, POST /api/qkd/attack',
      outputs: 'Structured JSON simulation sessions, audit logs, aggregated metrics',
      scientificNotes: 'Strict parameter boundary validation prevents simulation NaN and out-of-bounds rates.',
    },
    {
      id: 'qkd_engine',
      name: 'QKD Coordination Engine',
      category: 'QUANTUM_CORE',
      icon: <Workflow className="w-5 h-5 text-indigo-400" />,
      summary: 'Orchestrates the multi-stage BB84 lifecycle: entropy generation, basis selection, transmission, reconciliation, and key distillation.',
      technology: 'TypeScript, Pure Functional State Pipelines',
      inputs: 'Target parameters, scenario configuration, PRNG source',
      outputs: 'Complete qubit transmission trace array and classical classical channel messages',
      scientificNotes: 'Separates quantum physical transmission simulation from classical sifting communication.',
    },
    {
      id: 'bb84',
      name: 'BB84 Quantum Simulation Core',
      category: 'QUANTUM_CORE',
      icon: <Cpu className="w-5 h-5 text-cyan-300" />,
      summary: 'Faithfully implements single-photon polarization state encoding across Z {|0⟩, |1⟩} and X {|+⟩, |–⟩} conjugate bases.',
      technology: 'Exact Complex State Vectors & Born Rule Measurement',
      inputs: 'Alice classical bits & randomly chosen bases',
      outputs: 'State vectors (|0⟩, |1⟩, |+⟩, |–⟩) ready for optical transport',
      scientificNotes: 'Conjugate basis measurements are strictly non-deterministic: P(0) = P(1) = 0.5 upon wave-function collapse.',
    },
    {
      id: 'channel_model',
      name: 'Quantum Optical Channel Model',
      category: 'QUANTUM_CORE',
      icon: <Radio className="w-5 h-5 text-amber-400" />,
      summary: 'Simulates physical optical fiber properties including 1550nm fiber attenuation, birefringence, and environmental thermal phase noise.',
      technology: 'Depolarizing & Bit-Flip Noise Matrix Model',
      inputs: 'Prepared photon polarization states, channelNoise coefficient',
      outputs: 'Perturbed quantum states arriving at receiver or interceptor',
      scientificNotes: 'Models physical thermal drift and dark counts common in telecom dark-fiber links.',
    },
    {
      id: 'eve_model',
      name: 'Eve Intercept-Resend Attacker Model',
      category: 'SECURITY',
      icon: <Eye className="w-5 h-5 text-purple-400" />,
      summary: 'Educational eavesdropper module intercepting photons, measuring in random bases, collapsing wave-functions, and resending states.',
      technology: 'Projective Quantum Measurement & State Repreparation',
      inputs: 'Propagating photons, eveInterceptionRate (0.0 to 1.0)',
      outputs: 'Collapsed resent quantum states, corruption markers',
      scientificNotes: 'No-Cloning Theorem prevents passive wiretapping; Eve inevitably leaks presence by introducing ~25% error on sifted bits.',
    },
    {
      id: 'qber_engine',
      name: 'QBER & Sifting Engine',
      category: 'SECURITY',
      icon: <Activity className="w-5 h-5 text-emerald-400" />,
      summary: 'Executes classical basis reconciliation over authenticated channel and samples sifted bits to calculate Quantum Bit Error Rate.',
      technology: 'Statistical Parameter Estimation & Sifting Filter',
      inputs: 'Alice & Bob public basis announcements, sample test subset',
      outputs: 'Sifted key candidates, measured QBER percentage, sample error count',
      scientificNotes: 'QBER = N_errors / N_tested. Asymptotic theoretical security threshold is ~11% for standard BB84.',
    },
    {
      id: 'decision_engine',
      name: 'Security Policy Decision Engine',
      category: 'SECURITY',
      icon: <ShieldCheck className="w-5 h-5 text-rose-400" />,
      summary: 'Compares measured QBER against configured security threshold. Triggers security alerts and aborts/rejects keys if QBER exceeds limit.',
      technology: 'Automated OT Security Policy Evaluator',
      inputs: 'Measured QBER, securityThreshold parameter',
      outputs: 'Status: SECURE, WARNING, POTENTIAL_EAVESDROPPING, KEY_REJECTED',
      scientificNotes: 'Rejection prevents compromised keys from encrypting critical infrastructure SCADA telemetry.',
    },
    {
      id: 'database',
      name: 'Session Store & Event Ledger',
      category: 'STORAGE',
      icon: <Database className="w-5 h-5 text-slate-300" />,
      summary: 'In-memory persistent registry storing session parameters, telemetry history, audit logs, and One-Time Pad encrypted test payloads.',
      technology: 'Structured In-Memory Store / SQLite Compatible Interface',
      inputs: 'Completed simulation sessions & security events',
      outputs: 'Historical analytics, CSV/JSON export, queryable audit logs',
      scientificNotes: 'Provides traceability for hackathon judges and post-incident security forensics.',
    },
  ];

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[3];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Workflow className="w-5 h-5 text-cyan-400" />
          Q-SHIELD Modular System Architecture
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Interactive architectural map illustrating the layered dataflow from user controls down to quantum state physics and security decisions.
        </p>
      </div>

      {/* Interactive Flow Diagram */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase mb-4">
          Click any component to inspect inputs, outputs, and scientific implementation:
        </h3>

        {/* Vertical Pipeline Flow */}
        <div className="space-y-3 max-w-2xl mx-auto">
          {nodes.map((node, idx) => {
            const isSelected = selectedNodeId === node.id;
            return (
              <React.Fragment key={node.id}>
                <button
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-500 shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      {node.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100">{node.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {node.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{node.technology}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 font-semibold shrink-0">
                    {isSelected ? 'ACTIVE' : 'INSPECT'}
                  </span>
                </button>

                {/* Down Arrow connector between nodes */}
                {idx < nodes.length - 1 && (
                  <div className="flex justify-center py-0.5 text-slate-600">
                    <ArrowDown className="w-4 h-4 text-slate-700 animate-pulse" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Component Technical Specification Panel */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              {selectedNode.icon}
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                {selectedNode.category} COMPONENT SPECIFICATION
              </span>
              <h3 className="text-base font-bold text-slate-100 mt-0.5 font-sans">
                {selectedNode.name}
              </h3>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
            {selectedNode.technology}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {selectedNode.summary}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase text-[10px]">Data Inputs:</span>
            <p className="text-slate-300">{selectedNode.inputs}</p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase text-[10px]">Data Outputs:</span>
            <p className="text-cyan-300">{selectedNode.outputs}</p>
          </div>
        </div>

        <div className="bg-cyan-950/30 p-4 rounded-lg border border-cyan-800/60 text-xs flex items-start gap-3">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-cyan-200">Scientific Assumption & Engineering Constraint: </span>
            <p className="text-slate-300 mt-0.5 leading-relaxed">
              {selectedNode.scientificNotes}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
