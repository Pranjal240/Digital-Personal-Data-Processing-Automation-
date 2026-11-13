# DPDP AI Automation System

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-Interactive%20Workflow%20Explorer-6366f1?style=for-the-badge&logo=react)](https://pranjal240.github.io/Digital-Personal-Data-Processing-Automation-/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![n8n](https://img.shields.io/badge/Orchestrator-n8n%20Self--Hosted-ea4b71?style=for-the-badge&logo=n8n)](https://n8n.io)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2015+-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org)

An enterprise multi-agent automation platform designed for compliance with the **India Digital Personal Data Protection (DPDP) Act, 2023**. The system automates document intake, text and table extraction, personal data identification, Records of Processing Activities (RoPA) generation, data flow topology mapping (DFD), statutory requirement mapping, privacy risk assessment, autonomous quality assurance with self-correction revision loops, and human-in-the-loop review approval.

---

## 🌐 Live Interactive Architecture Explorer

Explore the production n8n multi-agent architecture directly in your browser without credentials or backend access:

👉 **[Launch Interactive Workflow Explorer](https://pranjal240.github.io/Digital-Personal-Data-Processing-Automation-/)**

### Explorer Capabilities
- **Interactive Node Canvas:** Pan, zoom, inspect, and search across all 106 production nodes.
- **Node Analysis & Logic Inspector:** View the exact executable JavaScript code, agent system prompts, PostgreSQL queries, and FastAPI endpoint schemas directly in the browser.
- **Specialized AI Agents (A0–A8):** Deep-dive into each specialist agent's prompts, governing rules, and dual-tier model fallback (Gemini + OpenRouter).
- **Air-Gapped & Sanitized:** 100% static client running zero credentials, tokens, or private network URLs.

---

## 🏛️ System Architecture

The automation operates across 12 sequential pipeline stages:

```
[Document Ingestion] ────────> [Extraction & Evidence Store] ────────> [Agent 0: Orchestrator]
 (Header Auth Webhook)           (PyMuPDF / Chunking / SHA-256)         (Execution Planning)
                                                                                  │
┌─────────────────────────────────────────────────────────────────────────────────┘
│
├──> [Agent 1: Document Intelligence] ───> Contractual clause and role extraction
├──> [Agent 2: Personal Data ID]      ───> Data categories & Data Principal classification
├──> [Agent 3: RoPA Register Builder] ───> Records of Processing Activities
├──> [Agent 4: Data Flow Analysis]    ───> Directed entity & data boundary topology
├──> [Agent 5: DPDP Mapping]          ───> Statutory requirement benchmarking
├──> [Agent 6: Risk & Gap Assessment] ───> Privacy risks, retention gaps & scoring
│
└─> [Agent 7: QA & Evidence Review] ────> Deterministic cross-checks & validation
         │
         ├── [QA Failed] ───────────────> Autonomous Retry Loop (Max 2 Attempts via Switch Router)
         │                                  (Re-routes targeted feedback to A3, A4, A5, or A6)
         │
         └── [QA Passed] ───────────────> [Mermaid DFD Generation (Row 09B)]
                                                        │
┌───────────────────────────────────────────────────────┘
│
└──> [Agent 8: Pre-Approval Briefing] ──> Executive 4-point briefing synthesis
         │
         └──> [Human Review Gate] ───────> n8n Wait Form + HTML/DOC Review Package + Gmail
                   │
                   ├── [Revision Needed] ─> Human Revision Loop (Max 2 Attempts via Switch)
                   ├── [Rejected] ────────> Terminal rejection audit in PostgreSQL
                   └── [Approved] ────────> [FastAPI Export Engine] (RoPA Excel, PDF, DFD SVG)
```

---

## 🤖 The Multi-Agent Pipeline (A0–A8)

| Agent | Responsibility | Primary LLM | Fallback LLM | Key Verification Tools |
|:---:|---|---|---|---|
| **A0** | **Orchestrator / Planner:** Formulates phased execution plan based on document characteristics. | Google Gemini | OpenRouter | `retrieve_document_metadata`, Scoped Postgres Memory |
| **A1** | **Document Intelligence:** Legal contract clause parser & entity classifier (Fiduciary vs. Processor). | Google Gemini | OpenRouter | `search_evidence` |
| **A2** | **Personal Data ID:** Personal data elements classifier and Data Principal categories identifier. | Google Gemini | OpenRouter | `search_evidence` |
| **A3** | **Processing Activities:** Statutory RoPA register generator linking business purposes and retention. | Google Gemini | OpenRouter | `search_evidence`, QA Revision Gate |
| **A4** | **Data Flow Analysis:** Directed topology mapper modeling entity boundaries and data flows. | Google Gemini | OpenRouter | `search_evidence`, `retrieve_processing_activities` |
| **A5** | **DPDP Compliance Mapping:** Benchmarks evidenced clauses against India DPDP Act 2023 catalogue. | Google Gemini | OpenRouter | `search_evidence`, `retrieve_dpdp_requirements_catalogue` |
| **A6** | **Risk & Gap Assessment:** Evaluates compliance gaps, unlisted sub-processors, and severity scores. | Google Gemini | OpenRouter | `search_evidence`, QA Revision Gate |
| **A7** | **QA & Evidence Review:** Senior reviewer gatekeeper with automated 2-cycle self-correction loop. | Google Gemini | OpenRouter | `cross_verify_package` (Deterministic cross-check) |
| **A8** | **Pre-Approval Briefing:** Executive review briefing synthesis for human compliance reviewer. | Google Gemini | OpenRouter | Direct HTML/Word Review Doc Builder |

---

## 📁 Repository Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Pages CI/CD workflow
├── backend/
│   ├── main.py                     # FastAPI backend microservice (PyMuPDF, ReportLab, export APIs)
│   ├── requirements.txt            # Python dependencies
│   └── .env.example                # Template configuration
├── database/
│   ├── 01_fresh_install.sql        # PostgreSQL 15+ relational schema migrations
│   ├── 02_existing_database_migration.sql
│   ├── 03_seed_dpdp_catalogue.sql  # DPDP Act, 2023 statutory requirements catalogue seed
│   ├── 04_validation_tests.sql
│   └── 05_rollback_and_recovery.sql
├── n8n/
│   └── workflow.json               # Canonical 106-node n8n workflow export
├── public-workflow-explorer/       # Standalone React 19 + React Flow Interactive Viewer
│   ├── src/                        # Component hierarchy, canvas, and data models
│   ├── scripts/security_audit.py   # Security and leak prevention audit script
│   └── package.json
└── README.md
```

---

## 🚀 Running Locally

### 1. Interactive Workflow Explorer
```bash
cd public-workflow-explorer
npm install
npm run dev
```
Open `http://localhost:5173`.

### 2. FastAPI Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate       # On Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # Configure your DATABASE_URL and API keys
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

---

## 🛡️ Security Audit
To ensure zero secrets or sensitive credentials are leakable in the public assets:
```bash
cd public-workflow-explorer
npm run security-audit
```

---

## 📄 License
MIT License.
