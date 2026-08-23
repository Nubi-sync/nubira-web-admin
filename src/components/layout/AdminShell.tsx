'use client'

import { AdminSidebar } from './AdminSidebar'

export function AdminShell({ 
  children, 
  userEmail 
}: { 
  children: React.ReactNode
  userEmail?: string 
}) {
  return (
    <div className="min-h-screen w-full flex bg-[var(--bg,#EEF1F5)] text-[var(--ink,#1C2733)] font-[family-name:var(--font-public-sans)]">
      {/* Persistent Left Sidebar */}
      <AdminSidebar userEmail={userEmail} />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
