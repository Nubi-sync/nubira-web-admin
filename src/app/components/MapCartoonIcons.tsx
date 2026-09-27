import React from 'react'

/**
 * 1. Moving Cartoon Truck with Shipping Containers
 * Simple black outline cartoon vector icon on cream #FAF7F0 background
 */
export function MovingTruckIcon({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Moving Cargo Truck">
      {/* Cream background card matching #FAF7F0 */}
      <rect width="100" height="100" rx="22" fill="#FAF7F0" stroke="#18181B" strokeWidth="1.5" strokeDasharray="3 3" />
      
      {/* Motion Speed Lines behind truck */}
      <path d="M10 44 H18" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M6 52 H16" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 60 H20" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />

      {/* Cargo: Shipping Containers on Flatbed */}
      {/* Container 1 (Back) */}
      <rect x="22" y="34" width="28" height="26" rx="2" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
      <line x1="29" y1="38" x2="29" y2="56" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="36" y1="38" x2="36" y2="56" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="43" y1="38" x2="43" y2="56" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" />

      {/* Container 2 (Front) */}
      <rect x="50" y="34" width="22" height="26" rx="2" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
      <line x1="57" y1="38" x2="57" y2="56" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="64" y1="38" x2="64" y2="56" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" />

      {/* Truck Chassis / Base */}
      <rect x="20" y="58" width="68" height="8" rx="2" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" strokeLinejoin="round" />

      {/* Truck Cab */}
      <path d="M72 40 H80 L88 52 V66 H72 V40 Z" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Windshield */}
      <path d="M76 44 H79 L85 52 H76 V44 Z" fill="#FAF7F0" stroke="#18181B" strokeWidth="2" strokeLinejoin="round" />
      {/* Headlight */}
      <circle cx="87" cy="60" r="1.8" fill="#18181B" />
      {/* Bumper */}
      <rect x="88" y="62" width="4" height="4" rx="1" fill="#18181B" />

      {/* Wheels with rim */}
      <circle cx="34" cy="68" r="7" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
      <circle cx="34" cy="68" r="2.5" fill="#18181B" />

      <circle cx="48" cy="68" r="7" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
      <circle cx="48" cy="68" r="2.5" fill="#18181B" />

      <circle cx="78" cy="68" r="7" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
      <circle cx="78" cy="68" r="2.5" fill="#18181B" />

      {/* Road line dash */}
      <path d="M22 79 H88" stroke="#18181B" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 4" />
    </svg>
  )
}

/**
 * 2. Threading & Sewing Machine
 * Simple black outline cartoon vector icon on cream #FAF7F0 background
 */
export function SewingMachineIcon({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Sewing Machine with Thread">
      {/* Cream background card matching #FAF7F0 */}
      <rect width="100" height="100" rx="22" fill="#FAF7F0" stroke="#18181B" strokeWidth="1.5" strokeDasharray="3 3" />

      {/* Spool Pin & Thread Spool */}
      <line x1="68" y1="19" x2="68" y2="30" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
      <rect x="64" y="22" width="8" height="12" rx="1.5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />
      <line x1="64" y1="26" x2="72" y2="26" stroke="#18181B" strokeWidth="1" />
      <line x1="64" y1="30" x2="72" y2="30" stroke="#18181B" strokeWidth="1" />

      {/* Playful Thread swooping down to needle */}
      <path 
        d="M68 22 C 58 14, 44 18, 42 28 C 40 36, 36 34, 34 44 L 34 56" 
        stroke="#3A3564" 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        strokeDasharray="2.5 2.5"
      />

      {/* Sewing Machine Base Plate */}
      <rect x="18" y="66" width="64" height="7" rx="2" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" strokeLinejoin="round" />

      {/* Machine Arm / Head */}
      <path 
        d="M72 66 V42 C72 35 67 33 60 33 H36 C29 33 26 38 26 44 V49 H38 V42 H58 V66" 
        fill="#FFFFFF" 
        stroke="#18181B" 
        strokeWidth="2.5" 
        strokeLinejoin="round"
      />

      {/* Handwheel on Right */}
      <rect x="74" y="42" width="5" height="16" rx="2" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />

      {/* Needle Bar & Needle */}
      <line x1="32" y1="48" x2="32" y2="62" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="62" x2="32" y2="66" stroke="#18181B" strokeWidth="1.5" />
      {/* Presser foot */}
      <path d="M30 63 H35" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />

      {/* Fabric Swatch under needle */}
      <path d="M22 66 H48" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="64" x2="44" y2="64" stroke="#3A3564" strokeWidth="1.5" strokeDasharray="2 2" />

      {/* Cute Stitch Sparkle */}
      <path d="M22 35 L24 37 L22 39 L20 37 Z" fill="#3A3564" />
      <circle cx="81" cy="28" r="1.5" fill="#3A3564" />
    </svg>
  )
}

/**
 * 3. Smartphone with "ZIGZA" and Commendable Verified Tick outside corner
 * Simple black outline cartoon vector icon on cream #FAF7F0 background
 */
export function PhoneZigzaVerifiedIcon({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Smartphone with Zigza App and Verified Tick">
      {/* Cream background card matching #FAF7F0 */}
      <rect width="100" height="100" rx="22" fill="#FAF7F0" stroke="#18181B" strokeWidth="1.5" strokeDasharray="3 3" />

      {/* Smartphone Body */}
      <rect x="26" y="20" width="44" height="64" rx="8" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
      {/* Speaker Bar */}
      <line x1="42" y1="25" x2="54" y2="25" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
      
      {/* Inner Screen */}
      <rect x="30" y="30" width="36" height="46" rx="4" fill="#FAF7F0" stroke="#18181B" strokeWidth="1.5" />
      
      {/* Screen Header Logo / Text */}
      <text 
        x="48" 
        y="45" 
        textAnchor="middle" 
        fill="#3A3564" 
        fontSize="8.5" 
        fontWeight="900" 
        fontFamily="monospace"
        letterSpacing="0.08em"
      >
        ZIGZA
      </text>

      {/* Simple Floor Status UI inside Phone */}
      <line x1="35" y1="52" x2="61" y2="52" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="35" y1="57" x2="55" y2="57" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="35" y1="62" x2="58" y2="62" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Mini Green Live Indicator */}
      <circle cx="59" cy="69" r="2" fill="#10B981" />
      <line x1="35" y1="69" x2="54" y2="69" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" />

      {/* Bottom Home Line */}
      <line x1="43" y1="80" x2="53" y2="80" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />

      {/* OUTSIDE TOP-RIGHT CORNER: COMMENDABLE VERIFIED BADGE WITH TICK */}
      {/* Commendable burst lines / rays */}
      <line x1="72" y1="9" x2="72" y2="5" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
      <line x1="84" y1="12" x2="88" y2="9" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
      <line x1="87" y1="24" x2="92" y2="24" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />

      {/* Circle Badge with Tick */}
      <circle cx="72" cy="22" r="11" fill="#3A3564" stroke="#18181B" strokeWidth="2" />
      <circle cx="72" cy="22" r="9" fill="#10B981" />
      {/* Clean White Checkmark */}
      <path 
        d="M68 22 L71 25 L77 18" 
        stroke="#FFFFFF" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  )
}
