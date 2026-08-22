'use client'

import { useState, useMemo, useTransition } from 'react'
import Link from 'next/link'
import { 
  Package, 
  Download, 
  Printer, 
  Search, 
  Plus, 
  Upload, 
  Layers, 
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Warehouse,
  Truck,
  Sparkles,
  X
} from 'lucide-react'
import { addStoreTransaction, addAccessoryTransaction } from '../actions'

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

interface InventoryClientProps {
  articles: Article[]
  storeTransactions: StoreTransaction[]
  accessories: Accessory[]
}

export function InventoryClient({
  articles,
  storeTransactions,
  accessories,
}: InventoryClientProps) {
  const [activeTab, setActiveTab] = useState<'finished' | 'accessories' | 'dispatch' | 'inward'>('finished')
  const [searchTerm, setSearchTerm] = useState('')
  const [isPending, startTransition] = useTransition()

  // Modal States
  const [showInwardModal, setShowInwardModal] = useState(false)
  const [showOutwardModal, setShowOutwardModal] = useState(false)
  const [showAccessoryModal, setShowAccessoryModal] = useState(false)

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
      const variantKey = `${tx.color || 'Standard'} / ${tx.size || 'Free'}`

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

    return Object.values(map).filter(item => {
      if (!searchTerm) return true
      return item.art_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.description.toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [storeTransactions, searchTerm])

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

    return Object.values(map).filter(item => {
      if (!searchTerm) return true
      return item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [accessories, searchTerm])

  // 3. Filtered Dispatch History
  const filteredDispatch = useMemo(() => {
    return storeTransactions
      .filter(tx => tx.type === 'OUTWARD')
      .filter(tx => {
        if (!searchTerm) return true
        return (
          tx.article?.art_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.party_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.challan_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.transport_no?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
  }, [storeTransactions, searchTerm])

  // 4. Filtered Inward History
  const filteredInward = useMemo(() => {
    return storeTransactions
      .filter(tx => tx.type === 'INWARD')
      .filter(tx => {
        if (!searchTerm) return true
        return (
          tx.article?.art_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.party_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.notes?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
  }, [storeTransactions, searchTerm])

  // Overall Global KPI numbers
  const totalStockBalance = finishedStockMatrix.reduce((sum, i) => sum + i.balance, 0)
  const totalInwardQty = storeTransactions.filter(t => t.type === 'INWARD').reduce((sum, t) => sum + t.quantity, 0)
  const totalOutwardQty = storeTransactions.filter(t => t.type === 'OUTWARD').reduce((sum, t) => sum + t.quantity, 0)

  // CSV Export Helper
  const handleExportCSV = () => {
    let headers: string[] = []
    let rows: (string | number)[][] = []
    const filename = `inventory_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`

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
        `"${(r.notes || '').replace(/"/g, '""')}"`
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
        `"${(r.notes || '').replace(/"/g, '""')}"`
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Warehouse className="w-8 h-8 text-purple-600" />
              Godown & Inventory Management
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 ml-11">
            Real-time Finished Goods Godown, Raw Material Accessories, and Delivery Challans.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          <button 
            onClick={() => setShowInwardModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            + Receive Inward
          </button>
          <button 
            onClick={() => setShowOutwardModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            + Dispatch Outward
          </button>
          <button 
            onClick={() => setShowAccessoryModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            + Accessory Trims
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Overview Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-xl">
            <Package className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Finished Stock</span>
            <span className="text-xl font-black text-slate-900">{totalStockBalance.toLocaleString()} pcs</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 rounded-xl">
            <Sparkles className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Accessories Trims</span>
            <span className="text-xl font-black text-slate-900">{accessoryStockMatrix.length} items</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Inward (QC)</span>
            <span className="text-xl font-black text-emerald-600">+{totalInwardQty.toLocaleString()} pcs</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Truck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Dispatched Outward</span>
            <span className="text-xl font-black text-blue-600">-{totalOutwardQty.toLocaleString()} pcs</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('finished')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'finished'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            Finished Goods Matrix ({finishedStockMatrix.length})
          </button>

          <button
            onClick={() => setActiveTab('accessories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'accessories'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Raw Materials & Trims ({accessoryStockMatrix.length})
          </button>

          <button
            onClick={() => setActiveTab('dispatch')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'dispatch'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-4 h-4" />
            Dispatch & Challans ({filteredDispatch.length})
          </button>

          <button
            onClick={() => setActiveTab('inward')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'inward'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Inward Receipts ({filteredInward.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search article, buyer, trims..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-full"
          />
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* TAB 1: FINISHED GOODS MATRIX */}
        {activeTab === 'finished' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Article No</th>
                  <th className="px-6 py-4 font-bold">Description</th>
                  <th className="px-6 py-4 font-bold text-right text-emerald-600">Total Inward (QC)</th>
                  <th className="px-6 py-4 font-bold text-right text-blue-600">Total Outward (Dispatch)</th>
                  <th className="px-6 py-4 font-bold text-right text-purple-600">Godown Balance</th>
                  <th className="px-6 py-4 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {finishedStockMatrix.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No finished stock matches your filters.
                    </td>
                  </tr>
                ) : (
                  finishedStockMatrix.map((row) => (
                    <tr key={row.art_no} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-extrabold text-blue-600">
                        {row.art_no}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {row.description}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-emerald-600 text-base">
                        +{row.totalInward.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-blue-600 text-base">
                        -{row.totalOutward.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-black ${
                          row.balance > 0 
                            ? 'bg-purple-100 text-purple-800' 
                            : row.balance === 0 
                              ? 'bg-slate-100 text-slate-700' 
                              : 'bg-rose-100 text-rose-800'
                        }`}>
                          {row.balance.toLocaleString()} pcs
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          row.balance > 0 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {row.balance > 0 ? 'In Stock âœ…' : 'Zero Stock â³'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: RAW MATERIALS & TRIMS (ACCESSORIES) */}
        {activeTab === 'accessories' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Item Name / Trim</th>
                  <th className="px-6 py-4 font-bold">Unit</th>
                  <th className="px-6 py-4 font-bold text-right text-emerald-600">Total Received (IN)</th>
                  <th className="px-6 py-4 font-bold text-right text-orange-600">Total Issued (OUT)</th>
                  <th className="px-6 py-4 font-bold text-right text-purple-600">Current Godown Balance</th>
                  <th className="px-6 py-4 font-bold text-center">Inventory Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {accessoryStockMatrix.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No raw material accessories logged yet.
                    </td>
                  </tr>
                ) : (
                  accessoryStockMatrix.map((row) => {
                    const isLow = row.balance < 10 && row.balance > 0
                    const isOut = row.balance <= 0

                    return (
                      <tr key={row.item_name} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 font-extrabold text-slate-900">
                          {row.item_name}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-semibold text-xs">
                          {row.unit}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-emerald-600 text-base">
                          +{row.totalIn.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-orange-600 text-base">
                          -{row.totalOut.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-black ${
                            isOut 
                              ? 'bg-rose-100 text-rose-800' 
                              : isLow 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {row.balance.toLocaleString()} {row.unit}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            isOut 
                              ? 'bg-rose-100 text-rose-800' 
                              : isLow 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isOut ? 'Out of Stock âŒ' : isLow ? 'Low Stock âš ï¸' : 'Available âœ…'}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: DISPATCH & DELIVERY CHALLANS */}
        {activeTab === 'dispatch' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Article No</th>
                  <th className="px-6 py-4 font-bold">Color / Size</th>
                  <th className="px-6 py-4 font-bold text-right text-blue-600">Dispatched Qty</th>
                  <th className="px-6 py-4 font-bold">Buyer / Customer</th>
                  <th className="px-6 py-4 font-bold">Challan / Vehicle No</th>
                  <th className="px-6 py-4 font-bold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredDispatch.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No dispatch transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredDispatch.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-600 whitespace-nowrap">
                        {row.entry_date || row.created_at.split('T')[0]}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-blue-600">
                        {row.article?.art_no || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {(row.color || row.size) ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">
                            {row.color} {row.size ? `(${row.size})` : ''}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-blue-600 text-base">
                        {row.quantity.toLocaleString()} pcs
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {row.party_name || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs font-semibold">
                        {row.challan_no ? `Challan: ${row.challan_no}` : ''} {row.transport_no ? `â€¢ ${row.transport_no}` : ''}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {row.notes || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: INWARD RECEIPTS */}
        {activeTab === 'inward' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Article No</th>
                  <th className="px-6 py-4 font-bold">Color / Size</th>
                  <th className="px-6 py-4 font-bold text-right text-emerald-600">Received Qty</th>
                  <th className="px-6 py-4 font-bold">Received From</th>
                  <th className="px-6 py-4 font-bold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredInward.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No inward transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredInward.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-600 whitespace-nowrap">
                        {row.entry_date || row.created_at.split('T')[0]}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-blue-600">
                        {row.article?.art_no || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {(row.color || row.size) ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">
                            {row.color} {row.size ? `(${row.size})` : ''}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-emerald-600 text-base">
                        +{row.quantity.toLocaleString()} pcs
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {row.party_name || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {row.notes || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: RECEIVE FINISHED GOODS INWARD                     */}
      {/* ======================================================== */}
      {showInwardModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Receive Inward (Finished Goods)
              </h3>
              <button onClick={() => setShowInwardModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={async (formData) => {
              formData.set('type', 'INWARD')
              startTransition(async () => {
                await addStoreTransaction(formData)
                setShowInwardModal(false)
              })
            }} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Article</label>
                <select name="article_id" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold">
                  {articles.map(art => (
                    <option key={art.id} value={art.id}>{art.art_no} ({art.description})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Color</label>
                  <input type="text" name="color" defaultValue="Navy Blue" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Size</label>
                  <input type="text" name="size" defaultValue="L" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantity (Pieces)</label>
                <input type="number" name="quantity" required placeholder="e.g. 150" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Received From</label>
                <input type="text" name="party_name" defaultValue="QC Finishing Floor" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Carton Ref</label>
                <input type="text" name="notes" placeholder="e.g. Master Carton #3" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors"
              >
                {isPending ? 'Saving...' : 'Save Inward to Stock'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: DISPATCH OUTWARD                                  */}
      {/* ======================================================== */}
      {showOutwardModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                Dispatch Outward (Delivery)
              </h3>
              <button onClick={() => setShowOutwardModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={async (formData) => {
              formData.set('type', 'OUTWARD')
              startTransition(async () => {
                await addStoreTransaction(formData)
                setShowOutwardModal(false)
              })
            }} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Article</label>
                <select name="article_id" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold">
                  {articles.map(art => (
                    <option key={art.id} value={art.id}>{art.art_no} ({art.description})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Color</label>
                  <input type="text" name="color" defaultValue="Navy Blue" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Size</label>
                  <input type="text" name="size" defaultValue="L" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dispatch Quantity (Pieces)</label>
                <input type="number" name="quantity" required placeholder="e.g. 100" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Buyer Name / Customer / PO #</label>
                <input type="text" name="party_name" required placeholder="e.g. Reliance Retail / Order #PO-882" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Challan No</label>
                  <input type="text" name="challan_no" placeholder="DC-104" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle / Transport</label>
                  <input type="text" name="transport_no" placeholder="MH-04-1234" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors"
              >
                {isPending ? 'Dispatching...' : 'Confirm Dispatch & Deduct Stock'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ACCESSORIES (RAW MATERIALS & TRIMS)               */}
      {/* ======================================================== */}
      {showAccessoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-600" />
                Raw Materials & Trims Movement
              </h3>
              <button onClick={() => setShowAccessoryModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={async (formData) => {
              startTransition(async () => {
                await addAccessoryTransaction(formData)
                setShowAccessoryModal(false)
              })
            }} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Movement Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center justify-center gap-2 p-2 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 font-bold text-xs">
                    <input type="radio" name="action" value="IN" defaultChecked />
                    ðŸ“¥ IN (Stock Received)
                  </label>
                  <label className="flex items-center justify-center gap-2 p-2 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 font-bold text-xs">
                    <input type="radio" name="action" value="OUT" />
                    ðŸ“¤ OUT (Issued to Line)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Name / Trim</label>
                <input type="text" name="item_name" required defaultValue="Sewing Thread (Navy Blue)" placeholder="e.g. Buttons 18L, Thread, Zipper" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
                  <input type="number" name="quantity" required placeholder="e.g. 24" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
                  <select name="unit" defaultValue="cones" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold">
                    <option value="cones">Cones</option>
                    <option value="pcs">Pcs</option>
                    <option value="gross">Gross</option>
                    <option value="meters">Meters</option>
                    <option value="packets">Packets</option>
                    <option value="rolls">Rolls</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supplier / Issued Line Ref</label>
                <input type="text" name="party_name" defaultValue="Supplier: Vardhman Threads" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes (Optional)</label>
                <input type="text" name="notes" placeholder="e.g. Batch #PO-882" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors"
              >
                {isPending ? 'Saving...' : 'Save Trim Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}