'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileCode,
  ChevronLeft,
  Plus,
  Search,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Download,
  Filter,
  Eye
} from 'lucide-react'
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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/embroidery"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Embroidery Floor</span>
        </Link>
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
          Punch Digitizing Vault
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                DST Punch File Library
              </h1>
              <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
                Tajima .DST / Barudan .DSB
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Digitized stitch coordinates, needle stop sequence, backing stabilizer specs, and piece-rate pricing
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Punch File (Form 1)</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Total Punch Files</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            {designs.length} Designs
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Ready for 20-head transmission</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Average Stitch Count</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            {avgStitches.toLocaleString()} Stitches
          </div>
          <p className="text-xs font-semibold text-emerald-600 mt-1">Calculated across catalog</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Default Jobwork Rate</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            ₹2.80 / 1k Stitches
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Plus backing stabilizer paper</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by code, design name, or PO..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedBuyer}
            onChange={e => setSelectedBuyer(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-medium focus:ring-1 focus:ring-[#3A3564] outline-none"
          >
            <option value="ALL">All Buyers</option>
            <option value="OLLYPOP">OLLYPOP</option>
          </select>
        </div>
      </div>

      {/* Designs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDesigns.map(design => (
          <div
            key={design.id}
            className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs hover:border-[#3A3564]/30 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-black text-[#3A3564]">
                    {design.design_code}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                    {design.design_name}
                  </h3>
                  <div className="text-[11px] font-semibold text-slate-500">
                    Buyer: {design.buyer_name} • <span className="font-mono">{design.order_id}</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                    design.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {design.status}
                </span>
              </div>

              {/* Technical Spec Box */}
              <div className="mt-3 p-3 rounded-xl bg-[#FAF7F0]/60 border border-black/5 space-y-1.5 text-xs font-mono">
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

            <div className="pt-3 border-t border-black/5 flex items-center justify-between text-xs">
              <span className="font-mono text-slate-600 font-bold">
                Rate: ₹{design.rate_per_thousand_stitches.toFixed(2)} / 1k
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActivePreview(design)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#FAF7F0] text-slate-700 font-semibold transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-[#3A3564]" />
                  <span>Inspect</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Punch Preview Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#3A3564]" />
                <h3 className="font-bold text-base text-slate-900">
                  {activePreview.design_code}
                </h3>
              </div>
              <button
                onClick={() => setActivePreview(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              {/* Simulated needle stitch layout */}
              <div className="h-32 bg-slate-900 rounded-xl flex items-center justify-center border border-black/10 p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#3A3564_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />
                <div className="text-center z-10">
                  <Sparkles className="w-8 h-8 text-amber-400 mx-auto animate-pulse mb-1" />
                  <span className="font-mono text-[11px] text-slate-300">
                    {activePreview.dst_file_name}
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {activePreview.total_stitches.toLocaleString()} Stitches • {activePreview.color_stops_count} Color Stops
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#FAF7F0] rounded-xl font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Binary File:</span>
                  <span className="font-bold text-slate-800">{activePreview.dst_file_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Backing Spec:</span>
                  <span className="font-bold text-slate-800">{activePreview.backing_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thread Brand:</span>
                  <span className="font-bold text-slate-800">{activePreview.thread_brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registered:</span>
                  <span className="font-bold text-slate-800">
                    {new Date(activePreview.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActivePreview(null)}
              className="w-full py-2 bg-[#3A3564] text-white font-bold rounded-xl text-xs hover:bg-[#2A2649] transition-all"
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
