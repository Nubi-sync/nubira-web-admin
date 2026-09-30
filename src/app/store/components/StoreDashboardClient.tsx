'use client'

import { useState, useMemo, useTransition, useEffect, useRef } from 'react'
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
  Send,
  Scissors,
  ShieldAlert,
  PackageCheck,
  Minus,
  Store,
  UserCheck,
  Hash,
  Camera,
  Activity,
  TrendingDown,
  PackageSearch,
  Palette
} from 'lucide-react'
import { TvViewButton } from '@/components/ui/TvViewButton'
import { 
  createTruckInwardGrn, 
  updateTruckInwardChallanPhoto,
  issueBomMaterials, 
  saveProductionInward, 
  saveFinishedGoodsOutward,
  deleteTruckInward, 
  deleteStoreTransaction, 
  deleteAccessory, 
  deleteAccessoryByName,
  reissueFloorAccessory,
  deleteFloorAccessoryReissue,
  TruckInwardItemInput,
  BomMaterialItemState,
  FloorAccessoryReissuePayload
} from '../actions'
import { getDetailedItemBreakdown } from '@/utils/multiSizeParser'
import { ArticleConsumptionLedger } from './ArticleConsumptionLedger'

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
  vendor_name?: string | null
  unit_price?: number | null
  total_price?: number | null
  size?: string | null
  color?: string | null
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
  garment_type?: string | null
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
  priority?: string | null
  mending_status?: string | null
  mending_total_counted?: number | null
  mending_supervisor_name?: string | null
  handed_to_mending_by?: string | null
  handed_to_mending_at?: string | null
  mending_handover_notes?: string | null
  qc_status?: string | null
  qc_total_passed?: number | null
  qc_total_alter?: number | null
  qc_supervisor_name?: string | null
  handed_to_qc_by?: string | null
  handed_to_qc_at?: string | null
  store_inward_status?: string | null
  created_at: string
  article?: Article | null
  lineman?: { id: string; username: string; company_name?: string | null } | null
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

export type FloorAccessoryReissue = {
  id: string
  allotment_id?: string | null
  article_id?: string | null
  article_no: string
  challan_no?: string | null
  worker_name: string
  lineman_name?: string | null
  item_name: string
  quantity: number
  unit?: string | null
  reason: 'LOST' | 'MACHINE_DAMAGE' | 'DEFECTIVE_PIECE' | 'SHORT_IN_LOT'
  channel?: 'DIRECT_COUNTER' | 'VIA_LINEMAN' | null
  issued_by: string
  notes?: string | null
  entry_date: string
  created_at: string
}

interface StoreDashboardClientProps {
  currentUserName: string
  userEmail: string
  articles: Article[]
  challans?: any[]
  storeTransactions: StoreTransaction[]
  accessories: Accessory[]
  truckInwards: TruckInward[]
  activeAllotments: ActiveAllotment[]
  readyQcAllotments: ReadyQcAllotment[]
  floorReissues?: FloorAccessoryReissue[]
  workerAssignments?: Array<{ id: string; allotment_id?: string | null; worker_name?: string | null; article_id?: string | null }>
}

export function StoreDashboardClient({
  currentUserName,
  userEmail,
  articles,
  challans = [],
  storeTransactions,
  accessories,
  truckInwards,
  activeAllotments,
  readyQcAllotments,
  floorReissues = [],
  workerAssignments = [],
}: StoreDashboardClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Feed Filter States
  const [feedTimeFilter, setFeedTimeFilter] = useState<'24h' | '7d' | 'all'>('24h')
  const [feedCategoryFilter, setFeedCategoryFilter] = useState<'ALL' | 'BOM' | 'TRIMS' | 'GARMENTS' | 'REISSUES'>('ALL')
  const [feedSearchQuery, setFeedSearchQuery] = useState('')
  const [expandedBOMKeys, setExpandedBOMKeys] = useState<Set<string>>(new Set())
  const [expandedGrnId, setExpandedGrnId] = useState<string | null>(null)

  // Modal Triggers & Create Dropdown
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const createRef = useRef<HTMLDivElement>(null)
  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false)
  const [isBomModalOpen, setIsBomModalOpen] = useState(false)
  const [isReissueModalOpen, setIsReissueModalOpen] = useState(false)
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false)
  const [isOutwardModalOpen, setIsOutwardModalOpen] = useState(false)
  const [isGoodsInLineDrawerOpen, setIsGoodsInLineDrawerOpen] = useState(false)
  const [activePhoto, setActivePhoto] = useState<{ url: string; title: string } | null>(null)
  const [attachPhotoTarget, setAttachPhotoTarget] = useState<TruckInward | null>(null)
  const [prefilledLotForInward, setPrefilledLotForInward] = useState<ReadyQcAllotment | null>(null)

  // Close Create dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (createRef.current && !createRef.current.contains(e.target as Node)) {
        setIsCreateOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Delete Target State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'TRUCK_INWARD' | 'STORE_TRANSACTION' | 'ACCESSORY' | 'ACCESSORY_BY_NAME' | 'FLOOR_REISSUE'
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

  // Count articles awaiting BOM material handover to linemen
  const { 
    pendingArticlesCount, 
    totalArticlesCount, 
    pendingLotsCount, 
    issuedLotsCount, 
    totalLotsCount 
  } = useMemo(() => {
    const artMap = new Map<string, { totalLots: number; pendingLots: number }>()

    activeAllotments.forEach(al => {
      const art = (al.article?.art_no || '').trim().toUpperCase() || 'GENERAL'
      if (!artMap.has(art)) {
        artMap.set(art, { totalLots: 0, pendingLots: 0 })
      }
      const entry = artMap.get(art)!
      entry.totalLots += 1

      const mats = al.allotment_materials || []
      const isFullyIssued = mats.length > 0 && mats.every(m => (m as any).admin_issued)
      if (!isFullyIssued) {
        entry.pendingLots += 1
      }
    })

    let pendingArticles = 0
    let totalLots = 0
    let pendingLots = 0

    artMap.forEach(v => {
      totalLots += v.totalLots
      pendingLots += v.pendingLots
      if (v.pendingLots > 0) {
        pendingArticles += 1
      }
    })

    return {
      pendingArticlesCount: pendingArticles,
      totalArticlesCount: artMap.size,
      pendingLotsCount: pendingLots,
      issuedLotsCount: totalLots - pendingLots,
      totalLotsCount: totalLots
    }
  }, [activeAllotments])

  // 1. Total Store Pipeline Stocks (Challans & Orders)
  const challanTotalPcs = useMemo(() => {
    return (challans || []).reduce((sum: number, c: any) => sum + (c.total_pcs || 0), 0)
  }, [challans])

  const totalAllotmentTargetPcs = useMemo(() => {
    return activeAllotments
      .filter(al => al.status !== 'CANCELLED')
      .reduce((sum, al) => sum + (Number(al.target_qty) || 0), 0)
  }, [activeAllotments])

  const storeMetrics = useMemo(() => {
    const totalStocks = Math.max(challanTotalPcs, totalAllotmentTargetPcs)
    const goodsInLine = totalAllotmentTargetPcs
    const unallottedStocks = Math.max(0, totalStocks - goodsInLine)
    return {
      totalStocks,
      goodsInLine,
      unallottedStocks,
    }
  }, [challanTotalPcs, totalAllotmentTargetPcs])

  // 2. Low Stock & Critical Trims Inventory Analysis
  const inventoryRiskRadar = useMemo(() => {
    const itemMap = new Map<string, {
      name: string
      unit: string
      inward: number
      issued: number
      balance: number
      minSafety: number
      category: 'TAG' | 'LABEL' | 'THREAD' | 'PACKAGING' | 'FABRIC' | 'ACCESSORY'
      status: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'OPTIMAL'
    }>()

    // Inward from Truck Inward Items
    truckInwards.forEach(t => {
      (t.items || []).forEach(it => {
        const name = (it.item_name || '').trim()
        if (!name) return
        const unit = it.unit || 'pcs'
        const qty = Number(it.quantity) || 0
        if (!itemMap.has(name)) {
          let cat: 'TAG' | 'LABEL' | 'THREAD' | 'PACKAGING' | 'FABRIC' | 'ACCESSORY' = 'ACCESSORY'
          const lower = name.toLowerCase()
          if (lower.includes('tag')) cat = 'TAG'
          else if (lower.includes('label')) cat = 'LABEL'
          else if (lower.includes('thread') || lower.includes('dhaga')) cat = 'THREAD'
          else if (lower.includes('poly') || lower.includes('pack') || lower.includes('box')) cat = 'PACKAGING'
          else if (lower.includes('fabric') || lower.includes('roll')) cat = 'FABRIC'

          const minSafety = cat === 'THREAD' ? 10 : cat === 'PACKAGING' ? 500 : cat === 'TAG' || cat === 'LABEL' ? 300 : 50

          itemMap.set(name, {
            name,
            unit,
            inward: 0,
            issued: 0,
            balance: 0,
            minSafety,
            category: cat,
            status: 'OPTIMAL'
          })
        }
        itemMap.get(name)!.inward += qty
      })
    })

    // Inward and Issue from Accessories
    accessories.forEach(acc => {
      const name = (acc.item_name || '').trim()
      if (!name) return
      const unit = acc.unit || 'pcs'
      const qty = Number(acc.quantity) || 0
      const isIssue = (acc.action as string) === 'OUT' || (acc.action as string) === 'ISSUE' || (acc.notes || '').includes('BOM Handover')
      if (!itemMap.has(name)) {
        let cat: 'TAG' | 'LABEL' | 'THREAD' | 'PACKAGING' | 'FABRIC' | 'ACCESSORY' = 'ACCESSORY'
        const lower = name.toLowerCase()
        if (lower.includes('tag')) cat = 'TAG'
        else if (lower.includes('label')) cat = 'LABEL'
        else if (lower.includes('thread') || lower.includes('dhaga')) cat = 'THREAD'
        else if (lower.includes('poly') || lower.includes('pack') || lower.includes('box')) cat = 'PACKAGING'
        else if (lower.includes('fabric') || lower.includes('roll')) cat = 'FABRIC'

        const minSafety = cat === 'THREAD' ? 10 : cat === 'PACKAGING' ? 500 : cat === 'TAG' || cat === 'LABEL' ? 300 : 50

        itemMap.set(name, {
          name,
          unit,
          inward: 0,
          issued: 0,
          balance: 0,
          minSafety,
          category: cat,
          status: 'OPTIMAL'
        })
      }

      if (isIssue) {
        itemMap.get(name)!.issued += qty
      } else {
        itemMap.get(name)!.inward += qty
      }
    })

    // Standard baseline trims always tracked
    const defaultMonitoredItems = [
      { name: 'Main Brand Neck Tag', unit: 'pcs', minSafety: 500, category: 'TAG' as const },
      { name: 'Matching Sewing Thread', unit: 'cones', minSafety: 15, category: 'THREAD' as const },
      { name: 'Washing Care & Size Label', unit: 'pcs', minSafety: 500, category: 'LABEL' as const },
      { name: 'Master Polybag (Self Adhesive)', unit: 'pcs', minSafety: 1000, category: 'PACKAGING' as const }
    ]

    defaultMonitoredItems.forEach(d => {
      if (!itemMap.has(d.name)) {
        const totalReq = activeAllotments.reduce((sum, al) => sum + (Number(al.target_qty) || 0), 0)
        const issuedQty = activeAllotments.filter(al => (al.allotment_materials || []).some(m => m.admin_issued)).reduce((sum, al) => sum + (Number(al.target_qty) || 0), 0)
        itemMap.set(d.name, {
          name: d.name,
          unit: d.unit,
          inward: Math.round(totalReq * 1.05),
          issued: issuedQty,
          balance: 0,
          minSafety: d.minSafety,
          category: d.category,
          status: 'OPTIMAL'
        })
      }
    })

    const allItems = Array.from(itemMap.values()).map(it => {
      const balance = Math.max(0, it.inward - it.issued)
      let status: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'OPTIMAL' = 'OPTIMAL'
      if (balance === 0) {
        status = 'OUT_OF_STOCK'
      } else if (balance <= it.minSafety) {
        status = 'LOW_STOCK'
      }
      return {
        ...it,
        balance,
        status
      }
    })

    const criticalItems = allItems.filter(it => it.status !== 'OPTIMAL')
    const outOfStockCount = allItems.filter(it => it.status === 'OUT_OF_STOCK').length
    const lowStockCount = allItems.filter(it => it.status === 'LOW_STOCK').length

    return {
      allItems,
      criticalItems,
      outOfStockCount,
      lowStockCount,
      totalAlerts: criticalItems.length
    }
  }, [truckInwards, accessories, activeAllotments])

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

    // 3. Add Floor Accessory Re-issues (Worker Loss & Machine Damage)
    floorReissues.forEach(re => {
      combined.push({
        isGroupedBOM: false,
        isAccessory: false,
        isFloorReissue: true,
        id: re.id,
        created_at: re.created_at,
        entry_date: re.entry_date,
        article_no: re.article_no,
        challan_no: re.challan_no,
        worker_name: re.worker_name,
        lineman_name: re.lineman_name,
        item_name: re.item_name,
        quantity: Number(re.quantity) || 0,
        unit: re.unit || 'pcs',
        reason: re.reason,
        channel: re.channel,
        issued_by: re.issued_by,
        notes: re.notes,
      })
    })

    // Sort descending by created_at
    combined.sort((a, b) => {
      const tA = a.created_at || a.entry_date || ''
      const tB = b.created_at || b.entry_date || ''
      return tB.localeCompare(tA)
    })

    return combined
  }, [accessories, storeTransactions, floorReissues])

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
        if (log.isAccessory || log.isFloorReissue) return false
      } else if (feedCategoryFilter === 'REISSUES') {
        if (!log.isFloorReissue) return false
      }

      // 3. Search Query
      if (feedSearchQuery) {
        const q = feedSearchQuery.toLowerCase()
        const matchItem = (log.item_name || log.art_no || log.article_no || '').toLowerCase().includes(q)
        const matchParty = (log.party_name || log.worker_name || log.lineman_name || '').toLowerCase().includes(q)
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
      } else if (deleteTarget.type === 'FLOOR_REISSUE') {
        res = await deleteFloorAccessoryReissue(deleteTarget.id)
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
          {/* + Create Dropdown */}
          <div className="relative" ref={createRef}>
            <button
              type="button"
              onClick={() => setIsCreateOpen(prev => !prev)}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#3A3564] hover:bg-[#2F2B52] text-white shadow-xs hover:shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create</span>
              <ChevronDown className={`w-3.5 h-3.5 text-white/80 transition-transform duration-150 ${isCreateOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCreateOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-[#14140F]/15 py-2 z-50 text-[#14140F] text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Store Quick Actions
                </div>
                
                {/* 1. Accessory Inward (GRN) */}
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false)
                    setIsGrnModalOpen(true)
                  }}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#FAF7F0] transition-colors text-left group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] group-hover:bg-[#3A3564] text-[#3A3564] group-hover:text-[#FAF7F0] border border-black/10 flex items-center justify-center shrink-0 transition-colors shadow-2xs mt-0.5">
                    <Receipt className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-slate-900 group-hover:text-[#3A3564] transition-colors">
                      Accessory Inward (GRN)
                    </div>
                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Record supplier delivery slip, trims, fabrics &amp; due items
                    </div>
                  </div>
                </button>

                {/* 2. BOM Material Handover */}
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false)
                    setIsBomModalOpen(true)
                  }}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#FAF7F0] transition-colors text-left group cursor-pointer border-t border-slate-100"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] group-hover:bg-[#3A3564] text-[#3A3564] group-hover:text-[#FAF7F0] border border-black/10 flex items-center justify-center shrink-0 transition-colors shadow-2xs mt-0.5">
                    <Boxes className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-slate-900 group-hover:text-[#3A3564] transition-colors">
                      BOM Material Handover
                    </div>
                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Inspect raw materials &amp; issue BOM lots to Linemen
                    </div>
                  </div>
                </button>

                {/* 3. Floor Loss / Re-Issue */}
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false)
                    setIsReissueModalOpen(true)
                  }}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-amber-50/50 transition-colors text-left group cursor-pointer border-t border-slate-100"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-50 group-hover:bg-amber-600 text-amber-700 group-hover:text-white border border-amber-200/80 flex items-center justify-center shrink-0 transition-colors shadow-2xs mt-0.5">
                    <RotateCw className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                      Floor Loss / Re-Issue
                    </div>
                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Log replacement accessories given to tailors for lost or damaged trims
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

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
      {/* 2. 5 STORE & GODOWN OPERATIONAL KPI CARDS                    */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
        
        {/* Card 1: Total Store Stocks */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 hover:border-[#3A3564]/40 hover:shadow-md transition-all flex flex-col justify-between group relative shadow-2xs">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#3A3564] group-hover:text-white transition-colors">
                <Warehouse className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#3A3564] transition-colors">
                STORE 01
              </span>
            </div>
            <div className="mt-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block truncate">
                1. Total Store Stocks
              </span>
              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                Cutting & Inward Target
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100/80">
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 leading-none">
              {storeMetrics.totalStocks.toLocaleString()}
            </h3>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 tracking-wider shadow-2xs">
                Total Pipeline
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-medium">pcs</span>
            </div>
          </div>
        </div>

        {/* Card 2: Goods In Line (Issued to Floor) - Interactive Drilldown */}
        <div 
          role="button"
          tabIndex={0}
          onClick={() => setIsGoodsInLineDrawerOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setIsGoodsInLineDrawerOpen(true)
            }
          }}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 hover:border-[#3A3564] hover:shadow-lg transition-all flex flex-col justify-between group relative shadow-2xs cursor-pointer ring-0 hover:ring-2 hover:ring-[#3A3564]/10 text-left select-none"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#3A3564] group-hover:text-white transition-colors">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#3A3564] transition-colors flex items-center gap-1">
                <span>INSPECT WIP</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-[#3A3564]" />
              </span>
            </div>
            <div className="mt-3.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block truncate group-hover:text-[#3A3564] transition-colors">
                  2. Goods in Line
                </span>
                <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                  Drawer
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                Lineman, Mending & QC Floor Live WIP
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100/80">
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 leading-none group-hover:text-[#3A3564] transition-colors">
              {storeMetrics.goodsInLine.toLocaleString()}
            </h3>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 tracking-wider shadow-2xs group-hover:bg-[#3A3564] group-hover:text-white transition-colors">
                {activeAllotments.length} Active Lots →
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-medium">
                {storeMetrics.totalStocks > 0 ? `${Math.round((storeMetrics.goodsInLine / storeMetrics.totalStocks) * 100)}% on floor` : '0%'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending to Issue (Store Balance) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 hover:border-[#3A3564]/40 hover:shadow-md transition-all flex flex-col justify-between group relative shadow-2xs">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#3A3564] group-hover:text-white transition-colors">
                <Boxes className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#3A3564] transition-colors">
                STORE 03
              </span>
            </div>
            <div className="mt-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block truncate">
                3. Pending to Issue
              </span>
              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                Store Godown Balance
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100/80">
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 leading-none">
              {storeMetrics.unallottedStocks.toLocaleString()}
            </h3>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 tracking-wider shadow-2xs">
                In Godown
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-medium">unallotted</span>
            </div>
          </div>
        </div>

        {/* Card 4: Lineman BOM Handover Pending */}
        <div 
          onClick={() => setIsBomModalOpen(true)}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 hover:border-[#3A3564]/40 hover:shadow-md transition-all flex flex-col justify-between group relative shadow-2xs cursor-pointer select-none hover:-translate-y-0.5"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#3A3564] group-hover:text-white transition-colors">
                <Boxes className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 tracking-wider shadow-2xs group-hover:bg-[#3A3564] group-hover:text-white transition-colors">
                  HANDOVER
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#3A3564] transition-colors hidden sm:inline">
                  ISSUE BOM
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#3A3564] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
            <div className="mt-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block truncate">
                4. BOM Handover to Lineman
              </span>
              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                Inspect raw materials & issue BOM lot
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100/80">
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 leading-none flex items-baseline">
              {pendingArticlesCount}
              <span className="text-xs sm:text-sm font-bold text-slate-500 font-sans ml-1.5">
                Articles
              </span>
            </h3>
            <div className="mt-2.5 flex items-center justify-between">
              <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border tracking-wider shadow-2xs ${
                pendingArticlesCount > 0 
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}>
                {pendingArticlesCount > 0 ? `${pendingArticlesCount} Pending Styles` : 'All Articles Issued'}
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-medium">
                {pendingLotsCount} lots queue
              </span>
            </div>
          </div>
        </div>

        {/* Card 5: Low Stock & Out-of-Stock Alert */}
        <div className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between group relative shadow-2xs ${
          inventoryRiskRadar.totalAlerts > 0
            ? 'bg-rose-50/40 border-rose-200 hover:border-rose-400'
            : 'bg-white border-black/10 hover:border-[#3A3564]/40 hover:shadow-md'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs border ${
                inventoryRiskRadar.totalAlerts > 0
                  ? 'bg-rose-100 text-rose-700 border-rose-300'
                  : 'bg-[#FAF7F0] text-[#3A3564] border-black/10 group-hover:bg-[#3A3564] group-hover:text-white transition-colors'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                inventoryRiskRadar.totalAlerts > 0 ? 'text-rose-600' : 'text-slate-400'
              }`}>
                RISK RADAR
              </span>
            </div>
            <div className="mt-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block truncate">
                5. Low Stock Alerts
              </span>
              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                Trims Safety Radar
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100/80">
            <h3 className={`text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] leading-none ${
              inventoryRiskRadar.totalAlerts > 0 ? 'text-rose-700' : 'text-slate-900'
            }`}>
              {inventoryRiskRadar.totalAlerts}
            </h3>
            <div className="mt-2.5 flex items-center justify-between">
              <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border tracking-wider shadow-2xs ${
                inventoryRiskRadar.totalAlerts > 0
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}>
                {inventoryRiskRadar.totalAlerts > 0 ? `${inventoryRiskRadar.totalAlerts} Critical` : 'Stock Healthy'}
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-medium">trims</span>
            </div>
          </div>
        </div>

      </div>





      {/* ============================================================ */}
      {/* 4.5 LIVE ARTICLE MATERIAL CONSUMPTION LEDGER                  */}
      {/* ============================================================ */}
      <div id="material-consumption-ledger">
        <ArticleConsumptionLedger 
          activeAllotments={activeAllotments} 
          truckInwards={truckInwards} 
        />
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
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold font-mono bg-[#FAF7F0] text-slate-800 border border-black/10 rounded-lg">
                            <AlertCircle className="w-3 h-3 text-slate-700" />
                            Defective: {totalDefectiveQty} pcs
                          </span>
                        )}
                        {isDue && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold font-mono bg-[#FAF7F0] text-[#3A3564] border border-black/10 rounded-lg">
                            <Clock className="w-3 h-3 text-[#3A3564]" />
                            Due: {totalDueQty > 0 ? `${totalDueQty} pcs` : 'Pending'}
                          </span>
                        )}
                        {!isDue && !isShortage && !isDefective && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold font-mono bg-[#FAF7F0] text-[#3A3564] border border-black/10 rounded-lg">
                            <CheckCircle2 className="w-3 h-3 text-[#3A3564]" />
                            Verified
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 mt-1.5 font-[family-name:var(--font-heading)]">
                        {grn.party_name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 flex-wrap mt-0.5">
                        <span>Challan #{grn.challan_no || '-'} • Vehicle: {grn.truck_no || 'Direct Inward'} • Style: {grn.article_no || '-'}</span>
                        {grn.garment_type && (
                          <span className="px-2 py-0.5 text-[11px] font-bold font-mono bg-[#FAF7F0] text-slate-700 border border-black/10 rounded-md">
                            {grn.garment_type}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {grn.challan_photo_url ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setActivePhoto({ url: grn.challan_photo_url!, title: `${grn.party_name} - ${grn.grn_no}` })}
                            className="p-2 text-[#3A3564] hover:bg-[#FAF7F0] rounded-xl border border-black/10 shadow-2xs transition-colors cursor-pointer"
                            title="View Paper Challan Slip Photo"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setAttachPhotoTarget(grn)}
                            className="p-2 text-slate-500 hover:text-[#3A3564] hover:bg-[#FAF7F0] rounded-xl border border-black/10 shadow-2xs transition-colors cursor-pointer"
                            title="Update / Re-take Paper Challan Photo"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAttachPhotoTarget(grn)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#3A3564] bg-[#FAF7F0] hover:bg-[#3A3564] hover:text-white border border-[#3A3564]/30 rounded-xl transition-all shadow-2xs cursor-pointer"
                          title="Attach Physical Paper Slip Photo"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Attach Slip Photo</span>
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
                        className="p-2 text-slate-400 hover:text-slate-800 hover:bg-[#FAF7F0] rounded-xl transition-colors cursor-pointer"
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
                      <span className="font-mono font-extrabold text-slate-800 text-sm tabular-nums">{totalChallanQty}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-mono font-bold uppercase text-slate-500">In Godown</span>
                      <span className="font-mono font-extrabold text-slate-900 text-sm tabular-nums">{totalReceivedQty}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-mono font-bold uppercase text-slate-400">
                        {isShortage ? 'Shortage' : isDefective ? 'Defective' : isDue ? 'Due' : 'Variance'}
                      </span>
                      <span className="font-mono font-extrabold text-sm text-slate-900 tabular-nums">
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

                  {/* Expandable Items Preview */}
                  {items.length > 0 && (
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setExpandedGrnId(expandedGrnId === grn.id ? null : grn.id)}
                        className="w-full flex items-center justify-between text-xs font-mono font-bold text-slate-600 hover:text-[#3A3564] py-1 cursor-pointer transition-colors"
                      >
                        <span>Materials Inwarded ({items.length} items)</span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          {expandedGrnId === grn.id ? 'Collapse' : 'Inspect'}
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedGrnId === grn.id ? 'rotate-180' : ''}`} />
                        </span>
                      </button>

                      {expandedGrnId === grn.id && (
                        <div className="space-y-2 pt-1">
                          {items.map((it, idx) => {
                            const itChallan = it.challan_quantity ?? it.quantity ?? 0
                            const itReceived = it.received_quantity ?? it.quantity ?? 0
                            const itShortage = it.shortage_quantity ?? 0
                            const itStatus = it.status || (itShortage > 0 ? 'SHORTAGE' : 'RECEIVED')
                            const breakdown = getDetailedItemBreakdown(it.item_name, Number(itReceived) || 0, it.size_label || it.size)

                            return (
                              <div 
                                key={idx} 
                                className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-2 text-xs shadow-2xs"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <span className="font-bold text-slate-900 block truncate" title={it.item_name}>
                                      {breakdown.cleanName}
                                    </span>
                                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                      <span className="text-[11px] text-slate-500 font-mono">
                                        {it.item_type || 'Material'} • {it.color || 'Standard'}
                                      </span>
                                      {breakdown.isMultiSize && breakdown.sizes.length > 0 && (
                                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                          Sizes: {breakdown.sizes.join(', ')}
                                        </span>
                                      )}
                                      {breakdown.bufferQty > 0 && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-[#3A3564] border border-[#3A3564]/20 shadow-2xs" title="Safety Buffer Reserve in Store Rack">
                                          <ShieldCheck className="w-3 h-3 text-[#3A3564]" />
                                          <span>Buffer: +{breakdown.bufferQty}</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono font-bold uppercase text-[10px] bg-[#FAF7F0] text-slate-800 border border-black/10 shrink-0">
                                    {itStatus === 'SHORTAGE' ? (
                                      <><AlertTriangle className="w-3 h-3 text-slate-700" /> Shortage</>
                                    ) : itStatus === 'DEFECTIVE' ? (
                                      <><AlertCircle className="w-3 h-3 text-slate-700" /> Defective</>
                                    ) : itStatus === 'DUE' ? (
                                      <><Clock className="w-3 h-3 text-[#3A3564]" /> Due</>
                                    ) : (
                                      <><CheckCircle2 className="w-3 h-3 text-[#3A3564]" /> Received</>
                                    )}
                                  </span>
                                </div>

                                {/* Size-Wise Breakdown Matrix */}
                                {breakdown.isMultiSize && breakdown.sizeBreakdown.length > 0 && (
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1.5 border-t border-slate-100">
                                    {breakdown.sizeBreakdown.map((sb) => (
                                      <div 
                                        key={sb.size} 
                                        className="flex items-center justify-between px-2 py-1 bg-[#FAF7F0] border border-black/10 rounded-md text-[11px] shadow-2xs"
                                      >
                                        <span className="font-bold text-[#3A3564]">Size {sb.size}</span>
                                        <span className="font-mono font-bold text-slate-800">
                                          {sb.qty.toLocaleString('en-IN')} <span className="text-[9px] font-normal text-slate-500">{it.unit || 'pcs'}</span>
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-slate-600 pt-1 border-t border-slate-200/50">
                                  <span>Challan: <strong className="text-slate-800">{itChallan} {it.unit || 'pcs'}</strong></span>
                                  <span>Received: <strong className="text-slate-900">{itReceived} {it.unit || 'pcs'}</strong></span>
                                  {itShortage > 0 && (
                                    <span className="text-slate-900 font-bold">
                                      {itStatus}: {itShortage} {it.unit || 'pcs'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

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
                        const breakdown = getDetailedItemBreakdown(it.item_name, itReceived, it.size_label || it.size_color)

                        return (
                          <div key={idx} className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-slate-900 truncate" title={it.item_name}>
                                  {breakdown.cleanName}
                                </p>
                                {breakdown.isMultiSize && breakdown.sizes.length > 0 && (
                                  <p className="text-[10px] text-slate-500 font-mono">
                                    Sizes: {breakdown.sizes.join(', ')}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {breakdown.bufferQty > 0 && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-[#3A3564] border border-[#3A3564]/20 shadow-2xs" title="Safety Buffer Reserve">
                                    <ShieldCheck className="w-3 h-3 text-[#3A3564]" />
                                    <span>+{breakdown.bufferQty} Buffer</span>
                                  </span>
                                )}
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
                            </div>

                            {/* Size-Wise Breakdown Matrix */}
                            {breakdown.isMultiSize && breakdown.sizeBreakdown.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1.5 border-t border-slate-200/60">
                                {breakdown.sizeBreakdown.map((sb) => (
                                  <div 
                                    key={sb.size} 
                                    className="flex items-center justify-between px-2 py-1 bg-white border border-black/10 rounded-md text-[11px] shadow-2xs"
                                  >
                                    <span className="font-bold text-[#3A3564]">Size {sb.size}</span>
                                    <span className="font-mono font-bold text-slate-800">
                                      {sb.qty.toLocaleString('en-IN')} <span className="text-[9px] font-normal text-slate-500">{it.unit || 'pcs'}</span>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

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
            { key: 'REISSUES', label: 'Floor Re-Issues (Loss/Damage)', icon: RotateCw },
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
                        Chain of Custody: Store Godown -&gt; Lineman
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

              // 2. Floor Accessory Re-issue Log Card (Worker Loss & Machine Damage)
              if (log.isFloorReissue) {
                const reasonLabelMap: Record<string, { label: string; badgeClass: string }> = {
                  LOST: { label: 'Worker Lost (खोगी)', badgeClass: 'bg-rose-50 text-rose-800 border-rose-200' },
                  MACHINE_DAMAGE: { label: 'Machine Damage (मशीन में टूटी)', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' },
                  DEFECTIVE_PIECE: { label: 'Defective (खराब निकली)', badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
                  SHORT_IN_LOT: { label: 'Lot Shortage (कम निकली)', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                }
                const reasonInfo = reasonLabelMap[log.reason] || { label: log.reason, badgeClass: 'bg-slate-100 text-slate-800 border-slate-200' }

                return (
                  <div
                    key={log.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-amber-200/80 hover:border-amber-400 shadow-2xs flex items-start justify-between gap-3 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0 shadow-2xs">
                        <RotateCw className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800">
                            Floor Re-Issue
                          </span>
                          <span className="text-xs font-mono font-bold bg-[#FAF7F0] text-[#3A3564] px-2 py-0.5 rounded border border-black/10">
                            Art #{log.article_no}
                          </span>
                          {log.challan_no && (
                            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 rounded">
                              Challan #{log.challan_no}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border ${reasonInfo.badgeClass}`}>
                            {reasonInfo.label}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-50 text-slate-600 rounded-lg border border-slate-200">
                            {log.channel === 'VIA_LINEMAN' ? 'Via Lineman' : 'Direct Counter'}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 mt-1">
                          Tailor: <span className="text-[#3A3564] font-black">{log.worker_name}</span>
                          {log.lineman_name && <span className="text-xs text-slate-500 font-medium ml-2">• Line: {log.lineman_name}</span>}
                        </h4>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                          Item: <strong className="text-slate-900">{log.item_name}</strong>
                          {log.notes && <span className="text-slate-500 italic"> • {log.notes}</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="text-right font-mono">
                        <span className="text-sm sm:text-base font-black text-rose-700">
                          -{log.quantity} {log.unit}
                        </span>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {log.entry_date || 'Today'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({
                          type: 'FLOOR_REISSUE',
                          id: log.id,
                          title: `Re-Issue: ${log.item_name} (${log.quantity} ${log.unit})`,
                          subtitle: `Tailor: ${log.worker_name} • Art #${log.article_no}`
                        })}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Re-issue entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              }

              // 3. Garment Inward/Outward Log Card
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
          truckInwards={truckInwards}
          currentUserName={currentUserName}
        />
      )}

      {/* ============================================================ */}
      {/* MODAL 1B: ATTACH / UPDATE PAPER CHALLAN SLIP PHOTO */}
      {/* ============================================================ */}
      {attachPhotoTarget && (
        <AttachChallanPhotoModal
          onClose={() => setAttachPhotoTarget(null)}
          truckInward={attachPhotoTarget}
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
      {/* MODAL 2B: FLOOR ACCESSORY RE-ISSUE & LOSS ENTRY */}
      {/* ============================================================ */}
      {isReissueModalOpen && (
        <AccessoryReissueModal
          onClose={() => setIsReissueModalOpen(false)}
          activeAllotments={activeAllotments}
          workerAssignments={workerAssignments}
          accessories={accessories}
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

      {/* ============================================================ */}
      {/* SLIDE-OVER DRAWER: GOODS IN LINE (LIVE FLOOR WIP BREAKDOWN) */}
      {/* ============================================================ */}
      {isGoodsInLineDrawerOpen && (
        <GoodsInLineDrawer
          onClose={() => setIsGoodsInLineDrawerOpen(false)}
          activeAllotments={activeAllotments}
          readyQcAllotments={readyQcAllotments}
        />
      )}


    </div>
  )
}

// ====================================================================
// HELPER: HISTORICAL ACCESSORY / TRIM RESOLUTION BY GARMENT TYPE
// ====================================================================
function getHistoricalTrimsForGarment(
  garmentType: string,
  articleNo: string,
  truckInwards: TruckInward[] = []
): Array<{ item_name: string; unit: string }> {
  const gClean = (garmentType || '').trim().toLowerCase()
  const aClean = (articleNo || '').trim().toLowerCase()
  const foundMap = new Map<string, { item_name: string; unit: string }>()

  // 1. First priority: Exact article_no match from past inward transactions
  if (aClean) {
    const artMatches = truckInwards.filter(t => (t.article_no || '').trim().toLowerCase() === aClean)
    for (const t of artMatches) {
      const lineList = t.items && t.items.length > 0 ? t.items : (Array.isArray(t.line_items) ? t.line_items : [])
      for (const item of lineList) {
        const name = (item.item_name || '').trim()
        if (name && !foundMap.has(name.toLowerCase())) {
          foundMap.set(name.toLowerCase(), {
            item_name: name,
            unit: (item.unit || 'pcs').trim()
          })
        }
      }
    }
  }

  // 2. Second priority: Match past challans by garment_type
  if (gClean) {
    const gMatches = truckInwards.filter(t => {
      const dbG = (t.garment_type || '').trim().toLowerCase()
      if (dbG) {
        return dbG === gClean || dbG.includes(gClean) || gClean.includes(dbG)
      }
      if (t.notes) {
        const match = t.notes.match(/\[Garment:\s*([^\]]+)\]/i)
        if (match) {
          const noteG = match[1].trim().toLowerCase()
          return noteG === gClean || noteG.includes(gClean) || gClean.includes(noteG)
        }
      }
      return false
    })

    for (const t of gMatches) {
      const lineList = t.items && t.items.length > 0 ? t.items : (Array.isArray(t.line_items) ? t.line_items : [])
      for (const item of lineList) {
        const name = (item.item_name || '').trim()
        if (name && !foundMap.has(name.toLowerCase())) {
          foundMap.set(name.toLowerCase(), {
            item_name: name,
            unit: (item.unit || 'pcs').trim()
          })
        }
      }
    }
  }

  if (foundMap.size > 0) {
    return Array.from(foundMap.values())
  }

  // 3. Industrial Standard Garment Fallback BOM
  if (gClean.includes('suit') || gClean.includes('kurti') || gClean.includes('set')) {
    return [
      { item_name: 'Main Zipper', unit: 'pcs' },
      { item_name: 'Main Brand Neck Label', unit: 'pcs' },
      { item_name: 'Wash Care Label', unit: 'pcs' },
      { item_name: 'Matching Sewing Thread', unit: 'cones' },
      { item_name: 'Waist Elastic Tape', unit: 'mt' },
      { item_name: 'Drawcord / Dori', unit: 'mt' },
    ]
  }

  if (gClean.includes('jacket') || gClean.includes('coat') || gClean.includes('blazer')) {
    return [
      { item_name: 'Front Open Zipper', unit: 'pcs' },
      { item_name: 'Pocket Zippers', unit: 'pcs' },
      { item_name: 'Main Brand Label', unit: 'pcs' },
      { item_name: 'Rib Elastic Tape', unit: 'mt' },
      { item_name: 'Sewing Thread', unit: 'cones' },
      { item_name: 'Snap Buttons / Rivets', unit: 'pcs' },
    ]
  }

  if (gClean.includes('pant') || gClean.includes('trouser') || gClean.includes('lower') || gClean.includes('pyjama') || gClean.includes('track')) {
    return [
      { item_name: 'Waistband Elastic Tape', unit: 'mt' },
      { item_name: 'Drawcord', unit: 'mt' },
      { item_name: 'Pocket Zipper', unit: 'pcs' },
      { item_name: 'Brand Label', unit: 'pcs' },
      { item_name: 'Sewing Thread', unit: 'cones' },
    ]
  }

  if (gClean.includes('top') || gClean.includes('t-shirt') || gClean.includes('shirt') || gClean.includes('tshirt')) {
    return [
      { item_name: 'Neck Ribbing Tape', unit: 'mt' },
      { item_name: 'Brand Neck Label', unit: 'pcs' },
      { item_name: 'Wash Care Label', unit: 'pcs' },
      { item_name: 'Sewing Thread', unit: 'cones' },
    ]
  }

  return []
}

// ====================================================================
// SUBCOMPONENT: MODAL 1 - ACCESSORY CHALLAN INWARD (GRN)
// ====================================================================
function GrnInwardModal({
  onClose,
  articles,
  truckInwards = [],
  currentUserName,
}: {
  onClose: () => void
  articles: Article[]
  truckInwards?: TruckInward[]
  currentUserName: string
}) {
  const router = useRouter()
  const [partyName, setPartyName] = useState('')
  const [articleNo, setArticleNo] = useState('')
  const [garmentType, setGarmentType] = useState('')
  const [challanNo, setChallanNo] = useState('')
  const [truckNo, setTruckNo] = useState('')
  const [inwardDate, setInwardDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [items, setItems] = useState<TruckInwardItemInput[]>([])
  const [appliedGarmentProfile, setAppliedGarmentProfile] = useState<string | null>(null)
  const [suggestedTrims, setSuggestedTrims] = useState<Array<{ item_name: string; unit: string }>>([])
  const [showProfileBanner, setShowProfileBanner] = useState(false)

  const triggerTrimsLookup = (gType: string, aNo: string, currentItems: TruckInwardItemInput[]) => {
    const g = gType.trim()
    const a = aNo.trim()
    if (g.length < 2 && a.length < 2) {
      setSuggestedTrims([])
      setShowProfileBanner(false)
      return
    }

    const matches = getHistoricalTrimsForGarment(g, a, truckInwards)
    if (matches.length > 0) {
      setSuggestedTrims(matches)
      // If table is currently empty, auto-populate immediately!
      if (currentItems.length === 0) {
        setItems(matches.map(t => ({
          item_name: t.item_name,
          vendor_name: '',
          unit_price: 0,
          total_price: 0,
          quantity: 0,
          challan_qty: 0,
          unit: t.unit || 'pcs',
          size: '',
          color: '',
          size_label: '',
          status: 'RECEIVED',
          shortage_qty: 0,
          remarks: ''
        })))
        setAppliedGarmentProfile(g || a)
        setShowProfileBanner(false)
      } else {
        // If items already exist and this profile is not the currently applied one
        if (appliedGarmentProfile?.toLowerCase() !== (g || a).toLowerCase()) {
          setShowProfileBanner(true)
        }
      }
    } else {
      setSuggestedTrims([])
      setShowProfileBanner(false)
    }
  }

  const handleGarmentTypeChange = (val: string) => {
    setGarmentType(val)
    triggerTrimsLookup(val, articleNo, items)
  }

  const handleArticleNoChange = (val: string) => {
    setArticleNo(val)
    let targetGarment = garmentType
    if (!garmentType.trim()) {
      const found = articles.find(a => a.art_no?.toLowerCase() === val.trim().toLowerCase())
      if (found && found.description) {
        targetGarment = found.description
        setGarmentType(found.description)
      }
    }
    triggerTrimsLookup(targetGarment, val, items)
  }

  const handleApplyProfile = () => {
    if (suggestedTrims.length === 0) return
    setItems(suggestedTrims.map(t => ({
      item_name: t.item_name,
      vendor_name: '',
      unit_price: 0,
      total_price: 0,
      quantity: 0,
      challan_qty: 0,
      unit: t.unit || 'pcs',
      size: '',
      color: '',
      size_label: '',
      status: 'RECEIVED',
      shortage_qty: 0,
      remarks: ''
    })))
    setAppliedGarmentProfile(garmentType.trim() || articleNo.trim())
    setShowProfileBanner(false)
  }

  const handleClearAllItems = () => {
    setItems([])
    setAppliedGarmentProfile(null)
    setShowProfileBanner(false)
  }

  // Presets to quickly add items
  const addPreset = (name: string, unit: string = 'pcs') => {
    setItems(prev => [
      ...prev,
      { item_name: name, vendor_name: '', unit_price: 0, total_price: 0, quantity: 0, challan_qty: 0, unit, size: '', color: '', size_label: '', status: 'RECEIVED', shortage_qty: 0, remarks: '' }
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
    if (!challanNo.trim()) {
      setError('Please enter Challan / Bill Number.')
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
      garment_type: garmentType.trim() || null,
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
      <div className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[90vh]">
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
                Consolidated Supplier / Consignor (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Multi-Vendor / Sourced / Transporter (or leave blank)"
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

          {/* Row 2: Challan #, Truck #, Article Target, Garment Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Challan / Bill # *
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
                onChange={e => handleArticleNoChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Garment Type / Style
              </label>
              <input
                type="text"
                placeholder="e.g. Suit, Top, Pant, Jacket..."
                value={garmentType}
                onChange={e => handleGarmentTypeChange(e.target.value)}
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
                className="px-3 py-1.5 text-xs font-bold bg-[#FAF7F0] hover:bg-[#F2ECE1] text-[#3A3564] rounded-xl border border-black/10 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> {p}
              </button>
            ))}
          </div>

          {/* Historical Profile Notification Banner */}
          {showProfileBanner && suggestedTrims.length > 0 && (
            <div className="p-3 bg-slate-50 border border-[#3A3564]/25 rounded-xl flex items-center justify-between gap-3 text-xs shadow-2xs animate-in fade-in">
              <div className="flex items-center gap-2 text-slate-700 min-w-0">
                <Sparkles className="w-4 h-4 text-[#3A3564] shrink-0" />
                <span className="truncate">
                  Historical Profile Found: <strong className="text-slate-900 font-bold">{suggestedTrims.length} standard trims</strong> recorded for <span className="font-bold text-[#3A3564]">{garmentType.trim() || articleNo.trim()}</span>.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleApplyProfile}
                  className="px-3 py-1 bg-[#3A3564] text-white font-bold rounded-lg hover:bg-[#2c284e] transition-colors shadow-2xs cursor-pointer"
                >
                  Load Profile
                </button>
                <button
                  type="button"
                  onClick={() => setShowProfileBanner(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  title="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Line Items Table / List */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Challan Line Items ({items.length})
              </label>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => setItems(prev => [
                    ...prev,
                    { item_name: '', vendor_name: '', unit_price: 0, total_price: 0, quantity: 0, challan_qty: 0, unit: 'pcs', size: '', color: '', size_label: '', status: 'RECEIVED', shortage_qty: 0, remarks: '' }
                  ])}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#3A3564] hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Line Item
                </button>
              )}
            </div>

            {/* Active profile indicator */}
            {appliedGarmentProfile && items.length > 0 && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <Layers className="w-3.5 h-3.5 text-[#3A3564] shrink-0" />
                  <span>
                    Auto-populated <strong className="text-slate-900">{items.length} trims</strong> for <span className="font-bold text-[#3A3564]">{appliedGarmentProfile}</span>. Enter received quantities below.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClearAllItems}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Clear all line items"
                >
                  <RotateCw className="w-3 h-3" />
                  Clear All
                </button>
              </div>
            )}

            {items.length === 0 ? (
              <div className="p-6 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs font-semibold text-slate-500 mb-2.5">
                  No line items added yet. Type a Garment Type above to auto-load standard trims, or click an "Add Preset" button.
                </p>
                <button
                  type="button"
                  onClick={() => setItems([
                    { item_name: '', vendor_name: '', unit_price: 0, total_price: 0, quantity: 0, challan_qty: 0, unit: 'pcs', size: '', color: '', size_label: '', status: 'RECEIVED', shortage_qty: 0, remarks: '' }
                  ])}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#3A3564] bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Line Item
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((it, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3">
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
                      <input
                        type="text"
                        placeholder="Item description (e.g. Antique Brass Zipper)"
                        value={it.item_name}
                        onChange={e => {
                          const copy = [...items]
                          copy[idx].item_name = e.target.value
                          setItems(copy)
                        }}
                        className="flex-1 min-w-[200px] px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
                      />
                      <input
                        type="text"
                        placeholder="Item Vendor (e.g. YKK / Vardhman)"
                        value={it.vendor_name || ''}
                        onChange={e => {
                          const copy = [...items]
                          copy[idx].vendor_name = e.target.value
                          setItems(copy)
                        }}
                        title="Leave blank to use challan supplier"
                        className="w-full sm:w-56 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
                      />
                      <button
                        type="button"
                        onClick={() => setItems(items.filter((_, i) => i !== idx))}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-7 gap-2.5 text-xs">
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
                            copy[idx].total_price = Number(((copy[idx].quantity || 0) * (copy[idx].unit_price || 0)).toFixed(2))
                            setItems(copy)
                          }}
                          className="w-full px-3 py-2 font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 mb-1 flex items-center justify-between">
                          <span>Received *</span>
                          <span className="text-[10px] text-slate-400 font-normal">Godown</span>
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
                            copy[idx].total_price = Number((rQty * (copy[idx].unit_price || 0)).toFixed(2))
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
                        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">Size / Width</label>
                        <input
                          type="text"
                          placeholder="e.g. M / 7&quot; / 25mm"
                          value={it.size ?? (it.size_label && it.size_label.includes('/') ? it.size_label.split('/')[0].trim() : (it.size_label || ''))}
                          onChange={e => {
                            const copy = [...items]
                            const newSize = e.target.value
                            copy[idx].size = newSize
                            const curColor = (copy[idx].color || '').trim()
                            copy[idx].size_label = newSize.trim() && curColor ? `${newSize.trim()} / ${curColor}` : (newSize.trim() || curColor)
                            setItems(copy)
                          }}
                          className="w-full px-3 py-2 font-semibold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">Color / Shade</label>
                        <input
                          type="text"
                          placeholder="e.g. Black / #402"
                          value={it.color ?? (it.size_label && it.size_label.includes('/') ? it.size_label.split('/')[1].trim() : '')}
                          onChange={e => {
                            const copy = [...items]
                            const newColor = e.target.value
                            copy[idx].color = newColor
                            const curSize = (copy[idx].size || '').trim()
                            copy[idx].size_label = curSize && newColor.trim() ? `${curSize} / ${newColor.trim()}` : (curSize || newColor.trim())
                            setItems(copy)
                          }}
                          className="w-full px-3 py-2 font-semibold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">Rate (₹/unit)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={it.unit_price === 0 ? '' : it.unit_price ?? ''}
                          onChange={e => {
                            const val = e.target.value
                            const rate = val === '' ? 0 : Number(val)
                            const copy = [...items]
                            copy[idx].unit_price = rate
                            copy[idx].total_price = Number(((copy[idx].quantity || 0) * rate).toFixed(2))
                            setItems(copy)
                          }}
                          className="w-full px-3 py-2 font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
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
                            copy[idx].total_price = Number(((copy[idx].quantity || 0) * (copy[idx].unit_price || 0)).toFixed(2))
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

                    {/* Price & Vendor Info pill */}
                    {((it.unit_price || 0) > 0 || it.vendor_name) && (
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 px-3 py-1 bg-white border border-slate-200/80 rounded-lg">
                        <span className="flex items-center gap-1.5">
                          <span className="text-slate-400">Supplier:</span>
                          <span className="font-bold text-slate-800">{it.vendor_name || partyName || 'Primary Supplier'}</span>
                        </span>
                        {(it.unit_price || 0) > 0 && (
                          <span className="flex items-center gap-1.5 font-mono">
                            <span className="text-slate-400">Valuation:</span>
                            <span className="font-bold text-emerald-700">
                              ₹{((it.quantity || 0) * (it.unit_price || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">({it.quantity || 0} {it.unit} @ ₹{it.unit_price}/unit)</span>
                          </span>
                        )}
                      </div>
                    )}

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
                                copy[idx].total_price = Number((copy[idx].quantity * (copy[idx].unit_price || 0)).toFixed(2))
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
                      { item_name: '', vendor_name: '', unit_price: 0, total_price: 0, quantity: 0, challan_qty: 0, unit: 'pcs', size: '', color: '', size_label: '', status: 'RECEIVED', shortage_qty: 0, remarks: '' }
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
        <div className="p-4 sm:p-5 border-t border-black/10 bg-[#FAF7F0] flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs font-mono text-slate-600">
            <span>Items: <strong className="text-slate-900">{items.length}</strong></span>
            <span>Received: <strong className="text-emerald-700">{items.reduce((s, i) => s + (Number(i.quantity) || 0), 0)} units</strong></span>
            {items.some(i => (i.unit_price || 0) > 0) && (
              <span>Value: <strong className="text-[#3A3564] font-bold">₹{items.reduce((s, i) => s + ((Number(i.quantity) || 0) * (Number(i.unit_price) || 0)), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
            )}
          </div>
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? 'Saving GRN...' : 'Confirm Inward'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ====================================================================
// SUBCOMPONENT: ATTACH / UPDATE PAPER CHALLAN SLIP PHOTO MODAL
// ====================================================================
function AttachChallanPhotoModal({
  onClose,
  truckInward,
}: {
  onClose: () => void
  truckInward: TruckInward
}) {
  const router = useRouter()
  const [photoUrl, setPhotoUrl] = useState<string | null>(truckInward.challan_photo_url || null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = () => {
      setPhotoUrl(reader.result as string)
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!photoUrl) {
      setError('Please select or capture a photo of the paper challan slip.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const res = await updateTruckInwardChallanPhoto(truckInward.id, photoUrl)

    setIsSubmitting(false)
    if (res?.error) {
      setError(res.error)
    } else {
      router.refresh()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-black/10 bg-[#FAF7F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#3A3564] border border-black/10 shadow-2xs flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Attach Paper Slip Photo
              </h3>
              <p className="text-xs font-medium text-slate-500">
                Upload physical supplier delivery challan for audit
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - STRICT READ-ONLY DETAILS */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Locked Inward Info Strip */}
          <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-black/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-[#3A3564]">
              <span>GRN #{truckInward.grn_no}</span>
              <span className="px-2 py-0.5 rounded bg-white text-slate-700 border border-black/10 text-[10.5px]">
                🔒 Items & Quantities Locked
              </span>
            </div>
            <div className="text-xs font-bold text-slate-800">
              Supplier: <span className="font-extrabold text-slate-900">{truckInward.party_name}</span>
            </div>
            <div className="text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
              <span>Challan: <strong className="text-slate-700 font-mono">#{truckInward.challan_no || '-'}</strong></span>
              <span>Vehicle: <strong className="text-slate-700 font-mono">{truckInward.truck_no || 'Direct'}</strong></span>
              <span>Items: <strong className="text-slate-700 font-mono">{truckInward.total_items} items</strong></span>
            </div>
          </div>

          {/* Photo Dropzone / Preview */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Paper Challan Slip Photo *
            </label>
            {photoUrl ? (
              <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-2 group">
                <img
                  src={photoUrl}
                  alt="Paper Challan Slip"
                  className="w-full max-h-64 object-contain rounded-lg bg-white"
                />
                <button
                  type="button"
                  onClick={() => setPhotoUrl(null)}
                  className="absolute top-4 right-4 p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove / Re-take</span>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-[#3A3564] rounded-2xl bg-slate-50/50 hover:bg-[#FAF7F0]/40 transition-all cursor-pointer group">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-[#3A3564] mb-2 transition-colors" />
                <span className="text-xs font-bold text-slate-700 group-hover:text-[#3A3564] transition-colors">
                  {isUploading ? 'Loading Photo...' : 'Click to Upload or Drag Paper Challan Image'}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">PNG, JPG, JPEG up to 10MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
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
            disabled={isSubmitting || !photoUrl}
            className="px-5 py-2.5 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving Photo...' : 'Save & Attach Photo'}
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
  if (!activeAllotments || activeAllotments.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
        <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden flex flex-col p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 mx-auto flex items-center justify-center shadow-2xs">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              No Active Floor Allotments
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              There are currently no active stitching allotments waiting for BOM material handover. All lots have either received their materials or are awaiting cutting completion.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-[#3A3564] text-white font-bold text-xs hover:bg-[#2A2649] transition-colors cursor-pointer shadow-sm"
          >
            Back to Store Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <BomHandoverForm
      onClose={onClose}
      activeAllotments={activeAllotments}
      currentUserName={currentUserName}
    />
  )
}

interface BomGroupItem {
  groupId: string
  artNo: string
  rawArtNos: string[]
  description: string
  linemanName: string
  challanNo: string
  lotsCount: number
  totalTargetQty: number
  allotmentIds: string[]
  variants: Array<{
    size?: string
    color?: string
    quantity?: number
  }>
  materials: Array<{
    id: string
    item_name: string
    required_qty: string | number
    allotment_id: string
    admin_issued: boolean
  }>
}

function BomHandoverForm({
  onClose,
  activeAllotments,
  currentUserName,
}: {
  onClose: () => void
  activeAllotments: ActiveAllotment[]
  currentUserName: string
}) {
  const router = useRouter()
  const [allotmentSearchQuery, setAllotmentSearchQuery] = useState('')
  const [supplierChallan, setSupplierChallan] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Group multiple lots into single consolidated entries by Article + Lineman + Challan
  const allotmentGroups: BomGroupItem[] = useMemo(() => {
    const map = new Map<string, BomGroupItem>()

    activeAllotments.forEach(al => {
      const rawArt = (al.article?.art_no || '').trim().toUpperCase() || 'GENERAL'
      const baseArt = getBaseMasterArticleNo(rawArt)
      const desc = al.article?.description || ''
      const lineman = al.lineman?.username || 'Lineman'
      const challan = (al.challans as any)?.challan_no || '-'
      const targetQty = Number(al.target_qty) || 0
      const key = `${baseArt}__${lineman}__${challan}`

      if (!map.has(key)) {
        map.set(key, {
          groupId: key,
          artNo: baseArt,
          rawArtNos: [rawArt],
          description: desc,
          linemanName: lineman,
          challanNo: challan,
          lotsCount: 0,
          totalTargetQty: 0,
          allotmentIds: [],
          variants: [],
          materials: []
        })
      }

      const group = map.get(key)!
      if (!group.rawArtNos.includes(rawArt)) {
        group.rawArtNos.push(rawArt)
      }
      if (!group.description && desc) {
        group.description = desc
      }
      group.lotsCount += 1
      group.totalTargetQty += targetQty
      group.allotmentIds.push(al.id)

      const alVars = al.allotment_variants || []
      alVars.forEach(v => group.variants.push(v))

      const mats = al.allotment_materials || []
      mats.forEach(m => {
        group.materials.push({
          id: m.id,
          item_name: m.item_name,
          required_qty: m.required_qty,
          allotment_id: al.id,
          admin_issued: Boolean((m as any).admin_issued)
        })
      })
    })

    return Array.from(map.values()).sort((a, b) => b.totalTargetQty - a.totalTargetQty)
  }, [activeAllotments])

  const [selectedGroupId, setSelectedGroupId] = useState(allotmentGroups[0]?.groupId || '')

  // Filter groups by Article #, Lineman, Challan #, or Description
  const filteredGroups = useMemo(() => {
    if (!allotmentSearchQuery.trim()) return allotmentGroups
    const q = allotmentSearchQuery.toLowerCase().trim()
    return allotmentGroups.filter(g => {
      const art = g.artNo.toLowerCase()
      const desc = (g.description || '').toLowerCase()
      const lineman = g.linemanName.toLowerCase()
      const challan = g.challanNo.toLowerCase()
      const rawMatch = g.rawArtNos.some(r => r.toLowerCase().includes(q))
      return art.includes(q) || rawMatch || desc.includes(q) || lineman.includes(q) || challan.includes(q)
    })
  }, [allotmentGroups, allotmentSearchQuery])

  const selectedGroup = allotmentGroups.find(g => g.groupId === selectedGroupId) || filteredGroups[0] || allotmentGroups[0]
  const linemanName = selectedGroup?.linemanName || 'Lineman'
  const artNo = selectedGroup?.artNo || '-'

  // Distinct unique materials in this selected style group
  const uniqueMaterialList = useMemo(() => {
    if (!selectedGroup) return []
    const matMap = new Map<string, {
      itemName: string
      totalRequiredNumber: number
      unit: string
      materialIds: string[]
    }>()

    selectedGroup.materials.forEach(m => {
      const name = m.item_name.trim()
      const reqMatch = String(m.required_qty || '').match(/^([\d.]+)\s*(.*)$/)
      const num = reqMatch ? parseFloat(reqMatch[1]) : (parseFloat(String(m.required_qty)) || 0)
      const unit = reqMatch ? reqMatch[2] : ''

      if (!matMap.has(name)) {
        matMap.set(name, {
          itemName: name,
          totalRequiredNumber: 0,
          unit: unit || 'pcs',
          materialIds: []
        })
      }
      const entry = matMap.get(name)!
      entry.totalRequiredNumber += isNaN(num) ? 0 : num
      entry.materialIds.push(m.id)
    })

    return Array.from(matMap.values())
  }, [selectedGroup])

  const buildInitialStates = (matList: typeof uniqueMaterialList) => {
    const states: Record<string, BomMaterialItemState> = {}
    matList.forEach(m => {
      const qtyStr = `${m.totalRequiredNumber} ${m.unit}`.trim()
      states[m.itemName] = {
        id: m.itemName,
        item_name: m.itemName,
        required_qty: qtyStr,
        received_qty: qtyStr,
        status: 'VERIFIED',
        shortage_qty: 0,
        remarks: ''
      }
    })
    return states
  }

  const [itemStates, setItemStates] = useState<Record<string, BomMaterialItemState>>(() =>
    buildInitialStates(uniqueMaterialList)
  )

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId)
    const target = allotmentGroups.find(g => g.groupId === groupId)
    if (target) {
      // Re-build material list and states
      const matMap = new Map<string, {
        itemName: string
        totalRequiredNumber: number
        unit: string
        materialIds: string[]
      }>()

      target.materials.forEach(m => {
        const name = m.item_name.trim()
        const reqMatch = String(m.required_qty || '').match(/^([\d.]+)\s*(.*)$/)
        const num = reqMatch ? parseFloat(reqMatch[1]) : (parseFloat(String(m.required_qty)) || 0)
        const unit = reqMatch ? reqMatch[2] : ''

        if (!matMap.has(name)) {
          matMap.set(name, {
            itemName: name,
            totalRequiredNumber: 0,
            unit: unit || 'pcs',
            materialIds: []
          })
        }
        const entry = matMap.get(name)!
        entry.totalRequiredNumber += isNaN(num) ? 0 : num
        entry.materialIds.push(m.id)
      })

      setItemStates(buildInitialStates(Array.from(matMap.values())))
    }
  }

  const handleSubmit = async () => {
    if (!selectedGroup) return
    setIsSubmitting(true)
    setError(null)

    // Build payload items for all allotment materials across all lots in this group
    const itemsToSubmit: BomMaterialItemState[] = selectedGroup.materials.map(m => {
      const state = itemStates[m.item_name.trim()]
      return {
        id: m.id,
        item_name: m.item_name,
        required_qty: m.required_qty,
        received_qty: state?.received_qty ?? m.required_qty,
        status: state?.status ?? 'VERIFIED',
        shortage_qty: state?.shortage_qty ?? 0,
        remarks: state?.remarks ?? ''
      }
    })

    const res = await issueBomMaterials({
      allotment_id: selectedGroup.allotmentIds[0] || '',
      lineman_name: selectedGroup.linemanName,
      supplier_challan_no: supplierChallan,
      article_no: selectedGroup.artNo,
      items: itemsToSubmit,
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

          {/* Select Target Lot Group with Quick Search */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Select Target Article &amp; Lineman *
              </label>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                {filteredGroups.length} of {allotmentGroups.length} unique style groups
              </span>
            </div>

            {/* Live Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={allotmentSearchQuery}
                onChange={e => {
                  const q = e.target.value
                  setAllotmentSearchQuery(q)
                  const filtered = allotmentGroups.filter(g => {
                    const art = g.artNo.toLowerCase()
                    const desc = (g.description || '').toLowerCase()
                    const lineman = g.linemanName.toLowerCase()
                    const challan = g.challanNo.toLowerCase()
                    const query = q.toLowerCase().trim()
                    return art.includes(query) || desc.includes(query) || lineman.includes(query) || challan.includes(query)
                  })
                  if (filtered.length > 0 && !filtered.some(g => g.groupId === selectedGroupId)) {
                    handleGroupChange(filtered[0].groupId)
                  }
                }}
                placeholder="Type Article, Lineman, or Challan (e.g. 9494, NAWAZ)..."
                className="w-full pl-9.5 pr-8 py-2 text-xs font-semibold bg-[#FAF7F0]/60 border border-black/10 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all placeholder:text-slate-400 text-slate-900"
              />
              {allotmentSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setAllotmentSearchQuery('')
                    if (allotmentGroups.length > 0) {
                      handleGroupChange(allotmentGroups[0].groupId)
                    }
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Consolidated Dropdown List */}
            {filteredGroups.length === 0 ? (
              <div className="p-3 text-center text-xs font-semibold text-amber-800 bg-amber-50 rounded-xl border border-amber-200">
                No style groups found matching &quot;{allotmentSearchQuery}&quot;
              </div>
            ) : (
              <select
                value={selectedGroup?.groupId || ''}
                onChange={e => handleGroupChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] shadow-2xs cursor-pointer"
              >
                {filteredGroups.map(group => {
                  const challanLabel = group.challanNo && group.challanNo !== '-' ? ` · Challan ${group.challanNo}` : ''
                  return (
                    <option key={group.groupId} value={group.groupId}>
                      Article {group.artNo} ({group.totalTargetQty.toLocaleString()} pcs · {group.lotsCount} {group.lotsCount > 1 ? 'Lots' : 'Lot'}) · Lineman: {group.linemanName}{challanLabel}
                    </option>
                  )
                })}
              </select>
            )}
          </div>

          {/* Lineman & Challan Info Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-[#FAF7F0] rounded-xl border border-black/10 text-xs font-bold text-[#3A3564]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Lineman: {linemanName}</span>
              {selectedGroup?.challanNo && selectedGroup.challanNo !== '-' && (
                <span className="font-mono text-slate-500 font-normal">· Challan {selectedGroup.challanNo}</span>
              )}
            </div>
            <div className="font-mono">
              <span>Target: {selectedGroup?.totalTargetQty.toLocaleString() || 0} pcs ({selectedGroup?.lotsCount || 1} {selectedGroup?.lotsCount === 1 ? 'Lot' : 'Lots'})</span>
            </div>
          </div>

          {/* Supplier Challan # */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Supplier Raw Material Challan No. (Optional)
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
              Raw Materials Inspection Checklist ({uniqueMaterialList.length} items)
            </label>
            {uniqueMaterialList.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                No BOM materials defined for this style group. You can still confirm handover.
              </p>
            ) : (
              uniqueMaterialList.map(mat => {
                const breakdown = getDetailedItemBreakdown(mat.itemName, mat.totalRequiredNumber)
                const lotVariants = selectedGroup?.variants || []
                const lotSizes = Array.from(new Set(lotVariants.map(v => v.size?.trim().toUpperCase()).filter(Boolean)))
                const matchingSizes = breakdown.isMultiSize ? breakdown.sizes.filter(s => lotSizes.includes(s)) : []
                const netSizeQuota = matchingSizes.length > 0
                  ? lotVariants
                      .filter(v => v.size && matchingSizes.includes(v.size.trim().toUpperCase()))
                      .reduce((acc, v) => acc + (Number(v.quantity) || 0), 0)
                  : 0

                const requiredStr = `${mat.totalRequiredNumber} ${mat.unit}`.trim()
                const st = itemStates[mat.itemName] || {
                  id: mat.itemName,
                  item_name: mat.itemName,
                  required_qty: requiredStr,
                  received_qty: requiredStr,
                  status: 'VERIFIED',
                  shortage_qty: 0,
                  remarks: ''
                }

                return (
                  <div key={mat.itemName} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900">{mat.itemName}</span>
                      <span className="text-xs font-mono font-bold text-slate-600">Required: {requiredStr}</span>
                    </div>

                    {/* Size-Specific Quota Helper for Multi-size trims */}
                    {breakdown.isMultiSize && matchingSizes.length > 0 && netSizeQuota > 0 && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-50/80 border border-[#3A3564]/15 text-xs flex-wrap gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-[#3A3564]" />
                          <span className="font-semibold text-slate-800">
                            Floor Bundle Size: <strong className="text-[#3A3564]">{matchingSizes.join(', ')}</strong> (Net Quota: <strong>{netSizeQuota} pcs</strong>)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setItemStates(prev => ({
                              ...prev,
                              [mat.itemName]: {
                                ...st,
                                received_qty: `${netSizeQuota} ${mat.unit}`.trim(),
                                status: 'VERIFIED',
                                shortage_qty: 0,
                                remarks: `Size ${matchingSizes.join(', ')} Net Quota (${netSizeQuota} pcs) issued. Remaining sizes stay in Store.`
                              }
                            }))
                          }}
                          className="px-2 py-0.5 rounded bg-[#3A3564] text-white font-bold text-[10.5px] hover:bg-[#2A2554] transition-colors cursor-pointer shadow-2xs"
                        >
                          Apply Size Quota ({netSizeQuota} pcs)
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center justify-between">
                          <span>Handover / Issue Qty *</span>
                          <span className="text-[10px] text-emerald-600 font-normal">To Lineman</span>
                        </label>
                        <input
                          type="text"
                          value={st.received_qty}
                          onChange={e => {
                            const val = e.target.value
                            const reqNum = mat.totalRequiredNumber
                            const unit = mat.unit
                            const recMatch = val.match(/^([\d.]+)/)
                            const recNum = recMatch ? parseFloat(recMatch[1]) : 0

                            let newStatus = st.status
                            let newShortage = st.shortage_qty

                            if (!isNaN(reqNum) && recNum > 0 && recNum < reqNum) {
                              const diff = Math.max(0, reqNum - recNum)
                              newStatus = 'SHORTAGE'
                              newShortage = `${diff} ${unit}`.trim()
                            } else if (!isNaN(reqNum) && recNum >= reqNum && st.status === 'SHORTAGE') {
                              newStatus = 'VERIFIED'
                              newShortage = 0
                            }

                            setItemStates({
                              ...itemStates,
                              [mat.itemName]: { 
                                ...st, 
                                received_qty: val,
                                status: newStatus,
                                shortage_qty: newShortage
                              }
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
                            const newStatus = e.target.value as any
                            const reqNum = mat.totalRequiredNumber
                            const unit = mat.unit
                            const recMatch = String(st.received_qty).match(/^([\d.]+)/)
                            const recNum = recMatch ? parseFloat(recMatch[1]) : 0

                            let sQty = st.shortage_qty
                            if (newStatus === 'VERIFIED') {
                              sQty = 0
                            } else if (!sQty || sQty === 0 || sQty === '0') {
                              const diff = (!isNaN(reqNum) && recNum > 0 && reqNum > recNum) ? reqNum - recNum : 1
                              sQty = `${diff} ${unit}`.trim()
                            }

                            setItemStates({
                              ...itemStates,
                              [mat.itemName]: { 
                                ...st, 
                                status: newStatus,
                                shortage_qty: sQty
                              }
                            })
                          }}
                          className={`w-full px-3 py-2 font-bold bg-white border rounded-xl focus:outline-none focus:ring-2 ${
                            st.status === 'VERIFIED'
                              ? 'text-emerald-700 border-emerald-300'
                              : st.status === 'SHORTAGE'
                                ? 'text-amber-700 border-amber-300'
                                : 'text-rose-700 border-rose-300'
                          }`}
                        >
                          <option value="VERIFIED">Verified</option>
                          <option value="SHORTAGE">Shortage</option>
                          <option value="DEFECTIVE">Defective</option>
                        </select>
                      </div>
                    </div>

                    {(st.status !== 'VERIFIED' || Boolean(st.shortage_qty && Number(String(st.shortage_qty).replace(/[^0-9.]/g, '')) > 0)) && (
                      <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono font-bold uppercase text-[10px] ${
                              st.status === 'SHORTAGE' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                              'bg-rose-100 text-rose-900 border border-rose-300'
                            }`}>
                              {st.status === 'SHORTAGE' ? (
                                <><AlertTriangle className="w-3 h-3 text-amber-700" /> Shortage</>
                              ) : (
                                <><AlertCircle className="w-3 h-3 text-rose-700" /> Defective</>
                              )}
                            </span>
                            <span className="font-semibold text-slate-700">
                              Required: <strong className="text-slate-900 font-mono">{requiredStr}</strong> | 
                              Issued: <strong className="text-emerald-700 font-mono">{st.received_qty}</strong> | 
                              Issue: <strong className="text-rose-700 font-mono">{st.shortage_qty || 0}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] font-mono font-bold uppercase text-slate-600">
                              {st.status === 'SHORTAGE' ? 'Short Qty:' : 'Defect Qty:'}
                            </label>
                            <input
                              type="text"
                              placeholder="0"
                              value={st.shortage_qty || ''}
                              onChange={e => {
                                setItemStates({
                                  ...itemStates,
                                  [mat.itemName]: { ...st, shortage_qty: e.target.value }
                                })
                              }}
                              className="w-24 px-2.5 py-1 text-xs font-mono font-bold bg-white border border-amber-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                            />
                          </div>
                        </div>
                        <input
                          type="text"
                          placeholder="Remarks / Note (e.g. 250 meters short in godown, or stained roll)"
                          value={st.remarks || ''}
                          onChange={e => {
                            setItemStates({
                              ...itemStates,
                              [mat.itemName]: { ...st, remarks: e.target.value }
                            })
                          }}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                        />
                      </div>
                    )}
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
            className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? 'Issuing...' : `Handover to ${linemanName} (${selectedGroup?.totalTargetQty.toLocaleString() || 0} pcs)`}
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

// ====================================================================
// SUBCOMPONENT: MODAL 2B - FLOOR ACCESSORY RE-ISSUE (WORKER LOSS & DAMAGE)
// ====================================================================
function AccessoryReissueModal({
  onClose,
  activeAllotments,
  workerAssignments,
  accessories,
  currentUserName,
}: {
  onClose: () => void
  activeAllotments: ActiveAllotment[]
  workerAssignments: Array<{ id: string; allotment_id?: string | null; worker_name?: string | null; article_id?: string | null }>
  accessories: Accessory[]
  currentUserName: string
}) {
  const router = useRouter()
  const [selectedAllotmentId, setSelectedAllotmentId] = useState<string>(activeAllotments[0]?.id || '')
  const [articleNo, setArticleNo] = useState<string>(activeAllotments[0]?.article?.art_no || '')
  const [challanNo, setChallanNo] = useState<string>(activeAllotments[0]?.challans?.challan_no || '')
  const [linemanName, setLinemanName] = useState<string>(activeAllotments[0]?.lineman?.username || '')
  const [workerName, setWorkerName] = useState<string>('')
  const [itemName, setItemName] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(0)
  const [unit, setUnit] = useState<string>('pcs')
  const [reason, setReason] = useState<'LOST' | 'MACHINE_DAMAGE' | 'DEFECTIVE_PIECE' | 'SHORT_IN_LOT'>('MACHINE_DAMAGE')
  const [channel, setChannel] = useState<'DIRECT_COUNTER' | 'VIA_LINEMAN'>('DIRECT_COUNTER')
  const [isBufferClaim, setIsBufferClaim] = useState(false)
  const [notes, setNotes] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Current active allotment object
  const currentLot = useMemo(() => {
    return activeAllotments.find(a => a.id === selectedAllotmentId)
  }, [activeAllotments, selectedAllotmentId])

  // Handle active allotment selection change
  const handleAllotmentSelect = (allotId: string) => {
    setSelectedAllotmentId(allotId)
    const found = activeAllotments.find(a => a.id === allotId)
    if (found) {
      setArticleNo(found.article?.art_no || '')
      setChallanNo(found.challans?.challan_no || '')
      setLinemanName(found.lineman?.username || '')
    }
  }

  // Tailors/workers assigned specifically to this allotment
  const lotWorkers = useMemo(() => {
    const list: string[] = []
    workerAssignments.forEach(w => {
      const name = w.worker_name?.trim()
      if (name && w.allotment_id === selectedAllotmentId && !list.includes(name)) {
        list.push(name)
      }
    })
    return list
  }, [workerAssignments, selectedAllotmentId])

  // All distinct workers across factory for fallback suggestions
  const factoryWorkers = useMemo(() => {
    const list: string[] = []
    workerAssignments.forEach(w => {
      const name = w.worker_name?.trim()
      if (name && !list.includes(name)) {
        list.push(name)
      }
    })
    return list
  }, [workerAssignments])

  // Worker chips to display: prefer lot-assigned workers, otherwise show top factory workers
  const displayedWorkerChips = useMemo(() => {
    if (lotWorkers.length > 0) return lotWorkers.slice(0, 8)
    return factoryWorkers.slice(0, 8)
  }, [lotWorkers, factoryWorkers])

  // Trims from this lot's BOM
  const lotBOMTrims = useMemo(() => {
    return currentLot?.allotment_materials || []
  }, [currentLot])

  // Godown trims with CLEAN POSITIVE stock calculation (never negative!)
  const stockAccessories = useMemo(() => {
    const stockMap: Record<string, { inStock: number; unit: string }> = {}
    accessories.forEach(acc => {
      const name = acc.item_name?.trim()
      if (!name) return
      if (!stockMap[name]) stockMap[name] = { inStock: 0, unit: acc.unit || 'pcs' }
      if (acc.action === 'IN') stockMap[name].inStock += Number(acc.quantity) || 0
      if (acc.action === 'OUT') stockMap[name].inStock -= Number(acc.quantity) || 0
    })
    return Object.entries(stockMap).map(([name, data]) => ({
      name,
      inStock: data.inStock,
      unit: data.unit,
    }))
  }, [accessories])

  // Clean trims that are not already in BOM list
  const extraGodownTrims = useMemo(() => {
    const bomNames = lotBOMTrims.map(m => m.item_name.toLowerCase())
    return stockAccessories.filter(acc => !bomNames.includes(acc.name.toLowerCase())).slice(0, 8)
  }, [stockAccessories, lotBOMTrims])

  const handleSubmit = async () => {
    if (!articleNo.trim()) {
      setError('Please select or specify the Target Article Number.')
      return
    }
    if (!workerName.trim()) {
      setError('Please enter or select the Tailor / Worker Name.')
      return
    }
    if (!itemName.trim()) {
      setError('Please select or enter the Accessory Item.')
      return
    }
    if (quantity <= 0) {
      setError('Please enter a valid quantity greater than 0.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const finalNotes = isBufferClaim
      ? (notes.trim() ? `${notes.trim()} • [SAFETY_BUFFER_RESERVE_CLAIM]` : '[SAFETY_BUFFER_RESERVE_CLAIM]')
      : (notes.trim() || null)

    const res = await reissueFloorAccessory({
      allotment_id: selectedAllotmentId || null,
      article_no: articleNo.trim(),
      challan_no: challanNo.trim() || null,
      worker_name: workerName.trim(),
      lineman_name: linemanName.trim() || null,
      item_name: itemName.trim(),
      quantity,
      unit,
      reason,
      channel,
      notes: finalNotes,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/10 bg-[#FAF7F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#3A3564] border border-black/10 shadow-2xs flex items-center justify-center shrink-0">
              <RotateCw className="w-5 h-5 text-[#3A3564]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Floor Re-Issue & Trim Replacement
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-amber-100 text-amber-800 border border-amber-200">
                  Floor Audit
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500">
                Log replacement trims for needle cut, machine damaged, or misplaced garment accessories
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2-Column Grid */}
        <div className="p-5 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ============================================================ */}
            {/* LEFT COLUMN: Production Lot Context & Worker Requisition */}
            {/* ============================================================ */}
            <div className="lg:col-span-5 space-y-4">
              {/* 1. Target Lot */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    Target Production Lot <span className="text-rose-600">*</span>
                  </label>
                  {currentLot && (
                    <span className="text-[11px] font-mono font-bold text-slate-600">
                      {currentLot.target_qty} pcs
                    </span>
                  )}
                </div>

                <select
                  value={selectedAllotmentId}
                  onChange={e => handleAllotmentSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-semibold bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all cursor-pointer shadow-2xs"
                >
                  {activeAllotments.map(al => {
                    const art = al.article?.art_no || 'Art'
                    const ch = al.challans?.challan_no ? ` • Ch #${al.challans.challan_no}` : ''
                    const line = al.lineman?.username ? ` • Line: ${al.lineman.username}` : ''
                    return (
                      <option key={al.id} value={al.id}>
                        Art #{art}{ch}{line} ({al.target_qty} pcs)
                      </option>
                    )
                  })}
                  <option value="">-- Manual Article Entry --</option>
                </select>

                {/* Selected Lot Metadata Pills */}
                {selectedAllotmentId && currentLot ? (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 flex-wrap text-xs">
                    <span className="px-2 py-0.5 rounded-md font-mono font-bold bg-white text-[#3A3564] border border-black/10 shadow-2xs">
                      Art #{articleNo}
                    </span>
                    {challanNo && (
                      <span className="px-2 py-0.5 rounded-md font-mono font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs">
                        Challan #{challanNo}
                      </span>
                    )}
                    {linemanName && (
                      <span className="px-2 py-0.5 rounded-md font-medium bg-white text-slate-600 border border-slate-200 shadow-2xs flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" /> Line: {linemanName}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">Art #</label>
                      <input
                        type="text"
                        placeholder="501"
                        value={articleNo}
                        onChange={e => setArticleNo(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">Challan</label>
                      <input
                        type="text"
                        placeholder="101"
                        value={challanNo}
                        onChange={e => setChallanNo(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">Lineman</label>
                      <input
                        type="text"
                        placeholder="Vicky"
                        value={linemanName}
                        onChange={e => setLinemanName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Tailor / Worker Name */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    Tailor / Worker <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {lotWorkers.length > 0 ? `${lotWorkers.length} assigned on lot` : 'Active Tailors'}
                  </span>
                </div>

                {/* Quick Avatar Chips */}
                {displayedWorkerChips.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {displayedWorkerChips.map(name => {
                      const isSelected = workerName.trim().toLowerCase() === name.toLowerCase()
                      const initials = name.slice(0, 2).toUpperCase()
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setWorkerName(name)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                            isSelected
                              ? 'bg-[#3A3564] text-white border-[#3A3564]'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold ${
                            isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {initials}
                          </span>
                          <span>{name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Type or select tailor name (e.g. Ramesh, Suresh)..."
                  value={workerName}
                  onChange={e => setWorkerName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm font-semibold bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all shadow-2xs"
                />
              </div>

              {/* 3. Requisition Channel */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-slate-500" />
                  Requisition Channel
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('DIRECT_COUNTER')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      channel === 'DIRECT_COUNTER'
                        ? 'bg-[#3A3564] text-white border-[#3A3564] shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Store className={`w-4 h-4 shrink-0 mt-0.5 ${channel === 'DIRECT_COUNTER' ? 'text-white' : 'text-slate-400'}`} />
                    <div>
                      <p className="text-xs font-bold leading-snug">Store Counter</p>
                      <p className={`text-[10px] mt-0.5 leading-tight ${channel === 'DIRECT_COUNTER' ? 'text-slate-200' : 'text-slate-500'}`}>
                        Worker walk-in
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('VIA_LINEMAN')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      channel === 'VIA_LINEMAN'
                        ? 'bg-[#3A3564] text-white border-[#3A3564] shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <UserCheck className={`w-4 h-4 shrink-0 mt-0.5 ${channel === 'VIA_LINEMAN' ? 'text-white' : 'text-slate-400'}`} />
                    <div>
                      <p className="text-xs font-bold leading-snug">Via Lineman</p>
                      <p className={`text-[10px] mt-0.5 leading-tight ${channel === 'VIA_LINEMAN' ? 'text-slate-200' : 'text-slate-500'}`}>
                        Authorized slip
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* RIGHT COLUMN: Trim Item, Stepper, Reason & Remarks */}
            {/* ============================================================ */}
            <div className="lg:col-span-7 space-y-4">
              {/* 4. Accessory / Trim Item */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-500" />
                    Accessory / Trim Item <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">Click to select item</span>
                </div>

                {/* Quick Trim Chips (BOM first, then clean positive stock) */}
                <div className="flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                  {lotBOMTrims.length === 0 && extraGodownTrims.length === 0 && (
                    <span className="text-xs text-slate-400 px-2 py-1">No preset trims found for lot</span>
                  )}
                  {lotBOMTrims.map(m => {
                    const isSelected = itemName.toLowerCase() === m.item_name.toLowerCase()
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setItemName(m.item_name)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                          isSelected
                            ? 'bg-[#3A3564] text-white border-[#3A3564]'
                            : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-indigo-600'}`} />
                        <span>{m.item_name}</span>
                        <span className={`text-[10px] font-mono px-1 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          BOM
                        </span>
                      </button>
                    )
                  })}

                  {extraGodownTrims.map(acc => {
                    const isSelected = itemName.toLowerCase() === acc.name.toLowerCase()
                    return (
                      <button
                        key={acc.name}
                        type="button"
                        onClick={() => {
                          setItemName(acc.name)
                          setUnit(acc.unit || 'pcs')
                        }}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                          isSelected
                            ? 'bg-[#3A3564] text-white border-[#3A3564]'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span>{acc.name}</span>
                        {acc.inStock > 0 && (
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {acc.inStock} {acc.unit}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                <input
                  type="text"
                  placeholder="e.g. Main Zipper 12 inch, Brass Buttons, Sewing Thread..."
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm font-semibold bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all shadow-2xs"
                />
              </div>

              {/* 5. Quantity & Stepper */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-slate-500" />
                    Quantity Issued <span className="text-rose-600">*</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-semibold text-slate-500 mr-1">Quick:</span>
                    {[1, 2, 5, 10].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setQuantity(prev => prev + n)}
                        className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 hover:bg-[#3A3564] hover:text-white rounded-md border border-slate-200 transition-colors cursor-pointer"
                      >
                        +{n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setQuantity(prev => Math.max(0, prev - 1))}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      placeholder="0"
                      value={quantity === 0 ? '' : quantity}
                      onChange={e => setQuantity(e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-16 text-center text-sm sm:text-base font-black font-mono bg-transparent text-slate-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="px-3 py-2 text-xs sm:text-sm font-bold bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 shadow-2xs cursor-pointer"
                  >
                    <option value="pcs">pcs (Pieces)</option>
                    <option value="meters">meters</option>
                    <option value="cones">cones (Thread)</option>
                    <option value="packets">packets</option>
                    <option value="sets">sets</option>
                  </select>

                  <div className="ml-auto px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs font-mono font-bold flex items-center gap-1.5">
                    <span>Stock:</span>
                    <strong className="text-rose-700">-{quantity} {unit}</strong>
                  </div>
                </div>
              </div>

              {/* 6. Reason for Replacement */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                  Reason for Replacement <span className="text-rose-600">*</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      key: 'MACHINE_DAMAGE',
                      label: 'Machine Cut',
                      desc: 'Needle break or blade cut',
                      icon: Scissors,
                    },
                    {
                      key: 'LOST',
                      label: 'Worker Lost',
                      desc: 'Dropped or misplaced',
                      icon: AlertTriangle,
                    },
                    {
                      key: 'DEFECTIVE_PIECE',
                      label: 'Defective Trim',
                      desc: 'Broken teeth, bad dye/puller',
                      icon: ShieldAlert,
                    },
                    {
                      key: 'SHORT_IN_LOT',
                      label: 'Bundle Shortage',
                      desc: 'Initial lot count was short',
                      icon: PackageCheck,
                    },
                  ].map(r => {
                    const isSelected = reason === r.key
                    const IconComp = r.icon
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => setReason(r.key as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-[#3A3564] text-white border-[#3A3564] shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200'
                        }`}>
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight">{r.label}</p>
                          <p className={`text-[10px] mt-0.5 leading-tight ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                            {r.desc}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Safety Buffer Reserve Claim Toggle */}
              <div className="p-3 rounded-xl bg-indigo-50/70 border border-[#3A3564]/15 flex items-start gap-2.5 shadow-2xs">
                <input
                  type="checkbox"
                  id="bufferClaimCheckbox"
                  checked={isBufferClaim}
                  onChange={e => setIsBufferClaim(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#3A3564] focus:ring-[#3A3564]/30 border-slate-300 cursor-pointer"
                />
                <label htmlFor="bufferClaimCheckbox" className="text-xs cursor-pointer select-none">
                  <span className="font-bold text-[#3A3564] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#3A3564]" />
                    Claim from Safety Buffer Reserve
                  </span>
                  <span className="text-[11px] text-slate-600 block leading-tight mt-0.5">
                    Deduct from Godown extra safety buffer without disturbing the Lineman&apos;s production target quota.
                  </span>
                </label>
              </div>

              {/* 7. Store Remarks */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  Remarks / Machine No. <span className="text-slate-400 text-[10px] font-normal normal-case">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Needle jammed on zipper slider, machine #4"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm font-semibold bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 border-t border-black/10 bg-[#FAF7F0] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
            <span>Deducting:</span>
            <span className="px-2 py-0.5 rounded-md font-bold font-mono bg-rose-100 text-rose-800 border border-rose-200">
              -{quantity} {unit}
            </span>
            <span className="text-slate-500 hidden sm:inline">• Live Godown Stock Sync</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || quantity <= 0 || !workerName.trim() || !itemName.trim()}
              className="px-5 py-2 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording...' : `Confirm & Deduct Stock (${quantity} ${unit})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ====================================================================
// HELPER: NORMALIZE BASE MASTER ARTICLE NUMBER
// (Combines suffix splits like 3293 & 3293A -> 3293)
// ====================================================================
function getBaseMasterArticleNo(rawArtNo?: string | null): string {
  if (!rawArtNo) return 'Garment'
  const trimmed = rawArtNo.trim().toUpperCase()
  // 1. Direct number with trailing letters or delimiters (e.g., 3293A, 3293AA, 3293-A, 3293/A, 3293_1, 3293 A)
  const match = trimmed.match(/^(\d+)[A-Z_\-\/\s]/) || trimmed.match(/^(\d+)[A-Z]+$/)
  if (match) return match[1]
  // 2. Pure digits (e.g. 3293)
  const numOnly = trimmed.match(/^(\d+)$/)
  if (numOnly) return numOnly[1]
  // 3. Fallback for strings like "ART-3293" or "ART 3293A"
  const artPrefix = trimmed.match(/^(?:ART|ARTICLE|STYLE)?\s*[-#:]?\s*(\d+)/i)
  if (artPrefix) return artPrefix[1]
  return trimmed
}

// ====================================================================
// COMPONENT: GOODS IN LINE (LIVE FLOOR WIP) SLIDE-OVER DRAWER
// ====================================================================
interface GoodsInLineDrawerProps {
  onClose: () => void
  activeAllotments: ActiveAllotment[]
  readyQcAllotments?: ReadyQcAllotment[]
}

interface LinemanConsolidatedSummary {
  linemanName: string
  challans: string[]
  totalPcs: number
  lotsCount: number
  stageKey: 'STITCHING' | 'MENDING' | 'QC' | 'READY_STORE'
  stageLabel: string
  badgeClass: string
  supervisor: string
  details: string
  latestDate: string
  colorSizes: Array<{ label: string; qty: number }>
}

interface MasterArticleGroup {
  artNo: string
  rawArtNos?: string[]
  description: string
  totalPcs: number
  totalLots: number
  stitchingPcs: number
  mendingPcs: number
  qcPcs: number
  readyPcs: number
  latestCreatedAt?: number
  linemenSummary: LinemanConsolidatedSummary[]
}

function GoodsInLineDrawer({ onClose, activeAllotments }: GoodsInLineDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStage, setSelectedStage] = useState<'ALL' | 'STITCHING' | 'MENDING' | 'QC' | 'READY_STORE'>('ALL')

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Resolve floor stage information for each lot
  const resolveStage = (al: ActiveAllotment) => {
    if (al.store_inward_status === 'INWARDED') {
      return {
        stageKey: 'READY_STORE' as const,
        label: 'Store Inward Done',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        details: 'Verified and inwarded into Godown stock.',
        supervisor: al.qc_supervisor_name || 'Store Inward',
      }
    }
    if (al.qc_status === 'APPROVED_FOR_STORE' || al.qc_status === 'READY_FOR_STORE') {
      return {
        stageKey: 'READY_STORE' as const,
        label: 'Ready for Store Inward',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        details: `QC Passed (${al.qc_total_passed || al.target_qty} pcs). Ready for store inward.`,
        supervisor: al.qc_supervisor_name || 'QC Supervisor',
      }
    }
    if (
      al.qc_status === 'IN_INSPECTION' || 
      al.qc_status === 'IN_PROGRESS' || 
      al.handed_to_qc_at || 
      (al.qc_total_passed && al.qc_total_passed > 0)
    ) {
      return {
        stageKey: 'QC' as const,
        label: 'In QC Inspection',
        badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
        details: `Passed: ${al.qc_total_passed || 0} pcs • Alterations: ${al.qc_total_alter || 0} pcs`,
        supervisor: al.qc_supervisor_name || 'QC Inspector',
      }
    }
    if (
      al.mending_status === 'IN_MENDING' || 
      al.mending_status === 'IN_PROGRESS' || 
      al.handed_to_mending_at || 
      (al.mending_total_counted && al.mending_total_counted > 0)
    ) {
      return {
        stageKey: 'MENDING' as const,
        label: 'In Mending & Alteration',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        details: `Under repair & checking (${al.mending_total_counted || al.target_qty} pcs).`,
        supervisor: al.mending_supervisor_name || 'Mending Table',
      }
    }
    return {
      stageKey: 'STITCHING' as const,
      label: 'Stitching in Progress',
      badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
      details: `Active sewing on machines under Lineman ${al.lineman?.username || 'Floor'}.`,
      supervisor: al.lineman?.username || 'Lineman',
    }
  }


  // Master Article Aggregation with Lineman Consolidation
  const masterArticleGroups = useMemo(() => {
    const artMap = new Map<string, {
      artNo: string
      rawArtSet: Set<string>
      description: string
      totalPcs: number
      totalLots: number
      stitchingPcs: number
      mendingPcs: number
      qcPcs: number
      readyPcs: number
      latestCreatedAt: number
      linemanMap: Map<string, {
        linemanName: string
        challanSet: Set<string>
        totalPcs: number
        lotsCount: number
        stageKey: 'STITCHING' | 'MENDING' | 'QC' | 'READY_STORE'
        stageLabel: string
        badgeClass: string
        supervisor: string
        details: string
        latestDate: string
        variantsMap: Map<string, number>
      }>
    }>()

    activeAllotments.forEach(al => {
      const rawArt = al.article?.art_no || 'Garment'
      const artNo = getBaseMasterArticleNo(rawArt)
      const desc = al.article?.description ? al.article.description.replace(/\[.*?\]/g, '').trim() : ''
      const stageInfo = resolveStage(al)
      const targetQty = Number(al.target_qty) || 0
      const linemanName = al.lineman?.username || 'Lineman'
      const challanNo = al.challans?.challan_no || ''
      const allotmentDate = al.allotment_date || (al.created_at ? al.created_at.split('T')[0] : 'Recent')

      const createdAtMs = new Date(al.created_at || al.allotment_date || 0).getTime()
      const validCreated = isNaN(createdAtMs) ? 0 : createdAtMs

      if (!artMap.has(artNo)) {
        artMap.set(artNo, {
          artNo,
          rawArtSet: new Set(),
          description: desc,
          totalPcs: 0,
          totalLots: 0,
          stitchingPcs: 0,
          mendingPcs: 0,
          qcPcs: 0,
          readyPcs: 0,
          latestCreatedAt: validCreated,
          linemanMap: new Map()
        })
      }

      const artGroup = artMap.get(artNo)!
      artGroup.rawArtSet.add(rawArt)
      if (!artGroup.description && desc) artGroup.description = desc
      artGroup.totalPcs += targetQty
      artGroup.totalLots += 1
      artGroup.latestCreatedAt = Math.max(artGroup.latestCreatedAt, validCreated)
      if (stageInfo.stageKey === 'STITCHING') artGroup.stitchingPcs += targetQty
      else if (stageInfo.stageKey === 'MENDING') artGroup.mendingPcs += targetQty
      else if (stageInfo.stageKey === 'QC') artGroup.qcPcs += targetQty
      else if (stageInfo.stageKey === 'READY_STORE') artGroup.readyPcs += targetQty

      // Group inside Master Article by (Lineman + Stage)
      const linemanKey = `${linemanName}_${stageInfo.stageKey}`
      if (!artGroup.linemanMap.has(linemanKey)) {
        artGroup.linemanMap.set(linemanKey, {
          linemanName,
          challanSet: new Set(),
          totalPcs: 0,
          lotsCount: 0,
          stageKey: stageInfo.stageKey,
          stageLabel: stageInfo.label,
          badgeClass: stageInfo.badgeClass,
          supervisor: stageInfo.supervisor,
          details: stageInfo.details,
          latestDate: allotmentDate,
          variantsMap: new Map()
        })
      }

      const lEntry = artGroup.linemanMap.get(linemanKey)!
      lEntry.totalPcs += targetQty
      lEntry.lotsCount += 1
      if (challanNo && challanNo !== '-') lEntry.challanSet.add(challanNo)
      if (allotmentDate > lEntry.latestDate) lEntry.latestDate = allotmentDate

      // Aggregate variants
      const variants = al.allotment_variants || []
      if (variants.length > 0) {
        variants.forEach(v => {
          const vKey = `${v.color || ''} ${v.size || ''}`.trim() || 'Standard'
          lEntry.variantsMap.set(vKey, (lEntry.variantsMap.get(vKey) || 0) + (Number(v.quantity) || 0))
        })
      } else {
        lEntry.variantsMap.set('Standard', (lEntry.variantsMap.get('Standard') || 0) + targetQty)
      }
    })

    // Convert map to array
    const result: (MasterArticleGroup & { latestCreatedAt: number })[] = []
    artMap.forEach(g => {
      const linemenSummary: LinemanConsolidatedSummary[] = []
      g.linemanMap.forEach(l => {
        const colorSizes: Array<{ label: string; qty: number }> = []
        l.variantsMap.forEach((qty, label) => {
          colorSizes.push({ label, qty })
        })

        linemenSummary.push({
          linemanName: l.linemanName,
          challans: Array.from(l.challanSet),
          totalPcs: l.totalPcs,
          lotsCount: l.lotsCount,
          stageKey: l.stageKey,
          stageLabel: l.stageLabel,
          badgeClass: l.badgeClass,
          supervisor: l.supervisor,
          details: l.details,
          latestDate: l.latestDate,
          colorSizes
        })
      })

      // Sort linemen by totalPcs descending
      linemenSummary.sort((a, b) => b.totalPcs - a.totalPcs)

      result.push({
        artNo: g.artNo,
        rawArtNos: Array.from(g.rawArtSet),
        description: g.description,
        totalPcs: g.totalPcs,
        totalLots: g.totalLots,
        stitchingPcs: g.stitchingPcs,
        mendingPcs: g.mendingPcs,
        qcPcs: g.qcPcs,
        readyPcs: g.readyPcs,
        latestCreatedAt: g.latestCreatedAt,
        linemenSummary
      })
    })

    return result.sort((a, b) => {
      if (b.latestCreatedAt !== a.latestCreatedAt) {
        return b.latestCreatedAt - a.latestCreatedAt
      }
      return b.totalPcs - a.totalPcs
    })
  }, [activeAllotments])

  // Overall Totals
  const { totalPcs, stitchingPcs, mendingPcs, qcPcs, readyPcs, stitchingLotsCount, mendingLotsCount, qcLotsCount, readyLotsCount } = useMemo(() => {
    let tPcs = 0
    let sPcs = 0
    let mPcs = 0
    let qPcs = 0
    let rPcs = 0
    let sCount = 0
    let mCount = 0
    let qCount = 0
    let rCount = 0

    masterArticleGroups.forEach(g => {
      tPcs += g.totalPcs
      sPcs += g.stitchingPcs
      mPcs += g.mendingPcs
      qPcs += g.qcPcs
      rPcs += g.readyPcs
      g.linemenSummary.forEach(l => {
        if (l.stageKey === 'STITCHING') sCount += l.lotsCount
        else if (l.stageKey === 'MENDING') mCount += l.lotsCount
        else if (l.stageKey === 'QC') qCount += l.lotsCount
        else if (l.stageKey === 'READY_STORE') rCount += l.lotsCount
      })
    })

    return {
      totalPcs: tPcs,
      stitchingPcs: sPcs,
      mendingPcs: mPcs,
      qcPcs: qPcs,
      readyPcs: rPcs,
      stitchingLotsCount: sCount,
      mendingLotsCount: mCount,
      qcLotsCount: qCount,
      readyLotsCount: rCount
    }
  }, [masterArticleGroups])

  // Filtered master articles
  const filteredMasterArticles = useMemo(() => {
    return masterArticleGroups.map(group => {
      const matchingLinemen = group.linemenSummary.filter(l => {
        if (selectedStage !== 'ALL' && l.stageKey !== selectedStage) {
          return false
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim()
          const matchesArt = group.artNo.toLowerCase().includes(q) || Boolean(group.rawArtNos?.some((r: string) => r.toLowerCase().includes(q)))
          const matchesLineman = l.linemanName.toLowerCase().includes(q)
          const matchesChallan = l.challans.some(c => c.toLowerCase().includes(q))
          const matchesSupervisor = l.supervisor.toLowerCase().includes(q)
          const matchesDesc = group.description.toLowerCase().includes(q)
          if (!matchesArt && !matchesLineman && !matchesChallan && !matchesSupervisor && !matchesDesc) {
            return false
          }
        }
        return true
      })

      if (matchingLinemen.length === 0) return null

      const currentTotalPcs = matchingLinemen.reduce((sum, l) => sum + l.totalPcs, 0)
      const currentTotalLots = matchingLinemen.reduce((sum, l) => sum + l.lotsCount, 0)

      return {
        ...group,
        totalPcs: currentTotalPcs,
        totalLots: currentTotalLots,
        linemenSummary: matchingLinemen
      }
    }).filter(Boolean) as MasterArticleGroup[]
  }, [masterArticleGroups, selectedStage, searchQuery])

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 max-w-3xl w-full bg-white shadow-2xl flex flex-col z-10 border-l border-black/10">
        
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 bg-[#FAF7F0] border-b border-black/10 space-y-4 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#3A3564] text-white flex items-center justify-center shrink-0 shadow-md">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 font-[family-name:var(--font-heading)]">
                    Goods in Line (Live Floor WIP)
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white text-[#3A3564] border border-black/10 shadow-2xs">
                    {totalPcs.toLocaleString()} pcs • {masterArticleGroups.length} Master Articles
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Consolidated floor summary by Master Article across Linemen, Mending & QC tables
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors cursor-pointer"
              title="Close Drawer (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Top Stage Telemetry Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setSelectedStage(selectedStage === 'STITCHING' ? 'ALL' : 'STITCHING')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedStage === 'STITCHING'
                  ? 'bg-blue-500 text-white border-blue-600 shadow-sm'
                  : 'bg-white border-black/10 hover:border-blue-400 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                  selectedStage === 'STITCHING' ? 'text-blue-100' : 'text-slate-500'
                }`}>
                  🧵 1. Stitching
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  selectedStage === 'STITCHING' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-800'
                }`}>
                  {stitchingLotsCount} lots
                </span>
              </div>
              <p className={`text-lg font-black font-mono mt-1 leading-none ${
                selectedStage === 'STITCHING' ? 'text-white' : 'text-slate-900'
              }`}>
                {stitchingPcs.toLocaleString()} <span className="text-xs font-medium">pcs</span>
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStage(selectedStage === 'MENDING' ? 'ALL' : 'MENDING')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedStage === 'MENDING'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'bg-white border-black/10 hover:border-amber-400 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                  selectedStage === 'MENDING' ? 'text-amber-100' : 'text-slate-500'
                }`}>
                  🔧 2. Mending
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  selectedStage === 'MENDING' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800'
                }`}>
                  {mendingLotsCount} lots
                </span>
              </div>
              <p className={`text-lg font-black font-mono mt-1 leading-none ${
                selectedStage === 'MENDING' ? 'text-white' : 'text-slate-900'
              }`}>
                {mendingPcs.toLocaleString()} <span className="text-xs font-medium">pcs</span>
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStage(selectedStage === 'QC' ? 'ALL' : 'QC')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedStage === 'QC'
                  ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                  : 'bg-white border-black/10 hover:border-purple-400 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                  selectedStage === 'QC' ? 'text-purple-100' : 'text-slate-500'
                }`}>
                  🔍 3. QC Table
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  selectedStage === 'QC' ? 'bg-purple-700 text-white' : 'bg-purple-50 text-purple-800'
                }`}>
                  {qcLotsCount} lots
                </span>
              </div>
              <p className={`text-lg font-black font-mono mt-1 leading-none ${
                selectedStage === 'QC' ? 'text-white' : 'text-slate-900'
              }`}>
                {qcPcs.toLocaleString()} <span className="text-xs font-medium">pcs</span>
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStage(selectedStage === 'READY_STORE' ? 'ALL' : 'READY_STORE')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedStage === 'READY_STORE'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  : 'bg-white border-black/10 hover:border-emerald-400 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                  selectedStage === 'READY_STORE' ? 'text-emerald-100' : 'text-slate-500'
                }`}>
                  📦 4. Store Inward
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  selectedStage === 'READY_STORE' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800'
                }`}>
                  {readyLotsCount} lots
                </span>
              </div>
              <p className={`text-lg font-black font-mono mt-1 leading-none ${
                selectedStage === 'READY_STORE' ? 'text-white' : 'text-slate-900'
              }`}>
                {readyPcs.toLocaleString()} <span className="text-xs font-medium">pcs</span>
              </p>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by Master Article #, Lineman name, Challan #, Mending/QC supervisor..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm font-semibold bg-[#FAF7F0] border border-black/10 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {(selectedStage !== 'ALL' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedStage('ALL')
                  setSearchQuery('')
                }}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shrink-0 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Master Articles List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {filteredMasterArticles.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-black/10 space-y-3">
              <PackageSearch className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">No Master Articles Match Your Search</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching with a different Article #, Lineman name, or reset active stage filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedStage('ALL')
                  setSearchQuery('')
                }}
                className="px-4 py-2 text-xs font-bold bg-[#3A3564] text-white rounded-xl shadow-2xs hover:bg-[#2F2B52] transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredMasterArticles.map(group => {
              return (
                <div 
                  key={group.artNo}
                  className="bg-white rounded-2xl border border-black/10 hover:border-black/20 shadow-2xs transition-all overflow-hidden"
                >
                  {/* Master Article Card Header */}
                  <div className="p-4 sm:p-5 bg-gradient-to-r from-[#FAF7F0] to-white border-b border-black/10 flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                          Article {group.artNo}
                        </span>
                        {group.totalLots > 1 && (
                          <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#3A3564] text-white rounded-lg shadow-2xs">
                            {group.totalLots} Lots
                          </span>
                        )}
                      </div>
                      {group.description && (
                        <p className="text-xs text-slate-600 font-medium mt-1">
                          {group.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Mini Stage Split Pills */}
                      <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono font-bold">
                        {group.stitchingPcs > 0 && (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                            🧵 {group.stitchingPcs.toLocaleString()} pcs Stitching
                          </span>
                        )}
                        {group.mendingPcs > 0 && (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                            🔧 {group.mendingPcs.toLocaleString()} pcs Mending
                          </span>
                        )}
                        {group.qcPcs > 0 && (
                          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200">
                            🔍 {group.qcPcs.toLocaleString()} pcs QC
                          </span>
                        )}
                        {group.readyPcs > 0 && (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
                            📦 {group.readyPcs.toLocaleString()} pcs Ready
                          </span>
                        )}
                      </div>

                      <div className="text-right pl-3 border-l border-slate-200">
                        <span className="text-lg sm:text-xl font-black font-mono text-slate-900 tabular-nums">
                          {group.totalPcs.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 block leading-tight">Total WIP</span>
                      </div>
                    </div>
                  </div>

                  {/* Consolidated Linemen Rows */}
                  <div className="divide-y divide-slate-100">
                    {group.linemenSummary.map((linemanEntry, idx) => {
                      return (
                        <div key={idx} className="p-4 hover:bg-slate-50/70 transition-colors space-y-3">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-[#3A3564] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                {linemanEntry.linemanName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-bold text-slate-900">
                                    {linemanEntry.linemanName}
                                  </span>
                                  {linemanEntry.challans.length > 0 && (
                                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10 rounded">
                                      {linemanEntry.challans.map(c => `Challan #${c}`).join(', ')}
                                    </span>
                                  )}
                                  {linemanEntry.lotsCount > 1 && (
                                    <span className="text-[11px] font-mono text-slate-400 font-medium">
                                      ({linemanEntry.lotsCount} batches)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border shadow-2xs ${linemanEntry.badgeClass}`}>
                                {linemanEntry.stageLabel}
                              </span>
                              <span className="text-base font-black font-mono text-slate-900 tabular-nums pl-2">
                                {linemanEntry.totalPcs.toLocaleString()} pcs
                              </span>
                            </div>
                          </div>

                          {/* Stage details & Current Table */}
                          <div className="flex items-center justify-between gap-2 flex-wrap text-xs bg-[#FAF7F0]/60 px-3 py-2 rounded-xl border border-black/5">
                            <div className="text-slate-600 text-[11px]">
                              <span className="font-bold text-slate-900">Table / Supervisor:</span> {linemanEntry.supervisor}
                              {linemanEntry.details && (
                                <span className="text-slate-500 ml-1.5">• {linemanEntry.details}</span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              Allotted: {linemanEntry.latestDate}
                            </div>
                          </div>

                          {/* Consolidated Variants Pills */}
                          {linemanEntry.colorSizes.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase mr-1">
                                Sizes:
                              </span>
                              {linemanEntry.colorSizes.map((v, vIdx) => (
                                <span key={vIdx} className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-white text-slate-700 rounded border border-slate-200">
                                  {v.label} ({v.qty.toLocaleString()} pcs)
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-[#FAF7F0] border-t border-black/10 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
            <span>Showing:</span>
            <span className="font-bold text-slate-900">{filteredMasterArticles.length} of {masterArticleGroups.length} Master Articles</span>
            <span className="text-slate-400 hidden sm:inline">• Live Factory Floor Sync</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            Close Drawer
          </button>
        </div>

      </div>
    </div>
  )
}


