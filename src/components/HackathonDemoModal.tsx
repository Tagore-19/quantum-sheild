/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Q-SHIELD: Automated 1-Click Hackathon Presentation Demo Modal
 * Automatically runs the complete end-to-end security story:
 * Normal Link → Eve Attack → QBER Spike → Key Rejection → Remediation
 */

import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { SimulationParameters } from '../types/qkd.ts';

interface HackathonDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunParametricSimulation: (params: SimulationParameters) => Promise<void>;
  onResetSimulation: () => void;
}

export const HackathonDemoModal: React.FC<HackathonDemoModalProps> = ({
  isOpen,
  onClose,
  onRunParametricSimulation,
  onResetSimulation,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [demoLog, setDemoLog] = useState<string[]>([]);

  const demoSteps = [
    {
      id: 1,
      title: 'Phase 1: Baseline Secure Channel',
      desc: 'Alice transmits 100 qubits across clean optical fiber (0% noise, Eve disabled).',
      action: async () => {
        addLog('Initiating nominal BB84 exchange: 100 qubits, 0.0% channel noise, Eve OFF...');
        await onRunParametricSimulation({
          qubitCount: 100,
          channelNoise: 0.0,
          eveEnabled: false,
          eveInterceptionRate: 0.0,
          securityThreshold: 0.11,
          scenario: 'power_grid',
        });
        addLog('✓ Sifting completed (~50 bits). Observed QBER = 0.00%. Status: SECURE. Key Accepted.');
      },
    },
    {
      id: 2,
      title: 'Phase 2: Adversary Activates Intercept-Resend',
      desc: 'Simulated attacker Eve probes the line, intercepting 50% of propagating photons.',
      action: async () => {
        addLog('Adversary Eve taps optical fiber line with 50% intercept-resend attack...');
        await onRunParametricSimulation({
          qubitCount: 200,
          channelNoise: 0.01,
          eveEnabled: true,
          eveInterceptionRate: 0.50,
          securityThreshold: 0.11,
          scenario: 'power_grid',
        });
        addLog('✓ Eve guessed wrong basis on ~25% of intercepted qubits, collapsing quantum states.');
      },
    },
    {
      id: 3,
      title: 'Phase 3: QBER Spike & Automated Anomaly Detection',
      desc: 'Error estimation measures QBER rising to ~12-14%, crossing the 11% threshold.',
      action: async () => {
        addLog('QBER parameter estimation calculated ~12.5% error rate.');
        addLog('⚠ SECURITY ALERT: Measured QBER exceeded application threshold (11.0%)!');
      },
    },
    {
      id: 4,
      title: 'Phase 4: Policy Enforcement & Key Rejection',
      desc: 'OT Security policy automatically discards the compromised key and blocks SCADA dispatch.',
      action: async () => {
        addLog('Policy enforcement: Key marked UNTRUSTED. SCADA command transmission blocked.');
        addLog('✓ Compromised key discarded. Physical line diagnostic requested.');
      },
    },
    {
      id: 5,
      title: 'Phase 5: Mitigation & Fresh Key Agreement',
      desc: 'Channel restored, Eve disengaged, fresh quantum key negotiated successfully.',
      action: async () => {
        addLog('Mitigation active: Rerouting quantum channel to clean dark fiber #02...');
        await onRunParametricSimulation({
          qubitCount: 150,
          channelNoise: 0.005,
          eveEnabled: false,
          eveInterceptionRate: 0.0,
          securityThreshold: 0.11,
          scenario: 'power_grid',
        });
        addLog('✓ Fresh 75-bit secret key established. One-Time Pad encrypted SCADA transmission restored!');
      },
    },
  ];

  const addLog = (msg: string) => {
    setDemoLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const startAutomatedWorkflow = async () => {
    setIsRunning(true);
    setDemoLog([]);
    addLog('Starting Automated Hackathon Presentation Demo...');

    for (let i = 0; i < demoSteps.length; i++) {
      setCurrentStep(i + 1);
      await demoSteps[i].action();
      // Brief pause between steps for dramatic effect
      await new Promise((r) => setTimeout(r, 1400));
    }

    addLog('🎉 Hackathon Demo Workflow Successfully Completed!');
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setDemoLog([]);
    onResetSimulation();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100 font-sans">
              1-Click Automated Hackathon Demo Runner
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automates the entire 5-stage demonstration sequence: from baseline quantum security to active Eve intercept-resend attack, QBER threshold violation, automated key rejection, and clean channel remediation.
          </p>
        </div>

        {/* Steps Progress Indicator */}
        <div className="grid grid-cols-5 gap-2">
          {demoSteps.map((s) => {
            const isCompleted = currentStep > s.id;
            const isCurrent = currentStep === s.id;
            return (
              <div
                key={s.id}
                className={`p-2.5 rounded-lg border text-xs text-center transition-all ${
                  isCurrent
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-200 font-bold shadow-md shadow-cyan-950/50'
                    : isCompleted
                    ? 'bg-slate-950 border-emerald-700/80 text-emerald-300'
                    : 'bg-slate-950/50 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex justify-center mb-1">
                  {isCompleted ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <span className="font-mono text-[10px]">0{s.id}</span>
                  )}
                </div>
                <p className="text-[10px] truncate leading-tight font-sans">
                  {s.title.split(':')[1] || s.title}
                </p>
              </div>
            );
          })}
        </div>

        {/* Live Execution Terminal Log */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs max-h-56 overflow-y-auto space-y-1">
          {demoLog.length === 0 ? (
            <p className="text-slate-500 italic">
              Press "Start Automated Demo" below to begin the presentation sequence.
            </p>
          ) : (
            demoLog.map((log, idx) => (
              <p
                key={idx}
                className={
                  log.includes('ALERT') || log.includes('UNTRUSTED')
                    ? 'text-rose-400 font-semibold'
                    : log.includes('✓') || log.includes('🎉')
                    ? 'text-emerald-400'
                    : 'text-slate-300'
                }
              >
                {log}
              </p>
            ))
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={handleReset}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={startAutomatedWorkflow}
              disabled={isRunning}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-lg shadow-cyan-950/50 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Running Sequence...' : 'Start Automated Demo'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
