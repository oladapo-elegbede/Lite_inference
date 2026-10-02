# LiteInference 🚀

> **Cost-Optimized AI Semantic Routing Proxy & Observability Dashboard**  
> An intelligent, drop-in API gateway sitting between applications and LLM providers to minimize inference costs by up to 94% without quality degradation.

---

## 🏛️ Architecture Overview

```text
                                  ┌────────────────────────┐
                                  │   Client Application   │
                                  └───────────┬────────────┘
                                              │
                                   HTTP POST /v1/chat/completions
                                              │
                                              ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ LiteInference Gateway (FastAPI Async ASGI)                                                │
│                                                                                           │
│   ┌────────────────────────┐     ┌────────────────────────┐     ┌─────────────────────┐   │
│   │ Prompt Complexity      │ ──> │ Hybrid Semantic Router │ ──> │ Model Catalog &     │   │
│   │ Analyzer               │     │ (Heuristics + Ollama)  │     │ Pricing Registry    │   │
│   └────────────────────────┘     └────────────────────────┘     └─────────────────────┘   │
└─────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    │                                                   │
                    ▼                                                   ▼
      ┌───────────────────────────┐                       ┌───────────────────────────┐
      │   Cloud LLM Providers     │                       │    Local Ollama Nodes     │
      │   (OpenAI gpt-4o-mini)    │                       │    (llama3.2 / zero cost) │
      └─────────────┬─────────────┘                       └─────────────┬─────────────┘
                    │                                                   │
                    └─────────────────────────┬─────────────────────────┘
                                              │
                                              ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ Telemetry & Persistence Layer                                                             │
│                                                                                           │
│   ├── Response Headers Injection (X-LiteInference-*)                                      │
│   └── Async Persistence Engine (PostgreSQL / SQLite via SQLAlchemy 2.0 Async)              │
└───────────────────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ LiteInference B2B Dashboard (Next.js 15, TypeScript, Tailwind CSS)                        │
│                                                                                           │
│   ├── Real-Time KPI Cards (Requests, Tokens, USD Saved %, Latency)                        │
│   ├── Live Proxy Audit Trail Table (Model Swaps & Decision Justifications)                │
│   └── Registered Model Catalog & Capability Tier Inspector                                │
└───────────────────────────────────────────────────────────────────────────────────────────┘

✨ Key Features
⚡ Backend Gateway
OpenAI Wire Protocol Compatibility: Standard drop-in replacement (POST /v1/chat/completions, GET /v1/models).
Hybrid Semantic Routing: Combines sub-millisecond regex/token count heuristics with local Ollama (llama3.2) LLM classification to route queries to the cheapest model capable of executing the task cleanly.
Cost Reduction Engine: Dynamically downscales non-complex reasoning requests from premium models (gpt-4o) to cost-efficient targets (gpt-4o-mini), achieving >90% cost savings.
Multi-Tier Fallback Resiliency: Automatically fails over to secondary targets if an upstream model experiences rate limits or outages.
Real-Time Telemetry Headers: Injects response headers (X-LiteInference-Estimated-Savings-USD, X-LiteInference-Latency-MS, X-LiteInference-Routing-Reason) for real-time observability.
Async Database Persistence: Records every request transaction, model swap, latency measurement, and financial metric into PostgreSQL or SQLite via SQLAlchemy 2.0.
📊 Frontend Dashboard
Custom B2B Dark Theme: Styled with slate-950 backgrounds, dark borders, and emerald financial accents (text-emerald-400).
Live Metrics KPI Cards: Displays real-time counts for processed requests, routed tokens, dollar savings ($ USD and %), and average proxy latency.
Live Proxy Audit Trail: Real-time transaction table showing model swaps (gpt-4o ➔ gpt-4o-mini), exact decision justifications, token usage, and sub-millisecond execution latencies.
Model Catalog Inspector: Displays active cloud/local models, capability tiers (reasoning, cheap, coding), and $/1M token pricing.
📂 Project Structure
text

lite-inference/
├── app/                      # Backend FastAPI Application
│   ├── api/v1/               # API Routes (chat, models, analyze, route, analytics)
│   ├── core/                 # Config, Model Registry, Token Analyzer, Router
│   ├── db/                   # Async SQLAlchemy Session & RequestLog Models
│   ├── schemas/              # Pydantic v2 Request/Response Models
│   └── services/             # Upstream SDK Execution, Classifier, Resiliency Logger
├── frontend/                 # Frontend Next.js Dashboard
│   ├── src/app/              # Next.js App Router Layout & Main Dashboard
│   ├── src/components/       # Sidebar, Header, KPICard, ModelCatalog, RequestHistory
│   └── src/types/            # TypeScript API Contracts
├── tests/                    # Async Pytest Suite with In-Memory DB Fixtures
├── .github/workflows/        # GitHub Actions CI Automation
├── docker-compose.yml        # Production Orchestration (Gateway + PostgreSQL 16)
├── Dockerfile                # Multi-Stage Non-Root Container Build Manifest
└── requirements.txt          # Backend Dependencies
⚡ Quickstart
1. Run via Docker Compose (Recommended)
Bash

docker-compose up --build -d
Backend Gateway: http://localhost:8000
Dashboard UI: http://localhost:3000
2. Local Development Setup
Backend (FastAPI)
Bash

# Set up virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start backend dev server
uvicorn app.main:app --reload
Frontend (Next.js)
Bash

cd frontend
npm install
npm run dev
🧪 Testing
Execute the automated async unit and integration test suite:

Bash

python -m pytest -v
🔌 API Endpoints Summary
Method    Endpoint    Description
POST    /v1/chat/completions    OpenAI-compatible chat proxy endpoint with automatic semantic routing
GET    /v1/models    List registered models, provider metadata, and pricing specs
POST    /v1/analyze    Inspect prompt token estimations and complexity signals
POST    /v1/route    Preview semantic routing decisions and cost savings
GET    /v1/analytics/summary    Query aggregate financial savings and latency performance metrics
GET    /v1/analytics/requests    Query recent request transaction audit logs
GET    /health    Gateway readiness and environment status check
🛠️ Stack & Technologies
Backend: Python 3.11+, FastAPI, Pydantic v2, AsyncOpenAI, Ollama Client
Database Layer: SQLAlchemy 2.0 Async, PostgreSQL (asyncpg), SQLite (aiosqlite)
Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS v4, Lucide Icons
Testing: Pytest, Pytest-Asyncio, HTTPX
DevOps & Containerization: Multi-stage Docker, Docker Compose, GitHub Actions CI