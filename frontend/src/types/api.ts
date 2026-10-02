export interface FinancialMetrics {
  total_original_cost_usd: number;
  total_actual_cost_usd: number;
  total_money_saved_usd: number;
  overall_savings_percent: number;
}

export interface PerformanceMetrics {
  average_latency_ms: number;
}

export interface AnalyticsSummary {
  total_requests_processed: number;
  total_tokens_processed: number;
  financial_metrics: FinancialMetrics;
  performance_metrics: PerformanceMetrics;
}

export interface ModelInfo {
  id: string;
  object: string;
  owned_by: string;
  capability_tier: "reasoning" | "cheap" | "coding" | "standard" | string;
  prompt_cost_per_1m: number;
  completion_cost_per_1m: number;
}

export interface ModelListResponse {
  object: string;
  data: ModelInfo[];
}

export interface RequestLogItem {
  id: string;
  request_id: string;
  timestamp: string | null;
  original_model: string;
  routed_model: string;
  provider: string;
  routing_reason: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_original_cost_usd: number;
  estimated_routed_cost_usd: number;
  money_saved_usd: number;
  latency_ms: number;
  status_code: number;
}

export interface RequestListResponse {
  object: string;
  data: RequestLogItem[];
}