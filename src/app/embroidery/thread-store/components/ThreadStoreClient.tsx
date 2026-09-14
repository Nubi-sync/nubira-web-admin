'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Boxes,
  ChevronLeft,
  Plus,
  Search,
  Filter
} from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto text-[#09090b] select-none">
      {/* 1. Breadcrumb */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Link
            href="/embroidery"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Embroidery Floor</span>
          </Link>
          <span className="text-slate-400 font-mono text-xs">/</span>
          <span className="text-xs font-mono font-bold text-slate-900">Thread Store</span>
        </div>

        <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
          Thread Inventory & Cones Log
        </span>
      </div>

      {/* 2. Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Thread Store & Cones Log
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
                Madeira • Isacord • Coats
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Spool weight depletion meters, shade lab dips, Pantone matching, and storage shelf allocations.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Spool Cones</span>
        </button>
      </div>

      {/* 3. Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500">Total Cones in Stock</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            {totalCones} Cones
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">Across all thread racks</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500">Active Thread Shades</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            {cones.length} Shades
          </div>
          <p className="text-xs font-medium text-slate-600 mt-1">Pantone calibrated lab dips</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500">Low Stock Requisitions</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            {lowStockCount} Cones Low
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">&lt;5 cones remaining on shelf</p>
        </div>
      </div>

      {/* 4. Filters */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAF7F0]/30">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search shade, Pantone, code, or bin..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] bg-white text-slate-900 placeholder:text-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={brandFilter}
            onChange={e => setBrandFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-medium focus:ring-1 focus:ring-[#3A3564] outline-none text-slate-800"
          >
            <option value="ALL">All Manufacturers</option>
            <option value="Madeira">Madeira Classic</option>
            <option value="Isacord">Isacord Polyester</option>
            <option value="Coats">Coats Sylko</option>
            <option value="Vardhman">Vardhman Rayon</option>
          </select>
        </div>
      </div>

      {/* 5. Cones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCones.length > 0 ? (
          filteredCones.map(cone => {
            const weightPct = Math.round((cone.current_weight_grams / cone.initial_weight_grams) * 100)
            return (
              <div
                key={cone.id}
                className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs hover:border-black/20 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#3A3564]">
                      {cone.cone_code}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                      {cone.shade_number}
                    </h3>
                    <div className="text-[11px] font-mono text-slate-500">
                      {cone.brand} • {cone.thread_type}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                    {cone.status.replace(/_/g, ' ')}
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
                    <span className="font-bold text-slate-900">
                      {cone.current_weight_grams}g / {cone.initial_weight_grams}g ({weightPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#3A3564] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${weightPct}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-full">
            <EmptyState
              variant="seamless"
              icon={Boxes}
              title="No thread spools or cones found"
              description="Madeira, Isacord, and Coats thread cones, Pantone shade lab dips, and storage bin coordinates will display once inventoried."
              actionLabel="Add Spool Cones"
              onAction={() => setIsAddOpen(true)}
            />
          </div>
        )}
      </div>

      <AddThreadConeModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />
    </div>
  )
}
