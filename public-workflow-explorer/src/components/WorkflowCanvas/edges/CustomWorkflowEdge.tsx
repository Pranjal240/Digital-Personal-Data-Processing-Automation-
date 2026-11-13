import React from 'react'
import {
  BaseEdge,
  getBezierPath,
  type EdgeProps
} from '@xyflow/react'

interface CustomEdgeData {
  connectionType?: 'main' | 'ai_languageModel' | 'ai_tool' | 'ai_memory'
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
  const isHighlighted = edgeData?.isHighlighted || false

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  // Stroke color & styling by connection type
  let strokeColor = '#6366f1' // indigo for main
  let strokeDasharray = undefined
  let strokeWidth = 2

  if (connType === 'ai_languageModel') {
    strokeColor = '#f59e0b' // amber
    strokeDasharray = '5 4'
    strokeWidth = 1.75
  } else if (connType === 'ai_tool') {
    strokeColor = '#06b6d4' // cyan
    strokeDasharray = '3 3'
    strokeWidth = 1.75
  } else if (connType === 'ai_memory') {
    strokeColor = '#10b981' // emerald
    strokeDasharray = '4 4'
    strokeWidth = 1.75
  }

  if (isHighlighted) {
    strokeWidth = 3.5
    strokeColor = '#ffffff'
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray,
          opacity: isHighlighted ? 1 : 0.75,
          transition: 'all 0.2s ease',
        }}
      />
    </>
  )
}

