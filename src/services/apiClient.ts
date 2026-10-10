/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Q-SHIELD: Frontend REST API Client
 * Connects frontend dashboard components to the Express backend
 */

import {
  SimulationParameters,
  SimulationSession,
  SecurityEvent,
} from '../types/qkd.ts';
import { runBB84Simulation, generateSessionEvents } from './bb84Simulation.ts';

export interface AggregatedMetrics {
  totalSessions: number;
  totalQubitsSent: number;
  totalBitsTested: number;
  avgQberPercentage: number;
  secureSessionsCount: number;
  rejectedSessionsCount: number;
  channelUptimePercentage: number;
  activeCriticalLinks: number;
}

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  quantumProtocol: string;
  channelSimulation: string;
  aiAssistantAvailable: boolean;
  uptimeSeconds: number;
  storedSessionsCount: number;
  storedEventsCount: number;
  timestamp: string;
}

export interface AiAnalysisResult {
  source: 'GEMINI_AI' | 'DETERMINISTIC_SECURITY_ENGINE';
  model: string;
  analysis: string;
}

export const apiClient = {
  /**
   * Runs a simulation session via backend API with client fallback.
   */
  async runSimulation(params: SimulationParameters): Promise<{
    session: SimulationSession;
    recentEvents: SecurityEvent[];
  }> {
    try {
      const res = await fetch('/api/simulation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      return {
        session: data.session,
        recentEvents: data.recentEvents || [],
      };
    } catch (err) {
      console.warn('API call failed; using local client-side simulation engine fallback:', err);
      const session = runBB84Simulation(params);
      const recentEvents = generateSessionEvents(session);
      return { session, recentEvents };
    }
  },

  /**
   * Resets simulation store back to baseline.
   */
  async resetSimulation(): Promise<SimulationSession> {
    try {
      const res = await fetch('/api/simulation/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        return data.currentSession;
      }
    } catch (err) {
      console.warn('Reset API fallback:', err);
    }

    const baselineParams: SimulationParameters = {
      qubitCount: 100,
      channelNoise: 0.01,
      eveEnabled: false,
      eveInterceptionRate: 0.0,
      securityThreshold: 0.11,
      scenario: 'power_grid',
    };
    return runBB84Simulation(baselineParams);
  },

  /**
   * Fetches latest security audit events.
   */
  async getEvents(severity = 'ALL'): Promise<SecurityEvent[]> {
    try {
      const res = await fetch(`/api/events?severity=${severity}`);
      if (res.ok) {
        const data = await res.json();
        return data.events || [];
      }
    } catch (err) {
      console.warn('Fetch events fallback:', err);
    }
    return [];
  },

  /**
   * Fetches aggregated metrics.
   */
  async getMetrics(): Promise<AggregatedMetrics> {
    try {
      const res = await fetch('/api/metrics');
      if (res.ok) {
        const data = await res.json();
        return data.metrics;
      }
    } catch (err) {
      console.warn('Fetch metrics fallback:', err);
    }
    return {
      totalSessions: 1,
      totalQubitsSent: 100,
      totalBitsTested: 25,
      avgQberPercentage: 0.0,
      secureSessionsCount: 1,
      rejectedSessionsCount: 0,
      channelUptimePercentage: 99.98,
      activeCriticalLinks: 4,
    };
  },

  /**
   * Fetches health status.
   */
  async getHealth(): Promise<HealthStatus | null> {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Health check fallback:', err);
    }
    return null;
  },

  /**
   * Requests AI/Security Expert analysis for a simulation session.
   */
  async analyzeSession(session: SimulationSession): Promise<AiAnalysisResult> {
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('AI Analysis fallback:', err);
    }

    // Client-side fallback text
    const isRejected = session.metrics.securityStatus === 'KEY_REJECTED' || session.metrics.securityStatus === 'POTENTIAL_EAVESDROPPING';
    return {
      source: 'DETERMINISTIC_SECURITY_ENGINE',
      model: 'BB84 Rule-Based Telemetry Evaluator',
      analysis: isRejected
        ? `The simulation observed a QBER of ${session.metrics.qberPercentage}%, exceeding the security threshold of ${(session.parameters.securityThreshold * 100).toFixed(1)}%. Quantum measurement collapse from simulated eavesdropping or noise disturbed conjugate states. The sifted key has been rejected.`
        : `The quantum communication link operated with low error (${session.metrics.qberPercentage}% QBER), safely under the ${(session.parameters.securityThreshold * 100).toFixed(1)}% threshold. The ${session.metrics.finalKeyLength}-bit key is verified.`,
    };
  },
};
