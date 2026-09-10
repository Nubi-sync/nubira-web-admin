'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Warehouse, 
  Package, 
  Truck, 
  Boxes, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RotateCw, 
  LogOut, 
  Search, 
  Plus, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  Trash2, 
  Check, 
  Sparkles, 
  User, 
  Layers, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Tv, 
  AlertCircle,
  Tag,
  Receipt,
  Download,
  Send
} from 'lucide-react'
import { TvViewButton } from '@/components/ui/TvViewButton'
import { 
  createTruckInwardGrn, 
  issueBomMaterials, 
  saveProductionInward, 
  saveFinishedGoodsOutward,
  deleteTruckInward, 
  deleteStoreTransaction, 
  deleteAccessory, 
  deleteAccessoryByName,
  TruckInwardItemInput,
  BomMaterialItemState
} from '../actions'

// Types
export type Article = {
  id: string
  art_no: string
  description?: string | null
  stitching_rate?: number | null
}

export type StoreTransaction = {
  id: string
  entry_date?: string | null
  created_at: string
  type: 'INWARD' | 'OUTWARD'
  quantity: number
  color?: string | null
  size?: string | null
  party_name?: string | null
  challan_no?: string | null
  transport_no?: string | null
  notes?: string | null
  lineman_name?: string | null
  mending_name?: string | null
  qc_supervisor_name?: string | null
  receiver_name?: string | null
  allotment_id?: string | null
  challan_id?: string | null
  article?: Article | null
}

export type Accessory = {
  id: string
  entry_date?: string | null
  created_at: string
  item_name: string
  action: 'IN' | 'OUT'
  quantity: number
  unit?: string | null
  party_name?: string | null
  notes?: string | null
}

export type TruckInwardItem = {
  id: string
  item_name: string
  size_label?: string | null
  size_color?: string | null
  quantity: number
  challan_qty?: number | null
  unit?: string | null
  status: 'RECEIVED' | 'SHORTAGE' | 'DUE' | 'DEFECTIVE'
  shortage_qty?: number | null
  remarks?: string | null
}

export type TruckInward = {
  id: string
  grn_no: string
  party_name: string
  article_no?: string | null
  challan_no?: string | null
  inward_date: string
  truck_no?: string | null
  challan_photo_url?: string | null
  receiver_name?: string | null
  status: 'VERIFIED' | 'SHORTAGE' | 'DUE_PENDING'
  total_items: number
  due_items_count: number
  shortage_items_count: number
  notes?: string | null
  line_items?: any[] | null
  created_at: string
  items?: TruckInwardItem[]
}

export type ActiveAllotment = {
  id: string
  target_qty: number
  allotment_date?: string | null
  status: string
  created_at: string
  article?: Article | null
  lineman?: { id: string; username: string } | null
  challans?: { id: string; challan_no: string; brand: string; fabric_type: string } | null
  allotment_variants?: Array<{ id: string; color: string; size: string; quantity: number }> | null
  allotment_materials?: Array<{
    id: string
    allotment_id: string
    item_name: string
    required_qty: string | number
    admin_issued?: boolean | null
    lineman_received?: boolean | null
    notes?: string | null
    created_at: string
  }> | null
}

export type ReadyQcAllotment = {
  id: string
  target_qty: number
  qc_total_passed?: number | null
  qc_total_alter?: number | null
  qc_status?: string | null
  qc_supervisor_name?: string | null
  qc_passed_at?: string | null
  mending_supervisor_name?: string | null
  store_inward_status?: string | null
  admin_approved_at?: string | null
  admin_approved_by?: string | null
  created_at: string
  article?: Article | null
  lineman?: { id: string; username: string } | null
  challans?: { id: string; challan_no: string; brand: string; fabric_type: string } | null
  allotment_variants?: Array<{ id: string; color: string; size: string; quantity: number }> | null
}

interface StoreDashboardClientProps {
  currentUserName: string
  userEmail: string
  articles: Article[]
  storeTransactions: StoreTransaction[]
  accessories: Accessory[]
  truckInwards: TruckInward[]
  activeAllotments: ActiveAllotment[]
  readyQcAllotments: ReadyQcAllotment[]
}

export function StoreDashboardClient({
  currentUserName,
  userEmail,
  articles,
  storeTransactions,
  accessories,
  truckInwards,
  activeAllotments,
  readyQcAllotments,
}: StoreDashboardClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Feed Filter States
  const [feedTimeFilter, setFeedTimeFilter] = useState<'24h' | '7d' | 'all'>('24h')
  const [feedCategoryFilter, setFeedCategoryFilter] = useState<'ALL' | 'BOM' | 'TRIMS' | 'GARMENTS'>('ALL')
  const [feedSearchQuery, setFeedSearchQuery] = useState('')
  const [expandedBOMKeys, setExpandedBOMKeys] = useState<Set<string>>(new Set())
  const [expandedGrnId, setExpandedGrnId] = useState<string | null>(null)

  // Modal Triggers
  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false)
  const [isBomModalOpen, setIsBomModalOpen] = useState(false)
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false)
  const [isOutwardModalOpen, setIsOutwardModalOpen] = useState(false)
  const [activePhoto, setActivePhoto] = useState<{ url: string; title: string } | null>(null)
  const [prefilledLotForInward, setPrefilledLotForInward] = useState<ReadyQcAllotment | null>(null)

  // Delete Target State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'TRUCK_INWARD' | 'STORE_TRANSACTION' | 'ACCESSORY' | 'ACCESSORY_BY_NAME'
    id: string
    title: string
    subtitle?: string
  } | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Handle Refresh
  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  // Helper to Clean Article Description
  const getCleanDescription = (desc?: string | null) => {
    if (!desc) return ''
    return desc.replace(/\[.*?\]/g, '').trim()
  }

  // ----------------------------------------------------
  // AGGREGATE CALCULATIONS & METRICS
  // ----------------------------------------------------
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  const {
    totalFinishedStock,
    todayOutward,
    todayTruckCount,
    articleStockMap,
    variantStockMap
  } = useMemo(() => {
    let totalIn = 0
    let totalOut = 0
    let tOutward = 0
    const artStock: Record<string, number> = {}
    const varStock: Record<string, number> = {}

    storeTransactions.forEach(tx => {
      const qty = Number(tx.quantity) || 0
      const type = tx.type || 'INWARD'
      const artId = tx.article?.id || 'UNKNOWN'
      const color = (tx.color || '').toLowerCase().trim()
      const size = (tx.size || '').toLowerCase().trim()
      const varKey = `${artId}_${color}_${size}`
      const entryDate = tx.entry_date || (tx.created_at ? tx.created_at.split('T')[0] : '')

      if (type === 'INWARD') {
        totalIn += qty
        artStock[artId] = (artStock[artId] || 0) + qty
        varStock[varKey] = (varStock[varKey] || 0) + qty
      } else if (type === 'OUTWARD') {
        totalOut += qty
        artStock[artId] = (artStock[artId] || 0) - qty
        varStock[varKey] = (varStock[varKey] || 0) - qty
        if (entryDate === todayStr) {
          tOutward += qty
        }
      }
    })

    const tTrucks = truckInwards.filter(t => (t.inward_date || '').split('T')[0] === todayStr).length

    return {
      totalFinishedStock: Math.max(0, totalIn - totalOut),
      todayOutward: tOutward,
      todayTruckCount: tTrucks,
      articleStockMap: artStock,
      variantStockMap: varStock
    }
  }, [storeTransactions, truckInwards, todayStr])

  // Count pending allotments awaiting BOM material handover
  const pendingBomAllotments = useMemo(() => {
    return activeAllotments.filter(al => {
      const mats = al.allotment_materials || []
      if (mats.length === 0) return true
      return mats.some(m => !m.admin_issued)
    })
  }, [activeAllotments])

  const pendingHandoverCount = pendingBomAllotments.length

  // Helper to extract variants for an article from active allotments
  const getVariantsForArticle = (articleId?: string | null) => {
    if (!articleId) return []
    const variants: Array<{ id: string; color: string; size: string; allotment_qty: number }> = []
    activeAllotments.forEach(al => {
      if (al.article?.id === articleId && al.allotment_variants) {
        al.allotment_variants.forEach(v => {
          variants.push({
            id: v.id,
            color: v.color || 'Default',
            size: v.size || 'Standard',
            allotment_qty: v.quantity || 0,
          })
        })
      }
    })
    return variants
  }

  // ----------------------------------------------------
  // SMART BOM BATCH ACTIVITY FEED
  // ----------------------------------------------------
  const combinedStoreLogs = useMemo(() => {
    const groupedBOMMap: Record<string, any> = {}
    const combined: any[] = []

    // 1. Process Accessories Logs (Group BOM Handover packages)
    accessories.forEach(acc => {
      const notes = acc.notes || ''
      const isBOM = notes.includes('BOM Handover') || notes.includes('BOM Package')

      if (isBOM) {
        const uuidMatch = notes.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/)
        const allotmentId = uuidMatch ? uuidMatch[0] : (acc.party_name || '')

        const chMatch = notes.match(/Challan #([^\s•]+)/)
        const challanStr = chMatch ? chMatch[1] : ''

        const createdAt = acc.created_at || ''
        const timeMinute = createdAt.length >= 16 ? createdAt.substring(0, 16) : (acc.entry_date || '')
        const partyName = acc.party_name || 'Issued to Lineman'
        const groupKey = `BOM_${allotmentId}_${timeMinute}_${partyName}`

        const itemName = acc.item_name || 'Material Item'
        const qty = Number(acc.quantity) || 0
        const unit = acc.unit || 'pcs'

        if (!groupedBOMMap[groupKey]) {
          groupedBOMMap[groupKey] = {
            isGroupedBOM: true,
            isAccessory: true,
            id: groupKey,
            groupKey,
            created_at: acc.created_at,
            entry_date: acc.entry_date,
            party_name: partyName,
            challan_no: challanStr,
            allotment_id: allotmentId,
            total_items_count: 0,
            total_units_count: 0,
            items: [],
            notes,
          }
        }

        groupedBOMMap[groupKey].total_items_count += 1
        groupedBOMMap[groupKey].total_units_count += qty
        groupedBOMMap[groupKey].items.push({
          name: itemName,
          qty,
          unit,
        })
      } else {
        combined.push({
          isGroupedBOM: false,
          isAccessory: true,
          id: acc.id,
          created_at: acc.created_at,
          entry_date: acc.entry_date,
          action: acc.action,
          item_name: acc.item_name,
          quantity: Number(acc.quantity) || 0,
          unit: acc.unit || 'pcs',
          party_name: acc.party_name,
          notes: acc.notes,
        })
      }
    })

    // Add grouped BOM packages
    Object.values(groupedBOMMap).forEach(grouped => {
      combined.push(grouped)
    })

    // 2. Add Garment Inward/Outward Transactions
    storeTransactions.forEach(tx => {
      combined.push({
        isGroupedBOM: false,
        isAccessory: false,
        id: tx.id,
        created_at: tx.created_at,
        entry_date: tx.entry_date,
        type: tx.type,
        quantity: Number(tx.quantity) || 0,
        art_no: tx.article?.art_no || '-',
        description: tx.article?.description || '',
        color: tx.color,
        size: tx.size,
        party_name: tx.party_name,
        challan_no: tx.challan_no,
        notes: tx.notes,
        lineman_name: tx.lineman_name,
        mending_name: tx.mending_name,
        qc_supervisor_name: tx.qc_supervisor_name,
        receiver_name: tx.receiver_name,
      })
    })

    // Sort descending by created_at
    combined.sort((a, b) => {
      const tA = a.created_at || a.entry_date || ''
      const tB = b.created_at || b.entry_date || ''
      return tB.localeCompare(tA)
    })

    return combined
  }, [accessories, storeTransactions])

  // Filtered store logs based on Time, Category, and Search
  const filteredStoreLogs = useMemo(() => {
    const now = Date.now()
    const oneDayAgo = now - 24 * 60 * 60 * 1000
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000

    return combinedStoreLogs.filter(log => {
      // 1. Time Filter
      if (feedTimeFilter === '24h') {
        const logTime = log.created_at ? new Date(log.created_at).getTime() : 0
        const isEntryToday = log.entry_date === todayStr
        if (logTime < oneDayAgo && !isEntryToday) return false
      } else if (feedTimeFilter === '7d') {
        const logTime = log.created_at ? new Date(log.created_at).getTime() : 0
        if (logTime < sevenDaysAgo) return false
      }

      // 2. Category Filter
      if (feedCategoryFilter === 'BOM') {
        if (!log.isGroupedBOM) return false
      } else if (feedCategoryFilter === 'TRIMS') {
        if (!log.isAccessory || log.isGroupedBOM) return false
      } else if (feedCategoryFilter === 'GARMENTS') {
        if (log.isAccessory) return false
      }

      // 3. Search Query
      if (feedSearchQuery) {
        const q = feedSearchQuery.toLowerCase()
        const matchItem = (log.item_name || log.art_no || '').toLowerCase().includes(q)
        const matchParty = (log.party_name || '').toLowerCase().includes(q)
        const matchChallan = (log.challan_no || '').toLowerCase().includes(q)
        const matchNotes = (log.notes || '').toLowerCase().includes(q)
        const matchItems = log.items ? log.items.some((it: any) => it.name.toLowerCase().includes(q)) : false
        if (!matchItem && !matchParty && !matchChallan && !matchNotes && !matchItems) {
          return false
        }
      }

      return true
    })
  }, [combinedStoreLogs, feedTimeFilter, feedCategoryFilter, feedSearchQuery, todayStr])

  const toggleBOMAccordion = (groupKey: string) => {
    setExpandedBOMKeys(prev => {
      const next = new Set(prev)
      if (next.has(groupKey)) {
        next.delete(groupKey)
      } else {
        next.add(groupKey)
      }
      return next
    })
  }

  // Deletion confirm
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    setDeleteError(null)
    startTransition(async () => {
      let res: any
      if (deleteTarget.type === 'TRUCK_INWARD') {
        res = await deleteTruckInward(deleteTarget.id)
      } else if (deleteTarget.type === 'STORE_TRANSACTION') {
        res = await deleteStoreTransaction(deleteTarget.id)
      } else if (deleteTarget.type === 'ACCESSORY') {
        res = await deleteAccessory(deleteTarget.id)
      } else if (deleteTarget.type === 'ACCESSORY_BY_NAME') {
        res = await deleteAccessoryByName(deleteTarget.id)
      }

      if (res?.error) {
        setDeleteError(res.error)
      } else {
        setDeleteTarget(null)
      }
    })
  }

  return (
    <div className="space-y-6">

      {/* ============================================================ */}
      {/* 1. TOP HEADER & TELEMETRY TOOLBAR                            */}
      {/* ============================================================ */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Warehouse className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Welcome, {currentUserName}
              </h1>
              <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
                Store & Godown Shift
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              Factory raw materials inventory, trims handover & finished goods dispatch
            </p>
          </div>
        </div>

        {/* Live Sync, TV View & Actions */}
        <div className="flex items-center gap-2.5 self-stretch sm:self-auto w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#FAF7F0] hover:bg-[#F2ECE1] text-[#3A3564] border border-black/10 shadow-2xs transition-all cursor-pointer disabled:opacity-60"
            title="Sync latest live movements"
          >
            <RotateCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <TvViewButton />

          <button
            type="button"
            onClick={() => router.push('/login')}
            className="inline-flex items-center justify-center w-10 h-10 text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer"
            title="Logout / Switch Account"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. HERO KPI CARDS & 4-COLUMN TELEMETRY STRIP                 */}
      {/* ============================================================ */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Card 1: Finished Stock */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Finished Garments Stock
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 font-mono">
                  {totalFinishedStock.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-500 font-mono">pcs</span>
              </div>
              <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 pt-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Ready in Godown Warehouse</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
              <Warehouse className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Floor Handover Lots */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Lineman BOM Handover
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl md:text-4xl font-black font-mono text-slate-900">
                  {pendingHandoverCount}
                </span>
                <span className="text-xs font-bold text-slate-500 font-mono">active lots</span>
              </div>
              <p className={`text-xs font-semibold flex items-center gap-1.5 pt-1.5 ${pendingHandoverCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {pendingHandoverCount > 0 ? (
                  <>
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Awaiting store raw material issue</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>All active lots issued</span>
                  </>
                )}
              </p>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs border border-black/10 ${
              pendingHandoverCount > 0 ? 'bg-amber-50 text-amber-700' : 'bg-[#FAF7F0] text-[#3A3564]'
            }`}>
              <Boxes className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 4-Column Unified Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-black/10 shadow-2xs divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="p-2.5 text-center">
            <p className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Godown Stock</p>
            <p className="text-lg sm:text-xl font-black text-slate-900 font-mono mt-1">
              {totalFinishedStock.toLocaleString()} <span className="text-xs font-medium text-slate-500">pcs</span>
            </p>
          </div>
          <div className="p-2.5 text-center">
            <p className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Pending Issue</p>
            <p className={`text-lg sm:text-xl font-black font-mono mt-1 ${pendingHandoverCount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
              {pendingHandoverCount} <span className="text-xs font-medium text-slate-500">lots</span>
            </p>
          </div>
          <div className="p-2.5 text-center">
            <p className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Truck Inward (Today)</p>
            <p className="text-lg sm:text-xl font-black text-emerald-700 font-mono mt-1">
              +{todayTruckCount} <span className="text-xs font-medium text-slate-500">slips</span>
            </p>
          </div>
          <div className="p-2.5 text-center">
            <p className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Dispatched (Today)</p>
            <p className="text-lg sm:text-xl font-black text-rose-700 font-mono mt-1">
              -{todayOutward} <span className="text-xs font-medium text-slate-500">pcs</span>
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. READY FROM QC TABLE QUEUE (HANDSHAKE WITH QC FLOOR)       */}
      {/* ============================================================ */}
      {readyQcAllotments.length > 0 && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-emerald-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Ready from QC Finishing Table
                </h3>
                <p className="text-xs text-slate-600">
                  Garments inspected, passed & approved for Store Godown Inward
                </p>
              </div>
            </div>
            <span className="px-3 py-1 text-xs font-bold font-mono bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 shadow-2xs">
              {readyQcAllotments.length} lots waiting
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {readyQcAllotments.map(lot => {
              const artNo = lot.article?.art_no || 'Garment'
              const passedQty = lot.qc_total_passed || lot.target_qty || 0
              const linemanName = lot.lineman?.username || 'Lineman'
              const qcSupervisor = lot.qc_supervisor_name || 'QC Supervisor'
              const challanNo = lot.challans?.challan_no || '-'
              const colors = lot.allotment_variants?.map(v => v.color).filter(Boolean) || []
              const distinctColors = Array.from(new Set(colors)).join(', ') || 'Standard'

              return (
                <div 
                  key={lot.id}
                  className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 shadow-2xs hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-black text-slate-900">
                          Art #{artNo}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10 rounded-lg">
                          Challan #{challanNo}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-1">
                        Color: <span className="font-bold text-slate-900">{distinctColors}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black font-mono text-emerald-700">
                        {passedQty} pcs
                      </span>
                      <p className="text-[10px] font-mono text-slate-500">QC Passed</p>
                    </div>
                  </div>

                  {/* Custody Meta Chips */}
                  <div className="flex flex-wrap gap-1.5 text-xs font-semibold text-slate-600">
                    <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg flex items-center gap-1.5 shadow-2xs">
                      <User className="w-3.5 h-3.5 text-[#3A3564]" />
                      <span>{linemanName}</span>
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-1.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{qcSupervisor}</span>
                    </span>
                  </div>

                  {/* 1-Click Receive Action */}
                  <button
                    type="button"
                    onClick={() => {
                      setPrefilledLotForInward(lot)
                      setIsInwardModalOpen(true)
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Receive into Godown ({passedQty} pcs)</span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. STORE QUICK ACTIONS (4-CARD GRID)                         */}
      {/* ============================================================ */}
      <div className="space-y-3">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
          Store Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* Action 1: Accessory Challan Inward (GRN) */}
          <button
            type="button"
            onClick={() => setIsGrnModalOpen(true)}
            className="p-5 text-left bg-white hover:bg-[#FAF7F0]/60 border border-black/10 hover:border-[#3A3564]/40 rounded-2xl shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-[#FAF7F0] group-hover:bg-[#3A3564] text-[#3A3564] group-hover:text-[#FAF7F0] border border-black/10 flex items-center justify-center transition-colors shadow-2xs">
                <Receipt className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#3A3564] transition-colors" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-[#3A3564] transition-colors">
                Accessory Inward (GRN)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                Record supplier delivery slip, trims, fabrics & due items
              </p>
            </div>
          </button>

          {/* Action 2: Lineman BOM Handover */}
          <button
            type="button"
            onClick={() => setIsBomModalOpen(true)}
            className="p-5 text-left bg-white hover:bg-[#FAF7F0]/60 border border-black/10 hover:border-[#3A3564]/40 rounded-2xl shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-[#FAF7F0] group-hover:bg-[#3A3564] text-[#3A3564] group-hover:text-[#FAF7F0] border border-black/10 flex items-center justify-center transition-colors shadow-2xs">
                <Boxes className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#3A3564] transition-colors" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-[#3A3564] transition-colors">
                BOM Material Handover
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                Inspect raw materials & issue BOM lots to Linemen
              </p>
            </div>
          </button>

          {/* Action 3: Production Inward */}
          <button
            type="button"
            onClick={() => {
              setPrefilledLotForInward(null)
              setIsInwardModalOpen(true)
            }}
            className="p-5 text-left bg-white hover:bg-[#FAF7F0]/60 border border-black/10 hover:border-[#3A3564]/40 rounded-2xl shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-[#FAF7F0] group-hover:bg-[#3A3564] text-[#3A3564] group-hover:text-[#FAF7F0] border border-black/10 flex items-center justify-center transition-colors shadow-2xs">
                <Download className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#3A3564] transition-colors" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-[#3A3564] transition-colors">
                Production Inward
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                Receive finished garments from QC / Stitching Floor
              </p>
            </div>
          </button>

          {/* Action 4: Finished Goods Outward */}
          <button
            type="button"
            onClick={() => setIsOutwardModalOpen(true)}
            className="p-5 text-left bg-white hover:bg-[#FAF7F0]/60 border border-black/10 hover:border-[#3A3564]/40 rounded-2xl shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-[#FAF7F0] group-hover:bg-[#3A3564] text-[#3A3564] group-hover:text-[#FAF7F0] border border-black/10 flex items-center justify-center transition-colors shadow-2xs">
                <Send className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#3A3564] transition-colors" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-[#3A3564] transition-colors">
                Finished Goods Outward
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                Issue & dispatch garments from warehouse with challan
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. RECENT SUPPLIER CHALLANS (GRN) FEED                       */}
      {/* ============================================================ */}
      {truckInwards.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Recent Supplier Challans (GRN)
            </h2>
            <span className="px-3 py-1 text-xs font-bold font-mono bg-[#FAF7F0] text-[#3A3564] rounded-xl border border-black/10 shadow-2xs">
              {truckInwards.length} slips recorded
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {truckInwards.slice(0, 10).map(grn => {
              const isExpanded = expandedGrnId === grn.id
              const items: any[] = (grn.items && grn.items.length > 0) ? grn.items : (grn.line_items || [])
              
              const totalChallanQty = items.reduce((acc, it) => acc + Number(it.challan_qty || (Number(it.quantity || it.received_qty || 0) + Number(it.shortage_qty || 0))), 0)
              const totalReceivedQty = items.reduce((acc, it) => acc + Number(it.quantity || it.received_qty || 0), 0)
              const totalShortageQty = items.reduce((acc, it) => (it.status === 'SHORTAGE' ? acc + Number(it.shortage_qty || 0) : acc), 0)
              const totalDefectiveQty = items.reduce((acc, it) => (it.status === 'DEFECTIVE' ? acc + Number(it.shortage_qty || 0) : acc), 0)
              const totalDueQty = items.reduce((acc, it) => (it.status === 'DUE' ? acc + Number(it.shortage_qty || 0) : acc), 0)

              const isDue = grn.status === 'DUE_PENDING' || grn.due_items_count > 0 || totalDueQty > 0
              const isShortage = grn.status === 'SHORTAGE' || grn.shortage_items_count > 0 || totalShortageQty > 0
              const isDefective = totalDefectiveQty > 0

              return (
                <div 
                  key={grn.id}
                  className="bg-white p-5 rounded-2xl border border-black/10 hover:border-slate-300 shadow-2xs space-y-3.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black font-mono text-[#3A3564]">
                          {grn.grn_no}
                        </span>
                        {isShortage && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold font-mono bg-amber-50 text-amber-800 border border-amber-300 rounded-lg">
                            <AlertTriangle className="w-3 h-3 text-amber-700" />
                            Shortage: {totalShortageQty > 0 ? `${totalShortageQty} pcs` : 'Logged'}
                          </span>
                        )}
                        {isDefective && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold font-mono bg-rose-50 text-rose-800 border border-rose-300 rounded-lg">
                            <AlertCircle className="w-3 h-3 text-rose-700" />
                            Defective: {totalDefectiveQty} pcs
                          </span>
                        )}
                        {isDue && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold font-mono bg-indigo-50 text-indigo-800 border border-indigo-300 rounded-lg">
                            <Clock className="w-3 h-3 text-indigo-700" />
                            Due: {totalDueQty > 0 ? `${totalDueQty} pcs` : 'Pending'}
                          </span>
                        )}
                        {!isDue && !isShortage && !isDefective && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            Verified
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 mt-1.5">
                        {grn.party_name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Challan #{grn.challan_no || '-'} • Vehicle: {grn.truck_no || 'Direct Inward'} • Style: {grn.article_no || '-'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {grn.challan_photo_url && (
                        <button
                          type="button"
                          onClick={() => setActivePhoto({ url: grn.challan_photo_url!, title: `${grn.party_name} - ${grn.grn_no}` })}
                          className="p-2 text-[#3A3564] hover:bg-[#FAF7F0] rounded-xl border border-black/10 shadow-2xs transition-colors cursor-pointer"
                          title="View Paper Challan Slip"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({
                          type: 'TRUCK_INWARD',
                          id: grn.id,
                          title: `GRN Slip: ${grn.grn_no}`,
                          subtitle: `Supplier: ${grn.party_name} (${items.length || grn.total_items} items)`
                        })}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete GRN Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Quantity Breakdown Pills Strip */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                    <div>
                      <span className="block text-[10px] font-mono font-bold uppercase text-slate-400">Challan Billed</span>
                      <span className="font-mono font-extrabold text-slate-800 text-sm">{totalChallanQty}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-mono font-bold uppercase text-emerald-600">In Godown</span>
                      <span className="font-mono font-extrabold text-emerald-700 text-sm">{totalReceivedQty}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-mono font-bold uppercase text-slate-400">
                        {isShortage ? 'Shortage' : isDefective ? 'Defective' : isDue ? 'Due' : 'Variance'}
                      </span>
                      <span className={`font-mono font-extrabold text-sm ${
                        (totalShortageQty > 0 || totalDefectiveQty > 0) ? 'text-rose-700' : 'text-slate-500'
                      }`}>
                        {totalShortageQty > 0 
                          ? `-${totalShortageQty}` 
                          : totalDefectiveQty > 0 
                            ? `${totalDefectiveQty} def` 
                            : totalDueQty > 0 
                              ? `${totalDueQty} due` 
                              : '0'}
                      </span>
                    </div>
                  </div>

                  {/* Summary Bar with Accordion Toggle */}
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 pt-1">
                    <span className="text-[11px] text-slate-500">
                      Receiver: {grn.receiver_name || 'Store Incharge'} • {grn.inward_date || 'Today'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedGrnId(isExpanded ? null : grn.id)}
                      className="text-[#3A3564] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{items.length || grn.total_items} item(s)</span>
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Accordion Line Items Detailed Breakdown */}
                  {isExpanded && items.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {items.map((it: any, idx: number) => {
                        const itChallan = it.challan_qty || (Number(it.quantity || it.received_qty || 0) + Number(it.shortage_qty || 0))
                        const itReceived = Number(it.quantity || it.received_qty || 0)
                        const itShortage = Number(it.shortage_qty || 0)
                        const itStatus = it.status || 'RECEIVED'

                        return (
                          <div key={idx} className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-bold text-slate-900">
                                {it.item_name} {it.size_label ? `(${it.size_label})` : it.size_color ? `(${it.size_color})` : ''}
                              </p>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono font-bold uppercase text-[10px] ${
                                itStatus === 'SHORTAGE' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                                itStatus === 'DEFECTIVE' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                                itStatus === 'DUE' ? 'bg-indigo-100 text-indigo-900 border border-indigo-300' :
                                'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              }`}>
                                {itStatus === 'SHORTAGE' ? (
                                  <><AlertTriangle className="w-3 h-3 text-amber-700" /> Shortage</>
                                ) : itStatus === 'DEFECTIVE' ? (
                                  <><AlertCircle className="w-3 h-3 text-rose-700" /> Defective</>
                                ) : itStatus === 'DUE' ? (
                                  <><Clock className="w-3 h-3 text-indigo-700" /> Due</>
                                ) : (
                                  <><CheckCircle2 className="w-3 h-3 text-emerald-700" /> Received</>
                                )}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-slate-600 pt-1 border-t border-slate-200/50">
                              <span>Challan: <strong className="text-slate-800">{itChallan} {it.unit || 'pcs'}</strong></span>
                              <span>Received: <strong className="text-emerald-700">{itReceived} {it.unit || 'pcs'}</strong></span>
                              {itShortage > 0 && (
                                <span className={itStatus === 'DEFECTIVE' ? 'text-rose-700 font-bold' : 'text-amber-700 font-bold'}>
                                  {itStatus}: {itShortage} {it.unit || 'pcs'}
                                </span>
                              )}
                            </div>

                            {it.remarks && (
                              <p className="text-[11px] text-slate-500 italic bg-white px-2 py-1 rounded border border-slate-200/60">
                                Note: {it.remarks}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. STORE LEDGER & MOVEMENTS ACTIVITY FEED                   */}
      {/* ============================================================ */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Store Ledger Activity Feed
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {feedTimeFilter === '24h' ? 'Showing last 24 hours live movements' : feedTimeFilter === '7d' ? 'Showing past 7 days activity' : 'Showing all historical logs'}
            </p>
          </div>
          <span className="px-3 py-1 text-xs font-bold font-mono bg-[#FAF7F0] text-[#3A3564] rounded-xl border border-black/10 shadow-2xs self-start md:self-auto">
            {filteredStoreLogs.length} entries found
          </span>
        </div>

        {/* Time Segmented Pills & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Time Filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-stretch sm:self-auto shadow-2xs">
            {(['24h', '7d', 'all'] as const).map(tf => (
              <button
                key={tf}
                type="button"
                onClick={() => setFeedTimeFilter(tf)}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  feedTimeFilter === tf ? 'bg-white text-[#3A3564] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tf === '24h' ? 'Today (24h)' : tf === '7d' ? '7 Days' : 'All Time'}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by article, item name, party or challan #..."
              value={feedSearchQuery}
              onChange={e => setFeedSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all"
            />
            {feedSearchQuery && (
              <button
                type="button"
                onClick={() => setFeedSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { key: 'ALL', label: 'All Activities', icon: Layers },
            { key: 'BOM', label: 'BOM Packages', icon: Boxes },
            { key: 'TRIMS', label: 'Trims & Materials', icon: Tag },
            { key: 'GARMENTS', label: 'Garments In/Out', icon: Warehouse },
          ].map(cat => {
            const isSelected = feedCategoryFilter === cat.key
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setFeedCategoryFilter(cat.key as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs ${
                  isSelected
                    ? 'bg-[#3A3564] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
                }`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* Logs List */}
        <div className="space-y-3 pt-2">
          {filteredStoreLogs.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-900">
                {feedTimeFilter === '24h' ? 'No store movements in the last 24 hours.' : 'No logs found matching your filters.'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {feedTimeFilter === '24h' && 'Tap "7 Days" or "All Time" above to view previous records.'}
              </p>
            </div>
          ) : (
            filteredStoreLogs.map(log => {
              // 1. Grouped BOM Handover Package Card
              if (log.isGroupedBOM) {
                const isExpanded = expandedBOMKeys.has(log.groupKey)
                return (
                  <div
                    key={log.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-[#3A3564]/30 shadow-2xs space-y-3 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
                          <Boxes className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#3A3564]">
                              BOM Material Issue
                            </span>
                            {log.challan_no && (
                              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10 rounded">
                                Challan #{log.challan_no}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-extrabold text-slate-900 mt-1">
                            {log.party_name}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">
                            {log.total_items_count} distinct trims package • {log.total_units_count} total units issued
                          </p>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-sm sm:text-base font-black text-rose-700">
                          -{log.total_units_count} units
                        </span>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {log.entry_date || (log.created_at ? log.created_at.split('T')[0] : 'Today')}
                        </p>
                      </div>
                    </div>

                    {/* Accordion Expand Button */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/60 text-xs">
                      <span className="text-[11px] font-mono font-bold text-slate-500">
                        Chain of Custody: Store Godown ➔ Lineman
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleBOMAccordion(log.groupKey)}
                        className="text-[#3A3564] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide Items' : `View ${log.total_items_count} Items`}</span>
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Expanded Materials List */}
                    {isExpanded && log.items && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                        {log.items.map((it: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs">
                            <span className="font-bold text-slate-900">{it.name}</span>
                            <span className="font-mono font-bold text-slate-700">{it.qty} {it.unit}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              // 2. Garment Inward/Outward Log Card
              if (!log.isAccessory) {
                const isInward = log.type === 'INWARD'
                return (
                  <div
                    key={log.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-black/10 hover:border-slate-300 shadow-2xs flex items-start justify-between gap-3 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs border ${
                        isInward ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {isInward ? <Download className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isInward ? 'text-emerald-800' : 'text-rose-800'}`}>
                            {isInward ? 'Production Inward' : 'Finished Goods Outward'}
                          </span>
                          <span className="text-xs font-mono font-bold bg-[#FAF7F0] text-[#3A3564] px-2 py-0.5 rounded border border-black/10">
                            Art #{log.art_no}
                          </span>
                          {log.challan_no && (
                            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 rounded">
                              Challan #{log.challan_no}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 mt-1">
                          {log.party_name || (isInward ? 'QC Finishing Floor' : 'General Dispatch')}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Variant: <span className="font-bold text-slate-900">{log.color || 'Standard'} / {log.size || 'Free'}</span>
                          {log.notes && ` • ${log.notes}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="text-right font-mono">
                        <span className={`text-base font-black ${isInward ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isInward ? `+${log.quantity}` : `-${log.quantity}`} pcs
                        </span>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {log.entry_date || (log.created_at ? log.created_at.split('T')[0] : 'Today')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({
                          type: 'STORE_TRANSACTION',
                          id: log.id,
                          title: `Garment ${log.type}: Art #${log.art_no}`,
                          subtitle: `${log.quantity} pcs (${log.color || 'Std'} / ${log.size || 'Free'})`
                        })}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              }

              // 3. Raw Accessory Entry Card
              const isAccIn = log.action === 'IN'
              return (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-white border border-black/10 hover:border-slate-300 shadow-2xs flex items-start justify-between gap-3 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs border ${
                      isAccIn ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-slate-900">
                          {log.item_name}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                          isAccIn ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isAccIn ? 'Inward' : 'Issue'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {log.party_name || 'Store'} {log.notes && `• ${log.notes}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="text-right font-mono">
                      <span className={`text-sm sm:text-base font-black ${isAccIn ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isAccIn ? `+${log.quantity}` : `-${log.quantity}`} {log.unit || 'pcs'}
                      </span>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {log.entry_date || (log.created_at ? log.created_at.split('T')[0] : 'Today')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({
                        type: 'ACCESSORY',
                        id: log.id,
                        title: `Accessory: ${log.item_name}`,
                        subtitle: `${log.quantity} ${log.unit || 'pcs'}`
                      })}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: ACCESSORY CHALLAN INWARD (TRUCK INWARD / GRN) */}
      {/* ============================================================ */}
      {isGrnModalOpen && (
        <GrnInwardModal
          onClose={() => setIsGrnModalOpen(false)}
          articles={articles}
          currentUserName={currentUserName}
        />
      )}

      {/* ============================================================ */}
      {/* MODAL 2: BOM MATERIAL HANDOVER (LINEMAN ISSUE) */}
      {/* ============================================================ */}
      {isBomModalOpen && (
        <BomHandoverModal
          onClose={() => setIsBomModalOpen(false)}
          activeAllotments={activeAllotments}
          currentUserName={currentUserName}
        />
      )}

      {/* ============================================================ */}
      {/* MODAL 3: PRODUCTION FINISHED GOODS INWARD */}
      {/* ============================================================ */}
      {isInwardModalOpen && (
        <ProductionInwardModal
          onClose={() => {
            setIsInwardModalOpen(false)
            setPrefilledLotForInward(null)
          }}
          articles={articles}
          readyQcAllotments={readyQcAllotments}
          prefilledLot={prefilledLotForInward}
          currentUserName={currentUserName}
          variantStockMap={variantStockMap}
        />
      )}

      {/* ============================================================ */}
      {/* MODAL 4: FINISHED GOODS OUTWARD (DISPATCH) */}
      {/* ============================================================ */}
      {isOutwardModalOpen && (
        <FinishedGoodsOutwardModal
          onClose={() => setIsOutwardModalOpen(false)}
          articles={articles}
          activeAllotments={activeAllotments}
          currentUserName={currentUserName}
          articleStockMap={articleStockMap}
          variantStockMap={variantStockMap}
        />
      )}

      {/* ============================================================ */}
      {/* MODAL 5: PHOTO VIEWER MODAL */}
      {/* ============================================================ */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 text-white">
              <h4 className="text-sm font-bold truncate">{activePhoto.title}</h4>
              <button onClick={() => setActivePhoto(null)} className="p-1 hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[75vh] overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activePhoto.url} alt="Challan" className="max-h-[70vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 6: DELETE CONFIRMATION DIALOG */}
      {/* ============================================================ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow-2xl border border-black/10 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-extrabold text-slate-900">
                  Delete Entry?
                </h3>
                <p className="text-xs font-semibold text-slate-600 mt-1">
                  Are you sure you want to permanently delete <strong className="text-slate-900 font-extrabold">{deleteTarget.title}</strong>?
                </p>
                {deleteTarget.subtitle && (
                  <p className="text-xs font-mono text-slate-500 mt-0.5">{deleteTarget.subtitle}</p>
                )}
              </div>
            </div>

            {deleteError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isPending}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-[#FAF7F0] hover:bg-[#F2ECE1] border border-black/10 rounded-xl transition-all shadow-2xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isPending}
                className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                {isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// ====================================================================
// SUBCOMPONENT: MODAL 1 - ACCESSORY CHALLAN INWARD (GRN)
// ====================================================================
function GrnInwardModal({
  onClose,
  articles,
  currentUserName,
}: {
  onClose: () => void
  articles: Article[]
  currentUserName: string
}) {
  const router = useRouter()
  const [partyName, setPartyName] = useState('')
  const [articleNo, setArticleNo] = useState('')
  const [challanNo, setChallanNo] = useState('')
  const [truckNo, setTruckNo] = useState('')
  const [inwardDate, setInwardDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [items, setItems] = useState<TruckInwardItemInput[]>([])

  // Presets to quickly add items
  const addPreset = (name: string, unit: string = 'pcs') => {
    setItems(prev => [
      ...prev,
      { item_name: name, quantity: 0, unit, size_label: '', status: 'RECEIVED', shortage_qty: 0, remarks: '' }
    ])
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingPhoto(true)
    const reader = new FileReader()
    reader.onload = () => {
      setPhotoUrl(reader.result as string)
      setIsUploadingPhoto(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!partyName.trim()) {
      setError('Please enter Supplier / Brand Name.')
      return
    }
    if (items.length === 0) {
      setError('Please add at least 1 item from the challan.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const res = await createTruckInwardGrn({
      party_name: partyName,
      article_no: articleNo,
      challan_no: challanNo,
      truck_no: truckNo,
      inward_date: inwardDate,
      challan_photo_url: photoUrl,
      notes,
      items,
    })

    setIsSubmitting(false)
    if (res.error) {
      setError(res.error)
    } else {
      router.refresh()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative max-w-3xl w-full bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-black/10 bg-[#FAF7F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#3A3564] border border-black/10 shadow-2xs flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Accessory Challan Inward (GRN)
              </h3>
              <p className="text-xs font-medium text-slate-500">
                Record supplier delivery slip, trims, fabrics & due items
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Supplier & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Supplier / Brand Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Vardhman Threads, YKK Zippers..."
                value={partyName}
                onChange={e => setPartyName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Inward Date
              </label>
              <input
                type="date"
                value={inwardDate}
                onChange={e => setInwardDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all"
              />
            </div>
          </div>

          {/* Row 2: Challan #, Truck #, Article Target */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Supplier Challan #
              </label>
              <input
                type="text"
                placeholder="e.g. CH-9081"
                value={challanNo}
                onChange={e => setChallanNo(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Vehicle / Truck #
              </label>
              <input
                type="text"
                placeholder="e.g. DL-01-AB-1234"
                value={truckNo}
                onChange={e => setTruckNo(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Target Article (Style #)
              </label>
              <input
                type="text"
                placeholder="e.g. ART-550"
                value={articleNo}
                onChange={e => setArticleNo(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all"
              />
            </div>
          </div>

          {/* Item Presets Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mr-1">Add Preset:</span>
            {['Zippers', 'Buttons', 'Care Labels', 'Sewing Threads', 'Fabric Rolls', 'Elastic Tape'].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => addPreset(p, p.includes('Rolls') ? 'rolls' : p.includes('Threads') ? 'cones' : 'pcs')}
                className="px-3 py-1.5 text-xs font-bold bg-[#FAF7F0] hover:bg-[#F2ECE1] text-[#3A3564] rounded-xl border border-black/10 transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" /> {p}
              </button>
            ))}
          </div>

          {/* Line Items Table / List */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Challan Line Items ({items.length})
              </label>
            </div>
            {items.length === 0 ? (
              <div className="p-6 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs font-semibold text-slate-500 mb-2.5">
                  No line items added yet. Click an "Add Preset" button above or add a custom item.
                </p>
                <button
                  type="button"
                  onClick={() => setItems([
                    { item_name: '', quantity: 0, unit: 'pcs', size_label: '', status: 'RECEIVED', shortage_qty: 0, remarks: '' }
                  ])}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#3A3564] bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" /> + Add Line Item
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((it, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between gap-2.5">
                      <input
                        type="text"
                        placeholder="Item description (e.g. Antique Brass Zipper)"
                        value={it.item_name}
                        onChange={e => {
                          const copy = [...items]
                          copy[idx].item_name = e.target.value
                          setItems(copy)
                        }}
                        className="flex-1 px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
                      />
                      <button
                        type="button"
                        onClick={() => setItems(items.filter((_, i) => i !== idx))}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Challan Qty *
                        </label>
                        <input
                          type="number"
                          placeholder="0"
                          value={it.challan_qty === 0 ? '' : it.challan_qty ?? (it.quantity === 0 ? '' : it.quantity)}
                          onChange={e => {
                            const val = e.target.value
                            const cQty = val === '' ? 0 : Number(val)
                            const copy = [...items]
                            copy[idx].challan_qty = cQty
                            if (!copy[idx].quantity || copy[idx].quantity === 0 || copy[idx].status === 'RECEIVED') {
                              copy[idx].quantity = cQty
                              copy[idx].shortage_qty = 0
                              copy[idx].status = 'RECEIVED'
                            } else {
                              const diff = Math.max(0, cQty - (copy[idx].quantity || 0))
                              copy[idx].shortage_qty = diff
                            }
                            setItems(copy)
                          }}
                          className="w-full px-3 py-2 font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 mb-1 flex items-center justify-between">
                          <span>Received Qty *</span>
                          <span className="text-[10px] text-slate-400 font-normal">In Godown</span>
                        </label>
                        <input
                          type="number"
                          placeholder="0"
                          value={it.quantity === 0 ? '' : it.quantity}
                          onChange={e => {
                            const val = e.target.value
                            const rQty = val === '' ? 0 : Number(val)
                            const copy = [...items]
                            copy[idx].quantity = rQty
                            const cQty = copy[idx].challan_qty ?? rQty
                            if (!copy[idx].challan_qty) {
                              copy[idx].challan_qty = rQty
                            }
                            if (rQty < cQty) {
                              copy[idx].shortage_qty = cQty - rQty
                              if (copy[idx].status === 'RECEIVED') {
                                copy[idx].status = 'SHORTAGE'
                              }
                            } else {
                              copy[idx].shortage_qty = 0
                              copy[idx].status = 'RECEIVED'
                            }
                            setItems(copy)
                          }}
                          className="w-full px-3 py-2 font-mono font-bold text-emerald-700 bg-emerald-50/40 border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">Unit</label>
                        <select
                          value={it.unit}
                          onChange={e => {
                            const copy = [...items]
                            copy[idx].unit = e.target.value
                            setItems(copy)
                          }}
                          className="w-full px-3 py-2 font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
                        >
                          {['pcs', 'cones', 'kg', 'mt', 'rolls', 'gross'].map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">Size / Color</label>
                        <input
                          type="text"
                          placeholder="e.g. M / Black"
                          value={it.size_label || ''}
                          onChange={e => {
                            const copy = [...items]
                            copy[idx].size_label = e.target.value
                            setItems(copy)
                          }}
                          className="w-full px-3 py-2 font-semibold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">Status</label>
                        <select
                          value={it.status}
                          onChange={e => {
                            const newStatus = e.target.value as any
                            const copy = [...items]
                            copy[idx].status = newStatus
                            if (newStatus === 'RECEIVED') {
                              copy[idx].shortage_qty = 0
                              copy[idx].quantity = copy[idx].challan_qty ?? copy[idx].quantity
                            } else if (!copy[idx].shortage_qty || copy[idx].shortage_qty === 0) {
                              const cQty = copy[idx].challan_qty ?? copy[idx].quantity
                              const rQty = copy[idx].quantity
                              copy[idx].shortage_qty = Math.max(0, cQty - rQty) || 1
                            }
                            setItems(copy)
                          }}
                          className={`w-full px-3 py-2 font-bold bg-white border rounded-xl focus:outline-none focus:ring-2 ${
                            it.status === 'RECEIVED' 
                              ? 'text-emerald-700 border-emerald-300' 
                              : it.status === 'SHORTAGE' 
                                ? 'text-amber-700 border-amber-300' 
                                : it.status === 'DEFECTIVE'
                                  ? 'text-rose-700 border-rose-300'
                                  : 'text-indigo-700 border-indigo-300'
                          }`}
                        >
                          <option value="RECEIVED">Full Received</option>
                          <option value="SHORTAGE">Shortage</option>
                          <option value="DEFECTIVE">Defective</option>
                          <option value="DUE">Due (Pending)</option>
                        </select>
                      </div>
                    </div>

                    {Boolean(it.status !== 'RECEIVED' || ((it.shortage_qty || 0) > 0)) && (
                      <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono font-bold uppercase text-[10px] ${
                              it.status === 'SHORTAGE' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                              it.status === 'DEFECTIVE' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                              'bg-indigo-100 text-indigo-900 border border-indigo-300'
                            }`}>
                              {it.status === 'SHORTAGE' ? (
                                <><AlertTriangle className="w-3 h-3 text-amber-700" /> Shortage</>
                              ) : it.status === 'DEFECTIVE' ? (
                                <><AlertCircle className="w-3 h-3 text-rose-700" /> Defective</>
                              ) : (
                                <><Clock className="w-3 h-3 text-indigo-700" /> Due Pending</>
                              )}
                            </span>
                            <span className="font-semibold text-slate-700">
                              Challan: <strong className="text-slate-900 font-mono">{it.challan_qty ?? (it.quantity + (it.shortage_qty || 0))}</strong> | 
                              Received: <strong className="text-emerald-700 font-mono">{it.quantity}</strong> | 
                              Issue: <strong className="text-rose-700 font-mono">{it.shortage_qty || 0} {it.unit}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] font-mono font-bold uppercase text-slate-600">
                              {it.status === 'SHORTAGE' ? 'Short Qty:' : it.status === 'DEFECTIVE' ? 'Defect Qty:' : 'Due Qty:'}
                            </label>
                            <input
                              type="number"
                              placeholder="0"
                              value={it.shortage_qty === 0 ? '' : it.shortage_qty}
                              onChange={e => {
                                const val = e.target.value
                                const sQty = val === '' ? 0 : Number(val)
                                const copy = [...items]
                                copy[idx].shortage_qty = sQty
                                const cQty = copy[idx].challan_qty ?? (copy[idx].quantity + sQty)
                                copy[idx].challan_qty = cQty
                                copy[idx].quantity = Math.max(0, cQty - sQty)
                                setItems(copy)
                              }}
                              className="w-20 px-2 py-1 text-xs font-mono font-bold bg-white border border-amber-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                            />
                          </div>
                        </div>
                        <input
                          type="text"
                          placeholder="Remarks / Note (e.g. 50 pcs short from supplier, or damaged on truck)"
                          value={it.remarks || ''}
                          onChange={e => {
                            const copy = [...items]
                            copy[idx].remarks = e.target.value
                            setItems(copy)
                          }}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                        />
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setItems(prev => [
                      ...prev,
                      { item_name: '', quantity: 0, unit: 'pcs', size_label: '', status: 'RECEIVED', shortage_qty: 0, remarks: '' }
                    ])}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#3A3564] bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Add Another Item
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Photo Attachment */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
              Challan Paper Slip Photo (Optional)
            </label>
            {photoUrl ? (
              <div className="flex items-center gap-3.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl} alt="Slip Preview" className="w-16 h-16 object-cover rounded-xl border border-black/10 shadow-2xs" />
                <div>
                  <p className="text-xs font-bold text-emerald-700">Photo attached & ready</p>
                  <button
                    type="button"
                    onClick={() => setPhotoUrl(null)}
                    className="text-xs text-rose-600 hover:underline mt-1 font-bold"
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-4 bg-white border-2 border-dashed border-slate-200 hover:border-[#3A3564] rounded-xl cursor-pointer text-xs font-bold text-slate-600 hover:text-[#3A3564] transition-all">
                <Upload className="w-4 h-4" />
                <span>Upload Paper Challan Image</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              General Remarks / Delivery Notes
            </label>
            <input
              type="text"
              placeholder="e.g. 10 bags unloaded in Bay 2 • Driver Mohan"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-black/10 bg-[#FAF7F0] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            {isSubmitting ? 'Saving GRN...' : 'Confirm Inward'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ====================================================================
// SUBCOMPONENT: MODAL 2 - BOM MATERIAL HANDOVER (LINEMAN ISSUE)
// ====================================================================
function BomHandoverModal({
  onClose,
  activeAllotments,
  currentUserName,
}: {
  onClose: () => void
  activeAllotments: ActiveAllotment[]
  currentUserName: string
}) {
  const [selectedAllotmentId, setSelectedAllotmentId] = useState(activeAllotments[0]?.id || '')
  const [supplierChallan, setSupplierChallan] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedAllotment = activeAllotments.find(a => a.id === selectedAllotmentId) || activeAllotments[0]
  const linemanName = selectedAllotment?.lineman?.username || 'Lineman'
  const artNo = selectedAllotment?.article?.art_no || '-'
  const materials = selectedAllotment?.allotment_materials || []

  const [itemStates, setItemStates] = useState<Record<string, BomMaterialItemState>>({})

  // Initialize state per material
  useMemo(() => {
    const states: Record<string, BomMaterialItemState> = {}
    materials.forEach(m => {
      states[m.id] = {
        id: m.id,
        item_name: m.item_name,
        required_qty: m.required_qty,
        received_qty: m.required_qty,
        status: 'VERIFIED',
        shortage_qty: 0,
        remarks: ''
      }
    })
    setItemStates(states)
  }, [selectedAllotmentId, materials])

  const handleSubmit = async () => {
    if (!selectedAllotment) return
    setIsSubmitting(true)
    setError(null)

    const res = await issueBomMaterials({
      allotment_id: selectedAllotment.id,
      lineman_name: linemanName,
      supplier_challan_no: supplierChallan,
      article_no: artNo,
      items: Object.values(itemStates),
    })

    setIsSubmitting(false)
    if (res.error) {
      setError(res.error)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-black/10 bg-[#FAF7F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#3A3564] border border-black/10 shadow-2xs flex items-center justify-center shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                BOM Material Handover
              </h3>
              <p className="text-xs font-medium text-slate-500">
                Inspect raw materials & issue BOM lot to Lineman
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Select Target Allotment */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Select Active Target Allotment *
            </label>
            <select
              value={selectedAllotmentId}
              onChange={e => setSelectedAllotmentId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
            >
              {activeAllotments.map(al => (
                <option key={al.id} value={al.id}>
                  Art #{al.article?.art_no || '-'} ({al.target_qty} pcs) · Lineman: {al.lineman?.username || 'Lineman'} · Challan #{al.challans?.challan_no || '-'}
                </option>
              ))}
            </select>
          </div>

          {/* Lineman & Challan Info Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-[#FAF7F0] rounded-xl border border-black/10 text-xs font-bold text-[#3A3564]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Lineman: {linemanName}</span>
            </div>
            <div className="font-mono">
              <span>Target: {selectedAllotment?.target_qty || 0} pcs</span>
            </div>
          </div>

          {/* Supplier Challan # */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Supplier Raw Material Challan # (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. RM-5542 / Lot #12"
              value={supplierChallan}
              onChange={e => setSupplierChallan(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all"
            />
          </div>

          {/* Material Checklist */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
              Raw Materials Inspection Checklist ({materials.length} items)
            </label>
            {materials.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                No BOM materials defined for this allotment. You can still confirm handover.
              </p>
            ) : (
              materials.map(mat => {
                const st = itemStates[mat.id] || {
                  id: mat.id,
                  item_name: mat.item_name,
                  required_qty: mat.required_qty,
                  received_qty: mat.required_qty,
                  status: 'VERIFIED',
                  shortage_qty: 0,
                  remarks: ''
                }

                return (
                  <div key={mat.id} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900">{mat.item_name}</span>
                      <span className="text-xs font-mono font-bold text-slate-600">Required: {mat.required_qty}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">Physical Received Count</label>
                        <input
                          type="text"
                          value={st.received_qty}
                          onChange={e => {
                            setItemStates({
                              ...itemStates,
                              [mat.id]: { ...st, received_qty: e.target.value }
                            })
                          }}
                          className="w-full px-3 py-2 font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">Verification Status</label>
                        <select
                          value={st.status}
                          onChange={e => {
                            setItemStates({
                              ...itemStates,
                              [mat.id]: { ...st, status: e.target.value as any }
                            })
                          }}
                          className="w-full px-3 py-2 font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
                        >
                          <option value="VERIFIED">Verified</option>
                          <option value="SHORTAGE">Shortage</option>
                          <option value="DEFECTIVE">Defective</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-black/10 bg-[#FAF7F0] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            {isSubmitting ? 'Issuing...' : `Handover to ${linemanName}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ====================================================================
// SUBCOMPONENT: MODAL 3 - PRODUCTION INWARD (FINISHED GOODS)
// ====================================================================
function ProductionInwardModal({
  onClose,
  articles,
  readyQcAllotments,
  prefilledLot,
  currentUserName,
  variantStockMap,
}: {
  onClose: () => void
  articles: Article[]
  readyQcAllotments: ReadyQcAllotment[]
  prefilledLot?: ReadyQcAllotment | null
  currentUserName: string
  variantStockMap: Record<string, number>
}) {
  const [selectedArticleId, setSelectedArticleId] = useState(
    prefilledLot?.article?.id || articles[0]?.id || ''
  )
  const [selectedAllotmentId, setSelectedAllotmentId] = useState<string | null>(
    prefilledLot?.id || null
  )

  const [fromParty, setFromParty] = useState(prefilledLot?.qc_supervisor_name ? `QC Passed (${prefilledLot.qc_supervisor_name})` : 'QC Finishing Floor')
  const [linemanName, setLinemanName] = useState(prefilledLot?.lineman?.username || '')
  const [mendingName, setMendingName] = useState(prefilledLot?.mending_supervisor_name || 'Mending Floor')
  const [qcName, setQcName] = useState(prefilledLot?.qc_supervisor_name || 'QC Supervisor')
  const [challanNo, setChallanNo] = useState(prefilledLot?.challans?.challan_no || '')
  const [notes, setNotes] = useState(prefilledLot?.lineman?.username ? `Stitched by ${prefilledLot.lineman.username}` : '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Matching ready lots from QC table for selected article
  const matchingReadyLots = useMemo(() => {
    return readyQcAllotments.filter(l => l.article?.id === selectedArticleId)
  }, [readyQcAllotments, selectedArticleId])

  // Extract variants from ready lots or fallback standard sizes
  const [variantInputs, setVariantInputs] = useState<Array<{ color: string; size: string; quantity: number }>>([])

  // If prefilledLot changes or selectedAllotmentId selected, populate variants
  useMemo(() => {
    if (prefilledLot && prefilledLot.allotment_variants) {
      setVariantInputs(prefilledLot.allotment_variants.map(v => ({
        color: v.color || 'Standard',
        size: v.size || 'Free',
        quantity: v.quantity || 0,
      })))
    }
  }, [prefilledLot])

  const totalInwardPieces = variantInputs.reduce((a, b) => a + (Number(b.quantity) || 0), 0)

  const handleSubmit = async () => {
    if (totalInwardPieces <= 0) {
      setError('Please enter at least 1 garment piece to inward.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const res = await saveProductionInward({
      article_id: selectedArticleId,
      allotment_id: selectedAllotmentId,
      from_party: fromParty,
      lineman_name: linemanName,
      mending_name: mendingName,
      qc_supervisor_name: qcName,
      challan_no: challanNo,
      notes,
      variants: variantInputs,
    })

    setIsSubmitting(false)
    if (res.error) {
      setError(res.error)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-black/10 bg-[#FAF7F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#3A3564] border border-black/10 shadow-2xs flex items-center justify-center shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Production Inward (Finished Goods)
              </h3>
              <p className="text-xs font-medium text-slate-500">
                Receive finished garments into Godown warehouse stock
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Select Article */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Article (Style #) *
            </label>
            <select
              value={selectedArticleId}
              onChange={e => {
                setSelectedArticleId(e.target.value)
                setSelectedAllotmentId(null)
              }}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
            >
              {articles.map(art => (
                <option key={art.id} value={art.id}>
                  Art #{art.art_no} ({art.description || '-'})
                </option>
              ))}
            </select>
          </div>

          {/* Ready Lots Chips from QC */}
          {matchingReadyLots.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Ready Lots from QC Table (Click to Autofill):
              </label>
              <div className="flex flex-wrap gap-2">
                {matchingReadyLots.map(lot => {
                  const isSelected = selectedAllotmentId === lot.id
                  const lineman = lot.lineman?.username || 'Lineman'
                  const passed = lot.qc_total_passed || lot.target_qty || 0
                  return (
                    <button
                      key={lot.id}
                      type="button"
                      onClick={() => {
                        setSelectedAllotmentId(lot.id)
                        setLinemanName(lot.lineman?.username || '')
                        setMendingName(lot.mending_supervisor_name || 'Mending Floor')
                        setQcName(lot.qc_supervisor_name || 'QC Supervisor')
                        setChallanNo(lot.challans?.challan_no || '')
                        setFromParty(`QC Passed (${lot.qc_supervisor_name || 'QC'})`)
                        setNotes(`Stitched by ${lot.lineman?.username || 'Lineman'}`)

                        if (lot.allotment_variants && lot.allotment_variants.length > 0) {
                          setVariantInputs(lot.allotment_variants.map(v => ({
                            color: v.color || 'Standard',
                            size: v.size || 'Free',
                            quantity: v.quantity || 0,
                          })))
                        }
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 shadow-2xs ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-300'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{passed} pcs · {lineman}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Chain of Custody Box */}
          <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-black/10 space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#3A3564]">Production Chain of Custody</span>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="px-2.5 py-1 bg-white rounded-lg text-slate-700 border border-black/10 font-bold shadow-2xs">
                Lineman: {linemanName || 'Floor'}
              </span>
              <span className="px-2.5 py-1 bg-white rounded-lg text-slate-700 border border-black/10 font-bold shadow-2xs">
                Mending: {mendingName}
              </span>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-300 font-bold shadow-2xs">
                QC: {qcName}
              </span>
              <span className="px-2.5 py-1 bg-white rounded-lg text-[#3A3564] border border-black/10 font-bold shadow-2xs">
                Store: {currentUserName}
              </span>
            </div>
          </div>

          {/* Live Total Quantity Banner */}
          <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800">Total Inward Quantity:</span>
            <span className="text-base font-extrabold font-mono text-emerald-700">{totalInwardPieces} pcs</span>
          </div>

          {/* Variant Matrix Table */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Color & Size Breakdown
              </label>
              <button
                type="button"
                onClick={() => setVariantInputs(prev => [...prev, { color: 'Standard', size: 'XL', quantity: 0 }])}
                className="text-xs font-mono font-bold uppercase tracking-wider text-[#3A3564] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Size Row
              </button>
            </div>

            <div className="space-y-2">
              {variantInputs.map((v, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50/70 rounded-xl border border-slate-200/80 text-xs">
                  <input
                    type="text"
                    placeholder="Color"
                    value={v.color}
                    onChange={e => {
                      const copy = [...variantInputs]
                      copy[idx].color = e.target.value
                      setVariantInputs(copy)
                    }}
                    className="w-1/3 px-3 py-1.5 bg-white font-bold border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
                  />
                  <input
                    type="text"
                    placeholder="Size"
                    value={v.size}
                    onChange={e => {
                      const copy = [...variantInputs]
                      copy[idx].size = e.target.value
                      setVariantInputs(copy)
                    }}
                    className="w-1/4 px-3 py-1.5 bg-white font-bold border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
                  />
                  <input
                    type="number"
                    placeholder="0"
                    value={v.quantity === 0 ? '' : v.quantity}
                    onChange={e => {
                      const val = e.target.value
                      const copy = [...variantInputs]
                      copy[idx].quantity = val === '' ? 0 : Number(val)
                      setVariantInputs(copy)
                    }}
                    className="flex-1 px-3 py-1.5 bg-white font-mono font-bold text-slate-900 border border-slate-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
                  />
                  <button
                    type="button"
                    onClick={() => setVariantInputs(variantInputs.filter((_, i) => i !== idx))}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Remarks (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Lot #12 Final QC Inward"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-black/10 bg-[#FAF7F0] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || totalInwardPieces <= 0}
            className="px-5 py-2.5 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : `Save Inward (${totalInwardPieces} pcs)`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ====================================================================
// SUBCOMPONENT: MODAL 4 - FINISHED GOODS OUTWARD (DISPATCH)
// ====================================================================
function FinishedGoodsOutwardModal({
  onClose,
  articles,
  activeAllotments,
  currentUserName,
  articleStockMap,
  variantStockMap,
}: {
  onClose: () => void
  articles: Article[]
  activeAllotments: ActiveAllotment[]
  currentUserName: string
  articleStockMap: Record<string, number>
  variantStockMap: Record<string, number>
}) {
  const [selectedArticleId, setSelectedArticleId] = useState(articles[0]?.id || '')
  const [partyName, setPartyName] = useState('')
  const [challanNo, setChallanNo] = useState('')
  const [transportNo, setTransportNo] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableStock = articleStockMap[selectedArticleId] || 0

  const [variantInputs, setVariantInputs] = useState<Array<{ color: string; size: string; quantity: number }>>([])

  const totalDispatchPieces = variantInputs.reduce((a, b) => a + (Number(b.quantity) || 0), 0)

  const handleSubmit = async () => {
    if (totalDispatchPieces <= 0) {
      setError('Please enter at least 1 piece to dispatch.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const res = await saveFinishedGoodsOutward({
      article_id: selectedArticleId,
      party_name: partyName || 'General Dispatch',
      challan_no: challanNo,
      transport_no: transportNo,
      notes,
      variants: variantInputs,
    })

    setIsSubmitting(false)
    if (res.error) {
      setError(res.error)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-black/10 bg-[#FAF7F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#3A3564] border border-black/10 shadow-2xs flex items-center justify-center shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Finished Goods Outward (Dispatch)
              </h3>
              <p className="text-xs font-medium text-slate-500">
                Issue garments from Godown for delivery with delivery challan
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Select Article & Stock Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-end">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Article (Style #) *
              </label>
              <select
                value={selectedArticleId}
                onChange={e => setSelectedArticleId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
              >
                {articles.map(art => (
                  <option key={art.id} value={art.id}>
                    Art #{art.art_no} ({art.description || '-'})
                  </option>
                ))}
              </select>
            </div>
            <div className="p-2.5 bg-[#FAF7F0] rounded-xl border border-black/10 text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="font-mono uppercase tracking-wider text-slate-600">Godown Stock:</span>
              <span className="font-mono text-emerald-700 text-sm font-extrabold">{availableStock} pcs</span>
            </div>
          </div>

          {/* Buyer & Challan # */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Buyer / Consignee Name
              </label>
              <input
                type="text"
                placeholder="e.g. Reliance Trends / Myntra Warehouse"
                value={partyName}
                onChange={e => setPartyName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Dispatch Challan #
              </label>
              <input
                type="text"
                placeholder="e.g. DC-2024-88"
                value={challanNo}
                onChange={e => setChallanNo(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all"
              />
            </div>
          </div>

          {/* Variant Matrix */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Dispatch Size Breakdown
              </label>
              <button
                type="button"
                onClick={() => setVariantInputs(prev => [...prev, { color: 'Standard', size: 'XL', quantity: 0 }])}
                className="text-xs font-mono font-bold uppercase tracking-wider text-[#3A3564] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Size Row
              </button>
            </div>

            <div className="space-y-2">
              {variantInputs.map((v, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50/70 rounded-xl border border-slate-200/80 text-xs">
                  <input
                    type="text"
                    placeholder="Color"
                    value={v.color}
                    onChange={e => {
                      const copy = [...variantInputs]
                      copy[idx].color = e.target.value
                      setVariantInputs(copy)
                    }}
                    className="w-1/3 px-3 py-1.5 bg-white font-bold border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
                  />
                  <input
                    type="text"
                    placeholder="Size"
                    value={v.size}
                    onChange={e => {
                      const copy = [...variantInputs]
                      copy[idx].size = e.target.value
                      setVariantInputs(copy)
                    }}
                    className="w-1/4 px-3 py-1.5 bg-white font-bold border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
                  />
                  <input
                    type="number"
                    placeholder="0"
                    value={v.quantity === 0 ? '' : v.quantity}
                    onChange={e => {
                      const val = e.target.value
                      const copy = [...variantInputs]
                      copy[idx].quantity = val === '' ? 0 : Number(val)
                      setVariantInputs(copy)
                    }}
                    className="flex-1 px-3 py-1.5 bg-white font-mono font-bold text-rose-600 border border-slate-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setVariantInputs(variantInputs.filter((_, i) => i !== idx))}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Transporter Notes */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Dispatch & Transporter Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. VRL Logistics • 5 master cartons packed"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-black/10 bg-[#FAF7F0] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || totalDispatchPieces <= 0}
            className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Dispatching...' : `Confirm Dispatch (${totalDispatchPieces} pcs)`}
          </button>
        </div>
      </div>
    </div>
  )
}
