import React, { useEffect, useState } from "react";
import { ModelInfo, ModelListResponse } from "@/types/api";
import { Cpu, Server, DollarSign } from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function ModelCatalog() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch(`${API_BASE_URL}/v1/models`);
        if (res.ok) {
          const data: ModelListResponse = await res.json();
          setModels(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch model catalog:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchModels();
  }, []);

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "reasoning":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "coding":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "cheap":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Cpu className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Registered Model Catalog</h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {models.length} Models Active
        </span>
      </div>

      {isLoading ? (
        <div className="h-32 rounded-lg bg-slate-900/40 animate-pulse" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-2 font-medium">Model ID</th>
                <th className="pb-2 font-medium">Provider</th>
                <th className="pb-2 font-medium">Capability Tier</th>
                <th className="pb-2 font-medium text-right">Prompt Cost / 1M</th>
                <th className="pb-2 font-medium text-right">Completion Cost / 1M</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {models.map((model) => (
                <tr key={model.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2.5 font-mono font-medium text-white flex items-center space-x-2">
                    <Server className="h-3.5 w-3.5 text-slate-500" />
                    <span>{model.id}</span>
                  </td>
                  <td className="py-2.5 text-slate-300 capitalize">{model.owned_by}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getTierBadge(model.capability_tier)}`}>
                      {model.capability_tier}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-300">
                    {model.prompt_cost_per_1m === 0 ? (
                      <span className="text-emerald-400 font-semibold">FREE</span>
                    ) : (
                      `$${model.prompt_cost_per_1m.toFixed(2)}`
                    )}
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-300">
                    {model.completion_cost_per_1m === 0 ? (
                      <span className="text-emerald-400 font-semibold">FREE</span>
                    ) : (
                      `$${model.completion_cost_per_1m.toFixed(2)}`
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}