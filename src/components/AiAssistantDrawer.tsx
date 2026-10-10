/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Q-SHIELD: AI Security Analyst & Mentor Drawer
 * Interprets telemetry using Gemini 3.8 Flash (or offline deterministic engine)
 */

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Cpu,
  ShieldAlert,
  ShieldCheck,
  RotateCw,
  Info,
  CheckCircle,
} from 'lucide-react';
import { SimulationSession } from '../types/qkd.ts';
import { apiClient, AiAnalysisResult } from '../services/apiClient.ts';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  session: SimulationSession;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  session,
}) => {
  const [analysisResult, setAnalysisResult] = useState<AiAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userQuery, setUserQuery] = useState<string>('');
  const [chatLog, setChatLog] = useState<{ role: 'USER' | 'ASSISTANT'; text: string; source?: string }[]>([]);

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.analyzeSession(session);
      setAnalysisResult(res);
      setChatLog((prev) => [
        ...prev,
        {
          role: 'ASSISTANT',
          text: res.analysis,
          source: res.source,
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    const query = userQuery.trim();
    setUserQuery('');

    // Add user question
    const newChat = [...chatLog, { role: 'USER' as const, text: query }];
    setChatLog(newChat);

    // Provide grounded response based strictly on simulation telemetry
    setTimeout(() => {
      let answer = '';
      const qLower = query.toLowerCase();
      const qber = session.metrics.qberPercentage;
      const thresh = (session.parameters.securityThreshold * 100).toFixed(1);

      if (qLower.includes('why') && (qLower.includes('reject') || qLower.includes('untrusted'))) {
        answer = `The simulation key was rejected because the measured QBER (${qber}%) exceeded your security policy threshold (${thresh}%). In quantum physics, when an eavesdropper intercepts photons, wave-function collapse introduces noise that cannot be hidden. Hence the key is unsafe for critical infrastructure.`;
      } else if (qLower.includes('qber') || qLower.includes('error rate')) {
        answer = `Current measured QBER is ${qber}%, compared to the theoretical expectation of ~${session.metrics.theoreticalQber}%. In this run, ${session.metrics.errorCount} bit discrepancies were identified out of ${session.metrics.sampleComparedCount} publicly compared test bits.`;
      } else if (qLower.includes('eve') || qLower.includes('attack') || qLower.includes('eavesdrop')) {
        answer = session.parameters.eveEnabled
          ? `Eve was active with a ${Math.round(session.parameters.eveInterceptionRate * 100)}% intercept-resend attack, intercepting ${session.metrics.eveInterceptedCount} qubits. Her conjugate basis measurements introduced ${session.metrics.eveErrorsIntroduced} corrupted states.`
          : `Eve was disabled during this run. The observed QBER of ${qber}% was purely due to simulated optical fiber transmission noise (${(session.parameters.channelNoise * 100).toFixed(1)}%).`;
      } else if (qLower.includes('bb84') || qLower.includes('protocol')) {
        answer = `The BB84 protocol successfully reconciled ${session.metrics.siftedBitsCount} compatible basis bits from ${session.metrics.totalQubitsSent} transmitted states (${session.metrics.siftingRatio}% efficiency).`;
      } else {
        answer = `Based on current telemetry: QBER is ${qber}% against threshold ${thresh}%. Security decision: ${session.metrics.securityStatus}. Key state: ${session.metrics.keyStatus}. All findings are strictly grounded in simulation physics.`;
      }

      setChatLog((prev) => [
        ...prev,
        {
          role: 'ASSISTANT',
          text: answer,
          source: 'GROUNDED_TELEMETRY_ENGINE',
        },
      ]);
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-950/95 border-l border-slate-800 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
      {/* Top Bar */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-950 text-purple-300 border border-purple-800">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>AI Security Analyst</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                Gemini 3.8 / Offline Engine
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Plain-English quantum interpretation & security decision advisory
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Telemetry Snapshot Pill */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono grid grid-cols-2 gap-2 text-slate-300">
          <div>Qubits: <span className="font-bold text-cyan-300">{session.metrics.totalQubitsSent}</span></div>
          <div>Sifted: <span className="font-bold text-emerald-300">{session.metrics.siftedBitsCount}</span></div>
          <div>Measured QBER: <span className="font-bold text-rose-300">{session.metrics.qberPercentage}%</span></div>
          <div>Threshold: <span className="font-bold text-slate-200">{(session.parameters.securityThreshold * 100).toFixed(1)}%</span></div>
          <div className="col-span-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
            Eve Attack: {session.parameters.eveEnabled ? `Active (${Math.round(session.parameters.eveInterceptionRate * 100)}%)` : 'Off'}
          </div>
        </div>

        {/* Generate Analysis Button */}
        <button
          onClick={handleRunAnalysis}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-purple-950/50 disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Synthesizing Quantum Analysis...' : 'Analyze Active Session'}</span>
        </button>

        {/* Chat / Analysis Stream */}
        <div className="space-y-3 pt-2">
          {chatLog.length === 0 && !analysisResult && (
            <div className="text-center py-8 text-slate-500 text-xs leading-relaxed">
              <Sparkles className="w-8 h-8 text-purple-400/40 mx-auto mb-2" />
              Click "Analyze Active Session" above or type a question below to receive a grounded, beginner-friendly explanation of your current quantum run.
            </div>
          )}

          {chatLog.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                msg.role === 'USER'
                  ? 'bg-slate-900 border border-slate-800 text-slate-200 ml-6'
                  : 'bg-purple-950/40 border border-purple-800/60 text-purple-100 mr-2 space-y-1'
              }`}
            >
              {msg.role === 'ASSISTANT' && (
                <div className="flex items-center justify-between text-[10px] font-mono text-purple-400 pb-1 border-b border-purple-900/60">
                  <span>Q-SHIELD ANALYST</span>
                  <span>{msg.source}</span>
                </div>
              )}
              <p className="font-sans whitespace-pre-line">{msg.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Query Input */}
      <form onSubmit={handleAskQuestion} className="p-3 border-t border-slate-800 bg-slate-900/90 flex gap-2">
        <input
          type="text"
          placeholder="Ask e.g. Why was the key rejected? What caused the QBER spike?"
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
        />
        <button
          type="submit"
          className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
