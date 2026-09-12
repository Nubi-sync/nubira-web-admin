'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  Maximize2,
  Search,
  Plus,
  X,
  Gauge,
  Layers,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Ruler
} from 'lucide-react'
import { MarkerEfficiency, CADSoftware } from '../../types/cutting'
import { getMarkers, saveMarker } from '../../utils/cuttingStorage'

export function MarkersClient() {
  const [markers, setMarkers] = useState<MarkerEfficiency[]>([])
  const [search, setSearch] = useState('')
  const [softwareFilter, setSoftwareFilter] = useState<string>('ALL')
  const [selectedMarker, setSelectedMarker] = useState<MarkerEfficiency | null>(null)
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    marker_name: 'MKR-HD-8821-B',
    style_ref: 'ART-HD-8821',
    cad_software: 'GERBER_ACCUMARK' as CADSoftware,
    fabric_width_inches: 60,
    marker_length_meters: 5.4,
    efficiency_percent: 89.6,
    sizes_included: 'XS, S, M, L, XL',
    ratio: '1:2:4:2:1',
    pattern_master: 'S. Selvam (CAD Specialist)'
  })

  useEffect(() => {
    setMarkers(getMarkers())
  }, [])

  const filteredMarkers = markers.filter(m => {
    const markerName = (m.marker_name || m.marker_ref || '').toLowerCase()
    const styleRef = (m.style_ref || '').toLowerCase()
    const sizesStr = Array.isArray(m.sizes_included) ? m.sizes_included.join(', ').toLowerCase() : String(m.sizes_included || '').toLowerCase()
    const matchSearch =
      markerName.includes(search.toLowerCase()) ||
      styleRef.includes(search.toLowerCase()) ||
      sizesStr.includes(search.toLowerCase())
    const matchSoftware = softwareFilter === 'ALL' || m.cad_software === softwareFilter
    return matchSearch && matchSoftware
  })

  const handleCreateMarker = (e: React.FormEvent) => {
    e.preventDefault()
    const newMarker: MarkerEfficiency = {
      id: `mrk-${Date.now()}`,
      marker_name: formData.marker_name || 'CAD-NEST-NEW',
      style_ref: formData.style_ref || 'STY-NEW-01',
      cad_software: formData.cad_software,
      fabric_width_inches: Number(formData.fabric_width_inches) || 60,
      marker_length_meters: Number(formData.marker_length_meters) || 5.0,
      efficiency_percent: Number(formData.efficiency_percent) || 88.0,
      sizes_included: formData.sizes_included.split(',').map(s => s.trim()),
      ratio: formData.ratio,
      pattern_master: formData.pattern_master,
      created_at: new Date().toISOString()
    }

    const updated = saveMarker(newMarker)
    setMarkers(updated)
    setIsNewModalOpen(false)
  }

  // Derived Metrics
  const avgEfficiency = markers.length > 0
    ? (markers.reduce((acc, m) => acc + m.efficiency_percent, 0) / markers.length).toFixed(1)
    : '88.4'
  const highestYield = markers.length > 0
    ? Math.max(...markers.map(m => m.efficiency_percent)).toFixed(1)
    : '89.6'
  const targetAbove88Count = markers.filter(m => m.efficiency_percent >= 88.0).length

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
      {/* 1. Breadcrumb */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Link
            href="/cutting"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Floor Dashboard</span>
          </Link>
          <span className="text-slate-400 font-mono text-xs">/</span>
          <span className="text-xs font-mono font-bold text-slate-900">Marker Efficiency Library</span>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2e2a50] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New CAD Marker</span>
        </button>
      </div>

      {/* 2. Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Maximize2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                CAD Marker Efficiency & Nesting Library
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
                Fabric Yield Optimization
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Automated nesting layout archive, cut-width tolerances, ratio combinations, and fabric utilization benchmarking
            </p>
          </div>
        </div>
      </div>

      {/* 3. Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Average CAD Yield</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 mt-2">{avgEfficiency}%</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Floor target is &gt;86.0%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Top Yield Benchmark</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">{highestYield}%</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Optimized by Gerber AccuMark</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Markers &gt;88% Yield</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-600 mt-2">{targetAbove88Count} of {markers.length}</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">High-utilization profiles</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">CAD Systems Synced</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">4 Engines</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Gerber, Lectra, Optitex, Tukatech</p>
        </div>
      </div>

      {/* 4. Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search marker, style ref, size..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
            {(['ALL', 'GERBER_ACCUMARK', 'LECTRA_MODARIS', 'OPTITEX', 'TUKATECH'] as const).map(sw => (
              <button
                key={sw}
                onClick={() => setSoftwareFilter(sw)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  softwareFilter === sw
                    ? 'bg-[#3A3564] text-white'
                    : 'bg-[#FAF7F0] text-slate-600 hover:bg-slate-100'
                }`}
              >
                {sw.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Markers Visual Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMarkers.map(marker => {
          let yieldColor = 'text-emerald-600 bg-emerald-50 border-emerald-200'
          let barFill = 'bg-emerald-500'
          if (marker.efficiency_percent < 87.0) {
            yieldColor = 'text-sky-700 bg-sky-50 border-sky-200'
            barFill = 'bg-sky-500'
          }
          if (marker.efficiency_percent < 85.0) {
            yieldColor = 'text-amber-700 bg-amber-50 border-amber-200'
            barFill = 'bg-amber-500'
          }

          return (
            <div
              key={marker.id}
              className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-4 hover:border-black/20 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base text-slate-900">{marker.marker_name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 font-bold uppercase">
                      {marker.cad_software.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">Style: {marker.style_ref}</p>
                </div>

                <div className={`px-3 py-1.5 rounded-xl border font-mono font-black text-sm flex flex-col items-end ${yieldColor}`}>
                  <span>{marker.efficiency_percent}%</span>
                  <span className="text-[9px] uppercase tracking-wider font-semibold">Yield</span>
                </div>
              </div>

              {/* Visual Nesting Density Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Fabric Nesting Utilization</span>
                  <span>{marker.efficiency_percent}% / 100%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#FAF7F0] border border-black/10 overflow-hidden">
                  <div className={`h-full ${barFill} rounded-full transition-all`} style={{ width: `${marker.efficiency_percent}%` }} />
                </div>
              </div>

              {/* Marker Specs */}
              <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-black/5 font-mono">
                <div className="p-2 rounded-lg bg-[#FAF7F0]/60 border border-black/5">
                  <span className="text-[9px] text-slate-500 uppercase block">Width Bed:</span>
                  <strong>{marker.fabric_width_inches}&quot; cut width</strong>
                </div>
                <div className="p-2 rounded-lg bg-[#FAF7F0]/60 border border-black/5">
                  <span className="text-[9px] text-slate-500 uppercase block">Length:</span>
                  <strong>{marker.marker_length_meters} meters</strong>
                </div>
                <div className="p-2 rounded-lg bg-[#FAF7F0]/60 border border-black/5">
                  <span className="text-[9px] text-slate-500 uppercase block">Ratio:</span>
                  <strong>{marker.ratio}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-black/5 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono text-slate-400">SIZES:</span>
                  {(Array.isArray(marker.sizes_included) ? marker.sizes_included : [String(marker.sizes_included || '')]).map((sz: string) => (
                    <span key={sz} className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] font-bold text-slate-700">
                      {sz}
                    </span>
                  ))}
                </div>
                <span className="text-[11px] text-slate-500 italic truncate max-w-[150px]">{marker.pattern_master}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* New Marker Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-black/15 shadow-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <h3 className="font-bold text-base text-slate-900">Archive New CAD Nesting Marker</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMarker} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Marker Code / Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MKR-CREW-S-XL-04"
                    value={formData.marker_name}
                    onChange={e => setFormData({ ...formData, marker_name: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Style Reference</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STY-CREW-8801"
                    value={formData.style_ref}
                    onChange={e => setFormData({ ...formData, style_ref: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">CAD Software Engine</label>
                  <select
                    value={formData.cad_software}
                    onChange={e => setFormData({ ...formData, cad_software: e.target.value as CADSoftware })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  >
                    <option value="GERBER_ACCUMARK">Gerber AccuMark</option>
                    <option value="LECTRA_MODARIS">Lectra Modaris / Diamino</option>
                    <option value="OPTITEX">Optitex Marker</option>
                    <option value="TUKATECH">TukaTech TUKAcad</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Fabric Cut Width (inches)</label>
                  <input
                    type="number"
                    value={formData.fabric_width_inches}
                    onChange={e => setFormData({ ...formData, fabric_width_inches: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Marker Length (meters)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.marker_length_meters}
                    onChange={e => setFormData({ ...formData, marker_length_meters: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Efficiency Yield (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="50"
                    max="100"
                    value={formData.efficiency_percent}
                    onChange={e => setFormData({ ...formData, efficiency_percent: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Sizes Included (comma separated)</label>
                  <input
                    type="text"
                    value={formData.sizes_included}
                    onChange={e => setFormData({ ...formData, sizes_included: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Size Ratio</label>
                  <input
                    type="text"
                    value={formData.ratio}
                    onChange={e => setFormData({ ...formData, ratio: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono font-bold text-slate-700 uppercase">Pattern Master / CAD Specialist</label>
                <input
                  type="text"
                  value={formData.pattern_master}
                  onChange={e => setFormData({ ...formData, pattern_master: e.target.value })}
                  className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10"
                />
              </div>

              <div className="pt-3 border-t border-black/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F0] hover:bg-slate-100 border border-black/10 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2e2a50] text-white text-xs font-bold"
                >
                  Save Marker Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
