'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileCode,
  ChevronLeft,
  Plus,
  Search,
  Filter,
  Eye,
  Sparkles
} from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  getEmbroideryDesigns,
  EMBROIDERY_UPDATE_EVENT,
} from '../../utils/embroideryStorage'
import { EmbroideryDesign } from '../../types/embroidery'
import { UploadPunchModal } from './UploadPunchModal'

interface PunchLibraryClientProps {
  initialDesigns?: EmbroideryDesign[]
}

export function PunchLibraryClient({ initialDesigns }: PunchLibraryClientProps = {}) {
  const [designs, setDesigns] = useState<EmbroideryDesign[]>(() => {
    if (initialDesigns && initialDesigns.length > 0) return initialDesigns
    return []
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBuyer, setSelectedBuyer] = useState('ALL')
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [activePreview, setActivePreview] = useState<EmbroideryDesign | null>(null)

  function loadDesigns() {
    if (initialDesigns && initialDesigns.length > 0) {
      setDesigns(initialDesigns)
    } else {
      setDesigns(getEmbroideryDesigns())
    }
  }

  useEffect(() => {
    if (initialDesigns && initialDesigns.length > 0) {
      setDesigns(initialDesigns)
      if (typeof window !== 'undefined') {
        localStorage.setItem('zigza_embroidery_designs_v2', JSON.stringify(initialDesigns))
      }
    } else {
      setDesigns(getEmbroideryDesigns())
    }
    window.addEventListener(EMBROIDERY_UPDATE_EVENT, loadDesigns)
    return () => window.removeEventListener(EMBROIDERY_UPDATE_EVENT, loadDesigns)
  }, [initialDesigns])

  const filteredDesigns = designs.filter(d => {
    const matchesSearch =
      d.design_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.design_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.order_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBuyer = selectedBuyer === 'ALL' || d.buyer_name === selectedBuyer
    return matchesSearch && matchesBuyer
  })

  const avgStitches = designs.length
    ? Math.round(designs.reduce((a, b) => a + b.total_stitches, 0) / designs.length)
    : 0

  return (
    <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto text-[#09090b] select-none">
      
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-black/15 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#F0FDFA] text-[#0B1220] border border-black/15">
            <FileCode className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                DST Punch <span className="text-[#1D4ED8]">File Library</span>
              </h1>
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs tracking-wider">
                Tajima .DST / Barudan .DSB
              </span>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-1">
              Digitized stitch coordinates, needle stop sequence, backing stabilizer specs, and piece-rate pricing.
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
          <Link
            href="/embroidery"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-black/15 text-xs font-mono font-bold text-slate-700 hover:text-[#0B1220] hover:bg-[#F0FDFA] transition-all shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Floor</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Upload Punch File</span>
          </button>
        </div>
      </div>

      {/* 3. Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/15 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500">Total Punch Files</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            {designs.length} Designs
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">Ready for 20-head transmission</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/15 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500">Average Stitch Count</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            {avgStitches.toLocaleString()} Stitches
          </div>
          <p className="text-xs font-medium text-slate-600 mt-1">Calculated across catalog</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/15 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500">Default Jobwork Rate</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            ₹2.80 / 1k Stitches
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">Plus backing stabilizer paper</p>
        </div>
      </div>

      {/* 4. Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-black/15 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F0FDFA]/30">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by code, design name, or PO..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-black/15 focus:outline-none focus:ring-1 focus:ring-[#0B1220] bg-white text-slate-900 placeholder:text-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedBuyer}
            onChange={e => setSelectedBuyer(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-black/15 bg-white font-medium focus:ring-1 focus:ring-[#0B1220] outline-none text-slate-800"
          >
            <option value="ALL">All Buyers</option>
            {Array.from(new Set(designs.map(d => d.buyer_name).filter(Boolean))).map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 5. Designs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDesigns.length > 0 ? (
          filteredDesigns.map(design => (
            <div
              key={design.id}
              className="bg-white p-5 rounded-2xl border border-black/15 shadow-2xs hover:border-black/20 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#0B1220]">
                      {design.design_code}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                      {design.design_name}
                    </h3>
                    <div className="text-[11px] font-medium text-slate-500">
                      Buyer: {design.buyer_name} • <span className="font-mono">{design.order_id}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15">
                    {design.status}
                  </span>
                </div>

                {/* Technical Spec Box */}
                <div className="mt-3 p-3 rounded-xl bg-[#F0FDFA]/60 border border-black/5 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Stitches:</span>
                    <span className="font-bold text-slate-900">
                      {design.total_stitches.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Color Stops (Needles):</span>
                    <span className="font-bold text-slate-900">
                      {design.color_stops_count} Changes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Stabilizer Backing:</span>
                    <span className="text-slate-800 font-semibold">{design.backing_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Thread Spec:</span>
                    <span className="text-slate-800 font-semibold">{design.thread_brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dimensions (WxH):</span>
                    <span className="text-slate-800 font-semibold">{design.width_mm} × {design.height_mm} mm</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-700 font-bold">
                  Rate: ₹{design.rate_per_thousand_stitches.toFixed(2)} / 1k
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActivePreview(design)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#F0FDFA] border border-black/15 hover:bg-white text-slate-800 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#0B1220]" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              variant="seamless"
              icon={FileCode}
              title="No punch files found"
              description="Digitized .DST / .DSB binary vector programs, needle stop sequences, and backing specs will display once registered."
              actionLabel="Upload Punch File (Form 1)"
              onAction={() => setIsUploadOpen(true)}
            />
          </div>
        )}
      </div>

      {/* Punch Preview Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-black/15 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center">
                  <FileCode className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900">
                  {activePreview.design_code}
                </h3>
              </div>
              <button
                onClick={() => setActivePreview(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              {/* Simulated needle stitch layout */}
              <div className="h-32 bg-slate-900 rounded-xl flex items-center justify-center border border-black/15 p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#0B1220_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />
                <div className="text-center z-10">
                  <div className="w-8 h-8 rounded-full bg-[#F0FDFA]/20 flex items-center justify-center mx-auto mb-1 text-[#F0FDFA]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-[11px] text-slate-300 font-bold">
                    {activePreview.dst_file_name}
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {activePreview.total_stitches.toLocaleString()} Stitches • {activePreview.color_stops_count} Color Stops
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#F0FDFA] rounded-xl font-mono space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Binary File:</span>
                  <span className="font-bold text-slate-900">{activePreview.dst_file_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Backing Spec:</span>
                  <span className="font-bold text-slate-900">{activePreview.backing_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thread Brand:</span>
                  <span className="font-bold text-slate-900">{activePreview.thread_brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registered:</span>
                  <span className="font-bold text-slate-900" suppressHydrationWarning>
                    {new Date(activePreview.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActivePreview(null)}
              className="w-full py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}

      {/* Form 1 Modal */}
      <UploadPunchModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  )
}
