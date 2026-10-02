import React from "react";
import { RefreshCw, Activity, Layers } from "lucide-react";

interface HeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function Header({ onRefresh, isRefreshing }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10 px-6 flex items-center justify-between">
      {/* Left Title & Breadcrumb */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Layers className="h-3.5 w-3.5" />
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-slate-100 font-medium">Overview</span>
        </div>
      </div>

      {/* Right Environment & Quick Actions */}
      <div className="flex items-center space-x-4">
        {/* Environment Badge */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
          <Activity className="h-3 w-3 text-emerald-400" />
          <span>http://127.0.0.1:8000</span>
        </div>

        {/* Refresh Action Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
          <span>{isRefreshing ? "Syncing..." : "Refresh"}</span>
        </button>
      </div>
    </header>
  );
}