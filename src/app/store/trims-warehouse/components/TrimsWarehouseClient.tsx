'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Tag, 
  ChevronLeft, 
  Search, 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  Package, 
  Clock, 
  Boxes,
  RotateCw,
  ArrowRight
} from 'lucide-react'
import { TrimsInventoryItem, TrimCategory } from '../../types/store'
import { getTrimsInventory, STORE_UPDATE_EVENT } from '../../utils/storeStorage'
import { AdjustTrimStockModal } from './AdjustTrimStockModal'

export function TrimsWarehouseClient() {
  const [trims, setTrims] = useState<TrimsInventoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | TrimCategory | 'LOW_STOCK'>('ALL')
  const [selectedItem, setSelectedItem] = useState<TrimsInventoryItem | null>(null)
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)

  const loadTrims = () => {
    setTrims(getTrimsInventory())
  }

  useEffect(() => {
    loadTrims()
    const handleUpdate = () => loadTrims()
    window.addEventListener(STORE_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(STORE_UPDATE_EVENT, handleUpdate)
  }, [])

  // Metrics
  const totalSku = trims.length
  const lowStockCount = trims.filter(t => t.currentStock <= t.reorderLevel).length
  const threadCount = trims
    .filter(t => t.category === 'SEWING_THREAD')
    .reduce((acc, t) => acc + t.currentStock, 0)
  const polybagCount = trims
    .filter(t => t.category === 'PACKAGING')
    .reduce((acc, t) => acc + t.currentStock, 0)

  const filteredTrims = trims.filter(t => {
    const matchesSearch = 
      t.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.binLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.supplierName.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (categoryFilter === 'ALL') return true
    if (categoryFilter === 'LOW_STOCK') return t.currentStock <= t.reorderLevel
    return t.category === categoryFilter
  })

  const openAdjustModal = (item: TrimsInventoryItem) => {
    setSelectedItem(item)
    setIsAdjustModalOpen(true)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/store"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Store Dashboard</span>
        </Link>
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
          Trims & Accessories Bin-Location Warehouse • ROL Alerts
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#3A3564]/10 text-[#3A3564] border border-[#3A3564]/20">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Trims & Accessories Warehouse
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 tracking-wider">
                Bin Inventory Matrix
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Real-time bin locations (BIN_A-14), Re-Order Level (ROL) traffic light warnings, and floor material issue allocations
            </p>
          </div>
        </div>

        <Link
          href="/store/material-issues"
          className="px-4 py-2.5 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e] transition-all shadow-2xs inline-flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>Issue Trims to Sewing Floor</span>
        </Link>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Total Active SKU Lines
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            {totalSku} <span className="text-sm font-normal text-slate-500">SKUs</span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            Threads, Zippers, Buttons, Labels
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Below Re-Order Level (ROL)
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black font-mono ${
            lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900'
          }`}>
            {lowStockCount} <span className="text-sm font-normal text-slate-500">Items</span>
          </div>
          <p className="text-[11px] font-mono text-rose-600 mt-1">
            Immediate PR / PO Procurement Required
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Sewing Thread Stock
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <RotateCw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-700">
            {threadCount} <span className="text-sm font-normal text-slate-500">Cones</span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            5,000m Spun Poly Sewing Cones
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Polybags & Packaging
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">
            {polybagCount.toLocaleString()} <span className="text-sm font-normal text-slate-500">Pcs</span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            Bags & Heavy Duty 7-Ply Cartons
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by trim code, item name, bin location, or mill supplier..."
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'LOW_STOCK', 'SEWING_THREAD', 'ZIPPERS', 'BUTTONS', 'LABELS', 'PACKAGING', 'ELASTIC_TAPE'] as const).map(tab => {
            const label = tab === 'ALL' ? 'All Trims' : tab === 'LOW_STOCK' ? 'Low Stock (ROL)' : tab.replace('_', ' ')
            const active = categoryFilter === tab
            return (
              <button
                key={tab}
                onClick={() => setCategoryFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                  active 
                    ? tab === 'LOW_STOCK'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-[#3A3564] text-white shadow-2xs' 
                    : 'bg-[#FAF7F0] text-slate-600 hover:text-slate-900 border border-black/10'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Trims Inventory Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-black/10 font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Item Code</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Bin Location</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">ROL Threshold</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-medium text-slate-800">
              {filteredTrims.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-mono text-xs">
                    No trim items found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTrims.map(item => {
                  const isLow = item.currentStock <= item.reorderLevel

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-black text-slate-900">
                          {item.itemCode}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {item.supplierName}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {item.itemName}
                        </div>
                        {item.color && (
                          <div className="text-[11px] font-mono text-slate-500">
                            Color: {item.color}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase border border-slate-200">
                          {item.category.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 font-bold text-xs">
                          {item.binLocation}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span className={`text-sm font-black ${
                          isLow ? 'text-rose-600' : 'text-slate-900'
                        }`}>
                          {item.currentStock.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-slate-500 ml-1">
                          {item.unit}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-500">
                        {item.reorderLevel.toLocaleString()} {item.unit}
                      </td>

                      <td className="py-3 px-4">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-mono font-bold uppercase border border-rose-200">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock (Re-Order)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Healthy Stock
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openAdjustModal(item)}
                          className="px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-black/10 hover:bg-[#3A3564] hover:text-white text-xs font-mono font-bold text-[#3A3564] transition-colors shadow-2xs cursor-pointer"
                        >
                          Adjust / Inward
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AdjustTrimStockModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        item={selectedItem}
      />

    </div>
  )
}
