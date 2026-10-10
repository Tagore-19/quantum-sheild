/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Q-SHIELD: Security Event & System Audit Logs View
 * Filterable, searchable, exportable security events
 */

import React, { useState } from 'react';
import {
  FileText,
  Filter,
  Search,
  Download,
  AlertTriangle,
  ShieldAlert,
  Info,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { SecurityEvent } from '../types/qkd.ts';

interface SystemLogsViewProps {
  events: SecurityEvent[];
}

export const SystemLogsView: React.FC<SystemLogsViewProps> = ({ events }) => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEvents = events.filter((ev) => {
    if (severityFilter !== 'ALL' && ev.severity !== severityFilter) return false;
    if (
      searchQuery &&
      !ev.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !ev.eventType.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !ev.sessionId.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleExportCsv = () => {
    let csv = 'Timestamp,EventID,SessionID,Severity,EventType,QBER,Description\n';
    filteredEvents.forEach((e) => {
      csv += `"${e.timestamp}","${e.id}","${e.sessionId}","${e.severity}","${e.eventType}","${e.qber}","${e.description.replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `q-shield-audit-log-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Security Audit Event Log (SIEM Standard)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Immutable ledger of quantum transmission cycles, threshold violations, and key life-cycle transitions.
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Search & Severity Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="px-2 text-[10px] font-mono text-slate-400 uppercase">Severity:</span>
            {['ALL', 'INFO', 'NOTICE', 'WARNING', 'CRITICAL'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer text-xs ${
                  severityFilter === sev
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xs text-slate-300 w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search events, types, session..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-full"
            />
          </div>
        </div>
      </div>

      {/* Event Logs List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3 font-mono">
          <span>Displaying {filteredEvents.length} events</span>
          <span>Buffer: Last 200 events retained</span>
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className={`p-3 rounded-lg border text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition-colors ${
                ev.severity === 'CRITICAL'
                  ? 'bg-rose-950/30 border-rose-800/80 hover:bg-rose-950/40'
                  : ev.severity === 'WARNING'
                  ? 'bg-amber-950/30 border-amber-800/80 hover:bg-amber-950/40'
                  : 'bg-slate-950/70 border-slate-850 hover:bg-slate-900/60'
              }`}
            >
              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      ev.severity === 'CRITICAL'
                        ? 'bg-rose-900 text-rose-200 border-rose-600'
                        : ev.severity === 'WARNING'
                        ? 'bg-amber-900 text-amber-200 border-amber-600'
                        : ev.severity === 'NOTICE'
                        ? 'bg-blue-950 text-blue-300 border-blue-800'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {ev.severity}
                  </span>
                  <span className="font-mono font-bold text-slate-200">
                    {ev.eventType}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ID: {ev.sessionId}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {ev.description}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-[11px] font-mono text-slate-400">
                {ev.qber > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                    QBER: {(ev.qber * 100).toFixed(1)}%
                  </span>
                )}
                <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs font-mono">
              No audit events matched current filter parameters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
