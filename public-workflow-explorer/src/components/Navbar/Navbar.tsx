/**
 * DPDP AI Automation Workflow Explorer
 * © 2026 Pranjal (Pranjal240). All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react'
import {
  Cpu,
  Bot,
  Download,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Info,
  Menu,
  Workflow
} from 'lucide-react'
import { FlowButton } from '../ui/FlowButton'

// Minimalist GitHub SVG Icon
const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
)

interface NavbarProps {
  onOpenOverview: () => void
  onOpenTechStack: () => void
  onOpenAgentExplorer: () => void
  onToggleSidebar?: () => void
  isSidebarOpen?: boolean
  isFullscreen: boolean
  onToggleFullscreen: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  onDownloadWorkflow: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenOverview,
  onOpenTechStack,
  onOpenAgentExplorer,
  onToggleSidebar,
  isFullscreen,
  onToggleFullscreen,
  theme,
  onToggleTheme,
  onDownloadWorkflow,
}) => {
  return (
    <header className="h-14 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 flex items-center justify-between select-none z-50 backdrop-blur-md sticky top-0 transition-colors">
      {/* Left Branding & Mobile Trigger */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition md:hidden"
          title="Toggle Navigation Index"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Clean Engineering Node Glyph (No generic shield) */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-mono font-bold text-xs shadow-sm">
            <Workflow className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">
                DPDP Automation
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-semibold">
                Explorer
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Interactive n8n Architecture Viewer
            </p>
          </div>
        </div>
      </div>

      {/* Center Nav Links with FlowButton styling */}
      <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950/70 p-1 rounded-full border border-slate-200 dark:border-slate-800">
        <FlowButton
          size="sm"
          variant="subtle"
          onClick={onOpenOverview}
          className="border-transparent hover:border-transparent text-slate-700 dark:text-slate-200 !py-1 !px-4"
        >
          <Info className="w-3.5 h-3.5 mr-1 text-indigo-600 dark:text-indigo-400" />
          <span>Overview</span>
        </FlowButton>

        <FlowButton
          size="sm"
          variant="accent"
          onClick={onOpenAgentExplorer}
          className="border-transparent hover:border-transparent !py-1 !px-4"
        >
          <Bot className="w-3.5 h-3.5 mr-1 text-cyan-600 dark:text-cyan-400" />
          <span>A0–A8 Agents</span>
        </FlowButton>

        <FlowButton
          size="sm"
          variant="subtle"
          onClick={onOpenTechStack}
          className="border-transparent hover:border-transparent text-slate-700 dark:text-slate-200 !py-1 !px-4"
        >
          <Cpu className="w-3.5 h-3.5 mr-1 text-amber-600 dark:text-amber-400" />
          <span>Tech Stack</span>
        </FlowButton>
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Interactive View-Only Notice Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Interactive View-Only Demo</span>
        </div>

        {/* Download Sanitized JSON FlowButton */}
        <FlowButton
          size="sm"
          variant="subtle"
          onClick={onDownloadWorkflow}
          className="hidden md:inline-flex"
        >
          <Download className="w-3.5 h-3.5 mr-1 text-indigo-600 dark:text-indigo-400" />
          <span>Export JSON</span>
        </FlowButton>

        {/* Direct GitHub Repository FlowButton */}
        <FlowButton
          size="sm"
          variant="accent"
          href="https://github.com/Pranjal240/Digital-Personal-Data-Processing-Automation-"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-flex"
        >
          <GithubIcon className="w-3.5 h-3.5 mr-1" />
          <span>GitHub</span>
        </FlowButton>

        <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Day / Night Theme Switcher Pill */}
        <button
          onClick={onToggleTheme}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all shadow-xs cursor-pointer ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
              : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
          }`}
          title={`Currently ${theme === 'dark' ? 'Night (Dark)' : 'Day (Light)'} Mode. Click to toggle.`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Night</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Day</span>
            </>
          )}
        </button>
      </div>
    </header>
  )
}
