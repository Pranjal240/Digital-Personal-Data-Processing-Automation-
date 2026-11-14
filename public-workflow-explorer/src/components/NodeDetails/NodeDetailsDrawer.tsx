import React, { useState } from 'react'
import {
  X,
  Bot,
  Cpu,
  Wrench,
  ArrowRight,
  ArrowLeft,
  Shield,
  Layers,
  Copy,
  Check,
  Code,
  FileText,
  Info,
  Terminal,
  Database,
  Globe,
  GitBranch,
  UserCheck
} from 'lucide-react'
import type { WorkflowNode, AgentInfo, StageInfo } from '../../types/workflow'

interface NodeDetailsDrawerProps {
  node: WorkflowNode | null
  onClose: () => void
  agents: AgentInfo[]
  stages: StageInfo[]
  idToNode: Map<string, WorkflowNode>
  connectedInbound: { id: string; name: string; type: string; connType: string }[]
  connectedOutbound: { id: string; name: string; type: string; connType: string }[]
  onSelectNode: (nodeId: string) => void
}

export const NodeDetailsDrawer: React.FC<NodeDetailsDrawerProps> = ({
  node,
  onClose,
  agents,
  stages,
  connectedInbound,
  connectedOutbound,
  onSelectNode,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'params' | 'json'>('overview')
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedJson, setCopiedJson] = useState(false)

  if (!node) return null

  const isAgent = node._meta.category === 'agent'
  const agentMeta = isAgent ? agents.find((a) => a.primaryNodeId === node.id || a.fallbackNodeId === node.id) : null
  const stage = stages.find((s) => s.id === node._meta.stage.id)
  const params = node.parameters || {}

  const handleCopy = (text: string, type: 'code' | 'json') => {
    navigator.clipboard.writeText(text)
    if (type === 'code') {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } else {
      setCopiedJson(true)
      setTimeout(() => setCopiedJson(false), 2000)
    }
  }

  // Infer purpose and description
  const inferPurpose = () => {
    if (agentMeta) return agentMeta.responsibility
    if (node.type.includes('webhook')) return 'Securely receives external document upload requests with HMAC header validation.'
    if (node.type.includes('httpRequest')) {
      if (node.name.includes('Extract')) return 'Calls FastAPI backend microservice to extract text, tables, and generate SHA-256 evidence chunks from PDF/DOCX/XLSX files.'
      if (node.name.includes('Export')) return 'Calls FastAPI export pipeline to persist final RoPA Excel, PDF compliance matrix, and DFD SVGs.'
      if (node.name.includes('Error')) return 'Notifies FastAPI error management endpoint to update job failure status and audit logs.'
    }
    if (node.type.includes('postgres')) return 'Executes parameterized SQL queries against PostgreSQL 15+ database for job state tracking, attempt counters, and compliance audits.'
    if (node.type.includes('code')) {
      if (node.name.includes('Validate Input')) return 'Validates file parameters, tenant config, allowed MIME types, and assigns a unique job execution ID.'
      if (node.name.includes('Validate Extraction')) return 'Validates text extraction completeness, checks token limits, and formats inline evidence store.'
      if (node.name.includes('Parse & Validate')) return 'Strictly validates specialist AI agent output schema, extracts JSON structure, and prepares payload for downstream nodes.'
      if (node.name.includes('Mermaid')) return 'Compiles validated entity topology into standard Mermaid diagram syntax for visual architecture rendering.'
      if (node.name.includes('Pre-Approval Review')) return 'Builds self-contained HTML/Word pre-approval document with executive summary and embedded PostgreSQL SQL script.'
      if (node.name.includes('Consolidated')) return 'Packages approved findings and RoPA records for multi-format export.'
      if (node.name.includes('Final Confirmation')) return 'Prepares email attachments and compliance artifacts for delivery to stakeholders.'
    }
    if (node.type.includes('if')) return 'Evaluates conditional criteria (validation status, QA approval, human review decision, retry threshold) to control execution branches.'
    if (node.type.includes('switch')) return 'Routes targeted revision requests back to specialist agents (A3, A4, A5, or A6) during iterative correction cycles.'
    if (node.type.includes('wait')) return 'Pauses workflow execution and generates a secure n8n web form for human compliance officer review and sign-off.'
    if (node.type.includes('gmail')) return 'Dispatches automated notifications with attached review documents, questionnaires, and final compliance packages.'
    if (node.type.includes('lmChat')) return 'Configures Large Language Model runtime parameters (temperature, model name, context window) for LangChain agents.'
    if (node.type.includes('toolCode')) return 'Provides a deterministic Python/JS tool interface callable by LLM agents for fact-retrieval and verification.'
    return 'Executes automated operational step within the DPDP compliance automation pipeline.'
  }

  const getTechnology = () => {
    if (node.type.includes('GoogleGemini')) return 'Google Gemini (PaLM API) / Generative AI'
    if (node.type.includes('OpenRouter')) return 'OpenRouter Multi-Model Gateway'
    if (node.type.includes('postgres')) return 'PostgreSQL 15+ / Relational DB'
    if (node.type.includes('httpRequest')) return 'FastAPI / Python Microservice'
    if (node.type.includes('code')) return 'JavaScript / Node.js Engine (n8n Sandboxed)'
    if (node.type.includes('agent')) return 'n8n Advanced AI / LangChain Agent'
    if (node.type.includes('toolCode')) return 'LangChain Code Tool Interface'
    if (node.type.includes('memory')) return 'PostgreSQL Scoped Chat Memory'
    if (node.type.includes('gmail')) return 'Google Workspace / Gmail API'
    if (node.type.includes('webhook')) return 'n8n Webhook Listener (HTTP)'
    if (node.type.includes('wait')) return 'n8n Wait Form Node'
    return 'n8n Core Workflow Engine'
  }

  // Extract jsCode if node has it
  const jsCode = params.jsCode as string | undefined
  const systemMessage = params.options?.systemMessage as string | undefined
  const promptText = params.text as string | undefined

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[540px] bg-white/98 dark:bg-slate-900/98 border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col backdrop-blur-xl shadow-2xl transition-all duration-300">
      {/* Top Header */}
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/70 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
          <div className="p-1.5 sm:p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 shrink-0">
            {isAgent ? <Bot className="w-4 h-4 sm:w-5 sm:h-5" /> : <Info className="w-4 h-4 sm:w-5 sm:h-5" />}
          </div>
          <div className="truncate min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-semibold shrink-0">
                {node._meta.category.toUpperCase()}
              </span>
              {node._meta.agentId && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 shrink-0">
                  {node._meta.agentId}
                </span>
              )}
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5" title={node.name}>
              {node.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition"
            title="Close Details Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center overflow-x-auto no-scrollbar whitespace-nowrap border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 px-2 sm:px-3 pt-1 text-xs font-medium shrink-0">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-2.5 sm:px-3 py-2 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'overview'
              ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('params')}
          className={`px-2.5 sm:px-3 py-2 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'params'
              ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Node Logic & Config</span>
          <span className="inline sm:hidden">Logic & Code</span>
        </button>

        <button
          onClick={() => setActiveTab('json')}
          className={`px-2.5 sm:px-3 py-2 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'json'
              ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Code className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Sanitized JSON</span>
          <span className="inline sm:hidden">JSON</span>
        </button>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 sm:space-y-6 text-xs sm:text-sm">
        {activeTab === 'overview' && (
          <>
            {/* Stage & Pipeline Row */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Workflow Stage:</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono">{node._meta.stage.name}</span>
              </div>
              {stage?.description && (
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pt-0.5 border-t border-slate-200 dark:border-slate-800/60">
                  {stage.description}
                </p>
              )}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-800/40">
                <span className="text-slate-500 dark:text-slate-400">Underlying Engine:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{getTechnology()}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">n8n Node Type:</span>
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[240px]" title={node.type}>
                  {node.type}
                </span>
              </div>
            </div>

            {/* AI Agent Deep Dive (if node is an AI agent) */}
            {agentMeta && (
              <div className="rounded-xl border border-indigo-200 dark:border-indigo-500/40 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 space-y-3.5 shadow-sm dark:shadow-lg">
                <div className="flex items-center justify-between border-b border-indigo-200 dark:border-indigo-500/20 pb-2">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
                    <Bot className="w-4 h-4" />
                    <span>Specialized AI Agent Architecture</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-semibold">
                    {agentMeta.id}
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Agent Title & Responsibility:
                  </label>
                  <p className="mt-1 text-xs text-slate-900 dark:text-slate-200 leading-relaxed font-semibold">
                    {agentMeta.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {agentMeta.responsibility}
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Pipeline Position:
                  </label>
                  <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
                    {agentMeta.pipelinePosition}
                  </p>
                </div>

                {/* Models */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="rounded-lg bg-white dark:bg-slate-900/80 p-2.5 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium text-[11px]">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Primary LLM</span>
                    </div>
                    <div className="mt-1 text-slate-800 dark:text-slate-300 text-[11px] font-mono font-medium">{agentMeta.primaryModel}</div>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-slate-900/80 p-2.5 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-medium text-[11px]">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Fallback LLM</span>
                    </div>
                    <div className="mt-1 text-slate-800 dark:text-slate-300 text-[11px] font-mono font-medium">{agentMeta.fallbackModel}</div>
                  </div>
                </div>

                {/* Connected Tools */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>Connected Verification Tools ({agentMeta.tools.length}):</span>
                  </label>
                  {agentMeta.tools.length > 0 ? (
                    <div className="mt-1.5 space-y-1.5">
                      {agentMeta.tools.map((t, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-cyan-900/40 text-xs shadow-xs">
                          <span className="font-mono text-cyan-700 dark:text-cyan-400 font-semibold">{t.name}</span>
                          <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400">{t.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 italic">No external tools attached (pure reasoning agent)</p>
                  )}
                </div>

                {/* Key Governing Rules */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    System Prompt Governing Rules:
                  </label>
                  <ul className="mt-1.5 space-y-1">
                    {agentMeta.keyRules.map((r, i) => (
                      <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* General Purpose & Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Node Responsibility & Purpose</span>
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                {inferPurpose()}
              </p>
            </div>

            {/* Inbound & Outbound Connections */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Graph Connections</span>
              </h4>

              {/* Inbound */}
              <div>
                <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-1.5">
                  <ArrowLeft className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Inbound Predecessors ({connectedInbound.length}):</span>
                </div>
                {connectedInbound.length > 0 ? (
                  <div className="space-y-1">
                    {connectedInbound.map((inb) => (
                      <button
                        key={inb.id}
                        onClick={() => onSelectNode(inb.id)}
                        className="w-full text-left p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-500/60 text-xs flex items-center justify-between group transition"
                      >
                        <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 truncate">
                          {inb.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ml-2">
                          {inb.connType}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic pl-2">Root entry point (no inbound dependencies)</p>
                )}
              </div>

              {/* Outbound */}
              <div className="pt-2">
                <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Outbound Successors ({connectedOutbound.length}):</span>
                </div>
                {connectedOutbound.length > 0 ? (
                  <div className="space-y-1">
                    {connectedOutbound.map((outb) => (
                      <button
                        key={outb.id}
                        onClick={() => onSelectNode(outb.id)}
                        className="w-full text-left p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-500/60 text-xs flex items-center justify-between group transition"
                      >
                        <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 truncate">
                          {outb.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ml-2">
                          {outb.connType}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic pl-2">Leaf node (terminal point)</p>
                )}
              </div>
            </div>

            {/* Sanitized Security Summary */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Credentials Status:</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                  Sanitized
                </span>
              </div>
              {node.credentials ? (
                <div className="space-y-1 pt-1">
                  {Object.entries(node.credentials).map(([k, c]) => (
                    <div key={k} className="p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] flex justify-between">
                      <span className="text-slate-700 dark:text-slate-300">{k}</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{c.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No external credentials required.</p>
              )}
            </div>
          </>
        )}

        {/* Tab 2: Parameters & Node Logic Inspector */}
        {activeTab === 'params' && (
          <div className="space-y-5">
            {/* JavaScript Code Inspector (for Code Nodes & ToolCode) */}
            {jsCode && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Executable Node JavaScript Code</span>
                  </h4>
                  <button
                    onClick={() => handleCopy(jsCode, 'code')}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] text-slate-700 dark:text-slate-200 transition"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
                <div className="rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-900 p-3 font-mono text-[11px] text-indigo-200 overflow-x-auto max-h-96 leading-relaxed">
                  <pre>{jsCode}</pre>
                </div>
              </div>
            )}

            {/* AI Agent System Message & Prompt Inspector */}
            {systemMessage && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <span>Agent System Prompt / Message</span>
                  </h4>
                  <button
                    onClick={() => handleCopy(systemMessage, 'code')}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] text-slate-700 dark:text-slate-200 transition"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Prompt'}</span>
                  </button>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-800 dark:text-slate-200 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap font-sans">
                  {systemMessage}
                </div>
              </div>
            )}

            {/* Prompt Template Expression */}
            {promptText && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Input Prompt Template Expression</span>
                </h4>
                <div className="rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-900 p-3 font-mono text-[11px] text-amber-300 overflow-x-auto max-h-48 whitespace-pre-wrap">
                  {promptText}
                </div>
              </div>
            )}

            {/* PostgreSQL Node Parameters */}
            {node.type.includes('postgres') && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>PostgreSQL Database Configuration</span>
                </h4>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Operation:</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{params.operation || 'executeQuery'}</span>
                  </div>
                  {params.schema && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Schema:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{typeof params.schema === 'object' ? params.schema.value : params.schema}</span>
                    </div>
                  )}
                  {params.table && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Target Table:</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{typeof params.table === 'object' ? params.table.value : params.table}</span>
                    </div>
                  )}
                  {params.query && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 block mb-1">SQL Query:</span>
                      <div className="p-2.5 rounded bg-slate-900 font-mono text-[11px] text-slate-200 overflow-x-auto">
                        {params.query}
                      </div>
                    </div>
                  )}
                  {params.columns && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 block mb-1">Columns / Values Mapping:</span>
                      <div className="p-2.5 rounded bg-slate-900 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-40">
                        <pre>{typeof params.columns === 'string' ? params.columns : JSON.stringify(params.columns, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* HTTP Request Node Parameters */}
            {node.type.includes('httpRequest') && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <span>FastAPI Microservice Request Spec</span>
                </h4>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">HTTP Method:</span>
                    <span className="font-mono px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 font-bold border border-violet-200 dark:border-violet-500/30">
                      {params.method || params.requestMethod || 'POST'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Endpoint URL:</span>
                    <div className="font-mono text-[11px] text-violet-700 dark:text-violet-300 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 truncate" title={params.url}>
                      {params.url}
                    </div>
                  </div>
                  {params.sendBody && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 block mb-1">Body Content Type:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-300">{params.contentType || 'json / multipart-form'}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Condition / IF / Switch Parameters */}
            {(node.type.includes('if') || node.type.includes('switch')) && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <GitBranch className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Branching Conditions & Routing Rules</span>
                </h4>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 space-y-2 text-xs">
                  <div className="font-mono text-[11px] text-amber-300 bg-slate-900 p-2.5 rounded border border-slate-800 overflow-x-auto max-h-48">
                    <pre>{JSON.stringify(params.conditions || params.rules || params, null, 2)}</pre>
                  </div>
                </div>
              </div>
            )}

            {/* Wait / Human Approval Gate Parameters */}
            {node.type.includes('wait') && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-fuchsia-600 dark:text-fuchsia-400" />
                  <span>Human Review Form Gate</span>
                </h4>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Resume Mode:</span>
                    <span className="font-mono text-fuchsia-700 dark:text-fuchsia-300 font-semibold">{params.resume || 'form'}</span>
                  </div>
                  {params.formTitle && (
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Form Title:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{params.formTitle}</span>
                    </div>
                  )}
                  {params.formDescription && (
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed pt-1">
                      {params.formDescription}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Sticky Note Content */}
            {node.type.includes('stickyNote') && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Stage Documentation Content</span>
                </h4>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-xs text-slate-800 dark:text-slate-300 leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap font-sans">
                  {params.content}
                </div>
              </div>
            )}

            {/* General parameters fallback if none of the specific blocks matched */}
            {!jsCode && !systemMessage && !node.type.includes('postgres') && !node.type.includes('httpRequest') && !node.type.includes('if') && !node.type.includes('switch') && !node.type.includes('wait') && !node.type.includes('stickyNote') && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Node Configuration Parameters
                </h4>
                <div className="rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-900 p-3 font-mono text-[11px] text-slate-200 overflow-x-auto max-h-72">
                  <pre>{JSON.stringify(params, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Complete Sanitized JSON Definition */}
        {activeTab === 'json' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Complete Sanitized n8n Node JSON</span>
              </h4>
              <button
                onClick={() => handleCopy(JSON.stringify(node, null, 2), 'json')}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] text-slate-700 dark:text-slate-200 transition"
              >
                {copiedJson ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <div className="rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-900 p-3 font-mono text-[11px] text-slate-200 overflow-x-auto max-h-[70vh] leading-relaxed">
              <pre>{JSON.stringify(node, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
