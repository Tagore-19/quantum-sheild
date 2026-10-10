/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Q-SHIELD: Top Navigation Bar
 */

import React from 'react';
import {
  Shield,
  Activity,
  Cpu,
  Network,
  Radio,
  Key,
  BarChart3,
  BookOpen,
  FileText,
  Workflow,
  Sparkles,
  Play,
  RotateCcw,
  Zap,
  Download,
} from 'lucide-react';
import { CriticalInfrastructureScenario, SecurityStatus, SimulationMode } from '../types/qkd.ts';
import { SCENARIO_PRESETS } from '../services/bb84Simulation.ts';

export type ActiveTab =
  | 'dashboard'
  | 'quantum_shield'
  | 'simulator'
  | 'network'
  | 'threats'
  | 'keys'
  | 'analytics'
  | 'education'
  | 'logs'
  | 'architecture'
  | 'about';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  scenario: CriticalInfrastructureScenario;
  setScenario: (sc: CriticalInfrastructureScenario) => void;
  simulationMode: SimulationMode;
  setSimulationMode: (mode: SimulationMode) => void;
  securityStatus: SecurityStatus;
  qberPercentage: number;
  onOpenDemo: () => void;
  onToggleAi: () => void;
  isAiDrawerOpen: boolean;
  onQuickReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  scenario,
  setScenario,
  simulationMode,
  setSimulationMode,
  securityStatus,
  qberPercentage,
  onOpenDemo,
  onToggleAi,
  isAiDrawerOpen,
  onQuickReset,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
    { id: 'quantum_shield', label: '7-Panel Core', icon: <Shield className="w-4 h-4" /> },
    { id: 'simulator', label: 'QKD Simulator', icon: <Cpu className="w-4 h-4" /> },
    { id: 'network', label: 'Network', icon: <Network className="w-4 h-4" /> },
    { id: 'threats', label: 'Threat Monitor', icon: <Radio className="w-4 h-4" /> },
    { id: 'keys', label: 'Key Management', icon: <Key className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'education', label: 'Education', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'logs', label: 'System Logs', icon: <FileText className="w-4 h-4" /> },
    { id: 'architecture', label: 'Architecture', icon: <Workflow className="w-4 h-4" /> },
    { id: 'about', label: 'About & Pitch', icon: <Zap className="w-4 h-4" /> },
  ];

  // Visual helper for security status badge
  const getStatusColor = () => {
    switch (securityStatus) {
      case 'SECURE':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
      case 'WARNING':
        return 'text-amber-400 bg-amber-950/60 border-amber-500/40';
      case 'POTENTIAL_EAVESDROPPING':
      case 'KEY_REJECTED':
        return 'text-rose-400 bg-rose-950/60 border-rose-500/40 animate-pulse';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Top Banner: Branding, Quick Scenario, Mode & Demo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-slate-800/50">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-lg shadow-cyan-950/50">
              <Shield className="w-5 h-5 text-white" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-wider text-slate-100 font-sans">
                  QUANTUM-SHIELD
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-medium text-cyan-300 bg-cyan-950/80 border border-cyan-800/60">
                  VNQFF-07
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Quantum Key Distribution & Threat Detection Platform
              </p>
            </div>
          </div>

          {/* Quick Scenario & Mode Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Scenario Picker */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-300">
              <span className="text-slate-400">Target:</span>
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value as CriticalInfrastructureScenario)}
                className="bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {Object.values(SCENARIO_PRESETS).map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Indicator */}
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-semibold border ${getStatusColor()}`}
              title={`QBER: ${qberPercentage}%`}
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              <span>{securityStatus.replace('_', ' ')}</span>
              <span className="text-[11px] opacity-80">({qberPercentage}%)</span>
            </div>

            {/* Hackathon Demo CTA */}
            <button
              onClick={onOpenDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold shadow-md shadow-cyan-950/40 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>1-Click Demo</span>
            </button>

            {/* Download Code ZIP button */}
            <a
              href="/api/download/project-zip"
              download="q-shield-quantum-prototype.zip"
              title="Download Full Project Source Code (ZIP)"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Download ZIP</span>
            </a>

            {/* AI Assistant Button */}
            <button
              onClick={onToggleAi}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                isAiDrawerOpen
                  ? 'bg-purple-950/80 border-purple-500/60 text-purple-200'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">AI Analyst</span>
            </button>

            {/* Reset button */}
            <button
              onClick={onQuickReset}
              title="Reset simulation to default baseline"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Bar: Tab Navigation & Application Modes */}
        <div className="flex items-center justify-between overflow-x-auto py-2 scrollbar-none gap-4">
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm border border-slate-700/80'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Simulation Mode Switcher */}
          <div className="hidden lg:flex items-center gap-1 p-0.5 bg-slate-900/90 rounded border border-slate-800 text-xs shrink-0">
            <span className="px-2 text-[10px] uppercase font-mono text-slate-500">Mode:</span>
            <button
              onClick={() => setSimulationMode('NORMAL')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                simulationMode === 'NORMAL'
                  ? 'bg-emerald-950/70 text-emerald-300 font-medium border border-emerald-700/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              A: Normal Secure
            </button>
            <button
              onClick={() => setSimulationMode('NOISY')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                simulationMode === 'NOISY'
                  ? 'bg-amber-950/70 text-amber-300 font-medium border border-amber-700/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              B: Noisy Fiber
            </button>
            <button
              onClick={() => setSimulationMode('ATTACK')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                simulationMode === 'ATTACK'
                  ? 'bg-rose-950/70 text-rose-300 font-medium border border-rose-700/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              C: Eve Attack
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
