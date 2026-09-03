'use client'

import { useState, useMemo, useTransition } from 'react'
import { 
  Package, 
  Download, 
  Search, 
  Plus, 
  Upload, 
  Warehouse, 
  Truck, 
  CheckCircle2, 
  Boxes,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  Clock,
  Eye,
  Check,
  ExternalLink,
  User,
  ShieldCheck
} from 'lucide-react'
import { TvViewButton } from '@/components/ui/TvViewButton'
import { approveQcForStoreInward } from '../actions'

type Article = {
  id: string
  art_no: string
  description?: string | null
}

type StoreTransaction = {
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

type Accessory = {
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
  quantity: number
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

export type PendingQcAllotment = {
  id: string
  target_qty: number
  qc_total_passed?: number | null
  qc_total_alter?: number | null
  qc_status?: string | null
  qc_supervisor_name?: string | null
  qc_passed_at?: string | null
  store_inward_status?: string | null
  admin_approved_at?: string | null
  admin_approved_by?: string | null
  created_at: string
  article?: Article | null
  lineman?: { id: string; username: string } | null
  challans?: { id: string; challan_no: string; brand: string; fabric_type: string } | null
  allotment_variants?: Array<{ id: string; color: string; size: string; quantity: number }> | null
}

interface InventoryClientProps {
  articles: Article[]
  storeTransactions: StoreTransaction[]
  accessories: Accessory[]
  truckInwards?: TruckInward[]
  pendingQcAllotments?: PendingQcAllotment[]
}

type TabKey = 'finished' | 'challans' | 'accessories' | 'dispatch' | 'inward'
type StockStatusFilter = 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
type SortOrder = 'asc' | 'desc'

function formatRelativeDate(dateStr?: string | null) {
  if (!dateStr) return 'None recorded'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / (1000 * 60))
  if (mins < 1) return 'Just now'
  if (mins < 60) return mins + ' min ago'
  const hours = Math.floor(mins / 60)
  if (hours < 24) return hours + ' hr' + (hours > 1 ? 's' : '') + ' ago'
  const days = Math.floor(hours / 24)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return days + ' days ago'
  const months = Math.floor(days / 30)
  return months + ' mo' + (months > 1 ? 's' : '') + ' ago'
}

export function InventoryClient({
  articles,
  storeTransactions,
  accessories,
  truckInwards = [],
  pendingQcAllotments = [],
}: InventoryClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('finished')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StockStatusFilter>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [isPending, startTransition] = useTransition()

  // Sorting state per column
  const [sortCol, setSortCol] = useState<string>('default')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Modal States
  const [activePhoto, setActivePhoto] = useState<{ url: string; title: string } | null>(null)
  const [expandedGrnId, setExpandedGrnId] = useState<string | null>(null)

  // Switch tabs & reset pagination/filters cleanly
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab)
    setCurrentPage(1)
    setStatusFilter('ALL')
    setSortCol('default')
    setSortOrder('desc')
  }

  const handleSort = (column: string) => {
    if (sortCol === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(column)
      setSortOrder('desc')
    }
  }

  // 1. Calculate Finished Goods Stock Matrix
  const finishedStockMatrix = useMemo(() => {
    const map: Record<string, {
      art_no: string
      description: string
      totalInward: number
      totalOutward: number
      balance: number
      variants: Record<string, { in: number, out: number, balance: number }>
    }> = {}

    storeTransactions.forEach(tx => {
      const artNo = tx.article?.art_no || 'Unknown'
      const desc = tx.article?.description || '-'
      const variantKey = (tx.color || 'Standard') + ' / ' + (tx.size || 'Free')

      if (!map[artNo]) {
        map[artNo] = {
          art_no: artNo,
          description: desc,
          totalInward: 0,
          totalOutward: 0,
          balance: 0,
          variants: {}
        }
      }

      if (!map[artNo].variants[variantKey]) {
        map[artNo].variants[variantKey] = { in: 0, out: 0, balance: 0 }
      }

      if (tx.type === 'INWARD') {
        map[artNo].totalInward += tx.quantity
        map[artNo].balance += tx.quantity
        map[artNo].variants[variantKey].in += tx.quantity
        map[artNo].variants[variantKey].balance += tx.quantity
      } else if (tx.type === 'OUTWARD') {
        map[artNo].totalOutward += tx.quantity
        map[artNo].balance -= tx.quantity
        map[artNo].variants[variantKey].out += tx.quantity
        map[artNo].variants[variantKey].balance -= tx.quantity
      }
    })

    let list = Object.values(map)

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      list = list.filter(item => 
        item.art_no.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      )
    }

    // Status filter
    if (statusFilter === 'IN_STOCK') {
      list = list.filter(item => item.balance > 0)
    } else if (statusFilter === 'LOW_STOCK') {
      list = list.filter(item => item.balance > 0 && item.balance <= 50)
    } else if (statusFilter === 'OUT_OF_STOCK') {
      list = list.filter(item => item.balance <= 0)
    }

    // Sort
    if (sortCol === 'art_no') {
      list.sort((a, b) => sortOrder === 'asc' ? a.art_no.localeCompare(b.art_no) : b.art_no.localeCompare(a.art_no))
    } else if (sortCol === 'inward') {
      list.sort((a, b) => sortOrder === 'asc' ? a.totalInward - b.totalInward : b.totalInward - a.totalInward)
    } else if (sortCol === 'balance') {
      list.sort((a, b) => sortOrder === 'asc' ? a.balance - b.balance : b.balance - a.balance)
    }

    return list
  }, [storeTransactions, searchTerm, statusFilter, sortCol, sortOrder])

  // 2. Calculate Raw Materials & Trims Ledger (Accessories)
  const accessoryStockMatrix = useMemo(() => {
    const map: Record<string, {
      item_name: string
      unit: string
      totalIn: number
      totalOut: number
      balance: number
      lastMovement: string
    }> = {}

    accessories.forEach(acc => {
      const name = acc.item_name.trim()
      const unit = acc.unit || 'pcs'
      const date = acc.entry_date || acc.created_at?.split('T')[0] || '-'

      if (!map[name]) {
        map[name] = {
          item_name: name,
          unit,
          totalIn: 0,
          totalOut: 0,
          balance: 0,
          lastMovement: date
        }
      }

      if (acc.action === 'IN') {
        map[name].totalIn += acc.quantity
        map[name].balance += acc.quantity
      } else if (acc.action === 'OUT') {
        map[name].totalOut += acc.quantity
        map[name].balance -= acc.quantity
      }
    })

    let list = Object.values(map)

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      list = list.filter(item => item.item_name.toLowerCase().includes(q))
    }

    // Status filter
    if (statusFilter === 'IN_STOCK') {
      list = list.filter(item => item.balance >= 10)
    } else if (statusFilter === 'LOW_STOCK') {
      list = list.filter(item => item.balance > 0 && item.balance < 10)
    } else if (statusFilter === 'OUT_OF_STOCK') {
      list = list.filter(item => item.balance <= 0)
    }

    // Sort
    if (sortCol === 'item_name') {
      list.sort((a, b) => sortOrder === 'asc' ? a.item_name.localeCompare(b.item_name) : b.item_name.localeCompare(a.item_name))
    } else if (sortCol === 'total_in') {
      list.sort((a, b) => sortOrder === 'asc' ? a.totalIn - b.totalIn : b.totalIn - a.totalIn)
    } else if (sortCol === 'balance') {
      list.sort((a, b) => sortOrder === 'asc' ? a.balance - b.balance : b.balance - a.balance)
    }

    return list
  }, [accessories, searchTerm, statusFilter, sortCol, sortOrder])

  // 3. Filtered Dispatch History
  const filteredDispatch = useMemo(() => {
    let list = storeTransactions.filter(tx => tx.type === 'OUTWARD')

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      list = list.filter(tx => 
        (tx.article?.art_no || '').toLowerCase().includes(q) ||
        (tx.party_name || '').toLowerCase().includes(q) ||
        (tx.challan_no || '').toLowerCase().includes(q) ||
        (tx.transport_no || '').toLowerCase().includes(q) ||
        (tx.notes || '').toLowerCase().includes(q)
      )
    }

    // Sort
    if (sortCol === 'date') {
      list.sort((a, b) => {
        const dA = new Date(a.entry_date || a.created_at).getTime()
        const dB = new Date(b.entry_date || b.created_at).getTime()
        return sortOrder === 'asc' ? dA - dB : dB - dA
      })
    } else if (sortCol === 'quantity') {
      list.sort((a, b) => sortOrder === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity)
    }

    return list
  }, [storeTransactions, searchTerm, sortCol, sortOrder])

  // 4. Filtered Inward History
  const filteredInward = useMemo(() => {
    let list = storeTransactions.filter(tx => tx.type === 'INWARD')

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      list = list.filter(tx => 
        (tx.article?.art_no || '').toLowerCase().includes(q) ||
        (tx.party_name || '').toLowerCase().includes(q) ||
        (tx.notes || '').toLowerCase().includes(q)
      )
    }

    // Sort
    if (sortCol === 'date') {
      list.sort((a, b) => {
        const dA = new Date(a.entry_date || a.created_at).getTime()
        const dB = new Date(b.entry_date || b.created_at).getTime()
        return sortOrder === 'asc' ? dA - dB : dB - dA
      })
    } else if (sortCol === 'quantity') {
      list.sort((a, b) => sortOrder === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity)
    }

    return list
  }, [storeTransactions, searchTerm, sortCol, sortOrder])

  // 5. Filtered Truck Inwards & Accessory Challans (GRN)
  const filteredChallans = useMemo(() => {
    let list = [...(truckInwards || [])]

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      list = list.filter(c =>
        (c.grn_no || '').toLowerCase().includes(q) ||
        (c.party_name || '').toLowerCase().includes(q) ||
        (c.article_no || '').toLowerCase().includes(q) ||
        (c.challan_no || '').toLowerCase().includes(q) ||
        (c.truck_no || '').toLowerCase().includes(q) ||
        (c.notes || '').toLowerCase().includes(q) ||
        (c.items || []).some(i => i.item_name.toLowerCase().includes(q))
      )
    }

    if (statusFilter === 'IN_STOCK') {
      list = list.filter(c => c.status === 'VERIFIED')
    } else if (statusFilter === 'LOW_STOCK') {
      list = list.filter(c => c.status === 'SHORTAGE')
    } else if (statusFilter === 'OUT_OF_STOCK') {
      list = list.filter(c => c.status === 'DUE_PENDING')
    }

    // Sort
    if (sortCol === 'date') {
      list.sort((a, b) => {
        const dA = new Date(a.inward_date || a.created_at).getTime()
        const dB = new Date(b.inward_date || b.created_at).getTime()
        return sortOrder === 'asc' ? dA - dB : dB - dA
      })
    } else if (sortCol === 'party_name') {
      list.sort((a, b) => sortOrder === 'asc' ? a.party_name.localeCompare(b.party_name) : b.party_name.localeCompare(a.party_name))
    } else if (sortCol === 'items') {
      list.sort((a, b) => sortOrder === 'asc' ? a.total_items - b.total_items : b.total_items - a.total_items)
    }

    return list
  }, [truckInwards, searchTerm, statusFilter, sortCol, sortOrder])

  // Current active list & pagination slices
  const currentListCount = useMemo(() => {
    if (activeTab === 'finished') return finishedStockMatrix.length
    if (activeTab === 'challans') return filteredChallans.length
    if (activeTab === 'accessories') return accessoryStockMatrix.length
    if (activeTab === 'dispatch') return filteredDispatch.length
    return filteredInward.length
  }, [activeTab, finishedStockMatrix, filteredChallans, accessoryStockMatrix, filteredDispatch, filteredInward])

  const totalPages = Math.max(1, Math.ceil(currentListCount / pageSize))

  const paginatedFinished = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return finishedStockMatrix.slice(start, start + pageSize)
  }, [finishedStockMatrix, currentPage, pageSize])

  const paginatedChallans = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredChallans.slice(start, start + pageSize)
  }, [filteredChallans, currentPage, pageSize])

  const paginatedAccessories = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return accessoryStockMatrix.slice(start, start + pageSize)
  }, [accessoryStockMatrix, currentPage, pageSize])

  const paginatedDispatch = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredDispatch.slice(start, start + pageSize)
  }, [filteredDispatch, currentPage, pageSize])

  const paginatedInward = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredInward.slice(start, start + pageSize)
  }, [filteredInward, currentPage, pageSize])

  // Overall Global KPI numbers (Unfiltered)
  const totalStockBalance = useMemo(() => {
    const map: Record<string, number> = {}
    storeTransactions.forEach(tx => {
      const artNo = tx.article?.art_no || 'Unknown'
      if (!map[artNo]) map[artNo] = 0
      if (tx.type === 'INWARD') map[artNo] += tx.quantity
      else if (tx.type === 'OUTWARD') map[artNo] -= tx.quantity
    })
    return Object.values(map).reduce((sum, b) => sum + b, 0)
  }, [storeTransactions])

  const totalInwardQty = storeTransactions.filter(t => t.type === 'INWARD').reduce((sum, t) => sum + t.quantity, 0)
  const totalOutwardQty = storeTransactions.filter(t => t.type === 'OUTWARD').reduce((sum, t) => sum + t.quantity, 0)

  // 5. Stock Velocity Smart Derived Calculation (Rolling 30-Day Horizon)
  const stockVelocity = useMemo(() => {
    const now = Date.now()
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000

    // A. Finished Stock Velocity
    const recentOutwards = storeTransactions.filter(
      t => t.type === 'OUTWARD' && new Date(t.entry_date || t.created_at).getTime() >= thirtyDaysAgo
    )
    const totalRecentDispatched = recentOutwards.reduce((sum, t) => sum + (t.quantity || 0), 0)
    const dailyDispatchRate = totalRecentDispatched / 30
    let finishedStockCaption = 'Steady, no reorder needed'
    if (dailyDispatchRate > 0 && totalStockBalance > 0) {
      const daysRemaining = Math.round(totalStockBalance / dailyDispatchRate)
      if (daysRemaining <= 15) {
        finishedStockCaption = '~' + daysRemaining + ' days stock at current pace'
      } else {
        finishedStockCaption = 'Steady, no reorder needed'
      }
    } else if (totalStockBalance === 0) {
      finishedStockCaption = 'Zero stock · Awaiting floor inward'
    }

    // B. Accessories Trims Velocity
    const trimStats: Record<string, { totalOut: number; balance: number; firstDate: number }> = {}
    accessories.forEach(acc => {
      const name = acc.item_name.trim()
      const time = new Date(acc.entry_date || acc.created_at).getTime()
      if (!trimStats[name]) {
        trimStats[name] = { totalOut: 0, balance: 0, firstDate: time }
      }
      if (acc.action === 'IN') trimStats[name].balance += acc.quantity
      if (acc.action === 'OUT') {
        trimStats[name].balance -= acc.quantity
        if (time >= thirtyDaysAgo) {
          trimStats[name].totalOut += acc.quantity
        }
      }
      if (time < trimStats[name].firstDate) trimStats[name].firstDate = time
    })

    let criticalTrimsCount = 0
    let minDaysToStockOut = Infinity
    const trimVelocityMap: Record<string, { daysToStockOut: number | null }> = {}

    Object.entries(trimStats).forEach(([name, stat]) => {
      const daysObserved = Math.max(1, Math.min(30, Math.ceil((now - stat.firstDate) / (1000 * 60 * 60 * 24))))
      if (daysObserved >= 3 && stat.totalOut > 0) {
        const dailyBurn = stat.totalOut / daysObserved
        if (dailyBurn > 0) {
          const daysLeft = Math.round(stat.balance / dailyBurn)
          trimVelocityMap[name] = { daysToStockOut: daysLeft }
          if (daysLeft <= 10 && daysLeft >= 0) {
            criticalTrimsCount++
            if (daysLeft < minDaysToStockOut) minDaysToStockOut = daysLeft
          }
        } else {
          trimVelocityMap[name] = { daysToStockOut: null }
        }
      } else {
        trimVelocityMap[name] = { daysToStockOut: null }
      }
    })

    let trimsCaption = 'All trims sufficiently stocked'
    let trimsCardAlert = false
    if (criticalTrimsCount > 0) {
      trimsCardAlert = true
      trimsCaption = criticalTrimsCount + ' item' + (criticalTrimsCount > 1 ? 's' : '') + ' ~' + (minDaysToStockOut === Infinity ? 0 : minDaysToStockOut) + ' days to stock-out'
    } else if (accessories.length === 0) {
      trimsCaption = 'Not enough history yet'
    }

    // C. Last QC Pass
    const latestInward = storeTransactions
      .filter(t => t.type === 'INWARD')
      .sort((a, b) => new Date(b.created_at || b.entry_date || 0).getTime() - new Date(a.created_at || a.entry_date || 0).getTime())[0]

    const lastQcCaption = latestInward 
      ? 'Last QC pass: ' + formatRelativeDate(latestInward.created_at || latestInward.entry_date)
      : 'No QC inward recorded yet'

    // D. Last Dispatch
    const latestDispatch = storeTransactions
      .filter(t => t.type === 'OUTWARD')
      .sort((a, b) => new Date(b.created_at || b.entry_date || 0).getTime() - new Date(a.created_at || a.entry_date || 0).getTime())[0]

    let lastDispatchCaption = 'No dispatch this week'
    if (latestDispatch) {
      const dispatchTime = new Date(latestDispatch.created_at || latestDispatch.entry_date || 0).getTime()
      if (dispatchTime >= sevenDaysAgo) {
        lastDispatchCaption = 'Last dispatch: ' + formatRelativeDate(latestDispatch.created_at || latestDispatch.entry_date)
      } else {
        lastDispatchCaption = 'Last dispatch: ' + formatRelativeDate(latestDispatch.created_at || latestDispatch.entry_date)
      }
    }

    return {
      finishedStockCaption,
      trimsCaption,
      trimsCardAlert,
      lastQcCaption,
      lastDispatchCaption,
      trimVelocityMap
    }
  }, [storeTransactions, accessories, totalStockBalance])

  // CSV Export Helper
  const handleExportCSV = () => {
    let headers: string[] = []
    let rows: (string | number)[][] = []
    const filename = 'inventory_' + activeTab + '_' + new Date().toISOString().split('T')[0] + '.csv'

    if (activeTab === 'finished') {
      headers = ['Article No', 'Description', 'Total Inward (QC)', 'Total Outward (Dispatch)', 'Current Balance']
      rows = finishedStockMatrix.map(r => [
        r.art_no,
        r.description,
        r.totalInward,
        r.totalOutward,
        r.balance
      ])
    } else if (activeTab === 'accessories') {
      headers = ['Item Name', 'Unit', 'Total Received (IN)', 'Total Issued (OUT)', 'Current Balance']
      rows = accessoryStockMatrix.map(r => [
        r.item_name,
        r.unit,
        r.totalIn,
        r.totalOut,
        r.balance
      ])
    } else if (activeTab === 'dispatch') {
      headers = ['Date', 'Article No', 'Color', 'Size', 'Quantity', 'Buyer / Customer', 'Challan No', 'Vehicle No', 'Notes']
      rows = filteredDispatch.map(r => [
        r.entry_date || '-',
        r.article?.art_no || '-',
        r.color || '-',
        r.size || '-',
        r.quantity,
        r.party_name || '-',
        r.challan_no || '-',
        r.transport_no || '-',
        '"' + (r.notes || '').replace(/"/g, '""') + '"'
      ])
    } else if (activeTab === 'inward') {
      headers = ['Date', 'Article No', 'Color', 'Size', 'Quantity', 'Received From', 'Notes']
      rows = filteredInward.map(r => [
        r.entry_date || '-',
        r.article?.art_no || '-',
        r.color || '-',
        r.size || '-',
        r.quantity,
        r.party_name || '-',
        '"' + (r.notes || '').replace(/"/g, '""') + '"'
      ])
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header Card */}
      <div 
        className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all"
      >
        <div className="flex items-center gap-3.5">
          <div 
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10"
          >
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <h1 
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900"
            >
              Godown & Inventory Management
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Real-time finished goods stock, raw trims ledger & store transactions
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-black/10 bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <TvViewButton />
        </div>
      </div>

      {/* 2. KPI Overview Banner with Stock Velocity Insight Captions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Finished Stock */}
        <div 
          className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:border-black/25 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Finished Stock
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[28px] sm:text-[30px] font-bold font-[family-name:var(--font-heading)] leading-none text-slate-900 block">
              {totalStockBalance.toLocaleString()} <span className="text-xs font-normal text-slate-400">pcs</span>
            </span>
            <span 
              className="text-xs font-mono font-medium block mt-1.5 truncate text-slate-400"
              title={stockVelocity.finishedStockCaption}
            >
              {stockVelocity.finishedStockCaption}
            </span>
          </div>
        </div>

        {/* Accessories Trims */}
        <div 
          className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:border-black/25 transition-all flex flex-col justify-between"
          style={{ 
            borderColor: stockVelocity.trimsCardAlert ? '#F59E0B' : undefined,
            background: stockVelocity.trimsCardAlert ? 'linear-gradient(180deg, #FFFDF8 0%, #FFFFFF 100%)' : '#FFFFFF'
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block" style={{ color: stockVelocity.trimsCardAlert ? '#B45309' : undefined }}>
              Accessories Trims
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[28px] sm:text-[30px] font-bold font-[family-name:var(--font-heading)] leading-none text-slate-900 block">
              {accessories.length} <span className="text-xs font-normal text-slate-400">items</span>
            </span>
            <span 
              className="text-xs font-mono font-medium block mt-1.5 truncate"
              style={{ color: stockVelocity.trimsCardAlert ? '#B45309' : '#94A3B8' }}
              title={stockVelocity.trimsCaption}
            >
              {stockVelocity.trimsCaption}
            </span>
          </div>
        </div>

        {/* Total Inward (QC) */}
        <div 
          className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:border-black/25 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Total Inward (QC)
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[28px] sm:text-[30px] font-bold font-[family-name:var(--font-heading)] leading-none text-slate-900 block">
              +{totalInwardQty.toLocaleString()} <span className="text-xs font-normal text-slate-400">pcs</span>
            </span>
            <span 
              className="text-xs font-mono font-medium block mt-1.5 truncate text-slate-400"
              title={stockVelocity.lastQcCaption}
            >
              {stockVelocity.lastQcCaption}
            </span>
          </div>
        </div>

        {/* Dispatched Outward */}
        <div 
          className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:border-black/25 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Dispatched Outward
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[28px] sm:text-[30px] font-bold font-[family-name:var(--font-heading)] leading-none text-[#7C3AED] block">
              -{totalOutwardQty.toLocaleString()} <span className="text-xs font-normal text-slate-400">pcs</span>
            </span>
            <span 
              className="text-xs font-mono font-medium block mt-1.5 truncate text-slate-400"
              title={stockVelocity.lastDispatchCaption}
            >
              {stockVelocity.lastDispatchCaption}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs, Status Filter Chips & Search Toolbar */}
      <div 
        className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs"
      >
        {/* Top Row: Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => handleTabChange('finished')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer outline-none ${
              activeTab === 'finished'
                ? 'bg-[#3A3564] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 bg-transparent'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Finished Goods Matrix ({finishedStockMatrix.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('challans')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer outline-none ${
              activeTab === 'challans'
                ? 'bg-[#3A3564] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 bg-transparent'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Supplier Challans & GRN ({filteredChallans.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('accessories')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer outline-none ${
              activeTab === 'accessories'
                ? 'bg-[#3A3564] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 bg-transparent'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Raw Materials & Trims ({accessoryStockMatrix.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('dispatch')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer outline-none ${
              activeTab === 'dispatch'
                ? 'bg-[#3A3564] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 bg-transparent'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Dispatch & Challans ({filteredDispatch.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('inward')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer outline-none ${
              activeTab === 'inward'
                ? 'bg-[#3A3564] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 bg-transparent'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Inward Receipts ({filteredInward.length})</span>
            {pendingQcAllotments.filter(a => a.qc_status === 'PENDING_ADMIN_APPROVAL').length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse">
                {pendingQcAllotments.filter(a => a.qc_status === 'PENDING_ADMIN_APPROVAL').length} QC Pending
              </span>
            )}
          </button>
        </div>

        {/* Bottom Row: Status Filter Chips + Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
          
          {/* Status Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'] as StockStatusFilter[]).map((st) => {
              const isSelected = statusFilter === st
              const labelMap: Record<StockStatusFilter, string> = {
                ALL: 'All',
                IN_STOCK: 'In Stock',
                LOW_STOCK: 'Low Stock',
                OUT_OF_STOCK: 'Out of Stock'
              }
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st)
                    setCurrentPage(1)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer outline-none ${
                    isSelected
                      ? 'bg-[#3A3564] text-white border-transparent shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {labelMap[st]}
                </button>
              )
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search article, buyer, trims..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 transition-all shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* 4. Main Table / Empty State Area */}
      <div 
        className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden"
      >
        
        {/* ======================================================== */}
        {/* TAB 1: FINISHED GOODS MATRIX                             */}
        {/* ======================================================== */}
        {activeTab === 'finished' && (
          <div>
            {finishedStockMatrix.length === 0 ? (
              <div className="p-12 sm:p-16 text-center flex flex-col items-center justify-center space-y-3.5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
                  <Package className="w-7 h-7" />
                </div>
                <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-heading)] text-slate-900">
                  No finished stock recorded yet
                </h3>
                <p className="text-sm text-slate-500 max-w-md">
                  Finished garments passed by QC and accepted by Store Manager will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
                  <thead>
                    <tr className="bg-[#FAF7F0] border-b border-black/10 text-xs font-mono uppercase tracking-wider font-bold text-slate-700">
                      
                      {/* Sortable Article No */}
                      <th 
                        onClick={() => handleSort('art_no')}
                        className="px-5 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors select-none font-bold"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Article No</span>
                          {sortCol === 'art_no' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#3A3564]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#3A3564]" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </th>

                      <th className="px-4 py-3.5 font-bold">Description</th>
                      
                      {/* Sortable Total Inward */}
                      <th 
                        onClick={() => handleSort('inward')}
                        className="px-4 py-3.5 text-right cursor-pointer hover:bg-slate-100 transition-colors select-none font-bold text-emerald-700"
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <span>Total Inward (QC)</span>
                          {sortCol === 'inward' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-700" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-700" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </th>

                      <th className="px-4 py-3.5 font-bold text-right text-[#3A3564]">Total Outward (Dispatch)</th>
                      
                      {/* Sortable Balance */}
                      <th 
                        onClick={() => handleSort('balance')}
                        className="px-4 py-3.5 text-right cursor-pointer hover:bg-slate-100 transition-colors select-none font-bold"
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <span>Godown Balance</span>
                          {sortCol === 'balance' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#3A3564]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#3A3564]" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </th>

                      <th className="px-4 py-3.5 font-bold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedFinished.map((row) => (
                      <tr key={row.art_no} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-sm text-[#3A3564]">
                          {row.art_no}
                        </td>
                        <td className="px-4 py-3.5 text-xs sm:text-[13px] text-slate-600 font-medium">
                          {row.description}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-600 text-xs sm:text-[13px]">
                          +{row.totalInward.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-[#3A3564] text-xs sm:text-[13px]">
                          -{row.totalOutward.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span 
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold font-mono shadow-2xs border ${
                              row.balance > 0 
                                ? 'bg-[#FAF7F0] text-[#3A3564] border-black/10' 
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {row.balance.toLocaleString()} pcs
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span 
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                              row.balance > 50 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                : row.balance > 0 
                                  ? 'bg-amber-50 text-amber-800 border-amber-200' 
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {row.balance > 50 ? 'In Stock' : row.balance > 0 ? 'Low Stock' : 'Zero Stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: SUPPLIER CHALLANS & GRN                            */}
        {/* ======================================================== */}
        {activeTab === 'challans' && (
          <div>
            {/* Supplier Due Items Alert Banner */}
            {truckInwards.some(c => (c.due_items_count || 0) > 0) && (
              <div className="m-4 p-4 rounded-[10px] bg-purple-50 border border-purple-200 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-purple-900">
                    Supplier Follow-up Alert: Pending Items on Delivery
                  </h4>
                  <p className="text-[11.5px] text-purple-800 mt-0.5">
                    Certain accessories were marked as <strong>Due / Pending from Supplier</strong> at factory gate inward. Please contact the respective suppliers for delivery status.
                  </p>
                </div>
              </div>
            )}

            {filteredChallans.length === 0 ? (
              <div className="p-12 sm:p-16 text-center flex flex-col items-center justify-center space-y-3.5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-heading)] text-slate-900">
                  No supplier challans or truck inwards logged yet
                </h3>
                <p className="text-sm text-slate-500 max-w-md">
                  Delivery challans recorded by Store Managers at factory gate will appear here with line items and paper slip photo proofs.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
                  <thead>
                    <tr className="bg-[#FAF7F0] border-b border-black/10 text-xs font-mono uppercase tracking-wider font-bold text-slate-700">
                      <th 
                        onClick={() => handleSort('date')}
                        className="px-5 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors select-none font-bold"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>GRN # & Date</span>
                          {sortCol === 'date' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#3A3564]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#3A3564]" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3.5 font-bold">Supplier / Brand</th>
                      <th className="px-4 py-3.5 font-bold">Article No</th>
                      <th className="px-4 py-3.5 font-bold">Challan / Vehicle</th>
                      <th className="px-4 py-3.5 font-bold">Items Breakdown</th>
                      <th className="px-4 py-3.5 font-bold text-center">Status</th>
                      <th className="px-4 py-3.5 font-bold text-center">Slip Proof</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedChallans.map((row) => {
                      const isExpanded = expandedGrnId === row.id
                      const isVerified = row.status === 'VERIFIED'
                      const isShortage = row.status === 'SHORTAGE'
                      const isDue = row.status === 'DUE_PENDING'

                      return (
                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors align-top">
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
                              {row.grn_no}
                            </span>
                            <div className="text-xs text-slate-500 mt-1 font-mono">
                              {row.inward_date || row.created_at.split('T')[0]}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="font-bold text-sm text-slate-900">{row.party_name}</div>
                            <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-black/10 text-[11px] font-bold text-[#3A3564] shadow-2xs">
                              <User className="w-3 h-3 text-[#3A3564]" />
                              <span>{row.receiver_name || 'Store Inward'}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            {row.article_no ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                Art {row.article_no}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-slate-600 text-xs sm:text-[13px]">
                            <div className="font-medium text-slate-800">{row.challan_no ? 'Challan #' + row.challan_no : 'Direct Delivery'}</div>
                            {row.truck_no && (
                              <div className="text-slate-500 mt-0.5 font-mono">{row.truck_no}</div>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="space-y-1.5 max-w-md">
                              {(() => {
                                const allItems: Array<{ item_name: string; size_label?: string | null; quantity: number; unit?: string | null; status: string }> = 
                                  (row.items && row.items.length > 0)
                                    ? row.items
                                    : Array.isArray(row.line_items)
                                      ? row.line_items.map((li: any) => ({
                                          item_name: li.name || li.item_name || 'Item',
                                          size_label: li.size || li.size_label || '',
                                          quantity: Number(li.qty || li.quantity) || 0,
                                          unit: li.unit || 'pcs',
                                          status: li.status || 'RECEIVED'
                                        }))
                                      : []

                                return (
                                  <>
                                    {allItems.slice(0, isExpanded ? allItems.length : 3).map((it, i) => (
                                      <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700">
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${it.status === 'DUE' ? 'bg-purple-500' : it.status === 'SHORTAGE' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                        <span className="font-semibold text-slate-900">{it.item_name}</span>
                                        {it.size_label && <span className="text-slate-500 font-mono">({it.size_label})</span>}
                                        <span className="text-slate-500 font-mono font-bold">: {it.quantity} {it.unit}</span>
                                        {it.status === 'DUE' && (
                                          <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700">DUE</span>
                                        )}
                                        {it.status === 'SHORTAGE' && (
                                          <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700">SHORT</span>
                                        )}
                                      </div>
                                    ))}
                                    {allItems.length > 3 && (
                                      <button
                                        type="button"
                                        onClick={() => setExpandedGrnId(isExpanded ? null : row.id)}
                                        className="text-xs font-bold text-[#3A3564] hover:underline pt-0.5 block cursor-pointer"
                                      >
                                        {isExpanded ? 'Show less' : `+ ${allItems.length - 3} more items`}
                                      </button>
                                    )}
                                  </>
                                )
                              })()}
                            </div>
                            {row.notes && (
                              <div className="text-xs text-slate-500 italic mt-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-200/60">
                                Note: {row.notes}
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            {isVerified && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                Verified
                              </span>
                            )}
                            {isShortage && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                Shortage ({row.shortage_items_count})
                              </span>
                            )}
                            {isDue && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
                                <Clock className="w-3.5 h-3.5 text-purple-600" />
                                Due ({row.due_items_count})
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            {row.challan_photo_url ? (
                              <button
                                type="button"
                                onClick={() => setActivePhoto({ url: row.challan_photo_url!, title: `${row.party_name} • ${row.grn_no}` })}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FAF7F0] hover:bg-slate-100 text-[#3A3564] border border-black/10 transition-colors cursor-pointer shadow-2xs"
                              >
                                <ImageIcon className="w-3.5 h-3.5 text-[#3A3564]" />
                                <span>View Slip</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 text-xs italic">No photo</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: RAW MATERIALS & TRIMS (ACCESSORIES)               */}
        {/* ======================================================== */}
        {activeTab === 'accessories' && (
          <div>
            {accessoryStockMatrix.length === 0 ? (
              <div className="p-12 sm:p-16 text-center flex flex-col items-center justify-center space-y-3.5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
                  <Boxes className="w-7 h-7" />
                </div>
                <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-heading)] text-slate-900">
                  No trims added yet
                </h3>
                <p className="text-sm text-slate-500 max-w-md">
                  Trims and raw accessories (buttons, threads, zippers) recorded by Store Manager from supplier deliveries will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
                  <thead>
                    <tr className="bg-[#FAF7F0] border-b border-black/10 text-xs font-mono uppercase tracking-wider font-bold text-slate-700">
                      
                      {/* Sortable Item Name */}
                      <th 
                        onClick={() => handleSort('item_name')}
                        className="px-5 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors select-none font-bold"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Item Name / Trim</span>
                          {sortCol === 'item_name' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#3A3564]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#3A3564]" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </th>

                      <th className="px-4 py-3.5 font-bold">Unit</th>

                      {/* Sortable Total Received */}
                      <th 
                        onClick={() => handleSort('total_in')}
                        className="px-4 py-3.5 text-right cursor-pointer hover:bg-slate-100 transition-colors select-none font-bold text-emerald-700"
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <span>Total Received (IN)</span>
                          {sortCol === 'total_in' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-700" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-700" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </th>

                      <th className="px-4 py-3.5 font-bold text-right text-amber-700">Total Issued (OUT)</th>
                      
                      {/* Sortable Balance */}
                      <th 
                        onClick={() => handleSort('balance')}
                        className="px-4 py-3.5 text-right cursor-pointer hover:bg-slate-100 transition-colors select-none font-bold"
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <span>Current Balance</span>
                          {sortCol === 'balance' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#3A3564]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#3A3564]" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </th>

                      <th className="px-4 py-3.5 font-bold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedAccessories.map((row) => {
                      const isLow = row.balance < 10 && row.balance > 0
                      const isOut = row.balance <= 0
                      const velocityInfo = stockVelocity.trimVelocityMap[row.item_name]
                      const daysLeft = velocityInfo?.daysToStockOut

                      return (
                        <tr key={row.item_name} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-sm text-slate-900">
                            {row.item_name}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 font-medium text-xs sm:text-[13px]">
                            {row.unit}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-600 text-xs sm:text-[13px]">
                            +{row.totalIn.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-amber-700 text-xs sm:text-[13px]">
                            -{row.totalOut.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <span 
                              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold font-mono shadow-2xs border ${
                                isOut 
                                  ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                  : 'bg-[#FAF7F0] text-[#3A3564] border-black/10'
                              }`}
                            >
                              {row.balance.toLocaleString()} {row.unit}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span 
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                                isOut 
                                  ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                  : isLow 
                                    ? 'bg-amber-50 text-amber-800 border-amber-200' 
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {isOut 
                                ? 'Out of Stock' 
                                : isLow 
                                  ? (daysLeft != null ? 'Low Stock · ~' + daysLeft + 'd' : 'Low Stock') 
                                  : (daysLeft != null ? 'Available · ~' + daysLeft + 'd' : 'Available')}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: DISPATCH & DELIVERY CHALLANS                     */}
        {/* ======================================================== */}
        {activeTab === 'dispatch' && (
          <div>
            {filteredDispatch.length === 0 ? (
              <div className="p-12 sm:p-16 text-center flex flex-col items-center justify-center space-y-3.5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
                  <Truck className="w-7 h-7" />
                </div>
                <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-heading)] text-slate-900">
                  No dispatches yet
                </h3>
                <p className="text-sm text-slate-500 max-w-md">
                  Buyer orders and delivery gate passes dispatched by Store Manager will show up here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
                  <thead>
                    <tr className="bg-[#FAF7F0] border-b border-black/10 text-xs font-mono uppercase tracking-wider font-bold text-slate-700">
                      
                      {/* Sortable Date */}
                      <th 
                        onClick={() => handleSort('date')}
                        className="px-5 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors select-none font-bold"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Date</span>
                          {sortCol === 'date' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#3A3564]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#3A3564]" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </th>

                      <th className="px-4 py-3.5 font-bold">Article No</th>
                      <th className="px-4 py-3.5 font-bold">Color / Size</th>
                      
                      {/* Sortable Dispatched Qty */}
                      <th 
                        onClick={() => handleSort('quantity')}
                        className="px-4 py-3.5 text-right cursor-pointer hover:bg-slate-100 transition-colors select-none font-bold text-[#3A3564]"
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <span>Dispatched Qty</span>
                          {sortCol === 'quantity' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#3A3564]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#3A3564]" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </th>

                      <th className="px-4 py-3.5 font-bold">Buyer / Customer</th>
                      <th className="px-4 py-3.5 font-bold">Challan / Vehicle No</th>
                      <th className="px-4 py-3.5 font-bold">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedDispatch.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-slate-600 text-xs whitespace-nowrap">
                          {row.entry_date || row.created_at.split('T')[0]}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-sm text-[#3A3564]">
                          {row.article?.art_no || '-'}
                        </td>
                        <td className="px-4 py-3.5">
                          {(row.color || row.size) ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                              {row.color} {row.size ? '(' + row.size + ')' : ''}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-[#3A3564] text-xs sm:text-[13px]">
                          {row.quantity.toLocaleString()} pcs
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">
                          {row.party_name || '-'}
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 text-xs sm:text-[13px]">
                          {row.challan_no ? 'Challan: ' + row.challan_no : ''} {row.transport_no ? '• ' + row.transport_no : ''}
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 text-xs">
                          {row.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: INWARD RECEIPTS & QC HANDSHAKE AUTHORIZATIONS     */}
        {/* ======================================================== */}
        {activeTab === 'inward' && (
          <div>
            {/* QC Handshake Approvals Section (Admin Gate) */}
            {pendingQcAllotments.length > 0 && (
              <div className="p-5 border-b border-slate-100 bg-[#FAF7F0]/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#3A3564] text-white flex items-center justify-center shadow-xs">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                        QC Floor Handshake Authorizations
                      </h4>
                      <p className="text-xs text-slate-500">
                        Finished lots passed by QC Supervisors. Authorize to notify Store Manager for Godown Inward.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {pendingQcAllotments.filter(a => a.qc_status === 'PENDING_ADMIN_APPROVAL').length} Awaiting Authorization
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {pendingQcAllotments.map((lot) => {
                    const isPendingApprove = lot.qc_status === 'PENDING_ADMIN_APPROVAL'
                    const passedQty = lot.qc_total_passed || lot.target_qty || 0
                    const artNo = lot.article?.art_no || 'Garment'
                    const challanNo = lot.challans?.challan_no || '-'
                    const brand = lot.challans?.brand || 'OLLYPOP'
                    const lineman = lot.lineman?.username || 'Lineman'
                    const qcSupervisor = lot.qc_supervisor_name || 'QC Supervisor'
                    const variants = lot.allotment_variants || []

                    return (
                      <div 
                        key={lot.id} 
                        className={`p-4 rounded-xl border transition-all ${
                          isPendingApprove 
                            ? 'bg-white border-amber-300 shadow-sm' 
                            : 'bg-emerald-50/50 border-emerald-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-700">
                                CH-{challanNo} · {brand}
                              </span>
                              <span className="text-sm font-black text-[#3A3564]">
                                Art #{artNo}
                              </span>
                            </div>
                            {lot.article?.description && (
                              <p className="text-xs text-slate-500 mt-0.5">{lot.article.description}</p>
                            )}
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black font-mono ${
                            isPendingApprove ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {passedQty.toLocaleString()} pcs
                          </span>
                        </div>

                        {/* Variant breakdowns */}
                        {variants.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {variants.map((v) => (
                              <span key={v.id} className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                                {v.color ? `${v.color} ` : ''}{v.size}: <strong>{v.quantity}</strong> pcs
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Chain of Custody line */}
                        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-600">
                          <span className="font-semibold text-slate-700">🧵 Lineman: {lineman}</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-700">🔍 QC Passed: {qcSupervisor}</span>
                        </div>

                        {/* Approval Action */}
                        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          {isPendingApprove ? (
                            <>
                              <div className="flex items-center gap-1 text-xs text-amber-700 font-medium">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>Awaiting Admin Gate</span>
                              </div>
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => {
                                  startTransition(async () => {
                                    await approveQcForStoreInward(lot.id)
                                  })
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve for Store Inward</span>
                              </button>
                            </>
                          ) : (
                            <div className="w-full flex items-center justify-between text-xs text-emerald-700 font-bold bg-emerald-100/60 px-3 py-1.5 rounded-lg">
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Approved by {lot.admin_approved_by || 'Admin'}</span>
                              </span>
                              <span className="text-[11px] text-emerald-800 font-normal">
                                Store Manager notified to collect
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            {filteredInward.length === 0 ? (
              <div className="p-12 sm:p-16 text-center flex flex-col items-center justify-center space-y-3.5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-heading)] text-slate-900">
                  No inward receipts logged yet
                </h3>
                <p className="text-sm text-slate-500 max-w-md">
                  Finished garments received from QC finishing floor by Store Manager will be listed here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
                  <thead>
                    <tr className="bg-[#FAF7F0] border-b border-black/10 text-xs font-mono uppercase tracking-wider font-bold text-slate-700">
                      
                      {/* Sortable Date */}
                      <th 
                        onClick={() => handleSort('date')}
                        className="px-5 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors select-none font-bold"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Date</span>
                          {sortCol === 'date' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#3A3564]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#3A3564]" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </th>

                      <th className="px-4 py-3.5 font-bold">Article & Challan</th>
                      <th className="px-4 py-3.5 font-bold">Color / Size</th>
                      
                      {/* Sortable Received Qty */}
                      <th 
                        onClick={() => handleSort('quantity')}
                        className="px-4 py-3.5 text-right cursor-pointer hover:bg-slate-100 transition-colors select-none font-bold text-emerald-700"
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <span>Received Qty</span>
                          {sortCol === 'quantity' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-700" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-700" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </th>

                      <th className="px-4 py-3.5 font-bold">Chain of Custody (Lineman • Mending • QC • Store)</th>
                      <th className="px-4 py-3.5 font-bold">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedInward.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-slate-600 text-xs whitespace-nowrap">
                          {row.entry_date || row.created_at.split('T')[0]}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-sm text-[#3A3564]">
                            {row.article?.art_no || '-'}
                          </div>
                          {row.challan_no && (
                            <div className="text-[11px] font-mono font-semibold text-slate-500 mt-0.5">
                              CH-{row.challan_no}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {(row.color || row.size) ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                              {row.color} {row.size ? '(' + row.size + ')' : ''}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-600 text-xs sm:text-[13px]">
                          +{row.quantity.toLocaleString()} pcs
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap items-center gap-1.5 max-w-sm">
                            {row.lineman_name && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-black/10 text-[11px] font-semibold text-[#3A3564]">
                                <span>🧵</span>
                                <span>Lineman: <strong>{row.lineman_name}</strong></span>
                              </span>
                            )}
                            {row.mending_name && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-[11px] font-semibold text-purple-800">
                                <span>✂️</span>
                                <span>Mending: <strong>{row.mending_name}</strong></span>
                              </span>
                            )}
                            {row.qc_supervisor_name && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800">
                                <span>🔍</span>
                                <span>QC: <strong>{row.qc_supervisor_name}</strong></span>
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[11px] font-semibold text-blue-800">
                              <User className="w-3 h-3 text-blue-700" />
                              <span>Store: <strong>{row.receiver_name || row.party_name || 'Store'}</strong></span>
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 text-xs">
                          {row.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 5. Pagination Controls Footer */}
        {currentListCount > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-[13px]">
            <div className="text-slate-600 font-medium">
              Showing <span className="font-bold text-slate-900">{(currentPage - 1) * pageSize + 1}</span>–<span className="font-bold text-slate-900">{Math.min(currentPage * pageSize, currentListCount)}</span> of <span className="font-bold text-slate-900">{currentListCount}</span> {activeTab === 'finished' ? 'articles' : activeTab === 'accessories' ? 'items' : activeTab === 'dispatch' ? 'dispatches' : 'receipts'}
            </div>

            {/* Page Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
                const isActive = currentPage === pg
                return (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setCurrentPage(pg)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#3A3564] text-white border-transparent shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {pg}
                  </button>
                )
              })}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL: CHALLAN SLIP PHOTO VIEWER                         */}
      {/* ======================================================== */}
      {activePhoto && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-[14px] max-w-3xl w-full p-4 space-y-3 shadow-2xl border border-slate-700">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold truncate">{activePhoto.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center rounded-lg bg-black/40 p-2">
              <img
                src={activePhoto.url}
                alt="Challan Slip"
                className="max-h-[70vh] w-auto object-contain rounded-md shadow-md"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
