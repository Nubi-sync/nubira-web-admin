'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Scissors,
  ChevronLeft,
  Layers,
  Search,
  Plus,
  X,
  CheckCircle2,
  FileText,
  Printer,
  Calendar,
  AlertCircle
} from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { LaySheet, LaySheetStatus } from '../../types/cutting'
import { getLaySheets, saveLaySheet } from '../../utils/cuttingStorage'
import { getOrders } from '@/app/merchandising/utils/merchandisingStorage'
import { getFabricRolls } from '@/app/store/utils/storeStorage'
import { Sparkles } from 'lucide-react'

interface LaySheetsClientProps {
  initialLays?: LaySheet[]
}

export function LaySheetsClient({ initialLays }: LaySheetsClientProps = {}) {
  const [lays, setLays] = useState<LaySheet[]>(() => {
    if (initialLays && initialLays.length > 0) return initialLays
    return []
  })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedLay, setSelectedLay] = useState<LaySheet | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [availablePos, setAvailablePos] = useState<any[]>([])

  // Form state
  const [formData, setFormData] = useState({
    lay_number: 'LAY-2026-0842',
    po_number: 'PO-2026-9901',
    brand_name: 'ZARA INTERNATIONAL',
    style_ref: 'TP-2026-8801',
    style_name: 'Heavyweight Relaxed French Terry Hoodie',
    table_number: 'Table 01',
    shell_fabric: '100% Combed Cotton French Terry 380 GSM',
    gsm: 380,
    plies_count: 84,
    marker_length_meters: 5.4,
    total_cut_pieces: 1000,
    ratio_breakdown: 'S:1, M:2, L:2, XL:1 (Ratio: 6)',
    fabric_weight_kg: 500,
    fabric_roll_barcodes: 'ROL-2026-9901, ROL-2026-9902',
    cutting_master: 'R. Veerappan (Master Cutter)',
    status: 'SPREADING' as LaySheetStatus
  })

  useEffect(() => {
    if (initialLays && initialLays.length > 0) {
      setLays(initialLays)
      if (typeof window !== 'undefined') {
        localStorage.setItem('zigza_cutting_lays_v2', JSON.stringify(initialLays))
      }
    } else {
      setLays(getLaySheets())
    }

    if (typeof window !== 'undefined') {
      const pos = getOrders()
      const rolls = getFabricRolls()
      setAvailablePos(pos)

      const activePo = pos.find(p => p.po_number === 'PO-2026-9901') || pos[0]
      const rollCodes = rolls.length > 0 ? rolls.map(r => r.rollBarcode).join(', ') : 'ROL-2026-9901, ROL-2026-9902'

      if (activePo) {
        setFormData(prev => ({
          ...prev,
          po_number: activePo.po_number,
          brand_name: activePo.brand_name || 'ZARA INTERNATIONAL',
          style_ref: activePo.style_ref || 'TP-2026-8801',
          style_name: activePo.style_name || 'Heavyweight Relaxed French Terry Hoodie',
          total_cut_pieces: activePo.total_quantity || 1000,
          fabric_roll_barcodes: rollCodes
        }))
      }
    }
  }, [initialLays])

  const handleSelectPo = (poNumber: string) => {
    const found = availablePos.find(p => p.po_number === poNumber)
    if (found) {
      setFormData(prev => ({
        ...prev,
        po_number: found.po_number,
        brand_name: found.brand_name || 'ZARA INTERNATIONAL',
        style_ref: found.style_ref || 'TP-2026-8801',
        style_name: found.style_name || 'Heavyweight Relaxed French Terry Hoodie',
        total_cut_pieces: found.total_quantity || 1000
      }))
    } else {
      setFormData(prev => ({ ...prev, po_number: poNumber }))
    }
  }

  const applyPreset43 = () => {
    setFormData({
      lay_number: 'LAY-2026-0842',
      po_number: 'PO-2026-9901',
      brand_name: 'ZARA INTERNATIONAL',
      style_ref: 'TP-2026-8801',
      style_name: 'Heavyweight Relaxed French Terry Hoodie',
      table_number: 'Table 01',
      shell_fabric: '100% Combed Cotton French Terry 380 GSM',
      gsm: 380,
      plies_count: 84,
      marker_length_meters: 5.4,
      total_cut_pieces: 1000,
      ratio_breakdown: 'S:1, M:2, L:2, XL:1 (Ratio: 6)',
      fabric_weight_kg: 500,
      fabric_roll_barcodes: 'ROL-2026-9901, ROL-2026-9902',
      cutting_master: 'R. Veerappan (Master Cutter)',
      status: 'SPREADING'
    })
  }

  const filteredLays = lays.filter(lay => {
    const matchSearch =
      lay.lay_number.toLowerCase().includes(search.toLowerCase()) ||
      lay.po_number.toLowerCase().includes(search.toLowerCase()) ||
      lay.style_name.toLowerCase().includes(search.toLowerCase()) ||
      lay.brand_name.toLowerCase().includes(search.toLowerCase()) ||
      lay.shell_fabric.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || lay.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleAdvanceStatus = (lay: LaySheet) => {
    let next: LaySheetStatus = lay.status
    if (lay.status === 'SPREADING') next = 'READY_FOR_CUT'
    else if (lay.status === 'READY_FOR_CUT') next = 'CUT_IN_PROGRESS'
    else if (lay.status === 'CUT_IN_PROGRESS') next = 'CUT_COMPLETED'
    else if (lay.status === 'CUT_COMPLETED') next = 'BUNDLED'
    
    const updated = saveLaySheet({ ...lay, status: next })
    setLays(updated)
    if (selectedLay?.id === lay.id) {
      setSelectedLay({ ...lay, status: next })
    }
  }

  const handleCreateLay = (e: React.FormEvent) => {
    e.preventDefault()
    const newLay: LaySheet = {
      id: `lay-${Date.now()}`,
      lay_number: formData.lay_number || `LAY-2026-${Math.floor(100 + Math.random() * 900)}`,
      po_number: formData.po_number || 'PO-ZIG-AUTO',
      brand_name: formData.brand_name || 'In-House Brand',
      style_ref: formData.style_ref || 'STY-GEN-01',
      style_name: formData.style_name || 'Custom Garment Spec',
      table_number: formData.table_number,
      fabric_roll_barcodes: formData.fabric_roll_barcodes.split(',').map(s => s.trim()),
      shell_fabric: formData.shell_fabric || '100% Cotton Single Jersey',
      gsm: Number(formData.gsm) || 180,
      plies_count: Number(formData.plies_count) || 50,
      marker_length_meters: Number(formData.marker_length_meters) || 5.0,
      total_cut_pieces: Number(formData.total_cut_pieces) || 300,
      ratio_breakdown: formData.ratio_breakdown,
      fabric_weight_kg: Number(formData.fabric_weight_kg) || 75.0,
      cutting_master: formData.cutting_master,
      status: formData.status,
      created_at: new Date().toISOString()
    }

    const updated = saveLaySheet(newLay)
    setLays(updated)
    setIsCreateModalOpen(false)
  }

  // Summary figures
  const totalActiveLays = lays.length
  const totalPliesSpread = lays.reduce((acc, l) => acc + l.plies_count, 0)
  const totalFabricWeight = lays.reduce((acc, l) => acc + l.fabric_weight_kg, 0).toFixed(1)
  const completedRate = lays.length > 0
    ? Math.round((lays.filter(l => l.status === 'CUT_COMPLETED' || l.status === 'BUNDLED').length / lays.length) * 100)
    : 0

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
          <span className="text-xs font-mono font-bold text-slate-900">Spreading & Lay Sheets</span>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2e2a50] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Lay Sheet</span>
        </button>
      </div>

      {/* 2. Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Spreading & Lay Sheets Ledger
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
                Physical Lay Tracking
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Fabric roll barcode bindings, plies count, markers, ratio breakdown, and cutter sign-offs
            </p>
          </div>
        </div>
      </div>

      {/* 3. Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Total Lays Active</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">{totalActiveLays} runs</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Across 4 cutting tables</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Total Plies Spread</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">{totalPliesSpread} plies</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Single-ply & multi-ply lots</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Total Fabric Weight</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">{totalFabricWeight} kg</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Verified gross shell meterage</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Cut Completion Rate</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">{completedRate}%</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Progressed to bundles</p>
        </div>
      </div>

      {/* 4. Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search lay, PO, style, fabric..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
            />
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
            {(['ALL', 'SPREADING', 'READY_FOR_CUT', 'CUT_IN_PROGRESS', 'CUT_COMPLETED', 'BUNDLED'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-[#3A3564] text-white'
                    : 'bg-[#FAF7F0] text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Lay Sheets Data Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        {filteredLays.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No lay sheets found"
              description="Create a new lay run or adjust filters to view spreading ledger."
              actionLabel="New Lay Sheet"
              onAction={() => setIsCreateModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead className="bg-[#FAF7F0] text-[#3A3564] font-mono uppercase text-[10px] tracking-wider border-b border-black/10">
                <tr>
                  <th className="py-3 px-4 font-bold">Lay Ref / PO</th>
                  <th className="py-3 px-4 font-bold">Style & Fabric</th>
                  <th className="py-3 px-4 font-bold">Table</th>
                  <th className="py-3 px-4 font-bold">Plies & Pcs</th>
                  <th className="py-3 px-4 font-bold">Marker Spec</th>
                  <th className="py-3 px-4 font-bold">Cutting Master</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-medium">
                {filteredLays.map(lay => {
                  let badge = 'bg-[#FAF7F0] text-[#3A3564] border border-black/10'
                  if (lay.status === 'SPREADING' || lay.status === 'READY_FOR_CUT') {
                    badge = 'bg-slate-100 text-slate-700 border border-slate-200'
                  }

                  return (
                    <tr key={lay.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-900">{lay.lay_number}</div>
                        <div className="text-[10px] text-slate-500">{lay.po_number}</div>
                        <div className="text-[10px] text-slate-900 font-bold">{lay.brand_name}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{lay.style_name}</div>
                        <div className="text-[11px] text-slate-600 line-clamp-1">{lay.shell_fabric}</div>
                        <div className="text-[10px] font-mono text-slate-400">{lay.gsm} GSM</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#3A3564]">
                        {lay.table_number}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-slate-900">{lay.plies_count} plies</span>
                        <div className="text-[10px] text-slate-500">{lay.total_cut_pieces} cut pieces</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        <div>{lay.marker_length_meters}m length</div>
                        <div className="text-[10px] text-slate-500">{lay.ratio_breakdown}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {lay.cutting_master}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${badge}`}>
                          {lay.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {lay.status !== 'BUNDLED' && (
                            <button
                              onClick={() => handleAdvanceStatus(lay)}
                              className="px-2.5 py-1 rounded-lg bg-[#FAF7F0] hover:bg-white text-[#3A3564] border border-black/10 font-mono text-[10px] font-bold"
                              title="Advance Lay Status"
                            >
                              Advance
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedLay(lay)}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FAF7F0] border border-black/10 font-mono text-[11px] text-[#3A3564] font-bold shadow-2xs"
                          >
                            Dossier
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Lay Sheet Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-black/15 shadow-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <h3 className="font-bold text-base text-slate-900">Create New Lay Sheet</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step 4.3 Quick Fill Preset */}
            <div className="bg-[#FAF7F0] p-3 rounded-xl border border-black/10 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#3A3564]" />
                Step 4.3 Lay Preset:
              </span>
              <button
                type="button"
                onClick={applyPreset43}
                className="px-2.5 py-1 text-xs font-mono font-bold bg-white text-[#3A3564] border border-black/10 rounded-lg hover:bg-[#3A3564] hover:text-white transition-all shadow-2xs cursor-pointer"
              >
                LAY-2026-0842 (84 Plies • Table 01)
              </button>
            </div>

            <form onSubmit={handleCreateLay} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Lay Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LAY-2026-0842"
                    value={formData.lay_number}
                    onChange={e => setFormData({ ...formData, lay_number: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">PO Number</label>
                  <select
                    value={formData.po_number}
                    onChange={e => handleSelectPo(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono font-bold text-slate-900"
                  >
                    {availablePos.map(p => (
                      <option key={p.po_number} value={p.po_number}>
                        {p.po_number} ({p.brand_name || 'Buyer'})
                      </option>
                    ))}
                    {availablePos.length === 0 && (
                      <option value="PO-2026-9901">PO-2026-9901 (ZARA INTERNATIONAL)</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Brand / Client</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ZARA INTERNATIONAL"
                    value={formData.brand_name}
                    onChange={e => setFormData({ ...formData, brand_name: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Cutting Table</label>
                  <select
                    value={formData.table_number}
                    onChange={e => setFormData({ ...formData, table_number: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  >
                    <option value="Table 01">Table 01 (42m Gerber)</option>
                    <option value="Table 02">Table 02 (36m Lectra)</option>
                    <option value="Table 03">Table 03 (28m Eastman)</option>
                    <option value="Table 04">Table 04 (20m Kuris)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Style Ref</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TP-2026-8801"
                    value={formData.style_ref}
                    onChange={e => setFormData({ ...formData, style_ref: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Style Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Heavyweight Relaxed French Terry Hoodie"
                    value={formData.style_name}
                    onChange={e => setFormData({ ...formData, style_name: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono font-bold text-slate-700 uppercase">Shell Fabric Specification</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 100% Combed Cotton French Terry 380 GSM"
                  value={formData.shell_fabric}
                  onChange={e => setFormData({ ...formData, shell_fabric: e.target.value })}
                  className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">GSM</label>
                  <input
                    type="number"
                    value={formData.gsm}
                    onChange={e => setFormData({ ...formData, gsm: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Plies Count</label>
                  <input
                    type="number"
                    value={formData.plies_count}
                    onChange={e => setFormData({ ...formData, plies_count: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Total Cut Pieces</label>
                  <input
                    type="number"
                    value={formData.total_cut_pieces}
                    onChange={e => setFormData({ ...formData, total_cut_pieces: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Marker Length (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.marker_length_meters}
                    onChange={e => setFormData({ ...formData, marker_length_meters: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Size Ratio Breakdown</label>
                  <input
                    type="text"
                    value={formData.ratio_breakdown}
                    onChange={e => setFormData({ ...formData, ratio_breakdown: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono font-bold text-slate-700 uppercase">Fabric Roll Barcodes (comma separated)</label>
                <input
                  type="text"
                  value={formData.fabric_roll_barcodes}
                  onChange={e => setFormData({ ...formData, fabric_roll_barcodes: e.target.value })}
                  className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-mono font-bold text-slate-700 uppercase">Cutting Master Sign-Off</label>
                <input
                  type="text"
                  value={formData.cutting_master}
                  onChange={e => setFormData({ ...formData, cutting_master: e.target.value })}
                  className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-medium text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-black/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F0] hover:bg-slate-100 border border-black/10 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2e2a50] text-white text-xs font-bold"
                >
                  Create Lay Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Lay Dossier Modal */}
      {selectedLay && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-black/15 shadow-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Official Cutting Dossier</span>
                <h3 className="font-black text-lg text-slate-900">{selectedLay.lay_number}</h3>
              </div>
              <button onClick={() => setSelectedLay(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-[#FAF7F0]/60 border border-black/5">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Purchase Order</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedLay.po_number}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF7F0]/60 border border-black/5">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Brand / Client</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedLay.brand_name}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF7F0]/60 border border-black/5">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Style Specification</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedLay.style_ref}</p>
                <p className="text-slate-600 truncate">{selectedLay.style_name}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF7F0]/60 border border-black/5">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Cutting Master</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedLay.cutting_master}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF7F0]/60 border border-black/5 col-span-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Shell Fabric Spec</span>
                <p className="font-medium text-slate-800 mt-0.5">{selectedLay.shell_fabric} ({selectedLay.gsm} GSM)</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF7F0]/60 border border-black/5">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Plies & Pieces</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedLay.plies_count} plies • {selectedLay.total_cut_pieces} pcs</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF7F0]/60 border border-black/5">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Marker Length & Ratio</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedLay.marker_length_meters}m • {selectedLay.ratio_breakdown}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF7F0]/60 border border-black/5 col-span-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Fabric Roll Barcodes</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedLay.fabric_roll_barcodes.map(r => (
                    <span key={r} className="px-2 py-0.5 rounded bg-white border border-black/10 font-mono text-[10px] font-bold text-[#3A3564]">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-black/10 flex justify-end gap-2">
              <button
                onClick={() => setSelectedLay(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
