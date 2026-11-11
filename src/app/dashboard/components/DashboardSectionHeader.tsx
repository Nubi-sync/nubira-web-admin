'use client'

import React from 'react'

interface DashboardSectionHeaderProps {
  icon: React.ElementType
  title: string
  accent: string
  badge?: string
  action?: React.ReactNode
  withDivider?: boolean
}

export function DashboardSectionHeader({
  icon: Icon,
  title,
  accent,
  badge,
  action,
  withDivider = true,
}: DashboardSectionHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between gap-2.5 flex-wrap ${
        withDivider ? 'pb-3 border-b border-slate-100' : ''
      }`}
    >
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[#F0FDFA] border border-black/10 flex items-center justify-center text-[#0B1220] shrink-0">
          <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#0B1220]" />
        </div>
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <h2 className="text-[15px] sm:text-base font-extrabold text-[#0B1220] tracking-tight font-[family-name:var(--font-heading)] leading-snug">
            {title} <span className="text-[#1D4ED8]">{accent}</span>
          </h2>
          {badge && (
            <span className="text-[10px] font-bold uppercase tracking-wide tabular-nums px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/10 shrink-0">
              {badge}
            </span>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
