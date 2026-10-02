"use client";

import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import KPICard from "@/components/KPICard";
import ModelCatalog from "@/components/ModelCatalog";
import RequestHistory from "@/components/RequestHistory";
import Playground from "@/components/Playground";
import { AnalyticsSummary } from "@/types/api";
import {
  Activity,
  Zap,
  DollarSign,
  Clock,
  AlertCircle,
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function Home() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/v1/analytics/summary`);
      if (!response.ok) {
        throw new Error(`Gateway returned HTTP status ${response.status}`);
      }
      const result: AnalyticsSummary = await response.json();
      setData(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to connect to gateway";
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(() => {
      fetchAnalytics(false);
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
      <Header
        onRefresh={() => fetchAnalytics(true)}
        isRefreshing={isRefreshing}
      />

      <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight">
              Gateway Metrics & Cost Optimization
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Real-time telemetry, routing performance, and cumulative USD cost savings.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Cannot reach LiteInference Gateway ({error}). Ensure backend is running at http://127.0.0.1:8000.</span>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-slate-900 border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Requests Processed"
              value={data?.total_requests_processed.toLocaleString() ?? "0"}
              subtitle="Total proxy API calls logged"
              icon={Activity}
            />

            <KPICard
              title="Tokens Routed"
              value={data?.total_tokens_processed.toLocaleString() ?? "0"}
              subtitle="Cumulative prompt & completion tokens"
              icon={Zap}
            />

            <KPICard
              title="Money Saved"
              value={`$${(data?.financial_metrics.total_money_saved_usd ?? 0).toFixed(6)}`}
              subtitle={`Original: $${(data?.financial_metrics.total_original_cost_usd ?? 0).toFixed(6)}`}
              icon={DollarSign}
              badgeText={`${data?.financial_metrics.overall_savings_percent.toFixed(1) ?? "0.0"}% Saved`}
              isPositive={true}
              highlightEmerald={true}
            />

            <KPICard
              title="Average Proxy Latency"
              value={`${(data?.performance_metrics.average_latency_ms ?? 0).toFixed(2)} ms`}
              subtitle="Gateway processing overhead"
              icon={Clock}
            />
          </div>
        )}

        {/* Live Interactive Proxy Playground */}
        <Playground onSuccess={() => fetchAnalytics(false)} />

        {/* Live Proxy Audit Trail */}
        <RequestHistory />

        {/* Registered Model Catalog Table */}
        <ModelCatalog />
      </main>
    </div>
  );
}