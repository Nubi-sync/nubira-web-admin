import React from 'react'

/**
 * 1. Big Smartphone with "ZIGZA" and Commendable Verified Tick
 * No background box, no outer outline — floats seamlessly directly on the page.
 * Stroke is ~2.2px, slightly bolder than the India map outline (~1.5px).
 */
export function PhoneZigzaVerifiedIcon({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <svg viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Zigza Mobile Companion">
      {/* Smartphone Body */}
      <rect 
        x="18" 
        y="16" 
        width="62" 
        height="88" 
        rx="14" 
        fill="#FFFFFF" 
        stroke="#18181B" 
        strokeWidth="2.2" 
      />
      
      {/* Speaker Bar & Camera */}
      <line x1="42" y1="21" x2="56" y2="21" stroke="#18181B" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="36" cy="21" r="1.2" fill="#18181B" />

      {/* Screen Area */}
      <rect 
        x="23" 
        y="26" 
        width="52" 
        height="68" 
        rx="8" 
        fill="#FAF7F0" 
        stroke="#18181B" 
        strokeWidth="1.6" 
      />

      {/* App Header: ZIGZA */}
      <text 
        x="49" 
        y="43" 
        textAnchor="middle" 
        fill="#3A3564" 
        fontSize="11.5" 
        fontWeight="900" 
        fontFamily="ui-monospace, monospace"
        letterSpacing="0.08em"
      >
        ZIGZA
      </text>

      {/* Floor Status UI inside screen */}
      {/* Card 1 */}
      <rect x="28" y="49" width="42" height="12" rx="3.5" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.2" />
      <circle cx="34" cy="55" r="2.2" fill="#10B981" />
      <line x1="40" y1="55" x2="62" y2="55" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />

      {/* Card 2 */}
      <rect x="28" y="64" width="42" height="12" rx="3.5" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.2" />
      <circle cx="34" cy="70" r="2.2" fill="#3A3564" />
      <line x1="40" y1="70" x2="58" y2="70" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />

      {/* Screen Bottom Progress Bar */}
      <rect x="28" y="80" width="42" height="5" rx="2" fill="#FFFFFF" stroke="#18181B" strokeWidth="1" />
      <rect x="28" y="80" width="28" height="5" rx="2" fill="#10B981" />

      {/* Home Swipe Indicator */}
      <line x1="40" y1="99" x2="58" y2="99" stroke="#18181B" strokeWidth="2.2" strokeLinecap="round" />

      {/* COMMENDABLE VERIFIED TICK BADGE (Top-Right Corner) */}
      {/* Radiating Commendation Sparkles / Rays */}
      <line x1="82" y1="5" x2="82" y2="1" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
      <line x1="94" y1="9" x2="98" y2="6" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
      <line x1="99" y1="21" x2="104" y2="21" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
      <line x1="95" y1="33" x2="99" y2="36" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />

      {/* Circle Badge with Tick */}
      <circle cx="82" cy="20" r="14" fill="#18181B" />
      <circle cx="82" cy="20" r="12" fill="#10B981" />
      {/* Crisp White Checkmark */}
      <path 
        d="M76 20 L80.5 24.5 L89 15.5" 
        stroke="#FFFFFF" 
        strokeWidth="3.2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  )
}

/**
 * 2. Woman Working on a Sewing Machine
 * Cute cartoon operator/tailor seated at industrial sewing machine.
 * No background box, no outer outline.
 * Stroke is ~2.2px, slightly bolder than the map outline (~1.5px).
 */
export function WomanSewingMachineIcon({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Woman Stitching on Sewing Machine">
      {/* Sewing Table */}
      <rect x="8" y="66" width="80" height="6" rx="2" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.2" />
      {/* Table Legs */}
      <line x1="18" y1="72" x2="18" y2="94" stroke="#18181B" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="80" y1="72" x2="80" y2="94" stroke="#18181B" strokeWidth="2.2" strokeLinecap="round" />
      {/* Table Foot Pedal / Crossbar */}
      <line x1="18" y1="88" x2="80" y2="88" stroke="#18181B" strokeWidth="1.8" />
      <rect x="36" y="85" width="16" height="5" rx="1.5" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.8" />

      {/* SEWING MACHINE ON TABLE */}
      {/* Machine Base */}
      <rect x="18" y="60" width="46" height="6" rx="1.5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.2" />
      
      {/* Machine Arm & Head */}
      <path 
        d="M58 60 V38 C58 33 54 30 48 30 H26 C20 30 17 34 17 40 V46 H27 V40 H48 V60" 
        fill="#FFFFFF" 
        stroke="#18181B" 
        strokeWidth="2.2" 
        strokeLinejoin="round" 
      />

      {/* Handwheel */}
      <rect x="59" y="38" width="4" height="15" rx="1.5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />

      {/* Needle Bar & Presser Foot */}
      <line x1="22" y1="46" x2="22" y2="58" stroke="#18181B" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="22" y1="58" x2="22" y2="61" stroke="#18181B" strokeWidth="1.6" />
      <path d="M20 58 H24" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />

      {/* Thread Spool on Top */}
      <line x1="50" y1="20" x2="50" y2="30" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
      <rect x="46" y="22" width="8" height="9" rx="1.5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />
      <line x1="46" y1="25" x2="54" y2="25" stroke="#18181B" strokeWidth="1" />
      <line x1="46" y1="28" x2="54" y2="28" stroke="#18181B" strokeWidth="1" />

      {/* Playful Thread Swooping Down to Needle */}
      <path 
        d="M50 22 C 40 14, 28 20, 26 30 L 22 46" 
        stroke="#3A3564" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeDasharray="2.5 2.5" 
      />

      {/* Fabric Swatch under Needle */}
      <path d="M12 61 H36 L34 66 H10 Z" fill="#FAF7F0" stroke="#18181B" strokeWidth="1.8" />
      {/* Stitch Line */}
      <line x1="14" y1="63.5" x2="32" y2="63.5" stroke="#3A3564" strokeWidth="1.6" strokeDasharray="2 2" strokeLinecap="round" />

      {/* WOMAN WORKING / OPERATOR SEATED ON RIGHT */}
      {/* Hair Bun */}
      <circle cx="86" cy="18" r="5" fill="#18181B" />
      <circle cx="86" cy="18" r="3.5" fill="#3A3564" />
      
      {/* Head */}
      <circle cx="75" cy="24" r="10" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.2" />
      {/* Hair front sweep */}
      <path d="M68 20 C 72 15, 82 17, 83 23" stroke="#18181B" strokeWidth="2.2" fill="#18181B" />
      
      {/* Smiling Eye & Happy Smile */}
      <path d="M69 25 Q 71 23 73 25" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M70 29 Q 73 31 76 29" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />

      {/* Body / Torso leaning forward slightly */}
      <path 
        d="M69 34 L62 58 H84 L79 34 Z" 
        fill="#FFFFFF" 
        stroke="#18181B" 
        strokeWidth="2.2" 
        strokeLinejoin="round" 
      />
      {/* Apron Straps */}
      <line x1="71" y1="34" x2="68" y2="44" stroke="#18181B" strokeWidth="1.5" />
      <line x1="77" y1="34" x2="78" y2="44" stroke="#18181B" strokeWidth="1.5" />
      <line x1="66" y1="44" x2="80" y2="44" stroke="#18181B" strokeWidth="1.5" />

      {/* Arms guiding the fabric under needle */}
      <path 
        d="M69 40 Q 52 48 38 58" 
        stroke="#18181B" 
        strokeWidth="2.4" 
        strokeLinecap="round" 
      />
      <path 
        d="M75 42 Q 58 50 44 60" 
        stroke="#18181B" 
        strokeWidth="2.4" 
        strokeLinecap="round" 
      />

      {/* Stool / Seat */}
      <rect x="74" y="68" width="16" height="4" rx="1.5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.2" />
      <line x1="82" y1="72" x2="82" y2="94" stroke="#18181B" strokeWidth="2.2" strokeLinecap="round" />

      {/* Cute Stitch Sparkle */}
      <path d="M12 36 L14 38 L12 40 L10 38 Z" fill="#3A3564" />
      <circle cx="8" cy="46" r="1.5" fill="#3A3564" />
    </svg>
  )
}

/**
 * 3. Guy Carrying Parcels / Cartons
 * Cute cartoon dispatch worker walking with stacked parcels.
 * No background box, no outer outline.
 * Stroke is ~2.2px, slightly bolder than the map outline (~1.5px).
 */
export function GuyCarryingParcelIcon({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Guy Carrying Parcels">
      {/* MOTION / WALKING DASH LINES */}
      <line x1="76" y1="80" x2="86" y2="80" stroke="#18181B" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
      <line x1="80" y1="87" x2="92" y2="87" stroke="#18181B" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3" />

      {/* GUY / WORKER */}
      {/* Head */}
      <circle cx="62" cy="22" r="9" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.2" />
      
      {/* Cap / Visor pointing left */}
      <path d="M53 18 H69 C70 18 71 19 71 21 H47 C47 18 50 18 53 18 Z" fill="#3A3564" stroke="#18181B" strokeWidth="1.8" />
      <path d="M47 21 H41" stroke="#18181B" strokeWidth="2.2" strokeLinecap="round" />

      {/* Smiling Eye & Happy Smile */}
      <path d="M56 22 Q 58 20 60 22" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M55 26 Q 58 28 61 26" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />

      {/* Body / Torso leaning back slightly to balance load */}
      <path 
        d="M58 31 L64 35 L58 60 H50 L48 35 Z" 
        fill="#FFFFFF" 
        stroke="#18181B" 
        strokeWidth="2.2" 
        strokeLinejoin="round" 
      />

      {/* Walking Legs */}
      {/* Back leg */}
      <path d="M56 60 L68 76 L74 88" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Back shoe */}
      <path d="M72 88 H82 C82 91 80 91 76 91 H72 Z" fill="#18181B" />

      {/* Front walking leg */}
      <path d="M52 60 L44 74 L38 88" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Front shoe */}
      <path d="M34 88 H44 C44 91 42 91 38 91 H34 Z" fill="#18181B" />

      {/* PARCEL BOXES STACKED IN FRONT */}
      {/* Bottom Large Carton Box */}
      <rect 
        x="16" 
        y="45" 
        width="34" 
        height="22" 
        rx="2.5" 
        fill="#FAF7F0" 
        stroke="#18181B" 
        strokeWidth="2.2" 
      />
      {/* Center Packing Tape */}
      <line x1="33" y1="45" x2="33" y2="67" stroke="#18181B" strokeWidth="1.8" strokeDasharray="3 2" />
      {/* Box Label / Barcode */}
      <rect x="20" y="50" width="8" height="5" rx="1" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.2" />
      <line x1="22" y1="52.5" x2="26" y2="52.5" stroke="#18181B" strokeWidth="1" />

      {/* Top Smaller Parcel Box */}
      <rect 
        x="20" 
        y="25" 
        width="26" 
        height="20" 
        rx="2.5" 
        fill="#FFFFFF" 
        stroke="#18181B" 
        strokeWidth="2.2" 
      />
      {/* Center Tape */}
      <line x1="33" y1="25" x2="33" y2="45" stroke="#18181B" strokeWidth="1.8" strokeDasharray="3 2" />
      {/* Upward Arrows Stamp */}
      <path d="M26 33 L28 31 L30 33" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="28" y1="31" x2="28" y2="38" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" />

      {/* Guy's Arms Wrapping Under & Holding the Boxes */}
      <path 
        d="M60 36 C 52 42, 42 56, 32 64 H24" 
        stroke="#18181B" 
        strokeWidth="2.4" 
        strokeLinecap="round" 
        fill="none" 
      />
      {/* Hand gripping corner */}
      <circle cx="22" cy="63" r="2.5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />
    </svg>
  )
}
