'use client'

import React, { useState, useEffect } from 'react'

export function LiveDateTimeHeader({ className = '' }: { className?: string }) {
  const [formatted, setFormatted] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      // e.g. "Tue, 10 Nov • 12:48 PM"
      const dayName = now.toLocaleDateString('en-US', { weekday: 'short' })
      const dayNum = now.getDate()
      const month = now.toLocaleDateString('en-US', { month: 'short' })
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
      const nextStr = `${dayName}, ${dayNum} ${month} • ${timeStr}`
      setFormatted((prev) => (prev !== nextStr ? nextStr : prev))
    }

    updateTime()
    // Timer checks every 15s to catch the minute transition accurately
    const interval = setInterval(updateTime, 15000)
    return () => clearInterval(interval)
  }, [])

  if (!formatted) {
    return (
      <span className={`inline-flex items-center text-xs font-semibold text-slate-700 tracking-tight ${className}`}>
        &nbsp;
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center text-xs font-bold text-[#0B1220] tracking-tight font-[family-name:var(--font-public-sans)] ${className}`}>
      {formatted}
    </span>
  )
}
