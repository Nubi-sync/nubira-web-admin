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
  AlertCircle,
  Building2,
  Users,
  Search,
  ChevronDown,
  Check,
  ShoppingBag,
  Cpu,
  Bot
} from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
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
  isSuperAdmin?: boolean
  initialLays?: LaySheet[]
  initialBundles?: CutBundle[]
  liveKpis?: any
  initialBuyers?: any[]
}

export function CuttingDashboardClient({ 
  userEmail,
  isSuperAdmin = false,
  initialLays,
  initialBundles,
  liveKpis,
  initialBuyers
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

  // Active Buyers for Contract Selection
  const [buyers, setBuyers] = useState<any[]>(() => {
    if (initialBuyers && initialBuyers.length > 0) return initialBuyers
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('zigza_active_buyers_v3')
        if (raw) return JSON.parse(raw)
      } catch {}
    }
    return []
  })
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('')
  const [isBuyerMenuOpen, setIsBuyerMenuOpen] = useState(false)
  const [buyerSearchQuery, setBuyerSearchQuery] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)

  // Auto-sync buyers if updated in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleStorageChange = () => {
        try {
          const raw = localStorage.getItem('zigza_active_buyers_v3')
          if (raw) {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setBuyers(parsed)
            }
          }
        } catch {}
      }
      window.addEventListener('storage', handleStorageChange)
      return () => window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  useEffect(() => {
    const rawTables = getCuttingTables()
    
    if (initialLays && initialLays.length > 0) {
      setLaySheets(initialLays)
      if (typeof window !== 'undefined') {
        localStorage.setItem('zigza_cutting_lays_v2', JSON.stringify(initialLays))
      }
      
      // Dynamically attach live active lay to table and clear mock lay IDs
      const cleanTbl = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '')
      const syncedTables = rawTables.map(t => {
        const cleanT = cleanTbl(t.table_number)
        const found = initialLays.find(l => {
          const cleanL = cleanTbl(l.table_number)
          return cleanL === cleanT || cleanT.includes(cleanL) || cleanL.includes(cleanT)
        })
        if (found) {
          return {
            ...t,
            current_lay_id: found.id,
            status: (found.status === 'CUT_COMPLETED' || (found.status as string) === 'COMPLETED') ? 'IDLE' : 'SPREADING'
          } as CuttingTable
        }
        return {
          ...t,
          current_lay_id: undefined,
          status: 'IDLE'
        } as CuttingTable
      })
      setTables(syncedTables)
    } else {
      setLaySheets(getLaySheets())
      setTables(rawTables)
    }

    if (initialBundles && initialBundles.length > 0) {
      setBundles(initialBundles)
      if (typeof window !== 'undefined') {
        localStorage.setItem('zigza_cutting_bundles_v2', JSON.stringify(initialBundles))
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

  const handleManualSync = () => {
    setIsSyncing(true)
    if (typeof window !== 'undefined') {
      try {
        const rawBuyers = localStorage.getItem('zigza_active_buyers_v3')
        if (rawBuyers) setBuyers(JSON.parse(rawBuyers))
        const rawLays = localStorage.getItem('zigza_cutting_lays_v2')
        if (rawLays) setLaySheets(JSON.parse(rawLays))
        const rawBundles = localStorage.getItem('zigza_cutting_bundles_v2')
        if (rawBundles) setBundles(JSON.parse(rawBundles))
      } catch {}
    }
    setTimeout(() => {
      setIsSyncing(false)
    }, 400)
  }

  // Determine active selected buyer
  const activeSelectedBuyerId = selectedBuyerId && buyers.some(b => b.id === selectedBuyerId)
    ? selectedBuyerId
    : (buyers[0]?.id || '')

  const selectedBuyer = buyers.find(b => b.id === activeSelectedBuyerId) || (buyers.length > 0 ? buyers[0] : null)

  const filteredBuyersList = buyers.filter(b =>
    (b.buyer_name || '').toLowerCase().includes(buyerSearchQuery.toLowerCase()) ||
    (b.buyer_code || '').toLowerCase().includes(buyerSearchQuery.toLowerCase()) ||
    (b.brand_name && b.brand_name.toLowerCase().includes(buyerSearchQuery.toLowerCase())) ||
    (b.linked_article_number && b.linked_article_number.toLowerCase().includes(buyerSearchQuery.toLowerCase()))
  )

  const selectedBuyerDisplayText = selectedBuyer
    ? `${selectedBuyer.buyer_name} (${(Number(selectedBuyer.contracted_volume) || 0).toLocaleString('en-IN')} Pcs)`
    : (buyers.length === 0 ? 'No Active Buyers Contracted' : 'Select Buyer Contract')

  // Piece metrics calculation for the selected buyer
  const inHandPieces = selectedBuyer ? (Number(selectedBuyer.contracted_volume) || 0) : 0
  const articleNum = (selectedBuyer?.linked_article_number || '').trim().toUpperCase()

  // Completed cutting pieces for the selected buyer/article
  const completedCuttingPieces = laySheets
    .filter(l => {
      const isDone = l.status === 'CUT_COMPLETED' || (l.status as string) === 'COMPLETED' || l.status === 'BUNDLED'
      if (!isDone) return false
      if (!articleNum) return true
      const sRef = (l.style_ref || '').trim().toUpperCase()
      const sName = (l.style_name || '').trim().toUpperCase()
      return sRef === articleNum || sRef.includes(articleNum) || sName.includes(articleNum)
    })
    .reduce((sum, curr) => sum + (Number(curr.total_cut_pieces) || 0), 0)

  const pendingCuttingPieces = Math.max(0, inHandPieces - completedCuttingPieces)

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <>
              <Link
                href="/modules"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Workspace Hub</span>
              </Link>
              <span className="text-slate-400 font-mono text-xs">/</span>
            </>
          )}
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
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Cutting & Lay Floor
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
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
            href="/cutting/markers"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-white border border-black/10 text-xs font-bold text-[#3A3564] transition-colors shadow-2xs"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>CAD Markers</span>
          </Link>
          <Link
            href="/cutting/orders"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-white border border-black/10 text-xs font-bold text-[#3A3564] transition-colors shadow-2xs"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Cutting Orders</span>
          </Link>
          <Link
            href="/cutting/bundles"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-white border border-black/10 text-xs font-bold text-[#3A3564] transition-colors shadow-2xs"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Bundle QR</span>
          </Link>
          <Link
            href="/cutting/zigza-ai"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-white border border-black/10 text-xs font-bold text-[#3A3564] transition-colors shadow-2xs"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Zigza AI</span>
          </Link>
        </div>
      </div>

      {/* Buyer Selection & Sync Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        
        {/* Left: Active Buyer Info Pill */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Selected Buyer Contract
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span>{selectedBuyer ? selectedBuyer.buyer_name : 'No Active Buyers'}</span>
              {selectedBuyer?.linked_article_number && (
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                  {selectedBuyer.linked_article_number}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Buyer Selector Dropdown & Sync */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-end">
          
          {/* Buyer Selector Searchable Dropdown */}
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <button
              type="button"
              onClick={() => setIsBuyerMenuOpen(!isBuyerMenuOpen)}
              className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-black/10 bg-[#FAF7F0] hover:bg-[#F2ECE1] text-xs sm:text-sm font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <Users className="w-4 h-4 text-[#3A3564] shrink-0" />
                <span className="truncate">{selectedBuyerDisplayText}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${isBuyerMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isBuyerMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-80 bg-white rounded-xl border border-black/10 shadow-xl z-30 p-2 space-y-1.5 animate-in fade-in zoom-in-95">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={buyerSearchQuery}
                    onChange={e => setBuyerSearchQuery(e.target.value)}
                    placeholder="Search buyers..."
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-black/10 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#3A3564]"
                    autoFocus
                  />
                </div>
                <div className="max-h-56 overflow-y-auto space-y-0.5 pt-1">
                  {filteredBuyersList.length === 0 ? (
                    <div className="py-3 px-2 text-center text-xs text-slate-400">
                      No buyers found
                    </div>
                  ) : (
                    filteredBuyersList.map(b => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setSelectedBuyerId(b.id)
                          setIsBuyerMenuOpen(false)
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-between ${
                          activeSelectedBuyerId === b.id
                            ? 'bg-[#3A3564] text-white font-bold'
                            : 'text-slate-700 hover:bg-[#FAF7F0]'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="font-bold">{b.buyer_name}</div>
                          <div className={`text-[10px] font-mono mt-0.5 ${activeSelectedBuyerId === b.id ? 'text-indigo-200' : 'text-slate-500'}`}>
                            {(Number(b.contracted_volume) || 0).toLocaleString('en-IN')} Pcs {b.linked_article_number ? `• ${b.linked_article_number}` : '• Pending Link'}
                          </div>
                        </div>
                        {activeSelectedBuyerId === b.id && <Check className="w-4 h-4 text-white shrink-0" />}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Refresh Sync Button */}
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="p-2.5 rounded-xl border border-black/10 bg-[#FAF7F0] hover:bg-[#F2ECE1] text-[#3A3564] transition-all cursor-pointer shadow-2xs flex items-center justify-center shrink-0"
            title="Sync latest live updates from floor modules"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3 Summary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        
        {/* 1. In Hand */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              In Hand
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-slate-900">
              {inHandPieces.toLocaleString('en-IN')}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {selectedBuyer ? `Contracted BPO pieces for ${selectedBuyer.buyer_name}` : 'Contracted BPO volume'}
            </p>
          </div>
        </div>

        {/* 2. Pending Cutting */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Pending Cutting
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-slate-900">
              {pendingCuttingPieces.toLocaleString('en-IN')}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Pieces pending table allocation &amp; cut
            </p>
          </div>
        </div>

        {/* 3. Completed Cutting */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Completed Cutting
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Scissors className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-slate-900">
              {completedCuttingPieces.toLocaleString('en-IN')}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Cut panels verified &amp; bundled
            </p>
          </div>
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
            let statusBadge = 'bg-[#FAF7F0] text-[#3A3564] border-black/10'
            if (table.status === 'IDLE') statusBadge = 'bg-slate-100 text-slate-600 border-slate-200'
            if (table.status === 'MAINTENANCE') statusBadge = 'bg-slate-200 text-slate-800 border-slate-300'

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
                      <p className="text-[10px] font-mono text-slate-700 font-semibold">{activeLay.plies_count} plies • {activeLay.total_cut_pieces} pcs</p>
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

          {laySheets.length === 0 ? (
            <div className="py-8">
              <EmptyState
                title="No active lay sheets queued"
                description="Spreading jobs and ply allocations will appear here once scheduled."
                actionLabel="Create Lay Sheet"
                onAction={() => { window.location.href = '/cutting/lay-sheets' }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[560px]">
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
                    let badge = 'bg-[#FAF7F0] text-[#3A3564] border border-black/10'
                    if (lay.status === 'SPREADING' || lay.status === 'READY_FOR_CUT') {
                      badge = 'bg-slate-100 text-slate-700 border border-slate-200'
                    }

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
          )}
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

          {bundles.length === 0 ? (
            <div className="py-6">
              <EmptyState
                compact
                title="No bundles awaiting handover"
                description="QR bundles will list here once generated."
                actionLabel="Generate Bundles"
                onAction={() => { window.location.href = '/cutting/bundles' }}
              />
            </div>
          ) : (
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

                let stBadge = 'bg-[#FAF7F0] text-[#3A3564] border border-black/10'
                if (bundle.status === 'HANDOVER_CONFIRMED') {
                  stBadge = 'bg-slate-900 text-white border border-slate-900'
                }

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
          )}
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
