'use client'

import React from 'react'

export default function RootLoading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F8FAFC] text-[#0B1220] font-[family-name:var(--font-public-sans)] p-4 select-none relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#1D4ED8]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#14C8B4]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
        {/* Animated Brand Emblem Container */}
        <div className="relative mb-6">
          {/* Subtle Outer Glow */}
          <div className="absolute -inset-2.5 rounded-3xl bg-gradient-to-tr from-[#1D4ED8]/20 via-[#14C8B4]/20 to-transparent blur-md animate-pulse" />

          {/* Center Card */}
          <div className="relative w-16 h-16 rounded-2xl bg-[#0B1220] border border-white/10 flex items-center justify-center shadow-xl shadow-[#0B1220]/25">
            {/* Outer Spinning Mint Ring */}
            <div className="absolute inset-1 rounded-xl border-2 border-[#14C8B4]/25 border-t-[#14C8B4] animate-spin" />
            
            {/* Inner Counter-Spinning Royal Blue Ring */}
            <div className="absolute inset-2.5 rounded-lg border-2 border-[#1D4ED8]/35 border-b-[#1D4ED8] animate-[spin_1.5s_linear_infinite_reverse]" />

            {/* Glowing Mint Center Core */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#14C8B4] shadow-[0_0_12px_#14C8B4] animate-pulse" />
          </div>
        </div>

        {/* Brand Header & Dynamic Status */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0FDFA] border border-[#14C8B4]/30 text-[11px] font-bold text-[#0B1220] tracking-wider uppercase shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14C8B4] animate-ping" />
            Zigza Intelligence
          </div>
          <h2 className="text-base font-extrabold text-[#0B1220] tracking-tight">
            Synchronizing Workspace
          </h2>
          <p className="text-xs text-slate-500 font-medium max-w-xs">
            Connecting real-time floor intelligence & telemetry...
          </p>
        </div>

        {/* Sleek Shimmering Progress Bar */}
        <div className="w-52 h-1.5 bg-slate-200/90 rounded-full overflow-hidden shadow-inner relative">
          <div className="h-full w-full bg-gradient-to-r from-[#1D4ED8] via-[#14C8B4] to-[#1D4ED8] animate-shimmer rounded-full" />
        </div>
      </div>
    </div>
  )
}
