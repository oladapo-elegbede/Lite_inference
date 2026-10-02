# LiteInference 🚀

### Cost-Optimized AI Semantic Routing Proxy & Observability Platform

LiteInference is an intelligent, high-performance, drop-in API gateway that sits seamlessly between your production applications and LLM providers. By executing real-time semantic analysis and token heuristics, it dynamically routes queries to the lowest-cost capable model—achieving up to **94% infrastructure cost reduction** without sacrificing response quality.

---

## 🏛️ Architecture Overview

```text
       ┌────────────────────────┐
       │   Client Application   │
       └───────────┬────────────┘
                   │ HTTP POST /v1/chat/completions
                   ▼
┌───────────────────────────────────────────────────────────────────┐
│              LiteInference Gateway (FastAPI Async ASGI)           │
│                                                                   │
│  ┌────────────────────┐   ┌────────────────────┐   ┌───────────┐  │
│  │ Prompt Complexity  │──>│  Semantic Router   │──>│   Model   │  │
│  │    Analyzer        │   │  Decision Engine   │   │  Registry │  │
│  └────────────────────┘   └────────────────────┘   └───────────┘  │
└───────────────────────────────────┬───────────────────────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
     ┌─────────────────────────┐         ┌─────────────────────────┐
     │    Cloud LLM Providers  │         │   Local Inference Pods  │
     │      (gpt-4o-mini)      │         │   (llama3.2 / $0 cost)  │
     └────────────┬────────────┘         └────────────┬────────────┘
                  │                                   │
                  └─────────────────┬─────────────────┘
                                    ▼
┌───────────────────────────────────────────────────────────────────┐
│                  Telemetry & Audit Logging Layer                  │
│                                                                   │
│  ├── Response Headers Injection (X-LiteInference-*)               │
│  └── Async Persistence (PostgreSQL / SQLite via SQLAlchemy 2.0)   │
└───────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

* **OpenAI Wire Protocol Compatibility:** True drop-in replacement. Simply update your `base_url` to route traffic via `/v1/chat/completions` and `/v1/models`.
* **Hybrid Semantic Routing Engine:** Evaluates incoming prompt complexity, token count heuristics, and coding constructs down to sub-millisecond execution times to determine processing requirements.
* **Intelligent Cost Optimization:** Dynamically downscales non-complex reasoning requests from premium tiers (`gpt-4o`) to highly efficient local or cloud targets, cutting infrastructure overhead significantly.
* **Multi-Tier Fallback Resiliency:** Features built-in automatic failover configurations, provider fallback chains, and backoff retry logic to guard against upstream rate limits or outages.
* **Non-Blocking Telemetry Headers:** Emits real-time observability indicators directly into the response payload headers:
  * `X-LiteInference-Estimated-Savings-USD`
  * `X-LiteInference-Latency-MS`
  * `X-LiteInference-Routing-Reason`
* **Asynchronous Data Persistence:** Leverages `SQLAlchemy 2.0 Async` and `asyncpg` to log request payloads, model substitutions, latency records, and cost metrics into PostgreSQL without blocking active worker API throughput.

---

## ⚡ Quickstart

### 1. Run via Docker Compose (Recommended)
```bash
docker-compose up --build -d
```
The gateway will be live and ready for requests at `http://localhost:8000`.

### 2. Local Development Setup
```bash
# Clone the repository
git clone https://github.com/your-username/lite-inference.git
cd lite-inference

# Set up virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start the development server
uvicorn app.main:app --reload
```

---

## 🧪 Testing Suite

Execute the automated asynchronous unit and integration test suite to verify pipeline integrity:
```bash
python -m pytest -v
```

---

## 📊 Analytics API Endpoints

Query live financial metrics, token distributions, and multi-tenant transaction aggregations directly from the built-in observability endpoint:

```bash
curl http://localhost:8000/v1/analytics/summary
```

### Example Response Payload
```json
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
```

---

## 🛠️ Tech Stack & Dependencies

* **Core Framework:** Python 3.11+, FastAPI (Async ASGI Architecture)
* **Data Validation:** Pydantic v2
* **Database Pipeline:** SQLAlchemy 2.0 Async, PostgreSQL (`asyncpg`), SQLite (`aiosqlite`)
* **LLM Clients:** AsyncOpenAI SDK, Ollama Core Integration
* **Testing Infrastructure:** Pytest, Pytest-Asyncio, HTTPX
* **Containerization:** Multi-stage Docker Engine, Docker Compose
