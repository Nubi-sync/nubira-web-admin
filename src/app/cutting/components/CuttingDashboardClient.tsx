'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Scissors,
  ChevronLeft,
  Layers,
  Ruler,
  QrCode,
  ArrowRight,
  Gauge,
  CheckCircle2,
  Boxes,
  Maximize2,
  Sparkles,
  Printer,
  Shirt,
  Clock,
  Plus,
  RefreshCw,
  X,
  AlertCircle
} from 'lucide-react'
import { CuttingTable, LaySheet, CutBundle, MarkerEfficiency, EndBitRemnant } from '../types/cutting'
import {
  getCuttingTables,
  saveCuttingTables,
  getLaySheets,
  getCutBundles,
  saveCutBundle,
  getMarkers,
  getEndBits
} from '../utils/cuttingStorage'

interface CuttingDashboardClientProps {
  userEmail?: string
  initialLays?: LaySheet[]
  initialBundles?: CutBundle[]
  liveKpis?: any
}

export function CuttingDashboardClient({ 
  userEmail,
  initialLays,
  initialBundles,
  liveKpis
}: CuttingDashboardClientProps) {
  const [tables, setTables] = useState<CuttingTable[]>([])
  const [laySheets, setLaySheets] = useState<LaySheet[]>(() => {
    if (initialLays && initialLays.length > 0) return initialLays
    return []
  })
  const [bundles, setBundles] = useState<CutBundle[]>(() => {
    if (initialBundles && initialBundles.length > 0) return initialBundles
    return []
  })
  const [markers, setMarkers] = useState<MarkerEfficiency[]>([])
  const [endBits, setEndBits] = useState<EndBitRemnant[]>([])
  const [selectedLay, setSelectedLay] = useState<LaySheet | null>(null)
  const [tableModal, setTableModal] = useState<CuttingTable | null>(null)

  useEffect(() => {
    const rawTables = getCuttingTables()
    
    if (initialLays && initialLays.length > 0) {
      setLaySheets(initialLays)
      if (typeof window !== 'undefined') {
        localStorage.setItem('zigza_cutting_lays_v1', JSON.stringify(initialLays))
      }
      
      // Dynamically attach live active lay to table
      const syncedTables = rawTables.map(t => {
        const found = initialLays.find(l => 
          l.table_number.toLowerCase().replace(/[^a-z0-9]/g, '') === t.table_number.toLowerCase().replace(/[^a-z0-9]/g, '') ||
          t.table_name.toLowerCase().includes(l.table_number.toLowerCase())
        )
        if (found) {
          return {
            ...t,
            current_lay_id: found.id,
            status: (found.status === 'CUT_COMPLETED' || (found.status as string) === 'COMPLETED') ? 'IDLE' : 'SPREADING'
          } as CuttingTable
        }
        return t
      })
      setTables(syncedTables)
    } else {
      setLaySheets(getLaySheets())
      setTables(rawTables)
    }

    if (initialBundles && initialBundles.length > 0) {
      setBundles(initialBundles)
      if (typeof window !== 'undefined') {
        localStorage.setItem('zigza_cutting_bundles_v1', JSON.stringify(initialBundles))
      }
    } else {
      setBundles(getCutBundles())
    }

    setMarkers(getMarkers())
    setEndBits(getEndBits())
  }, [initialLays, initialBundles])

  const handleTableStatusChange = (tableId: string, newStatus: CuttingTable['status']) => {
    const updated = tables.map(t => t.id === tableId ? { ...t, status: newStatus } : t)
    setTables(updated)
    saveCuttingTables(updated)
    if (tableModal?.id === tableId) {
      setTableModal({ ...tableModal, status: newStatus })
    }
  }

  const handleQuickAdvanceBundle = (bundleId: string) => {
    const b = bundles.find(x => x.id === bundleId)
    if (!b) return
    let nextStatus: CutBundle['status'] = b.status
    if (b.status === 'GENERATED') nextStatus = 'BANDED'
    else if (b.status === 'BANDED') nextStatus = 'IN_TRANSIT'
    else if (b.status === 'IN_TRANSIT') nextStatus = 'HANDOVER_CONFIRMED'
    
    const updated = saveCutBundle({ ...b, status: nextStatus })
    setBundles(updated)
  }

  // Derived metrics
  const totalPiecesCut = laySheets
    .filter(l => l.status === 'CUT_COMPLETED' || l.status === 'BUNDLED')
    .reduce((acc, curr) => acc + curr.total_cut_pieces, 0)

  const avgMarkerEff = markers.length > 0 
    ? (markers.reduce((acc, m) => acc + m.efficiency_percent, 0) / markers.length).toFixed(1)
    : '88.4'

  const activeBundlesInTransit = bundles.filter(b => b.status === 'IN_TRANSIT' || b.status === 'BANDED').length
  const totalRemnantsCount = endBits.filter(e => e.status === 'AVAILABLE_FOR_RECUT').length
  const totalRemnantMeters = endBits
    .filter(e => e.status === 'AVAILABLE_FOR_RECUT')
    .reduce((acc, e) => acc + e.usable_length_meters, 0)
    .toFixed(1)

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Link
            href="/modules"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Workspace Hub</span>
          </Link>
          <span className="text-slate-400 font-mono text-xs">/</span>
          <span className="text-xs font-mono font-bold text-slate-900">Division 03 • Cutting Floor</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            Vacuum Table Sync Active
          </span>
        </div>
      </div>

      {/* Module Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Cutting & Lay Floor
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                4 Tables Live
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Automated spreading plies, CAD marker efficiency, CNC vacuum knife execution, and QR bundle dispatch
            </p>
          </div>
        </div>

        {/* Quick Nav Chips */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <Link
            href="/cutting/lay-sheets"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-white border border-black/10 text-xs font-bold text-[#3A3564] transition-colors shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Lay Sheets</span>
          </Link>
          <Link
            href="/cutting/bundles"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-white border border-black/10 text-xs font-bold text-[#3A3564] transition-colors shadow-2xs"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Bundle QR</span>
          </Link>
          <Link
            href="/cutting/markers"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-white border border-black/10 text-xs font-bold text-[#3A3564] transition-colors shadow-2xs"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Markers</span>
          </Link>
          <Link
            href="/cutting/panel-qc"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-white border border-black/10 text-xs font-bold text-[#3A3564] transition-colors shadow-2xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Panel QC</span>
          </Link>
          <Link
            href="/cutting/end-bits"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-white border border-black/10 text-xs font-bold text-[#3A3564] transition-colors shadow-2xs"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>End-Bits</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Completed Cut Volume</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Scissors className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">{totalPiecesCut.toLocaleString()} pcs</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">From completed lay runs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">CAD Marker Yield</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">{avgMarkerEff}%</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Benchmark target &gt;86.0%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Active QR Bundles</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">{activeBundlesInTransit} in transit</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">{bundles.length} total generated</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Usable End-Bits</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-600">{totalRemnantMeters} m</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">{totalRemnantsCount} remnants in recut rack</p>
        </div>
      </div>

      {/* Cutting Tables Real-Time Grid */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Cutting Tables & Vacuum Stations</h2>
            <p className="text-xs text-slate-500 mt-0.5">Physical table allocations and automated cutter live states</p>
          </div>
          <div className="text-xs font-mono text-slate-500">
            Click table card to reassign status
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {tables.map(table => {
            const activeLay = laySheets.find(l => l.id === table.current_lay_id)
            let statusBadge = 'bg-slate-100 text-slate-700 border-slate-200'
            if (table.status === 'SPREADING') statusBadge = 'bg-amber-50 text-amber-800 border-amber-200'
            if (table.status === 'CUTTING') statusBadge = 'bg-sky-50 text-sky-800 border-sky-200'
            if (table.status === 'IDLE') statusBadge = 'bg-slate-100 text-slate-600 border-slate-200'
            if (table.status === 'MAINTENANCE') statusBadge = 'bg-rose-50 text-rose-800 border-rose-200'

            return (
              <div 
                key={table.id}
                onClick={() => setTableModal(table)}
                className="p-4 rounded-xl border border-black/10 bg-[#FAF7F0]/30 hover:bg-[#FAF7F0] transition-all cursor-pointer space-y-3 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-[#3A3564] uppercase">{table.table_number}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-bold uppercase ${statusBadge}`}>
                      {table.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 leading-snug">{table.table_name}</h3>
                  <div className="mt-2 space-y-1 text-xs text-slate-600 font-mono">
                    <p>Bed: {table.length_meters}m × {table.width_inches}&quot; width</p>
                    <p className="text-[11px] text-slate-500 truncate">{table.auto_cutter_model}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-black/5">
                  {activeLay ? (
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono uppercase text-slate-500">Active Job:</span>
                      <p className="text-xs font-bold text-slate-900 truncate">{activeLay.lay_number}</p>
                      <p className="text-[11px] text-slate-600 truncate">{activeLay.style_name}</p>
                      <p className="text-[10px] font-mono text-emerald-700 font-bold">{activeLay.plies_count} plies • {activeLay.total_cut_pieces} pcs</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No lay currently spread</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Active Lay Runs & Immediate Dispatch Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Lay Queue (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Active Lay Sheets Queue</h2>
              <p className="text-xs text-slate-500 mt-0.5">Roll barcodes, marker lengths, and cutting master sign-offs</p>
            </div>
            <Link
              href="/cutting/lay-sheets"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#3A3564] hover:underline"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F0] text-[#3A3564] font-mono uppercase text-[10px] tracking-wider border-y border-black/10">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Lay Ref</th>
                  <th className="py-2.5 px-3 font-bold">Style & Fabric</th>
                  <th className="py-2.5 px-3 font-bold">Plies / Pcs</th>
                  <th className="py-2.5 px-3 font-bold">Table</th>
                  <th className="py-2.5 px-3 font-bold">Status</th>
                  <th className="py-2.5 px-3 font-bold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-medium">
                {laySheets.slice(0, 5).map(lay => {
                  let badge = 'bg-slate-100 text-slate-700'
                  if (lay.status === 'SPREADING') badge = 'bg-amber-100 text-amber-800'
                  if (lay.status === 'READY_FOR_CUT') badge = 'bg-purple-100 text-purple-800'
                  if (lay.status === 'CUT_IN_PROGRESS') badge = 'bg-sky-100 text-sky-800'
                  if (lay.status === 'CUT_COMPLETED') badge = 'bg-emerald-100 text-emerald-800'
                  if (lay.status === 'BUNDLED') badge = 'bg-teal-100 text-teal-800'

                  return (
                    <tr key={lay.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {lay.lay_number}
                        <div className="text-[10px] text-slate-500 font-normal">{lay.po_number}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 line-clamp-1">{lay.style_name}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{lay.shell_fabric}</div>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className="font-bold text-slate-900">{lay.plies_count} plies</span>
                        <div className="text-[10px] text-slate-500">{lay.total_cut_pieces} pieces</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">{lay.table_number}</td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${badge}`}>
                          {lay.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedLay(lay)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-black/10 hover:bg-[#FAF7F0] font-mono text-[11px] text-[#3A3564] font-bold shadow-2xs"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Handover Pipeline (1 Col) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Department Handover</h2>
              <p className="text-xs text-slate-500 mt-0.5">QR Bundle dispatch to next processes</p>
            </div>
            <Link
              href="/cutting/bundles"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#3A3564] hover:underline"
            >
              <span>Bundles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {bundles.slice(0, 4).map(bundle => {
              let destIcon = <Shirt className="w-3.5 h-3.5" />
              let destName = 'Sewing Floor'
              if (bundle.destination === '04_PRINTING') {
                destIcon = <Printer className="w-3.5 h-3.5" />
                destName = 'Screen Print'
              } else if (bundle.destination === '05_EMBROIDERY') {
                destIcon = <Sparkles className="w-3.5 h-3.5" />
                destName = 'Embroidery'
              }

              let stBadge = 'bg-slate-100 text-slate-700'
              if (bundle.status === 'GENERATED') stBadge = 'bg-amber-100 text-amber-800'
              if (bundle.status === 'BANDED') stBadge = 'bg-purple-100 text-purple-800'
              if (bundle.status === 'IN_TRANSIT') stBadge = 'bg-sky-100 text-sky-800'
              if (bundle.status === 'HANDOVER_CONFIRMED') stBadge = 'bg-emerald-100 text-emerald-800'

              return (
                <div key={bundle.id} className="p-3 rounded-xl border border-black/10 bg-[#FAF7F0]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">{bundle.bundle_number}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${stBadge}`}>
                      {bundle.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Size: <strong className="text-slate-900">{bundle.size}</strong> ({bundle.pieces_count} pcs)</span>
                    <div className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#3A3564]">
                      {destIcon}
                      <span>{destName}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-black/5">
                    <span className="text-[10px] font-mono text-slate-500">Plies: {bundle.ply_range_start}-{bundle.ply_range_end}</span>
                    {bundle.status !== 'HANDOVER_CONFIRMED' && (
                      <button
                        onClick={() => handleQuickAdvanceBundle(bundle.id)}
                        className="px-2 py-0.5 rounded bg-white hover:bg-[#FAF7F0] border border-black/10 text-[10px] font-mono font-bold text-[#3A3564]"
                      >
                        Advance Step →
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Table Status Modal */}
      {tableModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-black/15 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/10">
              <h3 className="font-bold text-base text-slate-900">Manage {tableModal.table_number}</h3>
              <button onClick={() => setTableModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <p><strong>Table Name:</strong> {tableModal.table_name}</p>
              <p><strong>Dimensions:</strong> {tableModal.length_meters}m length × {tableModal.width_inches}&quot; bed</p>
              <p><strong>Vacuum Type:</strong> {tableModal.vacuum_type}</p>
              <p><strong>Automated Cutter:</strong> {tableModal.auto_cutter_model}</p>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-mono font-bold text-slate-700 uppercase">Update Floor Status:</label>
              <div className="grid grid-cols-2 gap-2">
                {(['IDLE', 'SPREADING', 'CUTTING', 'MAINTENANCE'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => handleTableStatusChange(tableModal.id, st)}
                    className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                      tableModal.status === st
                        ? 'bg-[#3A3564] text-white border-[#3A3564]'
                        : 'bg-[#FAF7F0] text-slate-700 border-black/10 hover:bg-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-black/10 flex justify-end">
              <button
                onClick={() => setTableModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lay Sheet Details Modal */}
      {selectedLay && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-black/15 shadow-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Lay Sheet Dossier</span>
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
                <span className="text-[10px] font-mono text-slate-500 uppercase">Style Reference</span>
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
              <Link
                href="/cutting/lay-sheets"
                className="px-4 py-2 rounded-xl bg-[#FAF7F0] hover:bg-slate-100 border border-black/10 text-xs font-bold text-[#3A3564]"
              >
                Go to Lay Sheet Ledger
              </Link>
              <button
                onClick={() => setSelectedLay(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
