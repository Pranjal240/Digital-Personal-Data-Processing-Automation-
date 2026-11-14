/**
 * DPDP AI Automation Workflow Explorer
 * © 2026 Pranjal (Pranjal240). All rights reserved.
 * Licensed under the MIT License.
 */

import { useState, useMemo, useEffect } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { Navbar } from './components/Navbar/Navbar'
import { FramerSidebar } from './components/Sidebar/FramerSidebar'
import { WorkflowCanvas } from './components/WorkflowCanvas/WorkflowCanvas'
import { NodeDetailsDrawer } from './components/NodeDetails/NodeDetailsDrawer'
import { AgentExplorerModal } from './components/AgentExplorer/AgentExplorerModal'
import { OverviewModal } from './components/Overview/OverviewModal'
import { TechnologyStackModal } from './components/TechnologyStack/TechnologyStackModal'
import { FlowButton } from './components/ui/FlowButton'
import { Info, X, GitFork } from 'lucide-react'

import agentsDataRaw from './data/agents.json'
import stagesDataRaw from './data/stages.json'
import statsDataRaw from './data/stats.json'

import type { AgentInfo, StageInfo, StatsInfo } from './types/workflow'
import { useWorkflowGraph } from './hooks/useWorkflowGraph'

const agentsData = agentsDataRaw as AgentInfo[]
const stagesData = stagesDataRaw as StageInfo[]
const statsData = statsDataRaw as unknown as StatsInfo

function WorkflowExplorerApp() {
  const {
    nodes,
    edges,
    onNodesChange,
    resetLayout,
    selectedNode,
    selectedNodeId,
    selectNode,
    focusAgent,
    searchQuery,
    setSearchQuery,
    activeStageId,
    setActiveStageId,
    activeCategory,
    setActiveCategory,
    layoutMode,
    setLayoutMode,
    idToNode,
    totalNodes,
  } = useWorkflowGraph()

  // UI state
  const [isOverviewOpen, setIsOverviewOpen] = useState(false)
  const [isTechStackOpen, setIsTechStackOpen] = useState(false)
  const [isAgentExplorerOpen, setIsAgentExplorerOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showBanner, setShowBanner] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Default to light theme on load (Day mode), with user-toggled persistence
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('dpdp_theme_v2')
      if (saved === 'dark' || saved === 'light') return saved
      return 'light'
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('dpdp_theme_v2', theme)
    } catch {}

    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.setAttribute('data-theme', 'dark')
      root.style.colorScheme = 'dark'
      document.body.style.backgroundColor = '#080c14'
      document.body.style.color = '#f1f5f9'
    } else {
      root.classList.remove('dark')
      root.setAttribute('data-theme', 'light')
      root.style.colorScheme = 'light'
      document.body.style.backgroundColor = '#f8fafc'
      document.body.style.color = '#0f172a'
    }
  }, [theme])

  // Selected agent identifier if selected node is an agent
  const selectedAgentId = useMemo(() => {
    if (!selectedNode) return null
    return selectedNode._meta.agentId
  }, [selectedNode])

  // Inbound & Outbound connected nodes for details drawer
  const { connectedInbound, connectedOutbound } = useMemo(() => {
    if (!selectedNodeId) return { connectedInbound: [], connectedOutbound: [] }

    const inbound: { id: string; name: string; type: string; connType: string }[] = []
    const outbound: { id: string; name: string; type: string; connType: string }[] = []

    edges.forEach((edge) => {
      if (edge.target === selectedNodeId) {
        const srcNode = idToNode.get(edge.source)
        if (srcNode) {
          inbound.push({
            id: srcNode.id,
            name: srcNode.name,
            type: srcNode.type,
            connType: (edge.data as any)?.connectionType || 'main',
          })
        }
      } else if (edge.source === selectedNodeId) {
        const tgtNode = idToNode.get(edge.target)
        if (tgtNode) {
          outbound.push({
            id: tgtNode.id,
            name: tgtNode.name,
            type: tgtNode.type,
            connType: (edge.data as any)?.connectionType || 'main',
          })
        }
      }
    })

    return { connectedInbound: inbound, connectedOutbound: outbound }
  }, [selectedNodeId, edges, idToNode])

  // Fullscreen handler
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
        setIsFullscreen(false)
      }
    }
  }

  // Download Sanitized Workflow JSON
  const handleDownloadWorkflow = () => {
    const link = document.createElement('a')
    link.href = './sanitized_workflow.json'
    link.download = 'dpdp_sanitized_workflow.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className={`w-screen h-screen flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Top Navbar */}
      <Navbar
        onOpenOverview={() => setIsOverviewOpen(true)}
        onOpenTechStack={() => setIsTechStackOpen(true)}
        onOpenAgentExplorer={() => setIsAgentExplorerOpen(true)}
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isSidebarOpen={isMobileSidebarOpen}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onDownloadWorkflow={handleDownloadWorkflow}
      />

      {/* Main Layout Body */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Left Expandable Rail Sidebar */}
        <FramerSidebar
          agents={agentsData}
          stages={stagesData}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          activeStageId={activeStageId}
          onSelectStage={setActiveStageId}
          onFocusAgent={focusAgent}
          selectedAgentId={selectedAgentId}
          isMobileOpen={isMobileSidebarOpen}
          onToggleMobileOpen={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenOverview={() => setIsOverviewOpen(true)}
          onOpenTechStack={() => setIsTechStackOpen(true)}
          onOpenAgentExplorer={() => setIsAgentExplorerOpen(true)}
          onDownloadWorkflow={handleDownloadWorkflow}
        />

        {/* Center Interactive Graph Canvas */}
        <main className="flex-1 h-full ml-0 md:ml-16 relative flex flex-col transition-all duration-300">
          {/* Interactive Disclaimer Banner */}
          {showBanner && (
            <div className="relative z-20 mx-2 sm:mx-6 mt-2 sm:mt-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-indigo-200/80 dark:border-indigo-500/30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 text-xs">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="p-1 sm:p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Info className="w-4 h-4" />
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-snug font-normal text-[11px] sm:text-xs min-w-0">
                  <strong className="font-semibold text-slate-900 dark:text-slate-100">Interactive Architecture Explorer:</strong>{' '}
                  <span className="hidden sm:inline">This is a public, read-only interactive viewer for exploring the DPDP multi-agent n8n workflow. Live production setup is free and open-source on GitHub.</span>
                  <span className="inline sm:hidden">Public read-only architecture viewer. Live setup is open-source on GitHub.</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <FlowButton
                  text="Backend Setup"
                  icon={GitFork}
                  size="sm"
                  variant="accent"
                  href="https://github.com/Pranjal240/Digital-Personal-Data-Processing-Automation-"
                  target="_blank"
                  rel="noreferrer"
                  className="!py-1 !text-[11px] sm:!text-xs"
                />
                <button
                  onClick={() => setShowBanner(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
                  title="Dismiss Notice"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Graph Viewport */}
          <div className="flex-1 relative overflow-hidden">
            <WorkflowCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              selectedNodeId={selectedNodeId}
              onSelectNode={selectNode}
              layoutMode={layoutMode}
              onChangeLayoutMode={setLayoutMode}
              onResetLayout={resetLayout}
              totalNodesCount={totalNodes}
              theme={theme}
              activeStageId={activeStageId}
            />
          </div>
        </main>

        {/* Right Node Details Drawer */}
        <NodeDetailsDrawer
          node={selectedNode}
          onClose={() => selectNode(null)}
          agents={agentsData}
          stages={stagesData}
          idToNode={idToNode}
          connectedInbound={connectedInbound}
          connectedOutbound={connectedOutbound}
          onSelectNode={selectNode}
        />
      </div>

      {/* Modals */}
      <AgentExplorerModal
        isOpen={isAgentExplorerOpen}
        onClose={() => setIsAgentExplorerOpen(false)}
        agents={agentsData}
        onSelectAgent={focusAgent}
      />

      <OverviewModal
        isOpen={isOverviewOpen}
        onClose={() => setIsOverviewOpen(false)}
        stats={statsData}
        stages={stagesData}
      />

      <TechnologyStackModal
        isOpen={isTechStackOpen}
        onClose={() => setIsTechStackOpen(false)}
      />
    </div>
  )
}

export default function App() {
  return (
    <ReactFlowProvider>
      <WorkflowExplorerApp />
    </ReactFlowProvider>
  )
}
