// Generates compact, pre-projected district-level SVG maps for every Indian state/UT.
// Source: https://github.com/udit-001/india-maps-data (Census 2011 district boundaries)
// Usage: node scripts/build-state-geo.mjs
import fs from 'node:fs'
import path from 'node:path'

const BASE = 'https://raw.githubusercontent.com/udit-001/india-maps-data/main/geojson/states/'
const OUT_DIR = path.join(process.cwd(), 'public', 'geo', 'states')
const SIZE = 1000 // longest side of the viewBox
const PAD = 12
const TOLERANCE = 0.9 // simplification tolerance in viewBox units

// Sources with finer political subdivisions where the district file has only one polygon
const SOURCE_OVERRIDES = {
  delhi: { url: 'https://raw.githubusercontent.com/datameet/Municipal_Spatial_Data/master/Delhi/Delhi_Wards.geojson', state: 'Delhi' }
}

const SLUGS = [
  'andaman-and-nicobar-islands', 'andhra-pradesh', 'arunachal-pradesh', 'assam', 'bihar',
  'chandigarh', 'chhattisgarh', 'delhi', 'dnh-and-dd', 'goa', 'gujarat', 'haryana',
  'himachal-pradesh', 'jammu-and-kashmir', 'jharkhand', 'karnataka', 'kerala', 'ladakh',
  'lakshadweep', 'madhya-pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram',
  'nagaland', 'odisha', 'puducherry', 'punjab', 'rajasthan', 'sikkim', 'tamil-nadu',
  'telangana', 'tripura', 'uttar-pradesh', 'uttarakhand', 'west-bengal'
]

// Douglas–Peucker simplification
function simplify(points, tol) {
  if (points.length < 4) return points
  const sqTol = tol * tol
  const keep = new Uint8Array(points.length)
  keep[0] = keep[points.length - 1] = 1
  const stack = [[0, points.length - 1]]
  while (stack.length) {
    const [first, last] = stack.pop()
    let maxD = 0, idx = -1
    const [ax, ay] = points[first], [bx, by] = points[last]
    const dx = bx - ax, dy = by - ay
    const len = dx * dx + dy * dy
    for (let i = first + 1; i < last; i++) {
      const [px, py] = points[i]
      let t = len ? ((px - ax) * dx + (py - ay) * dy) / len : 0
      t = Math.max(0, Math.min(1, t))
      const ex = ax + t * dx - px, ey = ay + t * dy - py
      const d = ex * ex + ey * ey
      if (d > maxD) { maxD = d; idx = i }
    }
    if (maxD > sqTol && idx > 0) {
      keep[idx] = 1
      stack.push([first, idx], [idx, last])
    }
  }
  return points.filter((_, i) => keep[i])
}

function polygonsOf(geom) {
  if (!geom) return []
  if (geom.type === 'Polygon') return [geom.coordinates]
  if (geom.type === 'MultiPolygon') return geom.coordinates
  return []
}

async function build(slug) {
  const override = SOURCE_OVERRIDES[slug]
  const res = await fetch(override ? override.url : BASE + slug + '.geojson')
  if (!res.ok) throw new Error(`${slug}: HTTP ${res.status}`)
  const gj = await res.json()

  let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity
  for (const f of gj.features) for (const poly of polygonsOf(f.geometry)) for (const ring of poly) for (const [lon, lat] of ring) {
    if (lon < minLon) minLon = lon; if (lon > maxLon) maxLon = lon
    if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat
  }

  // Equirectangular projection corrected for latitude (accurate enough at state scale)
  const k = Math.cos(((minLat + maxLat) / 2) * Math.PI / 180)
  const spanX = (maxLon - minLon) * k, spanY = maxLat - minLat
  const scale = (SIZE - PAD * 2) / Math.max(spanX, spanY)
  const width = Math.round(spanX * scale + PAD * 2)
  const height = Math.round(spanY * scale + PAD * 2)
  const project = (lon, lat) => [PAD + (lon - minLon) * k * scale, PAD + (maxLat - lat) * scale]

  const districts = []
  for (const f of gj.features) {
    let d = ''
    for (const poly of polygonsOf(f.geometry)) for (const ring of poly) {
      const pts = simplify(ring.map(([lon, lat]) => project(lon, lat)), TOLERANCE)
      if (pts.length < 3) continue
      d += 'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L') + 'Z'
    }
    if (d) districts.push({ name: f.properties?.district || f.properties?.Ward_Name || '', d })
  }

  const stateName = override?.state || gj.features[0]?.properties?.st_nm || slug
  const out = { state: stateName, slug, width, height, bounds: { minLon, maxLon, minLat, maxLat }, k, scale, pad: PAD, districts }
  fs.writeFileSync(path.join(OUT_DIR, slug + '.json'), JSON.stringify(out))
  return { slug, stateName, districts: districts.length, kb: Math.round(JSON.stringify(out).length / 1024) }
}

fs.mkdirSync(OUT_DIR, { recursive: true })
const only = process.argv.slice(2)
for (const slug of (only.length ? only : SLUGS)) {
  try {
    const r = await build(slug)
    console.log(`✓ ${r.slug.padEnd(30)} ${String(r.districts).padStart(3)} districts  ${r.kb} KB  (${r.stateName})`)
  } catch (e) {
    console.error(`✗ ${slug}: ${e.message}`)
  }
}
