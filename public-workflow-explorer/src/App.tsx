import { useState, useMemo } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { Navbar } from './components/Navbar/Navbar'
import { Sidebar } from './components/Sidebar/Sidebar'
import { WorkflowCanvas } from './components/WorkflowCanvas/WorkflowCanvas'
import { NodeDetailsDrawer } from './components/NodeDetails/NodeDetailsDrawer'
import { AgentExplorerModal } from './components/AgentExplorer/AgentExplorerModal'
import { OverviewModal } from './components/Overview/OverviewModal'
import { TechnologyStackModal } from './components/TechnologyStack/TechnologyStackModal'

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isOverviewOpen, setIsOverviewOpen] = useState(false)
  const [isTechStackOpen, setIsTechStackOpen] = useState(false)
  const [isAgentExplorerOpen, setIsAgentExplorerOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

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
    <div className={`w-screen h-screen flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-[#080c14] text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Top Navbar */}
      <Navbar
        onOpenOverview={() => setIsOverviewOpen(true)}
        onOpenTechStack={() => setIsTechStackOpen(true)}
        onOpenAgentExplorer={() => setIsAgentExplorerOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onDownloadWorkflow={handleDownloadWorkflow}
      />

      {/* Main Layout Body */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
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
          isOpen={isSidebarOpen}
          onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Center Interactive Graph Canvas */}
        <main className={`flex-1 h-full transition-all duration-300 ${isSidebarOpen ? 'md:ml-80' : 'ml-0'}`}>
          <WorkflowCanvas
            nodes={nodes}
            edges={edges}
            selectedNodeId={selectedNodeId}
            onSelectNode={selectNode}
            layoutMode={layoutMode}
            onChangeLayoutMode={setLayoutMode}
            onResetLayout={() => {
              setLayoutMode('native')
              setActiveStageId(null)
              setActiveCategory('all')
              setSearchQuery('')
              selectNode(null)
            }}
            totalNodesCount={totalNodes}
          />
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
