'use client'

import React, { useState, useEffect } from 'react'

function getFormattedDateTime(): string {
  if (typeof window === 'undefined') return ''
  const now = new Date()
  const dayName = now.toLocaleDateString('en-US', { weekday: 'short' })
  const dayNum = now.getDate()
  const month = now.toLocaleDateString('en-US', { month: 'short' })
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  return `${dayName}, ${dayNum} ${month}  •  ${timeStr}`
}

export function LiveDateTimeHeader({ className = '' }: { className?: string }) {
  const [text, setText] = useState<string>('')

  useEffect(() => {
    setText(getFormattedDateTime())

    // Check every second to catch the exact minute transition seamlessly
    const interval = setInterval(() => {
      const next = getFormattedDateTime()
      setText((prev) => (prev !== next ? next : prev))
    }, 1000)

    // Instantly sync when user switches tabs or unlocks screen
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setText(getFormattedDateTime())
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  if (!text) {
    return (
      <span className={`inline-flex items-center text-[14px] font-extrabold text-[#0B1220] tracking-tight opacity-0 ${className}`}>
        Tue, 10 Nov &bull; 1:30 PM
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center text-[14px] sm:text-[14.5px] font-extrabold text-[#0B1220] tracking-tight font-[family-name:var(--font-heading)] select-none whitespace-nowrap ${className}`}>
      {text}
    </span>
  )
}
