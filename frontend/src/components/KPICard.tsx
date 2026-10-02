import React from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  badgeText?: string;
  isPositive?: boolean;
  highlightEmerald?: boolean;
}

export default function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  isPositive,
  highlightEmerald,
}: KPICardProps) {
  return (
    <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-sm flex flex-col justify-between space-y-3 transition-all hover:border-slate-700/80">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <div
          className={`p-2 rounded-lg border ${
            highlightEmerald
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-slate-800/60 border-slate-700/50 text-slate-400"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div>
        <div
          className={`text-2xl font-bold tracking-tight ${
            highlightEmerald ? "text-emerald-400" : "text-white"
          }`}
        >
          {value}
        </div>
        {subtitle && (
          <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>

      {badgeText && (
        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Savings Impact</span>
          <span
            className={`font-semibold px-2 py-0.5 rounded ${
              isPositive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            {badgeText}
          </span>
        </div>
      )}
    </div>
  );
}