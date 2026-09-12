'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Boxes,
  ChevronLeft,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Sparkles
} from 'lucide-react'
import {
  getThreadCones,
  EMBROIDERY_UPDATE_EVENT,
} from '../../utils/embroideryStorage'
import { ThreadConeItem } from '../../types/embroidery'
import { AddThreadConeModal } from './AddThreadConeModal'

interface ThreadStoreClientProps {
  initialCones?: ThreadConeItem[]
}

export function ThreadStoreClient({ initialCones }: ThreadStoreClientProps = {}) {
  const [cones, setCones] = useState<ThreadConeItem[]>(() => {
    if (initialCones && initialCones.length > 0) return initialCones
    return []
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [brandFilter, setBrandFilter] = useState('ALL')
  const [isAddOpen, setIsAddOpen] = useState(false)

  function loadCones() {
    if (initialCones && initialCones.length > 0) {
      setCones(initialCones)
    } else {
      setCones(getThreadCones())
    }
  }

  useEffect(() => {
    if (initialCones && initialCones.length > 0) {
      setCones(initialCones)
      if (typeof window !== 'undefined') {
        localStorage.setItem('zigza_embroidery_cones_v2', JSON.stringify(initialCones))
      }
    } else {
      setCones(getThreadCones())
    }
    window.addEventListener(EMBROIDERY_UPDATE_EVENT, loadCones)
    return () => window.removeEventListener(EMBROIDERY_UPDATE_EVENT, loadCones)
  }, [initialCones])

  const filteredCones = cones.filter(c => {
    const matchesSearch =
      c.cone_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.shade_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.pantone_match.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.storage_bin.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBrand = brandFilter === 'ALL' || c.brand === brandFilter
    return matchesSearch && matchesBrand
  })

  const totalCones = cones.reduce((acc, c) => acc + c.cones_in_stock, 0)
  const lowStockCount = cones.filter(c => c.status === 'LOW_STOCK').length

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
          Thread Inventory & Cones Log
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Thread Store & Cones Log
              </h1>
              <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
                Madeira • Isacord • Coats
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Spool weight depletion meters, shade lab dips, Pantone matching, and storage shelf allocations
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Spool Cones</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Total Cones In Stock</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            {totalCones} Cones
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Across all thread racks</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Active Thread Shades</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            {cones.length} Shades
          </div>
          <p className="text-xs font-semibold text-emerald-600 mt-1">Pantone calibrated lab dips</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Low Stock Requisitions</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            {lowStockCount} Cones Low
          </div>
          <p className="text-xs font-semibold text-amber-600 mt-1">&lt;5 cones remaining on shelf</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search shade, Pantone, code, or bin..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={brandFilter}
            onChange={e => setBrandFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-medium focus:ring-1 focus:ring-[#3A3564] outline-none"
          >
            <option value="ALL">All Manufacturers</option>
            <option value="Madeira">Madeira Classic</option>
            <option value="Isacord">Isacord Polyester</option>
            <option value="Coats">Coats Sylko</option>
            <option value="Vardhman">Vardhman Rayon</option>
          </select>
        </div>
      </div>

      {/* Cones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCones.map(cone => {
          const weightPct = Math.round((cone.current_weight_grams / cone.initial_weight_grams) * 100)
          return (
            <div
              key={cone.id}
              className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs hover:border-[#3A3564]/30 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-black text-[#3A3564]">
                    {cone.cone_code}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                    {cone.shade_number}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-500">
                    {cone.brand} • {cone.thread_type}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                    cone.status === 'IN_STOCK'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {cone.status.replace('_', ' ')}
                </span>
              </div>

              <div className="p-3 bg-[#FAF7F0]/60 rounded-xl border border-black/5 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pantone Reference:</span>
                  <span className="font-bold text-slate-900">{cone.pantone_match}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Inventory Quantity:</span>
                  <span className="font-bold text-[#3A3564]">{cone.cones_in_stock} Cones</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Storage Location:</span>
                  <span className="text-slate-800 font-semibold">{cone.storage_bin}</span>
                </div>
              </div>

              {/* Weight depletion meter */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-500">Spool Remaining:</span>
                  <span className="font-bold text-slate-800">
                    {cone.current_weight_grams}g / {cone.initial_weight_grams}g ({weightPct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-black/5">
                  <div
                    className={`h-full rounded-full ${
                      weightPct < 25 ? 'bg-amber-500' : 'bg-[#3A3564]'
                    }`}
                    style={{ width: `${weightPct}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <AddThreadConeModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />
    </div>
  )
}
