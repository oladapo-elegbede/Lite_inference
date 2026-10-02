import React, { useEffect, useState } from "react";
import { RequestLogItem, RequestListResponse } from "@/types/api";
import { ListFilter, ArrowRight, CheckCircle2, Clock } from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function RequestHistory() {
  const [logs, setLogs] = useState<RequestLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch(`${API_BASE_URL}/v1/analytics/requests?limit=10`);
        if (res.ok) {
          const data: RequestListResponse = await res.json();
          setLogs(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch request history:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ListFilter className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Live Proxy Audit Trail</h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Recent 10 Transactions
        </span>
      </div>

      {isLoading ? (
        <div className="h-40 rounded-lg bg-slate-900/40 animate-pulse" />
      ) : logs.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
          No request transactions logged yet. Send API calls to http://127.0.0.1:8000/v1/chat/completions to see live telemetry.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-2 font-medium">Status / ID</th>
                <th className="pb-2 font-medium">Original ➔ Routed Model</th>
                <th className="pb-2 font-medium">Routing Decision Justification</th>
                <th className="pb-2 font-medium text-right">Tokens</th>
                <th className="pb-2 font-medium text-right">Money Saved</th>
                <th className="pb-2 font-medium text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {logs.map((log) => {
                const wasDowngraded = log.original_model !== log.routed_model;
                return (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 font-mono text-[11px] text-slate-300">
                      <div className="flex items-center space-x-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{log.request_id.slice(0, 14)}...</span>
                      </div>
                    </td>
                    <td className="py-2.5 font-mono text-[11px]">
                      <div className="flex items-center space-x-1.5">
                        <span className={wasDowngraded ? "line-through text-slate-500" : "text-slate-300"}>
                          {log.original_model}
                        </span>
                        {wasDowngraded && (
                          <>
                            <ArrowRight className="h-3 w-3 text-emerald-400 shrink-0" />
                            <span className="text-emerald-400 font-semibold">{log.routed_model}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 text-slate-400 max-w-xs truncate text-[11px]" title={log.routing_reason}>
                      {log.routing_reason}
                    </td>
                    <td className="py-2.5 text-right font-mono text-slate-300 text-[11px]">
                      {log.total_tokens}
                    </td>
                    <td className="py-2.5 text-right font-mono text-[11px]">
                      {log.money_saved_usd > 0 ? (
                        <span className="text-emerald-400 font-medium">
                          +${log.money_saved_usd.toFixed(6)}
                        </span>
                      ) : (
                        <span className="text-slate-500">$0.00</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right font-mono text-slate-400 text-[11px]">
                      <div className="flex items-center justify-end space-x-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        <span>{log.latency_ms.toFixed(2)}ms</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}