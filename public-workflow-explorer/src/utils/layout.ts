import dagre from 'dagre'
import type { Node, Edge } from '@xyflow/react'

export type LayoutMode = 'native' | 'horizontal' | 'vertical'

export function applyLayout(
  nodes: Node[],
  edges: Edge[],
  mode: LayoutMode = 'native'
): { nodes: Node[]; edges: Edge[] } {
  if (mode === 'native') {
    // Return original positions saved in node.data.initialPosition
    return {
      nodes: nodes.map((node) => ({
        ...node,
        hidden: false,
        position: {
          x: node.data?.initialPosition ? (node.data.initialPosition as [number, number])[0] : node.position.x,
          y: node.data?.initialPosition ? (node.data.initialPosition as [number, number])[1] : node.position.y,
        },
      })),
      edges,
    }
  }

  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  const isHorizontal = mode === 'horizontal'
  dagreGraph.setGraph({
    rankdir: isHorizontal ? 'LR' : 'TB',
    nodesep: isHorizontal ? 80 : 90,
    ranksep: isHorizontal ? 160 : 140,
    align: 'DL',
    ranker: 'network-simplex',
  })

  // Exclude sticky notes from dagre graph to keep the flowchart clean and focused
  const operationalNodes = nodes.filter((n) => n.type !== 'stickyGroup')

  operationalNodes.forEach((node) => {
    const width = (node.data?.width as number) || 280
    const height = (node.data?.height as number) || 120
    dagreGraph.setNode(node.id, { width, height })
  })

  // Map of node IDs to raw nodes
  const nodeMap = new Map<string, Node>()
  operationalNodes.forEach((n) => nodeMap.set(n.id, n))

  edges.forEach((edge) => {
    const src = nodeMap.get(edge.source)
    const tgt = nodeMap.get(edge.target)
    if (!src || !tgt) return

    const srcName = (src.data?.raw as any)?.name || ''
    const tgtName = (tgt.data?.raw as any)?.name || ''

    // Skip cyclic feedback loops and cross-stage shared evidence tool from ranking calculation
    // so that the DAG remains strictly ordered, clean, and un-tangled
    const isFeedback =
      srcName.includes('Switch: Route QA Revision') ||
      srcName.includes('Switch: Route Human Revision') ||
      (srcName === 'Tool: Search & Validate Evidence' && !tgtName.includes('Agent 3') && !tgtName.includes('FallBack3'))

    if (!isFeedback) {
      dagreGraph.setEdge(edge.source, edge.target)
    }
  })

  dagre.layout(dagreGraph)

  const positionedNodes = nodes.map((node) => {
    if (node.type === 'stickyGroup') {
      // In auto-layout flowcharts, background sticky frames are hidden
      return {
        ...node,
        hidden: true,
      }
    }

    const nodeWithPosition = dagreGraph.node(node.id)
    if (nodeWithPosition) {
      const width = (node.data?.width as number) || 280
      const height = (node.data?.height as number) || 120
      return {
        ...node,
        hidden: false,
        position: {
          x: Math.round(nodeWithPosition.x - width / 2),
          y: Math.round(nodeWithPosition.y - height / 2),
        },
      }
    }

    return node
  })

  return { nodes: positionedNodes, edges }
}
