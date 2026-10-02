import React from "react";
import {
  LayoutDashboard,
  Cpu,
  GitFork,
  BarChart3,
  ListFilter,
  ShieldCheck,
} from "lucide-react";

interface NavItem {
  name: string;
  icon: React.ElementType;
  active?: boolean;
}

const navItems: NavItem[] = [
  { name: "Overview", icon: LayoutDashboard, active: true },
  { name: "Model Catalog", icon: Cpu },
  { name: "Semantic Router", icon: GitFork },
  { name: "Analytics & Costs", icon: BarChart3 },
  { name: "Request Logs", icon: ListFilter },
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col justify-between h-screen sticky top-0 p-4">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center space-x-3 px-2 py-1">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
            ⚡
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-wide">
              LiteInference
            </h1>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-slate-400 font-medium">
                Gateway Online
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  item.active
                    ? "bg-slate-900 text-emerald-400 border border-slate-800"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Security Badge */}
      <div className="px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-800/80 flex items-center space-x-2 text-[11px] text-slate-400">
        <ShieldCheck className="h-4 w-4 text-emerald-400" />
        <span>v0.1.0-production</span>
      </div>
    </aside>
  );
}