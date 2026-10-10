/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Q-SHIELD: Quantum Key Distribution Simulation Platform Backend Server
 * Express Server with REST APIs & Vite Middleware Integration
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  runBB84Simulation,
  generateSessionEvents,
  SCENARIO_PRESETS,
} from './src/services/bb84Simulation.ts';
import {
  SimulationParameters,
  SimulationSession,
  SecurityEvent,
  CriticalInfrastructureScenario,
} from './src/types/qkd.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// In-Memory Database / Store for Prototype
const sessionsStore: Map<string, SimulationSession> = new Map();
const eventsStore: SecurityEvent[] = [];

// Seed baseline secure session
const baselineParams: SimulationParameters = {
  qubitCount: 100,
  channelNoise: 0.01,
  eveEnabled: false,
  eveInterceptionRate: 0.0,
  securityThreshold: 0.11,
  scenario: 'power_grid',
};
const baselineSession = runBB84Simulation(baselineParams);
sessionsStore.set(baselineSession.sessionId, baselineSession);
eventsStore.push(...generateSessionEvents(baselineSession));

// Optional Google GenAI Client
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Google GenAI initialization notice:', err);
  }
}

// ----------------------------------------------------
// REST API ENDPOINTS
// ----------------------------------------------------

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'Q-SHIELD Quantum Simulation Engine',
    version: '1.0.0-hackathon',
    quantumProtocol: 'BB84 (Bennett-Brassard 1984)',
    channelSimulation: 'Single-Photon Polarization State Engine',
    aiAssistantAvailable: Boolean(aiClient),
    uptimeSeconds: Math.floor(process.uptime()),
    storedSessionsCount: sessionsStore.size,
    storedEventsCount: eventsStore.length,
    timestamp: new Date().toISOString(),
  });
});

// Run Simulation (General)
app.post('/api/simulation/run', (req: Request, res: Response) => {
  try {
    const rawParams = req.body || {};
    const params: SimulationParameters = {
      qubitCount: typeof rawParams.qubitCount === 'number' ? Math.max(10, Math.min(2000, rawParams.qubitCount)) : 100,
      channelNoise: typeof rawParams.channelNoise === 'number' ? Math.max(0, Math.min(0.5, rawParams.channelNoise)) : 0.01,
      eveEnabled: Boolean(rawParams.eveEnabled),
      eveInterceptionRate: typeof rawParams.eveInterceptionRate === 'number' ? Math.max(0, Math.min(1, rawParams.eveInterceptionRate)) : 0.5,
      securityThreshold: typeof rawParams.securityThreshold === 'number' ? Math.max(0.01, Math.min(0.5, rawParams.securityThreshold)) : 0.11,
      scenario: (rawParams.scenario && (rawParams.scenario in SCENARIO_PRESETS))
        ? (rawParams.scenario as CriticalInfrastructureScenario)
        : 'power_grid',
    };

    const session = runBB84Simulation(params);
    const events = generateSessionEvents(session);

    sessionsStore.set(session.sessionId, session);
    // Add to front of events store (limit to 200 events)
    eventsStore.unshift(...events);
    if (eventsStore.length > 200) {
      eventsStore.length = 200;
    }

    res.status(200).json({
      success: true,
      session,
      recentEvents: events,
    });
  } catch (error: any) {
    console.error('Simulation error:', error);
    res.status(500).json({
      success: false,
      error: 'Simulation execution error',
      message: error?.message || 'Unknown error occurred',
    });
  }
});

// Shortcut: POST /api/qkd/bb84 (Normal clean session)
app.post('/api/qkd/bb84', (req: Request, res: Response) => {
  try {
    const rawParams = req.body || {};
    const params: SimulationParameters = {
      qubitCount: rawParams.qubitCount || 100,
      channelNoise: rawParams.channelNoise || 0.0,
      eveEnabled: false,
      eveInterceptionRate: 0.0,
      securityThreshold: rawParams.securityThreshold || 0.11,
      scenario: rawParams.scenario || 'power_grid',
    };

    const session = runBB84Simulation(params);
    const events = generateSessionEvents(session);

    sessionsStore.set(session.sessionId, session);
    eventsStore.unshift(...events);

    res.json({
      success: true,
      mode: 'NORMAL_SECURE',
      session,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Shortcut: POST /api/qkd/attack (Eve attack session)
app.post('/api/qkd/attack', (req: Request, res: Response) => {
  try {
    const rawParams = req.body || {};
    const interceptionRate = typeof rawParams.interceptionRate === 'number'
      ? rawParams.interceptionRate
      : (typeof rawParams.eveInterceptionRate === 'number' ? rawParams.eveInterceptionRate : 0.5);

    const params: SimulationParameters = {
      qubitCount: rawParams.qubitCount || 100,
      channelNoise: rawParams.channelNoise || 0.01,
      eveEnabled: true,
      eveInterceptionRate: Math.max(0.05, Math.min(1.0, interceptionRate)),
      securityThreshold: rawParams.securityThreshold || 0.11,
      scenario: rawParams.scenario || 'power_grid',
    };

    const session = runBB84Simulation(params);
    const events = generateSessionEvents(session);

    sessionsStore.set(session.sessionId, session);
    eventsStore.unshift(...events);

    res.json({
      success: true,
      mode: 'EAVESDROPPING_ATTACK',
      session,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reset Simulation & Store
app.post('/api/simulation/reset', (_req: Request, res: Response) => {
  sessionsStore.clear();
  eventsStore.length = 0;

  const resetSession = runBB84Simulation(baselineParams);
  sessionsStore.set(resetSession.sessionId, resetSession);
  eventsStore.push(...generateSessionEvents(resetSession));

  res.json({
    success: true,
    message: 'Simulation environment reset to default baseline',
    currentSession: resetSession,
  });
});

// Get Session By ID
app.get('/api/simulation/:id', (req: Request, res: Response) => {
  const session = sessionsStore.get(req.params.id);
  if (!session) {
    res.status(404).json({ success: false, error: 'Session not found' });
    return;
  }
  res.json({ success: true, session });
});

// List All Sessions
app.get('/api/sessions', (_req: Request, res: Response) => {
  const sessions = Array.from(sessionsStore.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  res.json({ success: true, sessions });
});

// Get Security Events
app.get('/api/events', (req: Request, res: Response) => {
  const severityFilter = req.query.severity as string;
  let filtered = eventsStore;
  if (severityFilter && severityFilter !== 'ALL') {
    filtered = eventsStore.filter((e) => e.severity === severityFilter);
  }
  res.json({ success: true, events: filtered.slice(0, 100) });
});

// Get Aggregated Metrics
app.get('/api/metrics', (_req: Request, res: Response) => {
  const sessions = Array.from(sessionsStore.values());
  let totalQubits = 0;
  let totalErrors = 0;
  let totalSampleTested = 0;
  let secureSessions = 0;
  let rejectedSessions = 0;

  for (const s of sessions) {
    totalQubits += s.metrics.totalQubitsSent;
    totalErrors += s.metrics.errorCount;
    totalSampleTested += s.metrics.sampleComparedCount;
    if (s.metrics.securityStatus === 'SECURE') secureSessions++;
    if (s.metrics.securityStatus === 'KEY_REJECTED' || s.metrics.securityStatus === 'POTENTIAL_EAVESDROPPING') {
      rejectedSessions++;
    }
  }

  const avgQber = totalSampleTested > 0 ? (totalErrors / totalSampleTested) * 100 : 0;

  res.json({
    success: true,
    metrics: {
      totalSessions: sessions.length,
      totalQubitsSent: totalQubits,
      totalBitsTested: totalSampleTested,
      avgQberPercentage: parseFloat(avgQber.toFixed(2)),
      secureSessionsCount: secureSessions,
      rejectedSessionsCount: rejectedSessions,
      channelUptimePercentage: 99.98,
      activeCriticalLinks: 4,
    },
  });
});

// AI Security Assistant Analysis Route
app.post('/api/ai/analyze', async (req: Request, res: Response) => {
  const sessionData = req.body as SimulationSession;

  if (!sessionData || !sessionData.metrics) {
    res.status(400).json({ error: 'Valid simulation session payload required' });
    return;
  }

  const { metrics, parameters } = sessionData;

  // Scientific deterministic explanation generator (always available offline)
  const isAttack = parameters.eveEnabled && parameters.eveInterceptionRate > 0;
  const isRejected = metrics.securityStatus === 'KEY_REJECTED' || metrics.securityStatus === 'POTENTIAL_EAVESDROPPING';
  
  let fallbackExplanation = '';
  if (isRejected) {
    fallbackExplanation = `The simulation measured an elevated Quantum Bit Error Rate of ${metrics.qberPercentage}%, which exceeds your configured security threshold of ${(parameters.securityThreshold * 100).toFixed(1)}%. ` +
      (isAttack
        ? `Because Eve intercepted approximately ${(parameters.eveInterceptionRate * 100).toFixed(0)}% of transmitted qubits using an intercept-resend attack, quantum measurement collapse disturbed conjugate polarization states. In BB84 theory, when Eve measures in the wrong basis (50% of the time), she induces a 50% error probability in Bob's measurement, yielding ~${metrics.theoreticalQber}% expected QBER. `
        : `Elevated error rate was introduced by simulated environmental channel attenuation and phase noise (${(parameters.channelNoise * 100).toFixed(1)}%). `) +
      `Under critical-infrastructure defense policies, the shared sifted key cannot guarantee unconditional secrecy and has been discarded. The quantum channel must be re-calibrated.`;
  } else {
    fallbackExplanation = `The quantum link operated within nominal bounds with a measured QBER of ${metrics.qberPercentage}% (threshold: ${(parameters.securityThreshold * 100).toFixed(1)}%). ` +
      `Out of ${metrics.totalQubitsSent} transmitted qubits, ${metrics.siftedBitsCount} were successfully reconciled through classical basis sifting (~${metrics.siftingRatio}% efficiency). ` +
      `The error rate is well below the application security limit. A shared simulation key of ${metrics.finalKeyLength} bits has been generated and validated for simulated One-Time Pad SCADA telemetry encryption.`;
  }

  // If Gemini API is configured, request high-level cybersecurity mentoring interpretation
  if (aiClient) {
    try {
      const prompt = `You are the Q-SHIELD Quantum Cybersecurity Expert Mentor.
Analyze this BB84 Quantum Key Distribution simulation run:
- Total Qubits: ${metrics.totalQubitsSent}
- Sifted Bits: ${metrics.siftedBitsCount}
- Measured QBER: ${metrics.qberPercentage}%
- Theoretical Expected QBER: ${metrics.theoreticalQber}%
- Configured Threshold: ${(parameters.securityThreshold * 100).toFixed(1)}%
- Eve Intercept-Resend Active: ${parameters.eveEnabled} (Rate: ${(parameters.eveInterceptionRate * 100).toFixed(0)}%)
- Channel Noise: ${(parameters.channelNoise * 100).toFixed(1)}%
- Security Status: ${metrics.securityStatus}
- Scenario: ${parameters.scenario}

Explain in 2-3 concise, professional, beginner-friendly paragraphs:
1. What happened physically to the photons/qubits during transmission and measurement.
2. Why the observed QBER did or did not exceed the threshold (mention Heisenberg measurement collapse / no-cloning theorem if Eve was active).
3. The operational security decision for critical infrastructure (why the key is trusted or rejected).
State clearly that this is an educational simulation.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const aiText = response.text;
      if (aiText && aiText.trim().length > 0) {
        res.json({
          source: 'GEMINI_AI',
          model: 'gemini-3.8-flash',
          analysis: aiText.trim(),
        });
        return;
      }
    } catch (err: any) {
      console.warn('Gemini API call failed, using deterministic security engine:', err?.message);
    }
  }

  // Deterministic fallback response
  res.json({
    source: 'DETERMINISTIC_SECURITY_ENGINE',
    model: 'BB84 Rule-Based Telemetry Evaluator',
    analysis: fallbackExplanation,
  });
});

// Helper for recursive directory zipping
function addDirectoryToZip(zip: JSZip, localDir: string, zipPrefix: string = '') {
  if (!fs.existsSync(localDir)) return;
  const items = fs.readdirSync(localDir);
  for (const item of items) {
    if (item === 'node_modules' || item === '.git' || item === 'dist' || item === '.next' || item.startsWith('.')) continue;
    const fullPath = path.join(localDir, item);
    const stat = fs.statSync(fullPath);
    const zipPath = zipPrefix ? `${zipPrefix}/${item}` : item;
    if (stat.isDirectory()) {
      addDirectoryToZip(zip, fullPath, zipPath);
    } else {
      try {
        const fileData = fs.readFileSync(fullPath);
        zip.file(zipPath, fileData);
      } catch (e) {
        console.warn(`[Q-SHIELD] Failed to read file ${fullPath}:`, e);
      }
    }
  }
}

// Full Source Code ZIP Download Endpoint
app.get('/api/download/project-zip', async (_req: Request, res: Response) => {
  try {
    const zip = new JSZip();

    // Include top-level config and documentation files
    const rootFiles = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'server.ts',
      'index.html',
      '.env.example',
      'metadata.json',
      'README.md',
      'ARCHITECTURE.md',
      'HACKATHON_DEMO.md',
      'LIMITATIONS.md',
      'FUTURE_SCOPE.md',
      'API.md',
    ];

    for (const fileName of rootFiles) {
      const filePath = path.resolve(__dirname, fileName);
      if (fs.existsSync(filePath)) {
        zip.file(fileName, fs.readFileSync(filePath));
      }
    }

    // Include source code and test directories
    addDirectoryToZip(zip, path.resolve(__dirname, 'src'), 'src');
    addDirectoryToZip(zip, path.resolve(__dirname, 'tests'), 'tests');

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="q-shield-quantum-prototype.zip"');
    res.setHeader('Content-Length', zipBuffer.length);
    res.send(zipBuffer);
  } catch (err: any) {
    console.error('Failed to generate project zip:', err);
    res.status(500).json({ error: 'Failed to generate project zip: ' + err?.message });
  }
});

// Documentation & Hackathon Pitch Bundle Download Endpoint
app.get('/api/download/docs-bundle', async (_req: Request, res: Response) => {
  try {
    const zip = new JSZip();
    const docFiles = [
      'README.md',
      'ARCHITECTURE.md',
      'HACKATHON_DEMO.md',
      'LIMITATIONS.md',
      'FUTURE_SCOPE.md',
      'API.md',
    ];

    for (const fileName of docFiles) {
      const filePath = path.resolve(__dirname, fileName);
      if (fs.existsSync(filePath)) {
        zip.file(fileName, fs.readFileSync(filePath));
      }
    }

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="q-shield-docs-and-pitch.zip"');
    res.setHeader('Content-Length', zipBuffer.length);
    res.send(zipBuffer);
  } catch (err: any) {
    console.error('Failed to generate documentation bundle:', err);
    res.status(500).json({ error: 'Failed to bundle docs: ' + err?.message });
  }
});

// ----------------------------------------------------
// Production / Dev Vite Middlewares
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Q-SHIELD] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Q-SHIELD server:', err);
});
