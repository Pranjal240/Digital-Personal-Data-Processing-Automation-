import React from 'react'
import {
  BaseEdge,
  getBezierPath,
  type EdgeProps
} from '@xyflow/react'

interface CustomEdgeData {
  connectionType?: 'main' | 'ai_languageModel' | 'ai_tool' | 'ai_memory'
  routeIndex?: number
  isHighlighted?: boolean
}

export const CustomWorkflowEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const edgeData = data as CustomEdgeData | undefined
  const connType = edgeData?.connectionType || 'main'
  const routeIndex = edgeData?.routeIndex || 0
  const isHighlighted = edgeData?.isHighlighted || false

  // Detect long cross-stage edges (e.g. shared evidence tool crossing multiple rows or feedback loops)
  const dy = Math.abs(targetY - sourceY)
  const isLongCrossStage = dy > 450

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  // Stroke color & styling by connection type & route
  let strokeColor = '#6366f1' // indigo for main success flow
  let strokeDasharray = undefined
  let strokeWidth = 2
  let opacity = 0.85

  if (connType === 'ai_languageModel') {
    strokeColor = '#f59e0b' // amber for language models
    strokeDasharray = '5 4'
    strokeWidth = 1.75
  } else if (connType === 'ai_tool') {
    strokeColor = '#06b6d4' // cyan for tools
    strokeDasharray = isLongCrossStage ? '3 4' : '3 3'
    strokeWidth = isLongCrossStage ? 1.25 : 1.75
    // Subdue long cross-stage background tool wires when unselected to prevent spiderweb clutter
    if (isLongCrossStage && !isHighlighted) {
      opacity = 0.2
    }
  } else if (connType === 'ai_memory') {
    strokeColor = '#10b981' // emerald for memory
    strokeDasharray = '4 4'
    strokeWidth = 1.75
  } else if (connType === 'main' && routeIndex === 1) {
    // Error fallback branch to FallBack agent
    strokeColor = '#f59e0b' // amber
    strokeDasharray = '4 3'
    strokeWidth = 1.75
  }

  // Cross-stage feedback loops (QA retry & human revisions)
  if (isLongCrossStage && connType === 'main') {
    strokeDasharray = '6 4'
    strokeWidth = 1.5
    strokeColor = '#f97316' // orange revision loop
    if (!isHighlighted) {
      opacity = 0.3
    }
  }

  if (isHighlighted) {
    strokeWidth = 3.5
    strokeColor = '#38bdf8' // vibrant sky-blue glow
    opacity = 1
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={isLongCrossStage && !isHighlighted ? undefined : markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray,
          opacity,
          transition: 'all 0.25s ease',
        }}
      />
    </>
  )
}
