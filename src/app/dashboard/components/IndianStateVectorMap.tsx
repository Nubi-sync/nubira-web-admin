'use client'

import React, { useEffect, useState } from 'react'

export interface StateMapProps {
  stateName: string
  cityName?: string
  latitude?: number
  longitude?: number
  isDetecting?: boolean
  className?: string
}

interface StateGeo {
  state: string
  slug: string
  width: number
  height: number
  bounds: { minLon: number; maxLon: number; minLat: number; maxLat: number }
  k: number
  scale: number
  pad: number
  districts: { name: string; d: string }[]
}

// Maps any common spelling of a state / UT name (incl. IP-geolocation region names)
// to the generated file slug in /public/geo/states.
const STATE_ALIASES: Record<string, string> = {
  'andaman and nicobar': 'andaman-and-nicobar-islands',
  'andaman and nicobar islands': 'andaman-and-nicobar-islands',
  'andhra pradesh': 'andhra-pradesh',
  'arunachal pradesh': 'arunachal-pradesh',
  'assam': 'assam',
  'bihar': 'bihar',
  'chandigarh': 'chandigarh',
  'chhattisgarh': 'chhattisgarh',
  'chattisgarh': 'chhattisgarh',
  'delhi': 'delhi',
  'new delhi': 'delhi',
  'nct of delhi': 'delhi',
  'national capital territory of delhi': 'delhi',
  'dadra and nagar haveli': 'dnh-and-dd',
  'daman and diu': 'dnh-and-dd',
  'dadra and nagar haveli and daman and diu': 'dnh-and-dd',
  'goa': 'goa',
  'gujarat': 'gujarat',
  'haryana': 'haryana',
  'himachal pradesh': 'himachal-pradesh',
  'jammu and kashmir': 'jammu-and-kashmir',
  'jharkhand': 'jharkhand',
  'karnataka': 'karnataka',
  'kerala': 'kerala',
  'ladakh': 'ladakh',
  'lakshadweep': 'lakshadweep',
  'madhya pradesh': 'madhya-pradesh',
  'maharashtra': 'maharashtra',
  'manipur': 'manipur',
  'meghalaya': 'meghalaya',
  'mizoram': 'mizoram',
  'nagaland': 'nagaland',
  'odisha': 'odisha',
  'orissa': 'odisha',
  'puducherry': 'puducherry',
  'pondicherry': 'puducherry',
  'punjab': 'punjab',
  'rajasthan': 'rajasthan',
  'sikkim': 'sikkim',
  'tamil nadu': 'tamil-nadu',
  'telangana': 'telangana',
  'tripura': 'tripura',
  'uttar pradesh': 'uttar-pradesh',
  'uttarakhand': 'uttarakhand',
  'uttaranchal': 'uttarakhand',
  'west bengal': 'west-bengal'
}

export function resolveStateSlug(name: string): string | null {
  const key = (name || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!key) return null
  if (STATE_ALIASES[key]) return STATE_ALIASES[key]
  // Loose match, e.g. "State of Gujarat"
  const hit = Object.keys(STATE_ALIASES).find(alias => key.includes(alias))
  return hit ? STATE_ALIASES[hit] : null
}

const geoCache = new Map<string, StateGeo>()

export function IndianStateVectorMap({
  stateName,
  cityName,
  latitude,
  longitude,
  isDetecting = false,
  className = ''
}: StateMapProps) {
  const slug = resolveStateSlug(stateName)
  const [geo, setGeo] = useState<StateGeo | null>(slug ? geoCache.get(slug) || null : null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!slug) { setGeo(null); return }
    const cached = geoCache.get(slug)
    if (cached) { setGeo(cached); setFailed(false); return }
    let cancelled = false
    setFailed(false)
    fetch(`/geo/states/${slug}.json`)
      .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json() })
      .then((data: StateGeo) => {
        geoCache.set(slug, data)
        if (!cancelled) setGeo(data)
      })
      .catch(() => { if (!cancelled) setFailed(true) })
    return () => { cancelled = true }
  }, [slug])

  // Project the user's real coordinates onto the same space as the generated paths
  let pin: { x: number; y: number } | null = null
  if (geo && typeof latitude === 'number' && typeof longitude === 'number' && !Number.isNaN(latitude) && !Number.isNaN(longitude)) {
    const { minLon, maxLat } = geo.bounds
    const x = geo.pad + (longitude - minLon) * geo.k * geo.scale
    const y = geo.pad + (maxLat - latitude) * geo.scale
    if (x >= 0 && x <= geo.width && y >= 0 && y <= geo.height) pin = { x, y }
  }
  const pinR = geo ? Math.max(geo.width, geo.height) / 90 : 0

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Your Current Location
          </span>
          <h3 className="text-lg font-black text-[#0B1220] tracking-tight mt-0.5 font-[family-name:var(--font-heading)] truncate">
            {isDetecting && !stateName ? 'Detecting…' : (geo?.state || stateName || 'Unknown')}
          </h3>
          {cityName && (
            <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">{cityName}</p>
          )}
        </div>
        {geo && geo.districts.length > 1 && (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/10 shrink-0">
            {geo.districts.length} {geo.slug === 'delhi' ? 'wards' : 'districts'}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center w-full h-[340px] sm:h-[380px]">
        {geo ? (
          <svg
            viewBox={`0 0 ${geo.width} ${geo.height}`}
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`District map of ${geo.state}`}
          >
            {/* Layer 1: thick black strokes. Interior edges get covered by layer 2,
                so only the outer state boundary stays visible as a black outline. */}
            <g fill="none" stroke="#0B1220" strokeWidth={3.2} strokeLinejoin="round">
              {geo.districts.map((dist, i) => (
                <path key={`o-${i}`} d={dist.d} vectorEffect="non-scaling-stroke" />
              ))}
            </g>
            {/* Layer 2: district fills + thin internal political boundaries */}
            <g fill="#FFFFFF" stroke="#64748B" strokeWidth={0.7} strokeLinejoin="round">
              {geo.districts.map((dist, i) => (
                <path key={`d-${i}`} d={dist.d} vectorEffect="non-scaling-stroke" />
              ))}
            </g>
            {pin && (
              <circle cx={pin.x} cy={pin.y} r={pinR} fill="#1D4ED8" stroke="#FFFFFF" strokeWidth={2} vectorEffect="non-scaling-stroke" />
            )}
          </svg>
        ) : (
          <div className="text-xs text-slate-400 font-medium">
            {failed
              ? 'Map unavailable for this region.'
              : (isDetecting || slug) ? 'Loading map…' : 'Location outside India or not detected.'}
          </div>
        )}
      </div>
    </div>
  )
}
