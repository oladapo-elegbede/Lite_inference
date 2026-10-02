"use client";

import React from "react";
import Header from "@/components/Header";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
      <Header />

      <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight">
              Analytics & Cost Intelligence
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Detailed financial telemetry, token breakdown, and provider cost comparison.
            </p>
          </div>
        </div>

        <div className="p-8 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
          <p className="text-sm font-medium text-slate-300">Analytics Route Active</p>
          <p className="text-xs text-slate-500">
            Path: <code className="font-mono text-emerald-400">/analytics</code>
          </p>
        </div>
      </main>
    </div>
  );
}