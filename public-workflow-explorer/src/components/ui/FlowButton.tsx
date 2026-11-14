/**
 * DPDP AI Automation Workflow Explorer
 * © 2026 Pranjal (Pranjal240). All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react'
import { ArrowRight, type LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface FlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string
  icon?: LucideIcon
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'accent' | 'subtle'
  href?: string
  target?: string
  rel?: string
}

export const FlowButton: React.FC<FlowButtonProps> = ({
  text,
  children,
  icon: Icon = ArrowRight,
  size = 'md',
  variant = 'default',
  href,
  target,
  rel,
  className,
  ...props
}) => {
  const content = text || children

  // Size configurations with ample right padding so text never collides with arrow icon
  const sizeClasses = {
    sm: 'pl-3.5 sm:pl-4 pr-7 sm:pr-8 py-1.5 text-xs rounded-[100px]',
    md: 'pl-4 sm:pl-6 pr-8 sm:pr-10 py-2 text-xs sm:text-sm rounded-[100px]',
    lg: 'pl-6 sm:pl-8 pr-10 sm:pr-12 py-3 text-sm rounded-[100px]',
  }

  // Variant color definitions (adapted for day & night mode)
  const variantClasses = {
    default:
      'border-slate-400/60 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 hover:text-white',
    accent:
      'border-indigo-500/60 dark:border-indigo-500/80 text-indigo-700 dark:text-indigo-300 hover:text-white',
    subtle:
      'border-slate-300/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-white',
  }

  const circleBg = {
    default: 'bg-slate-900 dark:bg-indigo-600',
    accent: 'bg-indigo-600 dark:bg-indigo-500',
    subtle: 'bg-slate-800 dark:bg-slate-700',
  }

  const baseButtonClasses = cn(
    'group relative inline-flex items-center justify-center gap-1 overflow-hidden border-[1.5px] bg-transparent font-semibold cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:rounded-[12px] active:scale-[0.95]',
    sizeClasses[size],
    variantClasses[variant],
    className
  )

  const innerContent = (
    <>
      {/* Left Icon (arr-2) */}
      <Icon
        className="absolute w-3.5 h-3.5 left-[-25%] stroke-current fill-none z-[9] group-hover:left-3 transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      />

      {/* Text label */}
      <span className="relative z-[1] -translate-x-2 group-hover:translate-x-2 transition-all duration-[800ms] ease-out flex items-center gap-1.5 whitespace-nowrap">
        {content}
      </span>

      {/* Fluid expansion bubble */}
      <span
        className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-[50%] opacity-0 group-hover:w-[320px] group-hover:h-[320px] group-hover:opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] pointer-events-none',
          circleBg[variant]
        )}
      />

      {/* Right Icon (arr-1) */}
      <Icon
        className="absolute w-3.5 h-3.5 right-3 stroke-current fill-none z-[9] group-hover:right-[-25%] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      />
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={baseButtonClasses}
      >
        {innerContent}
      </a>
    )
  }

  return (
    <button className={baseButtonClasses} {...props}>
      {innerContent}
    </button>
  )
}

