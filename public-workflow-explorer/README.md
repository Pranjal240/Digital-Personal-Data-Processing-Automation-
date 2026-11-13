# DPDP AI Automation — Interactive n8n Multi-Agent Workflow Explorer

An enterprise-grade, publicly accessible, read-only interactive architecture viewer and graph canvas visualising the complete **India Digital Personal Data Protection (DPDP) Act, 2023** production n8n automation system.

---

## 🛡️ Security & Privacy First (Zero Backend Exposure)

This public explorer runs **100% client-side** as a static application:
- ❌ **No credentials, tokens, or passwords:** All sensitive auth IDs and keys are removed.
- ❌ **No database connection strings:** Live PostgreSQL credentials and connection URLs are air-gapped.
- ❌ **No private webhook or ngrok URLs:** Private endpoints are neutralized into standardized internal URIs (`https://api.dpdp.enterprise.internal`).
- ❌ **No personal data or emails:** Personal identifiers are sanitized into generic enterprise addresses (`dpo-compliance@dpdp-enterprise.internal`).
- ❌ **Zero live backend requirements:** Visitors never interact with Docker containers, FastAPI servers, or n8n admin consoles.

---

## ⚡ Architectural Telemetry (Computed from Production Workflow)

| Metric | Grounded Value | Description |
|---|:---:|---|
| **Total Workflow Nodes** | **106** | 91 operational logic/agent nodes + 15 stage-bounding sticky note sections |
| **Total Directed Edges** | **119** | 77 main execution control edges + 18 LLM links + 22 tool links + 2 chat memory links |
| **Specialized AI Agents** | **9 Primary + 9 Fallback (18 Nodes)** | A0 through A8, each equipped with automated fallback models |
| **Language Model Nodes** | **18** | 9 Google Gemini (PaLM API) nodes + 9 OpenRouter resilience gateway nodes |
| **PostgreSQL Database Nodes** | **9** | Job state init, evidence audit, QA state reading, retry tracking, approval logging |
| **FastAPI Microservice Calls** | **3** | Ingestion & PyMuPDF extraction, multi-format artifact export, error monitoring |
| **Code & Script Nodes** | **17** | Data sanitization, payload schema validation, Mermaid DFD compilation, HTML doc builder |
| **Condition & Switch Nodes** | **7** | 5 IF logic gates + 2 multi-target Switch routers for automated revision cycles |
| **Workflow Stages** | **12 Rows** | Row 01 Intake through Row 12 Error Auditing |

---

## 🤖 The Multi-Agent Pipeline (A0–A8)

| Agent | Name | Role | Primary / Fallback Model | Connected Tools |
|:---:|---|---|---|---|
| **A0** | **Orchestrator** | Task planner & execution graph coordinator | Gemini 1.5/2.0 / OpenRouter | `retrieve_document_metadata`, Scoped Postgres Memory |
| **A1** | **Document Intelligence** | Legal contract clause parser & entity classifier | Gemini 1.5/2.0 / OpenRouter | `search_evidence` (shared) |
| **A2** | **Personal Data ID** | Data category & Data Principal classifier | Gemini 1.5/2.0 / OpenRouter | `search_evidence` (shared) |
| **A3** | **Processing Activities** | Statutory RoPA register generator | Gemini 1.5/2.0 / OpenRouter | `search_evidence` (shared), QA revision loop |
| **A4** | **Data Flow Analysis** | Directed topology & entity boundary mapper | Gemini 1.5/2.0 / OpenRouter | `search_evidence`, `retrieve_processing_activities` |
| **A5** | **DPDP Compliance Mapping** | India DPDP Act, 2023 statutory requirement assessor | Gemini 1.5/2.0 / OpenRouter | `search_evidence`, `retrieve_dpdp_requirements_catalogue` |
| **A6** | **Risk & Gap Assessment** | Privacy gap identification & risk severity scorer | Gemini 1.5/2.0 / OpenRouter | `search_evidence` (shared), QA revision loop |
| **A7** | **QA & Evidence Review** | Senior review gatekeeper & revision orchestrator | Gemini 1.5/2.0 / OpenRouter | `cross_verify_package` (deterministic verification) |
| **A8** | **Pre-Approval Briefing** | Executive briefing synthesis for human review | Gemini 1.5/2.0 / OpenRouter | Inline review doc builder & SQL generator |

---

## 🛠️ Technology Stack

### Existing Production Automation (Private System)
- **n8n Self-Hosted:** Multi-agent workflow automation runtime inside Docker Desktop.
- **Python / FastAPI (v0.115):** High-performance document processing (PyMuPDF, openpyxl, python-docx, ReportLab).
- **PostgreSQL 15+:** Structured state storage, tenant management, and compliance seed catalogues.
- **Google Gemini & OpenRouter:** Dual-tier LLM architecture with autonomous fallback.
- **Docker & Docker Compose:** Container orchestration.

### Public Architecture Viewer (This Static Website)
- **React 19 & TypeScript:** Reactive component state, typed data schemas, and client-side graph engine.
- **Vite 8:** Lightning-fast static asset compilation with relative path asset bundling.
- **@xyflow/react (React Flow v12):** Interactive node canvas, smooth bezier connections, and dynamic minimap.
- **Dagre Layout Engine:** Hierarchical DAG layout computation (Left-to-Right and Top-to-Bottom).
- **Tailwind CSS v4:** Modern developer-tool dark theme, subtle glassmorphism, and responsive layout.
- **Lucide React:** Specialized semantic iconography.
- **GitHub Pages:** Free, static, serverless deployment via GitHub Actions.

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm 9+

### Commands to Run Locally
```bash
# 1. Navigate to the viewer directory
cd public-workflow-explorer

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit `http://localhost:5173` to explore the live workflow canvas.

### Production Build & Preview
```bash
# Run TypeScript typecheck and Vite production build
npm run build

# Preview production build locally
npm run preview
```

### Security Leak Audit
Verify that zero credentials or sensitive strings exist in the build:
```bash
npm run security-audit
```

---

## 🌐 Publishing to GitHub Pages

### Option A: Automatic Deployment via GitHub Actions (Recommended)
1. Commit and push the repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: Add DPDP interactive workflow explorer"
   git push origin main
   ```
2. In your GitHub repository:
   - Navigate to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. The included workflow `.github/workflows/deploy.yml` will automatically build and publish the site.

### Public URL Format
Once deployed, your interactive explorer will be accessible at:
```
https://<your-github-username>.github.io/<your-repository-name>/
```
*(e.g., `https://pranjal0705.github.io/DPDP_Backend/`)*

---

## 📄 License
MIT License. Created for the DPDP AI Automation Architecture Showcase.
