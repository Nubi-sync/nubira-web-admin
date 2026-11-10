'use client'

import React, { useState, useEffect } from 'react'

export function LiveDateTimeHeader({ className = '' }: { className?: string }) {
  const [data, setData] = useState<{ date: string; time: string } | null>(null)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      // e.g. "Tue, 10 Nov" and "1:00 PM"
      const dayName = now.toLocaleDateString('en-US', { weekday: 'short' })
      const dayNum = now.getDate()
      const month = now.toLocaleDateString('en-US', { month: 'short' })
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
      setData({
        date: `${dayName}, ${dayNum} ${month}`,
        time: timeStr
      })
    }

    updateTime()
    // Timer checks every 15s to catch the minute transition accurately
    const interval = setInterval(updateTime, 15000)
    return () => clearInterval(interval)
  }, [])

  if (!data) {
    return (
      <span className={`inline-flex items-center text-sm font-bold text-slate-700 tracking-tight ${className}`}>
        &nbsp;
      </span>
    )
  }

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 text-[14px] sm:text-[14.5px] font-extrabold text-[#0B1220] tracking-tight font-[family-name:var(--font-heading)] select-none whitespace-nowrap ${className}`}>
      <span>{data.date}</span>
      <span className="w-1 h-1 rounded-full bg-slate-400/80 shrink-0" />
      <span className="font-mono text-[13px] sm:text-[13.5px] font-bold text-slate-700">{data.time}</span>
    </div>
  )
}
