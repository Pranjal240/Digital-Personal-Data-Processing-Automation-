import React from 'react'
import {
  X,
  Cpu,
  Server,
  Layers,
  ShieldCheck
} from 'lucide-react'

interface TechnologyStackModalProps {
  isOpen: boolean
  onClose: () => void
}

export const TechnologyStackModal: React.FC<TechnologyStackModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null

  const backendTech = [
    {
      category: 'Orchestration & Workflow Engine',
      name: 'n8n Enterprise Automation',
      version: 'Self-Hosted Docker',
      role: 'Core workflow orchestrator managing 106 nodes, webhook intake, LangChain agent loops, retry switch routers, and human review gates.',
      status: 'Active Backend',
    },
    {
      category: 'Backend Microservices & Extraction',
      name: 'FastAPI + Python 3.11',
      version: 'FastAPI v0.115',
      role: 'Document ingestion, PyMuPDF text & table extraction, openpyxl / python-docx parsing, SHA-256 evidence chunking, and multi-format report generation.',
      status: 'Active Backend',
    },
    {
      category: 'Structured Data Storage & Audit',
      name: 'PostgreSQL 15+',
      version: 'Docker Managed',
      role: 'Stores tenant configs, project states, document metadata, SHA-256 chunks, DPDP compliance catalogue seeds, and approval audit logs.',
      status: 'Active Backend',
    },
    {
      category: 'Primary AI Model Integration',
      name: 'Google Gemini 1.5/2.0 (PaLM API)',
      version: 'gemini-1.5-pro / flash',
      role: 'Primary intelligence for Agents A0 through A8, driving legal parsing, personal data detection, RoPA building, compliance mapping, and risk analysis.',
      status: 'Active AI Provider',
    },
    {
      category: 'Autonomous Resilience Gateway',
      name: 'OpenRouter Multi-Model Gateway',
      version: 'Production API',
      role: 'High-availability automated fallback for all agents (FallBack0 through FallBack8) in case of rate-limiting, quota exhaustion, or provider outages.',
      status: 'Active AI Provider',
    },
    {
      category: 'Document Parsing & PDF Synthesis',
      name: 'PyMuPDF, ReportLab, python-docx, openpyxl',
      version: 'Python Standard Suite',
      role: 'Extracts text from raw uploads; generates compliance matrices in PDF, multi-sheet RoPA registers in XLSX, and Word review documents in DOCX.',
      status: 'Active Library',
    },
    {
      category: 'Containerized Infrastructure',
      name: 'Docker Desktop & Docker Compose',
      version: 'Linux Containers',
      role: 'Isolates n8n, FastAPI, and PostgreSQL microservices in a local bridge network with persistent named volumes.',
      status: 'Active Infrastructure',
    },
  ]

  const viewerTech = [
    {
      category: 'Interactive Flow Canvas',
      name: '@xyflow/react (React Flow)',
      version: 'v12.12',
      role: 'Interactive graph canvas rendering 106 custom node cards, smooth bezier edges, minimap, dynamic zoom/pan, and node inspection.',
    },
    {
      category: 'UI Framework & Language',
      name: 'React 19 + TypeScript',
      version: 'React 19 / TS 5+',
      role: 'Strictly typed component hierarchy, reactive graph state hooks, and client-side telemetry computation.',
    },
    {
      category: 'Build Tooling & Bundler',
      name: 'Vite 8',
      version: 'v8.3',
      role: 'Sub-second HMR development and optimized static asset compilation with relative path resolution for GitHub Pages.',
    },
    {
      category: 'Automated Graph Layout',
      name: 'Dagre Layout Engine',
      version: 'v0.8.5',
      role: 'Calculates hierarchical directed acyclic graph (DAG) positions for left-to-right and top-to-bottom visualization modes.',
    },
    {
      category: 'Styling & Design System',
      name: 'Tailwind CSS v4 + Lucide React',
      version: 'Tailwind v4.3',
      role: 'Day/night dual-theme styling, glassmorphism backdrops, high-contrast typography, and specialized semantic iconography.',
    },
    {
      category: 'Deployment Platform',
      name: 'GitHub Pages & GitHub Actions',
      version: 'Static Hosting',
      role: 'Free static website hosting powered by automated CI/CD workflow, air-gapped with zero connection to private containers or backend secrets.',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Technology Stack & System Architecture
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Clear distinction between Production Automation Systems and Public Architecture Viewer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 text-sm">
          {/* Section 1: Production Automation Stack */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Existing Automation Infrastructure (Private Backend)
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 font-semibold">
                Private / Containerized
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {backendTech.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900 dark:text-slate-200">{item.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {item.version}
                    </span>
                  </div>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono block">{item.category}</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">{item.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Public Architecture Viewer Stack */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Public Interactive Viewer Architecture (Static Client)
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 font-semibold">
                Static / GitHub Pages
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {viewerTech.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900 dark:text-slate-200">{item.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {item.version}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono block">{item.category}</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">{item.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Air-Gap Assurance */}
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Air-Gapped Security Architecture</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              This public viewer is 100% static and client-side. It requires no credentials, database connections, ngrok tunnels, or Docker network access. All data displayed originates from a cryptographically verified and sanitized static workflow JSON asset with zero credentials, tokens, or private endpoints.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Production Stack vs. Public Visualization Stack</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
