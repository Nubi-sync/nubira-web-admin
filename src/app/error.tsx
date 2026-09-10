'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { AlertOctagon, RotateCcw, LayoutGrid, Home } from 'lucide-react'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log exception for telemetry
    console.error('Unhandled Floor Application Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-slate-900 flex flex-col justify-between selection:bg-[#3A3564] selection:text-white font-sans">
      {/* Header */}
      <header className="px-6 py-4 sm:px-10 flex items-center justify-between border-b border-black/10 bg-white/70 backdrop-blur-md">
        <div className="inline-flex items-center gap-2">
          <img 
            src="/z i g z a (2).png" 
            alt="Zigza" 
            className="h-7 w-auto object-contain rounded-md"
          />
        </div>
        <Link
          href="/modules"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors"
        >
          <LayoutGrid className="w-4 h-4 text-[#3A3564]" />
          <span>Workspace Hub</span>
        </Link>
      </header>

      {/* Main Error Canvas */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-md sm:max-w-lg w-full bg-white border border-black/15 rounded-3xl p-8 sm:p-10 shadow-xs text-center space-y-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FEE2E2] border border-[#FCA5A5] text-[11px] font-mono font-bold uppercase tracking-wider text-[#991B1B]">
            <AlertOctagon className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>Floor Checkpoint Exception</span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Something Interrupted This View
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              A temporary network glitch or server timeout prevented this page from rendering factory data.
            </p>
          </div>

          {/* Error Digest (if available) */}
          {error.digest && (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left font-mono text-[11px] text-slate-500 flex items-center justify-between">
              <span className="text-slate-400">Error Ref:</span>
              <span className="font-bold text-slate-700 select-all">{error.digest}</span>
            </div>
          )}

          {/* Recovery Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-sm font-bold transition-all shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry / Re-render View</span>
            </button>
            <Link
              href="/modules"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FAF7F0] hover:bg-slate-100 border border-black/15 text-slate-800 rounded-xl text-sm font-bold transition-all cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4 text-slate-600" />
              <span>Workspace Hub</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center border-t border-black/10 bg-white/40 text-xs text-slate-500">
        <span>Zigza Operations Engine • Precision Floor Tracking</span>
      </footer>
    </div>
  )
}
