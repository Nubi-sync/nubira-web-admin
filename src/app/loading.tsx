'use client'

import React from 'react'

export default function RootLoading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] select-none">
      <div className="relative flex items-center justify-center">
        {/* Outer brand spinner ring */}
        <div className="w-11 h-11 rounded-full border-2 border-slate-200 border-t-[#1D4ED8] animate-spin" />
        {/* Inner brand counter-spinning ring */}
        <div className="absolute w-6 h-6 rounded-full border-2 border-slate-200 border-b-[#14C8B4] animate-[spin_1.2s_linear_infinite_reverse]" />
      </div>
    </div>
  )
}
