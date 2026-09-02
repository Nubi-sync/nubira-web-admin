'use client'

import { AdminSidebar } from './AdminSidebar'
import { TvModeProvider, useTvMode } from '@/context/TvModeContext'
import { TvTopBar } from './TvTopBar'

function AdminShellContent({ 
  children, 
  userEmail 
}: { 
  children: React.ReactNode
  userEmail?: string 
}) {
  const { isTvMode } = useTvMode()

  return (
    <div className={`min-h-screen w-full flex bg-[#FAFAF8] text-slate-900 font-[family-name:var(--font-public-sans)] ${isTvMode ? 'tv-mode-active' : ''}`}>
      {/* Persistent Left Sidebar - Hidden in TV Mode */}
      {!isTvMode && <AdminSidebar userEmail={userEmail} />}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen overflow-y-auto transition-all">
        {isTvMode && <TvTopBar />}
        <div className={`flex-1 ${isTvMode ? 'w-full max-w-none' : ''}`}>
          {children}
        </div>
      </main>
    </div>
  )
}

export function AdminShell({ 
  children, 
  userEmail 
}: { 
  children: React.ReactNode
  userEmail?: string 
}) {
  return (
    <TvModeProvider>
      <AdminShellContent userEmail={userEmail}>
        {children}
      </AdminShellContent>
    </TvModeProvider>
  )
}
