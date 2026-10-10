/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Q-SHIELD: Quantum Key Distribution Platform for Critical Infrastructure
 * Main Application Orchestrator
 */

import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { QKDSimulatorView } from './components/QKDSimulatorView.tsx';
import { NetworkView } from './components/NetworkView.tsx';
import { ThreatMonitorView } from './components/ThreatMonitorView.tsx';
import { KeyManagementView } from './components/KeyManagementView.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { EducationView } from './components/EducationView.tsx';
import { SystemLogsView } from './components/SystemLogsView.tsx';
import { ArchitectureView } from './components/ArchitectureView.tsx';
import { AboutDocsView } from './components/AboutDocsView.tsx';
import { QuantumShield7Panels } from './components/QuantumShield7Panels.tsx';
import { HackathonDemoModal } from './components/HackathonDemoModal.tsx';
import { AiAssistantDrawer } from './components/AiAssistantDrawer.tsx';

import {
  SimulationParameters,
  SimulationSession,
  SecurityEvent,
  CriticalInfrastructureScenario,
  SimulationMode,
} from './types/qkd.ts';
import { runBB84Simulation, generateSessionEvents } from './services/bb84Simulation.ts';
import { apiClient } from './services/apiClient.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [scenario, setScenario] = useState<CriticalInfrastructureScenario>('power_grid');
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('NORMAL');

  // Simulation Parameters State
  const [parameters, setParameters] = useState<SimulationParameters>({
    qubitCount: 100,
    channelNoise: 0.01,
    eveEnabled: false,
    eveInterceptionRate: 0.5,
    securityThreshold: 0.11,
    scenario: 'power_grid',
  });

  // Simulation Session State
  const [session, setSession] = useState<SimulationSession>(() => {
    return runBB84Simulation({
      qubitCount: 100,
      channelNoise: 0.01,
      eveEnabled: false,
      eveInterceptionRate: 0.5,
      securityThreshold: 0.11,
      scenario: 'power_grid',
    });
  });

  const [sessionsHistory, setSessionsHistory] = useState<SimulationSession[]>([session]);
  const [events, setEvents] = useState<SecurityEvent[]>(() => generateSessionEvents(session));
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Modals & Drawers
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);

  // Sync parameters scenario when top selector changes
  useEffect(() => {
    setParameters((prev) => ({ ...prev, scenario }));
  }, [scenario]);

  const handleUpdateParameters = (newParams: Partial<SimulationParameters>) => {
    setParameters((prev) => ({ ...prev, ...newParams }));
  };

  const handleRunSimulation = async (customParams?: SimulationParameters) => {
    setIsSimulating(true);
    const targetParams = customParams || parameters;

    try {
      const result = await apiClient.runSimulation(targetParams);
      setSession(result.session);
      setSessionsHistory((prev) => [result.session, ...prev.slice(0, 49)]);
      setEvents((prev) => [...result.recentEvents, ...prev.slice(0, 150)]);
    } catch (err) {
      console.error('Simulation error:', err);
      const fallbackSession = runBB84Simulation(targetParams);
      const fallbackEvents = generateSessionEvents(fallbackSession);
      setSession(fallbackSession);
      setSessionsHistory((prev) => [fallbackSession, ...prev]);
      setEvents((prev) => [...fallbackEvents, ...prev]);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSetMode = (mode: SimulationMode) => {
    setSimulationMode(mode);
    let newParams: SimulationParameters;

    if (mode === 'NORMAL') {
      newParams = {
        ...parameters,
        channelNoise: 0.005,
        eveEnabled: false,
        eveInterceptionRate: 0.0,
      };
    } else if (mode === 'NOISY') {
      newParams = {
        ...parameters,
        channelNoise: 0.05,
        eveEnabled: false,
        eveInterceptionRate: 0.0,
      };
    } else {
      // ATTACK
      newParams = {
        ...parameters,
        channelNoise: 0.01,
        eveEnabled: true,
        eveInterceptionRate: 0.50,
      };
    }

    setParameters(newParams);
    handleRunSimulation(newParams);
  };

  const handleQuickReset = async () => {
    const baselineParams: SimulationParameters = {
      qubitCount: 100,
      channelNoise: 0.01,
      eveEnabled: false,
      eveInterceptionRate: 0.5,
      securityThreshold: 0.11,
      scenario: 'power_grid',
    };
    setParameters(baselineParams);
    setSimulationMode('NORMAL');
    setScenario('power_grid');
    const resetSession = await apiClient.resetSimulation();
    setSession(resetSession);
    setSessionsHistory([resetSession]);
    setEvents(generateSessionEvents(resetSession));
  };

  const handleRotateKey = () => {
    handleRunSimulation();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scenario={scenario}
        setScenario={(sc) => {
          setScenario(sc);
          handleRunSimulation({ ...parameters, scenario: sc });
        }}
        simulationMode={simulationMode}
        setSimulationMode={handleSetMode}
        securityStatus={session.metrics.securityStatus}
        qberPercentage={session.metrics.qberPercentage}
        onOpenDemo={() => setIsDemoModalOpen(true)}
        onToggleAi={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
        isAiDrawerOpen={isAiDrawerOpen}
        onQuickReset={handleQuickReset}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            session={session}
            events={events}
            scenario={scenario}
            onRunSimulation={(customParams) => handleRunSimulation(customParams)}
            onSetMode={handleSetMode}
            onNavigateTab={setActiveTab}
            onOpenDemo={() => setIsDemoModalOpen(true)}
            isSimulating={isSimulating}
          />
        )}

        {activeTab === 'quantum_shield' && (
          <QuantumShield7Panels
            session={session}
            parameters={parameters}
            onRunSimulation={(customParams) => handleRunSimulation(customParams)}
            onUpdateParameters={handleUpdateParameters}
            events={events}
            isSimulating={isSimulating}
          />
        )}

        {activeTab === 'simulator' && (
          <QKDSimulatorView
            session={session}
            parameters={parameters}
            onUpdateParameters={handleUpdateParameters}
            onRunSimulation={() => handleRunSimulation()}
            onResetSimulation={handleQuickReset}
            isSimulating={isSimulating}
          />
        )}

        {activeTab === 'network' && (
          <NetworkView
            session={session}
            scenario={scenario}
            onSelectScenario={(sc) => {
              setScenario(sc);
              handleRunSimulation({ ...parameters, scenario: sc });
            }}
            onRotateKey={handleRotateKey}
          />
        )}

        {activeTab === 'threats' && (
          <ThreatMonitorView
            session={session}
            parameters={parameters}
            onUpdateParameters={handleUpdateParameters}
            onRunSimulation={() => handleRunSimulation()}
            isSimulating={isSimulating}
          />
        )}

        {activeTab === 'keys' && (
          <KeyManagementView
            session={session}
            onRotateKey={handleRotateKey}
            isSimulating={isSimulating}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            currentSession={session}
            sessionsHistory={sessionsHistory}
            onSelectSession={setSession}
          />
        )}

        {activeTab === 'education' && <EducationView />}

        {activeTab === 'logs' && <SystemLogsView events={events} />}

        {activeTab === 'architecture' && <ArchitectureView />}

        {activeTab === 'about' && <AboutDocsView />}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">Q-SHIELD</span>
            <span>·</span>
            <span>Quantum Key Distribution (BB84) & QBER Threat Detection Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <span>Problem Statement VNQFF-07</span>
            <span>·</span>
            <span>Software Simulation & Educational Prototype</span>
          </div>
        </div>
      </footer>

      {/* Hackathon Demo Workflow Modal */}
      <HackathonDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onRunParametricSimulation={handleRunSimulation}
        onResetSimulation={handleQuickReset}
      />

      {/* AI Security Assistant Drawer */}
      <AiAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        session={session}
      />
    </div>
  );
}
