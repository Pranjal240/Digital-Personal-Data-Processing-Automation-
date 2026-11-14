import dagre from 'dagre'
import type { Node, Edge } from '@xyflow/react'

export type LayoutMode = 'native' | 'horizontal' | 'vertical'

const STAGES_ORDER = [
  'stage-01',
  'stage-02',
  'stage-03',
  'stage-04',
  'stage-05',
  'stage-06',
  'stage-07',
  'stage-08',
  'stage-09',
  'stage-09b',
  'stage-10',
  'stage-11',
  'stage-12',
]

export function applyLayout(
  nodes: Node[],
  edges: Edge[],
  mode: LayoutMode = 'native'
): { nodes: Node[]; edges: Edge[] } {
  if (mode === 'native') {
    // Return original positions saved in node.data.initialPosition and restore initial dimensions
    return {
      nodes: nodes.map((node) => {
        const raw = node.data?.raw as any
        const initialPos = node.data?.initialPosition as [number, number] | undefined
        const posX = initialPos ? initialPos[0] : node.position.x
        const posY = initialPos ? initialPos[1] : node.position.y
        const initialW = (node.type === 'stickyGroup' ? raw?.parameters?.width : node.data?.width) || 280
        const initialH = (node.type === 'stickyGroup' ? raw?.parameters?.height : node.data?.height) || 120

        return {
          ...node,
          hidden: false,
          position: { x: posX, y: posY },
          initialWidth: initialW,
          initialHeight: initialH,
          measured: { width: initialW, height: initialH },
          data: {
            ...node.data,
            width: initialW,
            height: initialH,
          },
        }
      }),
      edges,
    }
  }

  const isHorizontal = mode === 'horizontal'
  const operationalNodes = nodes.filter((n) => n.type !== 'stickyGroup')

  // Calculate layout per stage to guarantee strict stage containment and clean non-overlapping cards
  const nodePositions = new Map<string, { x: number; y: number }>()
  const cardData = new Map<
    string,
    { x: number; y: number; width: number; height: number }
  >()

  let currentX = 40
  let currentY = 220 // Room for Master Overview banner at top

  STAGES_ORDER.forEach((stageId) => {
    const stageNodes = operationalNodes.filter(
      (n) => (n.data?.raw as any)?._meta?.stage?.id === stageId
    )
    if (stageNodes.length === 0) return

    const g = new dagre.graphlib.Graph()
    g.setDefaultEdgeLabel(() => ({}))
    g.setGraph({
      rankdir: isHorizontal ? 'LR' : 'TB',
      nodesep: isHorizontal ? 60 : 50,
      ranksep: isHorizontal ? 90 : 80,
      align: 'DL',
    })

    stageNodes.forEach((node) => {
      const width = (node.data?.width as number) || 280
      const height = (node.data?.height as number) || 120
      g.setNode(node.id, { width, height })
    })

    // Add intra-stage edges for clean hierarchical flow inside each stage
    const stageNodeIds = new Set(stageNodes.map((n) => n.id))
    edges.forEach((edge) => {
      if (!stageNodeIds.has(edge.source) || !stageNodeIds.has(edge.target)) return

      const src = stageNodes.find((n) => n.id === edge.source)
      const srcName = (src?.data?.raw as any)?.name || ''
      // Exclude feedback loops from internal ranking
      const isFeedback =
        srcName.includes('Switch: Route QA Revision') ||
        srcName.includes('Switch: Route Human Revision')

      if (!isFeedback) {
        g.setEdge(edge.source, edge.target)
      }
    })

    dagre.layout(g)

    // Compute bounding box for this stage's internal DAG
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    stageNodes.forEach((node) => {
      const p = g.node(node.id)
      if (!p) return
      const width = (node.data?.width as number) || 280
      const height = (node.data?.height as number) || 120
      minX = Math.min(minX, p.x - width / 2)
      minY = Math.min(minY, p.y - height / 2)
      maxX = Math.max(maxX, p.x + width / 2)
      maxY = Math.max(maxY, p.y + height / 2)
    })

    const padL = 40
    const padR = 40
    const padT = 75 // Extra top padding for stage header, row title, and summary
    const padB = 40

    const cardW = Math.max(500, Math.round((maxX - minX) + padL + padR))
    const cardH = Math.max(220, Math.round((maxY - minY) + padT + padB))

    let stageX = 0
    let stageY = 0

    if (isHorizontal) {
      if (stageId === 'stage-12') {
        // Place global error handling stage neatly below stage 01
        stageX = 40
        stageY = 880
      } else {
        stageX = currentX
        stageY = 220
        currentX += cardW + 80
      }
    } else {
      stageX = 40
      stageY = currentY
      currentY += cardH + 60
    }

    cardData.set(stageId, { x: stageX, y: stageY, width: cardW, height: cardH })

    // Position operational nodes relative to the stage card
    stageNodes.forEach((node) => {
      const p = g.node(node.id)
      if (!p) return
      const width = (node.data?.width as number) || 280
      const height = (node.data?.height as number) || 120
      const finalX = Math.round(p.x - width / 2 - minX + padL + stageX)
      const finalY = Math.round(p.y - height / 2 - minY + padT + stageY)
      nodePositions.set(node.id, { x: finalX, y: finalY })
    })
  })

  // Build positioned nodes array
  const positionedNodes = nodes.map((node) => {
    if (node.type === 'stickyGroup') {
      const raw = node.data?.raw as any
      const name = raw?.name || ''
      const isMaster = name.includes('Master Overview')
      const isSharedTool = name === 'Sticky Note'
      const stageId = raw?._meta?.stage?.id

      if (isMaster) {
        const b1 = cardData.get('stage-01')
        const cardX = b1?.x ?? 40
        const cardY = 30
        const cardW = Math.max(b1?.width ?? 1200, isHorizontal ? 1440 : 1020)
        const cardH = 150

        return {
          ...node,
          hidden: false,
          position: { x: cardX, y: cardY },
          initialWidth: cardW,
          initialHeight: cardH,
          measured: { width: cardW, height: cardH },
          data: {
            ...node.data,
            width: cardW,
            height: cardH,
          },
        }
      }

      if (isSharedTool) {
        // Enclose the shared evidence tool node inside stage 5
        const toolNode = operationalNodes.find(
          (n) => (n.data?.raw as any)?.name === 'Tool: Search & Validate Evidence'
        )
        const toolPos = toolNode ? nodePositions.get(toolNode.id) : null
        let cardX = 0
        let cardY = 0
        const cardW = 310
        const cardH = 210

        if (toolPos) {
          cardX = Math.round(toolPos.x - 30)
          cardY = Math.round(toolPos.y - 55)
        } else {
          const b5 = cardData.get('stage-05')
          cardX = (b5?.x ?? 0) + 40
          cardY = (b5?.y ?? 0) + 80
        }

        return {
          ...node,
          hidden: false,
          position: { x: cardX, y: cardY },
          initialWidth: cardW,
          initialHeight: cardH,
          measured: { width: cardW, height: cardH },
          data: {
            ...node.data,
            width: cardW,
            height: cardH,
          },
        }
      }

      // Stage background card
      const c = cardData.get(stageId)
      if (c) {
        return {
          ...node,
          hidden: false,
          position: { x: c.x, y: c.y },
          initialWidth: c.width,
          initialHeight: c.height,
          measured: { width: c.width, height: c.height },
          data: {
            ...node.data,
            width: c.width,
            height: c.height,
          },
        }
      }

      return {
        ...node,
        hidden: false,
      }
    }

    // Operational nodes
    const pos = nodePositions.get(node.id)
    if (pos) {
      return {
        ...node,
        hidden: false,
        position: pos,
      }
    }

    return node
  })

  return { nodes: positionedNodes, edges }
}
