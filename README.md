# LiteInference 🚀

> **Cost-Optimized AI Semantic Routing Proxy**  
> An intelligent, drop-in API gateway sitting between applications and LLM providers to minimize inference costs without quality degradation.

---

## 🏛️ Architecture Overview

\\\	ext
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
│   │ Prompt Complexity      │ ──> │ Semantic Router        │ ──> │ Cost & Model        │   │
│   │ Analyzer               │     │ Decision Engine        │     │ Pricing Registry    │   │
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
│ Telemetry & Audit Logging Layer                                                           │
│                                                                                           │
│   ├── Response Headers Injection (X-LiteInference-*)                                      │
│   └── Async Persistence Engine (PostgreSQL / SQLite via SQLAlchemy 2.0 Async)              │
└───────────────────────────────────────────────────────────────────────────────────────────┘
\\\

---

## ✨ Key Features

- **OpenAI Wire Protocol Compatibility**: Standard drop-in replacement (\POST /v1/chat/completions\, \GET /v1/models\).
- **Hybrid Semantic Routing**: Evaluates prompt complexity, token count heuristics, and coding constructs to route queries to the cheapest model capable of executing the task cleanly.
- **Cost Reduction Engine**: Dynamically downscales non-complex reasoning requests from premium models (\gpt-4o\) to cost-efficient targets (\gpt-4o-mini\), achieving up to **90%+ cost savings**.
- **Multi-Tier Fallback Resiliency**: If an upstream model experiences rate limits or outages, LiteInference automatically fails over to fallback targets.
- **Real-Time Telemetry Headers**: Emits response headers (\X-LiteInference-Estimated-Savings-USD\, \X-LiteInference-Latency-MS\, \X-LiteInference-Routing-Reason\) for real-time observability.
- **Async Database Persistence**: Records every request transaction, model swap, latency measurement, and financial metric into PostgreSQL or SQLite.

---

## ⚡ Quickstart

### 1. Run via Docker Compose (Recommended)

\\\ash
docker-compose up --build -d
\\\

The gateway will be live at \http://localhost:8000\.

### 2. Local Development Setup

\\\ash
# Clone repository
git clone https://github.com/your-username/lite-inference.git
cd lite-inference

# Set up virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start development server
uvicorn app.main:app --reload
\\\

---

## 🧪 Testing

Execute the automated async unit and integration test suite:

\\\ash
python -m pytest -v
\\\

---

## 📊 Analytics API

Query live financial metrics and transaction aggregations:

\\\ash
curl http://localhost:8000/v1/analytics/summary
\\\

**Example Response:**

\\\json
{
  "total_requests_processed": 142,
  "total_tokens_processed": 18420,
  "financial_metrics": {
    "total_original_cost_usd": 0.04605,
    "total_actual_cost_usd": 0.00276,
    "total_money_saved_usd": 0.04329,
    "overall_savings_percent": 94.01
  },
  "performance_metrics": {
    "average_latency_ms": 1.28
  }
}
\\\

---

## 🛠️ Stack & Technologies

- **Framework**: Python 3.11+, FastAPI (Async ASGI)
- **Validation**: Pydantic v2
- **Database Engine**: SQLAlchemy 2.0 Async, PostgreSQL (\syncpg\), SQLite (\iosqlite\)
- **LLM Integrations**: AsyncOpenAI SDK, Ollama Client
- **Testing**: Pytest, Pytest-Asyncio, HTTPX
- **Containerization**: Multi-stage Docker, Docker Compose
