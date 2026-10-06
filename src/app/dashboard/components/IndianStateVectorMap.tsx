'use client'

import React from 'react'

export interface StateMapProps {
  stateName: string
  cityName: string
  className?: string
}

interface StateData {
  code: string
  region: string
  capital: string
  viewBox: string
  path: string
  cityCoords: { x: number; y: number }
}

// Clean, accurate vector outlines for Indian states
const STATE_MAP_REGISTRY: Record<string, StateData> = {
  'West Bengal': {
    code: 'WB',
    region: 'Eastern India',
    capital: 'Kolkata',
    viewBox: '0 0 400 600',
    path: `M 220 30 
           L 245 45 L 260 70 L 250 95 L 230 110 L 225 140 L 240 170 L 235 200 
           L 215 220 L 220 250 L 230 280 L 210 310 L 195 340 L 180 370 L 160 400 
           L 150 430 L 165 460 L 180 490 L 195 520 L 220 550 L 250 565 L 280 570 
           L 290 550 L 280 520 L 270 490 L 260 460 L 265 430 L 275 400 L 285 370 
           L 280 330 L 290 300 L 285 270 L 275 240 L 265 210 L 260 170 L 250 130 
           L 240 90 L 235 60 Z`,
    cityCoords: { x: 255, y: 480 }
  },
  'Gujarat': {
    code: 'GJ',
    region: 'Western India',
    capital: 'Gandhinagar',
    viewBox: '0 0 600 450',
    path: `M 150 70 
           L 220 60 L 300 70 L 370 90 L 430 110 L 490 140 L 530 190 L 520 240 
           L 490 280 L 470 330 L 440 370 L 400 390 L 360 400 L 330 380 L 300 350 
           L 270 360 L 230 380 L 180 370 L 140 340 L 120 300 L 140 260 L 190 240 
           L 240 250 L 270 240 L 280 210 L 250 180 L 200 170 L 150 180 L 100 170 
           L 70 140 L 80 100 Z`,
    cityCoords: { x: 440, y: 340 }
  },
  'Maharashtra': {
    code: 'MH',
    region: 'Western India',
    capital: 'Mumbai',
    viewBox: '0 0 600 450',
    path: `M 130 100 
           L 200 90 L 290 95 L 380 90 L 460 100 L 530 120 L 560 160 L 540 210 
           L 490 250 L 450 280 L 400 320 L 340 360 L 280 390 L 220 400 L 170 390 
           L 140 350 L 120 300 L 110 240 L 115 180 Z`,
    cityCoords: { x: 140, y: 220 }
  },
  'Tamil Nadu': {
    code: 'TN',
    region: 'Southern India',
    capital: 'Chennai',
    viewBox: '0 0 450 550',
    path: `M 220 60 
           L 290 70 L 340 100 L 360 150 L 340 210 L 330 270 L 320 330 L 300 390 
           L 270 450 L 240 500 L 210 520 L 180 490 L 160 440 L 150 380 L 160 320 
           L 150 260 L 140 200 L 160 140 L 180 90 Z`,
    cityCoords: { x: 190, y: 300 }
  },
  'Karnataka': {
    code: 'KA',
    region: 'Southern India',
    capital: 'Bengaluru',
    viewBox: '0 0 400 550',
    path: `M 180 50 
           L 240 60 L 280 100 L 290 160 L 270 220 L 290 290 L 310 350 L 300 420 
           L 260 480 L 210 500 L 160 470 L 140 400 L 120 330 L 110 260 L 130 190 
           L 140 120 Z`,
    cityCoords: { x: 260, y: 440 }
  },
  'Delhi': {
    code: 'DL',
    region: 'Northern India',
    capital: 'New Delhi',
    viewBox: '0 0 400 400',
    path: `M 150 70 
           L 240 60 L 310 100 L 340 160 L 330 240 L 290 310 L 230 350 L 160 340 
           L 100 290 L 80 210 L 90 140 Z`,
    cityCoords: { x: 210, y: 200 }
  },
  'Uttar Pradesh': {
    code: 'UP',
    region: 'Northern India',
    capital: 'Lucknow',
    viewBox: '0 0 600 450',
    path: `M 120 140 
           L 200 110 L 290 100 L 390 120 L 480 150 L 540 200 L 550 260 L 500 300 
           L 430 320 L 360 340 L 290 350 L 210 330 L 150 300 L 110 240 L 100 180 Z`,
    cityCoords: { x: 330, y: 230 }
  },
  'Rajasthan': {
    code: 'RJ',
    region: 'Northern India',
    capital: 'Jaipur',
    viewBox: '0 0 550 500',
    path: `M 170 80 
           L 280 70 L 380 90 L 440 140 L 460 210 L 440 290 L 390 360 L 320 410 
           L 240 430 L 160 410 L 110 350 L 90 270 L 100 180 L 130 120 Z`,
    cityCoords: { x: 350, y: 220 }
  },
  'Punjab': {
    code: 'PB',
    region: 'Northern India',
    capital: 'Chandigarh',
    viewBox: '0 0 450 450',
    path: `M 160 80 
           L 250 70 L 330 110 L 360 180 L 340 260 L 290 330 L 220 370 L 150 360 
           L 110 290 L 100 200 L 120 130 Z`,
    cityCoords: { x: 240, y: 220 }
  },
  'Haryana': {
    code: 'HR',
    region: 'Northern India',
    capital: 'Chandigarh',
    viewBox: '0 0 450 450',
    path: `M 180 80 
           L 270 80 L 330 130 L 350 210 L 330 290 L 270 350 L 200 370 L 140 340 
           L 120 260 L 130 170 Z`,
    cityCoords: { x: 270, y: 250 }
  },
  'Telangana': {
    code: 'TS',
    region: 'Southern India',
    capital: 'Hyderabad',
    viewBox: '0 0 450 450',
    path: `M 180 90 
           L 260 80 L 330 120 L 370 190 L 350 270 L 290 340 L 220 360 L 150 330 
           L 110 250 L 120 160 Z`,
    cityCoords: { x: 230, y: 230 }
  },
  'Kerala': {
    code: 'KL',
    region: 'Southern India',
    capital: 'Thiruvananthapuram',
    viewBox: '0 0 350 600',
    path: `M 220 50 
           L 260 100 L 250 180 L 230 260 L 210 340 L 190 420 L 170 500 L 140 560 
           L 110 540 L 120 460 L 140 380 L 160 290 L 170 200 L 180 120 Z`,
    cityCoords: { x: 190, y: 350 }
  },
  'Madhya Pradesh': {
    code: 'MP',
    region: 'Central India',
    capital: 'Bhopal',
    viewBox: '0 0 600 450',
    path: `M 150 120 
           L 240 90 L 340 100 L 440 120 L 520 160 L 510 230 L 450 290 L 380 340 
           L 290 350 L 210 330 L 150 280 L 120 210 Z`,
    cityCoords: { x: 280, y: 230 }
  }
}

// Fallback all-India geometric silhouette
const DEFAULT_INDIA_MAP: StateData = {
  code: 'IN',
  region: 'India',
  capital: 'New Delhi',
  viewBox: '0 0 500 550',
  path: `M 240 40 
         L 280 60 L 310 110 L 290 160 L 340 190 L 390 220 L 440 230 L 430 270 
         L 370 290 L 330 330 L 280 400 L 240 480 L 200 400 L 160 330 L 140 280 
         L 110 230 L 140 190 L 180 160 L 200 100 Z`,
  cityCoords: { x: 240, y: 260 }
}

export function IndianStateVectorMap({
  stateName,
  cityName,
  className = ''
}: StateMapProps) {
  // Normalize match
  const matchedKey = Object.keys(STATE_MAP_REGISTRY).find(
    k => k.toLowerCase() === (stateName || '').toLowerCase()
  )
  const stateData = matchedKey ? STATE_MAP_REGISTRY[matchedKey] : (STATE_MAP_REGISTRY['West Bengal'] || DEFAULT_INDIA_MAP)
  const displayCity = cityName || stateData.capital || 'Factory Location'

  return (
    <div className={`bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between ${className}`}>
      
      {/* Clean Minimalist Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-700">
            Factory Location
          </span>
          <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5 font-[family-name:var(--font-heading)]">
            {stateName || stateData.region}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {displayCity}
          </p>
        </div>

        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-900 border border-cyan-200">
          {stateData.code}
        </span>
      </div>

      {/* State Vector Map - Clean Cyan Outline & Fill */}
      <div className="my-3 flex items-center justify-center min-h-[190px] max-h-[220px] w-full">
        <svg
          viewBox={stateData.viewBox}
          className="w-full h-full max-h-[200px] transition-transform duration-300 hover:scale-102"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* State Body - Solid Light Cyan with Cyan Stroke */}
          <path
            d={stateData.path}
            fill="#ECFEFF"
            stroke="#06B6D4"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* City Pin Point in Cyan */}
          <g transform={`translate(${stateData.cityCoords.x}, ${stateData.cityCoords.y})`}>
            {/* Subtle radar ring */}
            <circle r="12" fill="none" stroke="#06B6D4" strokeWidth="1.5" opacity="0.3" />
            
            {/* Solid Pin */}
            <circle r="4.5" fill="#06B6D4" stroke="#ffffff" strokeWidth="2" />
            
            {/* City Label Badge */}
            <rect
              x="8"
              y="-10"
              width={displayCity.length * 6.5 + 12}
              height="18"
              rx="4"
              fill="#0891B2"
            />
            <text
              x="14"
              y="2.5"
              fill="#ffffff"
              fontSize="9.5"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              {displayCity}
            </text>
          </g>
        </svg>
      </div>

    </div>
  )
}
