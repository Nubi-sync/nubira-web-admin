import React from 'react'

/**
 * Custom bespoke industrial icon for Central Store / Fabric Warehouse
 * Designed specifically for Zigza Enterprise MES
 */
export function CentralStoreBespokeIcon({ className = "w-5 h-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Precision Fabric Roll Cylinders & Spool Track */}
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v12c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
      <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
      {/* Inner spindle core notch */}
      <circle cx="12" cy="6" r="1.5" fill="currentColor" fillOpacity="0.2" />
      {/* Measurement tick marks */}
      <line x1="8" y1="13.5" x2="8" y2="16" />
      <line x1="12" y1="14" x2="12" y2="17" />
      <line x1="16" y1="13.5" x2="16" y2="16" />
    </svg>
  )
}

export function MaterialFlowBespokeIcon({ className = "w-5 h-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Interlocking division handshakes */}
      <path d="M3 8h12a3 3 0 0 1 3 3v8" />
      <path d="M15 5l3 3-3 3" />
      <path d="M21 16H9a3 3 0 0 1-3-3V5" />
      <path d="M9 19l-3-3 3-3" />
    </svg>
  )
}
