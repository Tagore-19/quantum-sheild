/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Q-SHIELD: Hackathon Presenter Mode HUD & Live Pitch Controller
 * Provides one-click stage progression, exact speech talking points,
 * and presentation timing for hackathon competitors.
 */

import React, { useState } from 'react';
import {
  Mic,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  Info,
  Clock,
  Volume2,
} from 'lucide-react';
import { SimulationParameters, SimulationMode } from '../types/qkd.ts';

interface PresenterHUDProps {
  onExecuteStage: (params: SimulationParameters) => void;
  onSetMode: (mode: SimulationMode) => void;
  qberPercentage: number;
  securityStatus: string;
}

export const PresenterHUD: React.FC<PresenterHUDProps> = ({
  onExecuteStage,
  onSetMode,
  qberPercentage,
  securityStatus,
}) => {
  const [activeStage, setActiveStage] = useState<number>(1);

  const stages = [
    {
      id: 1,
      name: '1. Baseline Secure Link',
      badge: '0% Noise · Eve OFF',
      color: 'emerald',
      talkTitle: 'Say this to Judges:',
      speech:
        '“Judges, right now Alice (Control Center) and Bob (Substation) are negotiating shared secret keys using polarized photons. Notice our measured QBER is 0.00%. Our SCADA command to trip a 400kV breaker is encrypted with an unbreakable One-Time Pad.”',
      actionLabel: 'Run Clean BB84',
      params: {
        qubitCount: 100,
        channelNoise: 0.0,
        eveEnabled: false,
        eveInterceptionRate: 0.0,
        securityThreshold: 0.11,
        scenario: 'power_grid' as const,
      },
    },
    {
      id: 2,
      name: '2. Environmental Fiber Noise',
      badge: '5% Fiber Noise · Eve OFF',
      color: 'amber',
      talkTitle: 'Say this to Judges:',
      speech:
        '“In real-world optical fiber, thermal fluctuations and birefringence introduce baseline noise. We simulate 5% line noise. QBER rises to ~2.5%, but because it is well below our 11% threshold, the key remains trusted and operational.”',
      actionLabel: 'Inject Fiber Noise',
      params: {
        qubitCount: 100,
        channelNoise: 0.05,
        eveEnabled: false,
        eveInterceptionRate: 0.0,
        securityThreshold: 0.11,
        scenario: 'power_grid' as const,
      },
    },
    {
      id: 3,
      name: '3. Adversary Eve Attacks!',
      badge: 'Eve Active · 50% Intercept',
      color: 'rose',
      talkTitle: 'Say this to Judges (Climax):',
      speech:
        '“Now watch this: an attacker, Eve, taps the fiber line with a 50% intercept-resend attack. By the No-Cloning Theorem, Eve cannot copy photons without measuring them. Her measurement collapses quantum superpositions, injecting a 25% error rate on intercepted qubits. QBER instantly spikes past our 11% threshold. The alarm triggers, status turns to KEY REJECTED, and our SCADA interlocking automatically BLOCKS the command!”',
      actionLabel: 'Trigger Eve Attack',
      params: {
        qubitCount: 200,
        channelNoise: 0.01,
        eveEnabled: true,
        eveInterceptionRate: 0.50,
        securityThreshold: 0.11,
        scenario: 'power_grid' as const,
      },
    },
    {
      id: 4,
      name: '4. Automated Channel Mitigation',
      badge: 'Clean Channel · Re-Keyed',
      color: 'cyan',
      talkTitle: 'Say this to Judges:',
      speech:
        '“Q-SHIELD immediately isolates the compromised optical link, disengages the compromised channel, and re-keys across a clean fiber path. A fresh, verified key is established, restoring safe OT SCADA dispatch. That is proactive quantum defense in action.”',
      actionLabel: 'Auto-Mitigate & Re-Key',
      params: {
        qubitCount: 150,
        channelNoise: 0.005,
        eveEnabled: false,
        eveInterceptionRate: 0.0,
        securityThreshold: 0.11,
        scenario: 'power_grid' as const,
      },
    },
  ];

  const currentStage = stages[activeStage - 1];

  const handleStageClick = (stage: typeof stages[0]) => {
    setActiveStage(stage.id);
    onExecuteStage(stage.params);
  };

  return (
    <div className="bg-slate-900 border-2 border-cyan-500/60 rounded-xl p-5 shadow-2xl shadow-cyan-950/40 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-96 h-32 bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Top Bar: Teleprompter Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-600/80 text-cyan-300">
            <Mic className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 font-sans tracking-wide">
                HACKATHON PRESENTER MODE · LIVE PITCH CONTROLLER
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Stage {activeStage} of 4
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Click each stage button sequentially during your 3–5 minute pitch to run the live simulation and read the speaker teleprompter!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Live QBER:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded ${
              qberPercentage > 11
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}
          >
            {qberPercentage}%
          </span>
        </div>
      </div>

      {/* Stage Selector Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-4">
        {stages.map((stage) => {
          const isActive = activeStage === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => handleStageClick(stage)}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-cyan-950/80 border-cyan-400 shadow-md shadow-cyan-950/50'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {stage.badge}
                </span>
                {isActive && <Play className="w-3 h-3 fill-cyan-400 text-cyan-400" />}
              </div>
              <p className="text-xs font-bold text-slate-100 truncate">{stage.name}</p>
              <span className="text-[10px] text-cyan-400 mt-1 inline-block font-mono">
                {isActive ? '● Currently Active' : '▶ Click to Present'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Teleprompter Box: What to Say & What to Show */}
      <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 font-mono">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>{currentStage.talkTitle}</span>
          </div>
          <button
            onClick={() => handleStageClick(currentStage)}
            className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded cursor-pointer transition-colors"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{currentStage.actionLabel}</span>
          </button>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed font-sans italic bg-slate-900/80 p-3 rounded-lg border border-slate-800">
          {currentStage.speech}
        </p>
      </div>
    </div>
  );
};
