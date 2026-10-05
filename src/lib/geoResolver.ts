// ============================================================================
// Zigza MES Platform - IP Geolocation & User Agent Resolver
// Resolves Visitor IP to City/State without third-party tracking scripts
// ============================================================================

export interface GeoLocationResult {
  ip: string
  city: string
  state: string
  country: string
  deviceType: 'mobile' | 'desktop' | 'tablet'
  browser: string
  os: string
}

// In-memory cache for IP -> Geo resolution to prevent redundant lookups
const ipGeoCache = new Map<string, { city: string; state: string; country: string; timestamp: number }>()
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

// Mapping for Indian state codes (e.g. from Vercel headers or abbreviated strings)
const INDIA_STATE_CODE_MAP: Record<string, string> = {
  GJ: 'Gujarat',
  TN: 'Tamil Nadu',
  MH: 'Maharashtra',
  PB: 'Punjab',
  KA: 'Karnataka',
  WB: 'West Bengal',
  DL: 'Delhi',
  UP: 'Uttar Pradesh',
  HR: 'Haryana',
  RJ: 'Rajasthan',
  TS: 'Telangana',
  TG: 'Telangana',
  AP: 'Andhra Pradesh',
  KL: 'Kerala',
  MP: 'Madhya Pradesh',
  BR: 'Bihar',
  OR: 'Odisha',
  AS: 'Assam',
  JH: 'Jharkhand',
  CH: 'Chandigarh',
  UT: 'Uttarakhand',
  UK: 'Uttarakhand',
  HP: 'Himachal Pradesh',
  JK: 'Jammu & Kashmir',
  GA: 'Goa',
  PY: 'Puducherry'
}

/**
 * Normalizes state names for consistency (e.g. "National Capital Territory of Delhi" -> "Delhi")
 */
export function normalizeIndianState(rawState: string): string {
  if (!rawState || rawState.trim() === '') return 'Unknown'
  const trimmed = rawState.trim()

  if (INDIA_STATE_CODE_MAP[trimmed.toUpperCase()]) {
    return INDIA_STATE_CODE_MAP[trimmed.toUpperCase()]
  }

  const lower = trimmed.toLowerCase()
  if (lower.includes('delhi')) return 'Delhi'
  if (lower.includes('gujarat')) return 'Gujarat'
  if (lower.includes('tamil nadu')) return 'Tamil Nadu'
  if (lower.includes('maharashtra')) return 'Maharashtra'
  if (lower.includes('punjab')) return 'Punjab'
  if (lower.includes('karnataka')) return 'Karnataka'
  if (lower.includes('west bengal') || lower.includes('bengal')) return 'West Bengal'
  if (lower.includes('uttar pradesh')) return 'Uttar Pradesh'
  if (lower.includes('haryana')) return 'Haryana'
  if (lower.includes('rajasthan')) return 'Rajasthan'
  if (lower.includes('telangana')) return 'Telangana'
  if (lower.includes('andhra pradesh')) return 'Andhra Pradesh'
  if (lower.includes('kerala')) return 'Kerala'
  if (lower.includes('madhya pradesh')) return 'Madhya Pradesh'
  if (lower.includes('odisha') || lower.includes('orissa')) return 'Odisha'
  if (lower.includes('assam')) return 'Assam'
  if (lower.includes('bihar')) return 'Bihar'
  if (lower.includes('jharkhand')) return 'Jharkhand'
  if (lower.includes('uttarakhand')) return 'Uttarakhand'
  if (lower.includes('himachal')) return 'Himachal Pradesh'
  if (lower.includes('jammu') || lower.includes('kashmir')) return 'Jammu & Kashmir'
  if (lower.includes('goa')) return 'Goa'

  return trimmed
}

/**
 * Checks if an IP is in a local or private address range
 */
export function isPrivateOrLocalIp(ip: string): boolean {
  if (!ip) return true
  const clean = ip.trim().toLowerCase()
  if (clean === '127.0.0.1' || clean === '::1' || clean === 'localhost' || clean === 'unknown') {
    return true
  }
  if (clean.startsWith('10.') || clean.startsWith('192.168.') || clean.startsWith('169.254.')) {
    return true
  }
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(clean)) {
    return true
  }
  return false
}

/**
 * Extracts and cleans the visitor's public IP address from request headers
 */
export function extractClientIp(headers: Headers): string {
  const xForwardedFor = headers.get('x-forwarded-for')
  if (xForwardedFor) {
    const parts = xForwardedFor.split(',').map(p => p.trim())
    for (const part of parts) {
      const cleanIp = part.replace(/:\d+$/, '') // strip port if any
      if (!isPrivateOrLocalIp(cleanIp)) {
        return cleanIp
      }
    }
    // If all were private, return the first one
    return parts[0].replace(/:\d+$/, '')
  }

  const cfConnectingIp = headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp.trim().replace(/:\d+$/, '')
  }

  const xRealIp = headers.get('x-real-ip')
  if (xRealIp) {
    return xRealIp.trim().replace(/:\d+$/, '')
  }

  return '127.0.0.1'
}

/**
 * Resolves IP address to City, State, Country
 */
export async function resolveIpGeolocation(ip: string, headers?: Headers): Promise<{
  city: string
  state: string
  country: string
}> {
  // Check private or local IP
  if (isPrivateOrLocalIp(ip)) {
    return {
      city: 'Local Dev',
      state: 'Local Dev',
      country: 'India'
    }
  }

  // Check cache first
  const cached = ipGeoCache.get(ip)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return {
      city: cached.city,
      state: cached.state,
      country: cached.country
    }
  }

  // Check Vercel edge headers if available
  if (headers) {
    const vCity = headers.get('x-vercel-ip-city')
    const vRegion = headers.get('x-vercel-ip-country-region')
    const vCountry = headers.get('x-vercel-ip-country') || 'India'

    if (vRegion || vCity) {
      const resolved = {
        city: vCity ? decodeURIComponent(vCity) : 'Unknown',
        state: normalizeIndianState(vRegion || ''),
        country: vCountry === 'IN' ? 'India' : vCountry
      }
      ipGeoCache.set(ip, { ...resolved, timestamp: Date.now() })
      return resolved
    }
  }

  // Fallback to ip-api.com (free, rate limited to 45/min, zero API key needed)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3500)

    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,query`, {
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (res.ok) {
      const data = await res.json()
      if (data.status === 'success') {
        const resolved = {
          city: data.city || 'Unknown',
          state: normalizeIndianState(data.regionName || ''),
          country: data.country || 'India'
        }
        ipGeoCache.set(ip, { ...resolved, timestamp: Date.now() })
        return resolved
      }
    }
  } catch (err) {
    console.warn('[resolveIpGeolocation] ip-api lookup skipped/failed:', err)
  }

  // Default fallback
  const fallback = { city: 'Unknown', state: 'Unknown', country: 'India' }
  ipGeoCache.set(ip, { ...fallback, timestamp: Date.now() })
  return fallback
}

/**
 * Parses user agent into deviceType, browser, and os
 */
export function parseUserAgent(userAgent: string): {
  deviceType: 'mobile' | 'desktop' | 'tablet'
  browser: string
  os: string
} {
  const ua = userAgent || ''

  // Device type
  let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop'
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    deviceType = 'tablet'
  } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
    deviceType = 'mobile'
  }

  // Browser
  let browser = 'Unknown'
  if (/edg/i.test(ua)) {
    browser = 'Edge'
  } else if (/samsungbrowser/i.test(ua)) {
    browser = 'Samsung Internet'
  } else if (/chrome|crios/i.test(ua)) {
    browser = 'Chrome'
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'Firefox'
  } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
    browser = 'Safari'
  } else if (/opera|opr/i.test(ua)) {
    browser = 'Opera'
  }

  // Operating System
  let os = 'Unknown'
  if (/windows/i.test(ua)) {
    os = 'Windows'
  } else if (/android/i.test(ua)) {
    os = 'Android'
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    os = 'iOS'
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS'
  } else if (/linux/i.test(ua)) {
    os = 'Linux'
  }

  return { deviceType, browser, os }
}
