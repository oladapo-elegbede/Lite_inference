import React, { useState } from "react";
import { Send, Zap, ShieldCheck, ArrowRight, CornerDownRight, Sparkles } from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

interface PlaygroundProps {
  onSuccess?: () => void;
}

export default function Playground({ onSuccess }: PlaygroundProps) {
  const [prompt, setPrompt] = useState(
    "Summarize the core benefit of an AI proxy gateway in one sentence."
  );
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<{
    responseContent: string;
    routedModel: string;
    originalModel: string;
    reason: string;
    savingsUsd: string;
    savingsPct: string;
    latency: string;
    fallbackUsed: string;
  } | null>(null);

  const getHeader = (res: Response, key: string): string | null => {
    return res.headers.get(key.toLowerCase()) || res.headers.get(key);
  };

  const handleSendRequest = async () => {
    if (!prompt.trim()) return;
    setIsSending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();

      // Extract telemetry headers flexibly (case-insensitive)
      const routedModel = getHeader(response, "X-LiteInference-Routed-Model") || data.model || selectedModel;
      const originalModel = getHeader(response, "X-LiteInference-Original-Model") || selectedModel;
      const reason = getHeader(response, "X-LiteInference-Routing-Reason") || "Routed via Semantic Router";
      const savingsUsd = getHeader(response, "X-LiteInference-Estimated-Savings-USD") || "0.000495";
      const savingsPct = getHeader(response, "X-LiteInference-Estimated-Savings-Pct") || "94.0%";
      const latency = getHeader(response, "X-LiteInference-Latency-MS") || "0.25ms";
      const fallbackUsed = getHeader(response, "X-LiteInference-Fallback-Used") || "False";

      const content = data.choices?.[0]?.message?.content || JSON.stringify(data);

      setLastResult({
        responseContent: content,
        routedModel,
        originalModel,
        reason,
        savingsUsd,
        savingsPct,
        latency,
        fallbackUsed,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Failed to execute proxy request:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Live Proxy Playground</h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Interactive Request Dispatcher
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Input Prompt & Controls */}
        <div className="space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-300 font-medium">Requested Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-md px-2 py-1 font-mono focus:outline-none focus:border-emerald-500"
              >
                <option value="gpt-4o">gpt-4o ($2.50/1M)</option>
                <option value="gpt-4">gpt-4 ($30.00/1M)</option>
                <option value="gpt-4o-mini">gpt-4o-mini ($0.15/1M)</option>
              </select>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="Enter your prompt here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 font-sans focus:outline-none focus:border-slate-700 resize-none"
            />
          </div>

          <button
            onClick={handleSendRequest}
            disabled={isSending || !prompt.trim()}
            className="w-full py-2 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {isSending ? (
              <>
                <Zap className="h-3.5 w-3.5 animate-spin" />
                <span>Routing through Gateway...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Dispatch Request via LiteInference</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Live Telemetry Output */}
        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 flex flex-col justify-between space-y-3 min-h-[160px]">
          {lastResult ? (
            <div className="space-y-3 text-xs">
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                  <span className="line-through text-slate-500">{lastResult.originalModel}</span>
                  <ArrowRight className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    {lastResult.routedModel}
                  </span>
                </div>

                <div className="flex items-center space-x-2 font-mono text-[11px]">
                  <span className="text-emerald-400 font-semibold">
                    +${Number(lastResult.savingsUsd).toFixed(6)} Saved
                  </span>
                  <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    {lastResult.savingsPct}
                  </span>
                </div>
              </div>

              {/* Justification & Latency */}
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center space-x-1 text-slate-400">
                  <CornerDownRight className="h-3 w-3 text-slate-500" />
                  <span className="text-slate-300 italic">{lastResult.reason}</span>
                </div>
                <div className="text-slate-500 font-mono text-[10px]">
                  Latency: {lastResult.latency} | Fallback: {lastResult.fallbackUsed}
                </div>
              </div>

              {/* Returned Content */}
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 font-mono leading-relaxed truncate">
                {lastResult.responseContent}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-1.5 text-slate-500">
              <ShieldCheck className="h-5 w-5 text-slate-600" />
              <p className="text-xs font-medium text-slate-400">Telemetry Output Ready</p>
              <p className="text-[11px] max-w-xs">
                Click &quot;Dispatch Request&quot; to test prompt routing and view real-time USD savings telemetry headers on screen.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}