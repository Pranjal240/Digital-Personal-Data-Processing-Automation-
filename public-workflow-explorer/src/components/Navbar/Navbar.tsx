import React from 'react'
import {
  Shield,
  Cpu,
  Bot,
  Download,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Info,
  Menu
} from 'lucide-react'

// GitHub SVG Icon
const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
)

interface NavbarProps {
  onOpenOverview: () => void
  onOpenTechStack: () => void
  onOpenAgentExplorer: () => void
  onToggleSidebar: () => void
  isSidebarOpen: boolean
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
    <header className="h-14 bg-slate-900/95 border-b border-slate-800 px-4 flex items-center justify-between select-none z-50 backdrop-blur-md sticky top-0">
      {/* Left branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition md:hidden"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-100 tracking-tight">
                DPDP AI Automation
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                v2.1
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Interactive n8n Multi-Agent Workflow Explorer
            </p>
          </div>
        </div>
      </div>

      {/* Center Nav Links */}
      <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
        <button
          onClick={onOpenOverview}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition flex items-center gap-1.5"
        >
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>Workflow Overview</span>
        </button>

        <button
          onClick={onOpenAgentExplorer}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition flex items-center gap-1.5"
        >
          <Bot className="w-3.5 h-3.5 text-cyan-400" />
          <span>A0–A8 Agents</span>
        </button>

        <button
          onClick={onOpenTechStack}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition flex items-center gap-1.5"
        >
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <span>Tech Stack</span>
        </button>
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Download Sanitized JSON */}
        <button
          onClick={onDownloadWorkflow}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-200 border border-slate-700/60 transition"
          title="Download Sanitized n8n Workflow JSON"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span>Export JSON</span>
        </button>

        {/* GitHub link */}
        <a
          href="https://github.com/Pranjal240/Digital-Personal-Data-Processing-Automation-"
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="View on GitHub"
        >
          <GithubIcon className="w-4 h-4" />
        </a>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Dark/Light mode toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>
      </div>
    </header>
  )
}
