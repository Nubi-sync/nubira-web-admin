'use client'

import { useState, useMemo, useTransition } from 'react'
import Link from 'next/link'
import { 
  Truck, 
  Download, 
  Printer, 
  Search, 
  Plus, 
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Pin,
  Building2,
  Calendar,
  X,
  Trash2,
  Eye
} from 'lucide-react'
import { createDeliveryChallan, recordCountingAudit } from '../actions'

type Article = {
  id: string
  art_no: string
  description?: string | null
}

type ChallanItem = {
  id: string
  article_id: string
  color?: string | null
  size?: string | null
  quantity: number
  article?: Article | null
}

type DeliveryChallan = {
  id: string
  challan_no: string
  buyer_name: string
  destination?: string | null
  vehicle_no?: string | null
  driver_name?: string | null
  driver_phone?: string | null
  total_pieces: number
  delivery_date: string
  created_at: string
  status: string
  notes?: string | null
  challan_items?: ChallanItem[]
}

type CountingReport = {
  id: string
  article_id: string
  color?: string | null
  size?: string | null
  counted_qty: number
  expected_qty: number
  remarks?: string | null
  entry_date: string
  created_at: string
  article?: Article | null
}

interface DispatchClientProps {
  articles: Article[]
  deliveryChallans: DeliveryChallan[]
  countingReports: CountingReport[]
}

export function DispatchClient({
  articles,
  deliveryChallans,
  countingReports,
}: DispatchClientProps) {
  const [activeTab, setActiveTab] = useState<'challans' | 'counting'>('challans')
  const [searchTerm, setSearchTerm] = useState('')
  const [isPending, startTransition] = useTransition()

  // Modal States
  const [showCreateChallanModal, setShowCreateChallanModal] = useState(false)
  const [showCountingModal, setShowCountingModal] = useState(false)
  const [selectedChallanForPrint, setSelectedChallanForPrint] = useState<DeliveryChallan | null>(null)

  // Multi-row items state for Create Challan Modal
  const [challanRows, setChallanRows] = useState<Array<{
    article_id: string
    color: string
    size: string
    quantity: number
  }>>([
    {
      article_id: articles.length > 0 ? articles[0].id : '',
      color: 'Navy Blue',
      size: 'L',
      quantity: 200,
    }
  ])

  // 1. Filtered Challans
  const filteredChallans = useMemo(() => {
    return deliveryChallans.filter(ch => {
      if (!searchTerm) return true
      return (
        ch.challan_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ch.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ch.destination && ch.destination.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ch.vehicle_no && ch.vehicle_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ch.driver_name && ch.driver_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    })
  }, [deliveryChallans, searchTerm])

  // 2. Filtered Counting Audits
  const filteredCounting = useMemo(() => {
    return countingReports.filter(c => {
      if (!searchTerm) return true
      return (
        (c.article?.art_no && c.article.art_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.color && c.color.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.size && c.size.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.remarks && c.remarks.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    })
  }, [countingReports, searchTerm])

  // Overall KPIs
  const totalDeliveredPieces = deliveryChallans.reduce((sum, c) => sum + (c.total_pieces || 0), 0)
  const totalCountedPieces = countingReports.reduce((sum, c) => sum + (c.counted_qty || 0), 0)
  const totalDiscrepancies = countingReports.filter(c => c.expected_qty > 0 && c.counted_qty !== c.expected_qty).length

  // CSV Export Helper
  const handleExportCSV = () => {
    let headers: string[] = []
    let rows: (string | number)[][] = []
    const filename = `dispatch_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`

    if (activeTab === 'challans') {
      headers = ['Challan No', 'Date', 'Buyer Name', 'Destination', 'Vehicle No', 'Driver Name', 'Driver Phone', 'Total Pieces', 'Status']
      rows = filteredChallans.map(r => [
        r.challan_no,
        r.delivery_date,
        r.buyer_name,
        r.destination || '-',
        r.vehicle_no || '-',
        r.driver_name || '-',
        r.driver_phone || '-',
        r.total_pieces,
        r.status
      ])
    } else {
      headers = ['Date', 'Article No', 'Color', 'Size', 'Counted Qty', 'Expected Qty', 'Difference', 'Remarks']
      rows = filteredCounting.map(r => [
        r.entry_date,
        r.article?.art_no || '-',
        r.color || '-',
        r.size || '-',
        r.counted_qty,
        r.expected_qty,
        r.counted_qty - r.expected_qty,
        `"${(r.remarks || '').replace(/"/g, '""')}"`
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
              <Truck className="w-8 h-8 text-blue-600" />
              Dispatch & Logistics Hub
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 ml-11">
            Pre-loading physical counting, delivery challans, and truck transport management.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          <button 
            onClick={() => setShowCountingModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Pin className="w-3.5 h-3.5" />
            + Record Counting
          </button>
          <button 
            onClick={() => {
              setChallanRows([{
                article_id: articles.length > 0 ? articles[0].id : '',
                color: 'Navy Blue',
                size: 'L',
                quantity: 200,
              }])
              setShowCreateChallanModal(true)
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            + New Delivery Challan
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
          <div className="p-3 bg-blue-50 rounded-xl">
            <Truck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Dispatched</span>
            <span className="text-xl font-black text-slate-900">{totalDeliveredPieces.toLocaleString()} pcs</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl">
            <FileText className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Delivery Challans</span>
            <span className="text-xl font-black text-slate-900">{deliveryChallans.length} challans</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-xl">
            <Pin className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Counted Audits</span>
            <span className="text-xl font-black text-purple-600">{totalCountedPieces.toLocaleString()} pcs</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Discrepancies</span>
            <span className="text-xl font-black text-rose-600">{totalDiscrepancies} alerts</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('challans')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'challans'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            Delivery Challans Master ({filteredChallans.length})
          </button>

          <button
            onClick={() => setActiveTab('counting')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'counting'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Pin className="w-4 h-4" />
            Pre-Loading Counting Audits ({filteredCounting.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search challan, buyer, vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full"
          />
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* TAB 1: DELIVERY CHALLANS MASTER REGISTER */}
        {activeTab === 'challans' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Challan No</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Buyer / Consignee</th>
                  <th className="px-6 py-4 font-bold">Destination</th>
                  <th className="px-6 py-4 font-bold">Transporter (Vehicle / Driver)</th>
                  <th className="px-6 py-4 font-bold text-right text-blue-600">Total Pieces</th>
                  <th className="px-6 py-4 font-bold text-center">Status</th>
                  <th className="px-6 py-4 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredChallans.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      No delivery challans found. Tap "+ New Delivery Challan" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredChallans.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-black text-blue-600 whitespace-nowrap">
                        #{row.challan_no}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-semibold whitespace-nowrap text-xs">
                        {row.delivery_date}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-slate-900">
                        {row.buyer_name}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs font-semibold">
                        {row.destination || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-700 text-xs">
                        <div className="font-bold text-slate-800">{row.vehicle_no || '-'}</div>
                        <div className="text-slate-500">{row.driver_name} {row.driver_phone ? `(${row.driver_phone})` : ''}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-blue-600 text-base whitespace-nowrap">
                        {row.total_pieces.toLocaleString()} pcs
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          Dispatched ðŸšš
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedChallanForPrint(row)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View / Print
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: PRE-LOADING COUNTING AUDITS */}
        {activeTab === 'counting' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Article No</th>
                  <th className="px-6 py-4 font-bold">Color / Size</th>
                  <th className="px-6 py-4 font-bold text-right text-purple-600">Counted Qty</th>
                  <th className="px-6 py-4 font-bold text-right text-slate-500">Expected Qty</th>
                  <th className="px-6 py-4 font-bold text-center">Audit Result</th>
                  <th className="px-6 py-4 font-bold">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredCounting.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No pre-loading counting audits recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredCounting.map((row) => {
                    const finalDiff = row.counted_qty - (row.expected_qty || 0)
                    const isMismatch = row.expected_qty > 0 && finalDiff !== 0

                    return (
                      <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-600 whitespace-nowrap text-xs">
                          {row.entry_date}
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
                        <td className="px-6 py-4 text-right font-black text-purple-700 text-base">
                          {row.counted_qty.toLocaleString()} pcs
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-600 text-sm">
                          {row.expected_qty.toLocaleString()} pcs
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            finalDiff === 0 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : finalDiff < 0 
                                ? 'bg-rose-100 text-rose-800 font-extrabold' 
                                : 'bg-amber-100 text-amber-800 font-extrabold'
                          }`}>
                            {finalDiff === 0 ? 'Exact Match âœ…' : `${finalDiff > 0 ? "+" : ""}${finalDiff} pcs ${finalDiff < 0 ? "Shortage âš ï¸" : "Surplus ðŸ“¦"}`}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {row.remarks || '-'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: CREATE DELIVERY CHALLAN                          */}
      {/* ======================================================== */}
      {showCreateChallanModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                Generate Delivery Challan
              </h3>
              <button onClick={() => setShowCreateChallanModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={async (formData) => {
              formData.set('items_json', JSON.stringify(challanRows))
              startTransition(async () => {
                await createDeliveryChallan(formData)
                setShowCreateChallanModal(false)
              })
            }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Challan No</label>
                  <input type="text" name="challan_no" defaultValue={`CH-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-blue-600" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Buyer / Consignee</label>
                  <input type="text" name="buyer_name" required defaultValue="Reliance Retail Pvt Ltd" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Destination Address / Hub</label>
                <input type="text" name="destination" defaultValue="Mumbai Central Hub" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </div>

              {/* Multi-Row Items */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">Challan Items (Articles & Sizes)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setChallanRows([...challanRows, {
                        article_id: articles.length > 0 ? articles[0].id : '',
                        color: 'Black',
                        size: 'M',
                        quantity: 100,
                      }])
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {challanRows.map((row, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">Item #{idx + 1}</span>
                        {challanRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setChallanRows(challanRows.filter((_, i) => i !== idx))
                            }}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-5">
                          <select
                            value={row.article_id}
                            onChange={(e) => {
                              const next = [...challanRows]
                              next[idx].article_id = e.target.value
                              setChallanRows(next)
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                          >
                            {articles.map(art => (
                              <option key={art.id} value={art.id}>{art.art_no}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-3">
                          <input
                            type="text"
                            placeholder="Color"
                            value={row.color}
                            onChange={(e) => {
                              const next = [...challanRows]
                              next[idx].color = e.target.value
                              setChallanRows(next)
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            placeholder="Size"
                            value={row.size}
                            onChange={(e) => {
                              const next = [...challanRows]
                              next[idx].size = e.target.value
                              setChallanRows(next)
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            placeholder="Qty"
                            value={row.quantity}
                            onChange={(e) => {
                              const next = [...challanRows]
                              next[idx].quantity = parseInt(e.target.value) || 0
                              setChallanRows(next)
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-blue-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-2 p-3 bg-blue-50 rounded-xl flex items-center justify-between text-xs font-bold text-blue-900">
                  <span>Total Consignment Quantity:</span>
                  <span className="text-sm font-black text-blue-700">
                    {challanRows.reduce((sum, r) => sum + (r.quantity || 0), 0)} Pieces
                  </span>
                </div>
              </div>

              {/* Transporter Details */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle No</label>
                  <input type="text" name="vehicle_no" defaultValue="MH-04-1234" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Driver Name</label>
                  <input type="text" name="driver_name" defaultValue="Ramesh Kumar" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Driver Phone</label>
                  <input type="text" name="driver_phone" defaultValue="+91 98765 43210" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors mt-2"
              >
                {isPending ? 'Generating...' : 'Generate Official Challan & Record Dispatch'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: RECORD PRE-LOADING COUNTING                      */}
      {/* ======================================================== */}
      {showCountingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Pin className="w-5 h-5 text-blue-600" />
                Pre-Loading Counting Tally
              </h3>
              <button onClick={() => setShowCountingModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={async (formData) => {
              startTransition(async () => {
                await recordCountingAudit(formData)
                setShowCountingModal(false)
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expected Qty</label>
                  <input type="number" name="expected_qty" defaultValue={200} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Physical Counted Qty</label>
                  <input type="number" name="counted_qty" required placeholder="e.g. 200" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-blue-600" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Remarks / Discrepancy Note</label>
                <input type="text" name="remarks" placeholder="e.g. Verified and loaded onto truck" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors"
              >
                {isPending ? 'Recording...' : 'Save Counting Verification'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: FULL A4 PRINTABLE DELIVERY CHALLAN SLIP          */}
      {/* ======================================================== */}
      {selectedChallanForPrint && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header with Print / Close */}
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-black text-slate-900">Official Delivery Document</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print A4 Challan
                </button>
                <button onClick={() => setSelectedChallanForPrint(null)} className="text-slate-400 hover:text-slate-700 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Box */}
            <div className="border-2 border-slate-900 p-6 rounded-2xl space-y-6 text-slate-900 bg-white">
              {/* Factory Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <h2 className="text-2xl font-black tracking-wider">NUBIRA CREATION GARMENTS</h2>
                <p className="text-xs text-slate-600">Apparel Manufacturing & Export Division â€¢ GSTIN: 27AABCN1234F1Z5</p>
                <div className="mt-2 inline-block px-4 py-1 bg-slate-900 text-white font-bold text-xs rounded-full uppercase tracking-widest">
                  DELIVERY CHALLAN & GATE PASS
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-bold text-slate-500 uppercase">Consignee (Buyer):</div>
                  <div className="font-black text-sm text-slate-900 mt-0.5">{selectedChallanForPrint.buyer_name}</div>
                  <div className="text-slate-600">{selectedChallanForPrint.destination || 'Destination as per PO'}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-500 uppercase">Challan Details:</div>
                  <div className="font-black text-sm text-blue-600 mt-0.5">#{selectedChallanForPrint.challan_no}</div>
                  <div className="text-slate-600">Date: {selectedChallanForPrint.delivery_date}</div>
                </div>
              </div>

              {/* Transporter Grid */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 text-xs">
                <div>
                  <span className="font-bold text-slate-500">Vehicle No: </span>
                  <span className="font-black text-slate-900">{selectedChallanForPrint.vehicle_no || '-'}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-500">Driver: </span>
                  <span className="font-bold text-slate-900">{selectedChallanForPrint.driver_name || '-'} {selectedChallanForPrint.driver_phone ? `(${selectedChallanForPrint.driver_phone})` : ''}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-900 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-900 font-black">
                      <th className="p-2.5 border-r border-slate-900">#</th>
                      <th className="p-2.5 border-r border-slate-900">Article No</th>
                      <th className="p-2.5 border-r border-slate-900">Description</th>
                      <th className="p-2.5 border-r border-slate-900">Color / Size</th>
                      <th className="p-2.5 text-right">Quantity (Pcs)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(selectedChallanForPrint.challan_items || []).map((it, idx) => (
                      <tr key={it.id || idx}>
                        <td className="p-2.5 border-r border-slate-200 font-bold">{idx + 1}</td>
                        <td className="p-2.5 border-r border-slate-200 font-extrabold">{it.article?.art_no || '-'}</td>
                        <td className="p-2.5 border-r border-slate-200 text-slate-600">{it.article?.description || '-'}</td>
                        <td className="p-2.5 border-r border-slate-200">{it.color || ''} {it.size ? `(${it.size})` : ''}</td>
                        <td className="p-2.5 text-right font-black text-sm">{it.quantity.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 border-t-2 border-slate-900 font-black text-sm">
                      <td colSpan={4} className="p-2.5 text-right border-r border-slate-900">TOTAL CONSIGNMENT QUANTITY:</td>
                      <td className="p-2.5 text-right text-blue-600 font-black">{selectedChallanForPrint.total_pieces.toLocaleString()} Pieces</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
                <div className="border-t border-slate-400 pt-2 font-bold text-slate-700">
                  Authorized Dispatch Incharge
                </div>
                <div className="border-t border-slate-400 pt-2 font-bold text-slate-700">
                  Receiver / Transporter Signature
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}