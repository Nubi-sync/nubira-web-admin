'use client';

import React from 'react';
import mapData from './indiaMapData.json';
import {
  Shirt,
  Scissors,
  Truck,
  Layers,
  FileSpreadsheet,
  ClipboardCheck
} from 'lucide-react';

interface IndiaSegmentedMapProps {
  className?: string;
}

// 6 Strategic Manufacturing Hub Nodes strictly placed inside mainland India
const NETWORK_NODES = [
  {
    id: 'ludhiana',
    title: 'Ready-Made Garments & Knits',
    dotX: 165,
    dotY: 165, // Punjab mainland
    iconOffsetX: -18,
    iconOffsetY: -44, // In Punjab / Himachal landmass
    icon: <Shirt className="w-8 h-8 sm:w-9 sm:h-9 text-[#0B1220]" strokeWidth={2} />,
  },
  {
    id: 'delhi',
    title: 'Buyer POs & Tech Packs',
    dotX: 215,
    dotY: 215, // Delhi NCR / Western UP (well south of Nepal)
    iconOffsetX: 14,
    iconOffsetY: -18, // Safely in Western UP
    icon: <FileSpreadsheet className="w-8 h-8 sm:w-9 sm:h-9 text-[#0B1220]" strokeWidth={2} />,
  },
  {
    id: 'surat',
    title: 'Fabric Inward & Textile Rolls',
    dotX: 115,
    dotY: 355, // Gujarat mainland (well away from coast and borders)
    iconOffsetX: -14,
    iconOffsetY: -44, // Inland towards North Gujarat / Rajasthan
    icon: <Layers className="w-8 h-8 sm:w-9 sm:h-9 text-[#0B1220]" strokeWidth={2} />,
  },
  {
    id: 'mumbai',
    title: 'Logistics & Dispatch Fleet',
    dotX: 165,
    dotY: 440, // Maharashtra mainland (inland between Mumbai & Pune)
    iconOffsetX: -44,
    iconOffsetY: -16, // Safely within Maharashtra landmass
    icon: <Truck className="w-8 h-8 sm:w-9 sm:h-9 text-[#0B1220]" strokeWidth={2} />,
  },
  {
    id: 'kolkata',
    title: 'Quality Assurance & Job-Work',
    dotX: 375,
    dotY: 330, // West Bengal / Bihar border (completely west of Bangladesh)
    iconOffsetX: -44,
    iconOffsetY: -16, // Safely inland in Jharkhand / Bihar
    icon: <ClipboardCheck className="w-8 h-8 sm:w-9 sm:h-9 text-[#0B1220]" strokeWidth={2} />,
  },
  {
    id: 'tiruppur',
    title: 'Cutting Table & Lay Matrix',
    dotX: 205,
    dotY: 575, // Southern plateau inside Karnataka / Tamil Nadu (well above the ocean)
    iconOffsetX: -44,
    iconOffsetY: -16, // Safely inside Karnataka / Tamil Nadu landmass
    icon: <Scissors className="w-8 h-8 sm:w-9 sm:h-9 text-[#0B1220]" strokeWidth={2} />,
  },
];

export default function IndiaSegmentedMap({ className = '' }: IndiaSegmentedMapProps) {
  return (
    <div className={`relative w-full select-none py-2 ${className}`}>
      {/* SVG Map Canvas with Network Mesh */}
      <div className="relative w-full aspect-[612/696] max-h-[600px] mx-auto overflow-visible">
        <svg
          viewBox={mapData.viewBox}
          className="w-full h-full overflow-visible select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft, clean cyan map silhouette fill */}
            <linearGradient id="solidIndiaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F0FDFA" />
              <stop offset="100%" stopColor="#E6FFFA" />
            </linearGradient>

            {/* Filter to create a crisp outer boundary outline for the entire map of India without internal lines */}
            <filter id="outerPerimeterOutline" x="-5%" y="-5%" width="110%" height="110%">
              <feMorphology in="SourceAlpha" operator="dilate" radius="1.6" result="dilated" />
              <feFlood floodColor="#0B1220" floodOpacity="1" result="outlineColor" />
              <feComposite in="outlineColor" in2="dilated" operator="in" result="outline" />
              <feMerge>
                <feMergeNode in="outline" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Glowing cyan node filter */}
            <filter id="darkCyanGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#0891B2" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* 1. Whole India Outline: ONLY outlined from the outside, NO internal state borders */}
          <g filter="url(#outerPerimeterOutline)">
            {mapData.locations.map((loc) => (
              <path
                key={`map-fill-${loc.id}`}
                d={loc.path}
                fill="url(#solidIndiaGradient)"
                stroke="none"
              />
            ))}
          </g>

          {/* 2. Dotted Dark Cyan Network Lines (#0891B2) - 100% strictly routed across mainland India */}
          <g className="opacity-90">
            {/* Punjab -> Delhi NCR (across Haryana) */}
            <line x1="165" y1="165" x2="215" y2="215" stroke="#0891B2" strokeWidth="2.2" strokeDasharray="4 4" />
            {/* Delhi NCR -> Bengal (across UP and Bihar) */}
            <line x1="215" y1="215" x2="375" y2="330" stroke="#0891B2" strokeWidth="2.2" strokeDasharray="4 4" />
            {/* Punjab -> Gujarat (across Rajasthan) */}
            <line x1="165" y1="165" x2="115" y2="355" stroke="#0891B2" strokeWidth="2.2" strokeDasharray="4 4" />
            {/* Gujarat -> Maharashtra (across mainland) */}
            <line x1="115" y1="355" x2="165" y2="440" stroke="#0891B2" strokeWidth="2.2" strokeDasharray="4 4" />
            {/* Maharashtra -> South India (across Karnataka) */}
            <line x1="165" y1="440" x2="205" y2="575" stroke="#0891B2" strokeWidth="2.2" strokeDasharray="4 4" />

            {/* North-South Spine: Delhi NCR -> South India (vertical spine through MP/Telangana) */}
            <line x1="215" y1="215" x2="205" y2="575" stroke="#0891B2" strokeWidth="2.2" strokeDasharray="4 4" />
            {/* East-West Highway: Gujarat -> Bengal (across Madhya Pradesh and Chhattisgarh) */}
            <line x1="115" y1="355" x2="375" y2="330" stroke="#0891B2" strokeWidth="2.2" strokeDasharray="4 4" />
            {/* Bengal -> Maharashtra (across Odisha / Chhattisgarh / MP) */}
            <line x1="375" y1="330" x2="165" y2="440" stroke="#0891B2" strokeWidth="2.2" strokeDasharray="4 4" />
          </g>

          {/* 3. Pulsing Node Dots & Anchored Custom Icons (100% Inside India) */}
          {NETWORK_NODES.map((node) => (
            <g key={`node-group-${node.id}`} transform={`translate(${node.dotX}, ${node.dotY})`}>
              {/* Pulsing Dark Cyan Node Dot */}
              <circle r="9" fill="#0891B2" opacity="0.3" className="animate-ping" />
              <circle r="5" fill="#0891B2" stroke="#FFFFFF" strokeWidth="1.5" filter="url(#darkCyanGlow)" />

              {/* Garment Icon Anchored Safely Inside Mainland */}
              <foreignObject
                x={node.iconOffsetX}
                y={node.iconOffsetY}
                width="40"
                height="40"
                className="overflow-visible pointer-events-none"
              >
                <div className="w-9 h-9 flex items-center justify-center select-none filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.16)]">
                  {node.icon}
                </div>
              </foreignObject>
            </g>
          ))}
        </svg>

        {/* 4. Central Floating Flat Zigza Logo (Positioned in Central Madhya Pradesh) */}
        <div className="absolute top-[49%] left-[39%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none select-none">
          <div className="flex flex-col items-center justify-center">
            <img
              src="/zigza_icon.png"
              alt="Zigza Core"
              className="w-14 sm:w-18 lg:w-20 h-auto object-contain"
            />
            <img
              src="/zigza new logo.png"
              alt="Zigza"
              className="h-4.5 sm:h-6 lg:h-7 w-auto object-contain mt-1.5"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
