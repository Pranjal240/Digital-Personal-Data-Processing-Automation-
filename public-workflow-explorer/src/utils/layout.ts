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
    nodesep: isHorizontal ? 60 : 70,
    ranksep: isHorizontal ? 120 : 100,
  })

  // Exclude sticky notes from dagre graph to keep the flowchart clean
  const operationalNodes = nodes.filter((n) => n.type !== 'stickyGroup')

  operationalNodes.forEach((node) => {
    const width = (node.data?.width as number) || 280
    const height = (node.data?.height as number) || 120
    dagreGraph.setNode(node.id, { width, height })
  })

  edges.forEach((edge) => {
    // Only connect if both nodes are operational
    if (
      operationalNodes.some((n) => n.id === edge.source) &&
      operationalNodes.some((n) => n.id === edge.target)
    ) {
      dagreGraph.setEdge(edge.source, edge.target)
    }
  })

  dagre.layout(dagreGraph)

  const positionedNodes = nodes.map((node) => {
    if (node.type === 'stickyGroup') {
      // Hide sticky note background containers during auto-layout
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
          x: nodeWithPosition.x - width / 2,
          y: nodeWithPosition.y - height / 2,
        },
      }
    }

    return node
  })

  return { nodes: positionedNodes, edges }
}
