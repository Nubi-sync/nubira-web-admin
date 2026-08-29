'use client'

import { useState, useMemo, useTransition, useRef } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Layers,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Eye,
  Filter,
  Download,
  Printer,
  Trash2,
  ArrowUpDown,
  Tag,
  AlertTriangle,
  Sparkles,
  X,
  ExternalLink,
  ChevronDown,
  Upload,
  Image as ImageIcon,
  Palette
} from 'lucide-react'
import {
  ProductionOrderPayload,
  SizeMatrixRow,
  createProductionOrder,
  updateOrderStatus,
  deleteProductionOrder
} from '../actions'

const DEFAULT_FABRICS = [
  'PRINTED SINKER',
  'LY 2FD',
  'LY SINKER',
  'P.K LY KULTY',
  '28 SINKER',
  'HEAVY FLEECE',
  'COTTON CANDY KNIT',
  'SINGLE JERSEY',
  'TERRY COTTON'
]

const DEFAULT_BRANDS = [
  'OLLYPOP',
  'LAZY BONES',
  'CANDY POP',
  'NUBIRA IN-HOUSE',
  'CHERRY POP'
]

interface ProductionOrdersClientProps {
  initialOrders: any[]
  articlesList: any[]
}

export function ProductionOrdersClient({
  initialOrders = [],
  articlesList = []
}: ProductionOrdersClientProps) {
  const [isPending, startTransition] = useTransition()
  const [orders, setOrders] = useState<any[]>(initialOrders || [])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedDate, setSelectedDate] = useState('ALL')

  // Modals
  const [showNewOrderModal, setShowNewOrderModal] = useState(false)
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)
  const [previewTitle, setPreviewTitle] = useState('')

  // Form State
  const todayStr = new Date().toISOString().split('T')[0]
  const [formDeliveryDate, setFormDeliveryDate] = useState(todayStr)
  const [formArtNo, setFormArtNo] = useState('')
  const [formSubArtNo, setFormSubArtNo] = useState('')
  const [formPictureUrl, setFormPictureUrl] = useState('')
  const [imageUploadType, setImageUploadType] = useState<'FILE' | 'URL'>('FILE')
  const [formMtCode, setFormMtCode] = useState('')
  const [formFabric, setFormFabric] = useState('PRINTED SINKER')
  const [formPatternNo, setFormPatternNo] = useState('')
  const [formDescription, setFormDescription] = useState('')
  
  // Multi-Color State
  const [formBodyColors, setFormBodyColors] = useState<string[]>(['Blue Printed'])
  const [formPantColors, setFormPantColors] = useState<string[]>(['Blue Printed'])
  const [newBodyColorInput, setNewBodyColorInput] = useState('')
  const [newPantColorInput, setNewPantColorInput] = useState('')
  
  const [formBrand, setFormBrand] = useState('OLLYPOP')
  const [formRibStatus, setFormRibStatus] = useState('PENDING')
  const [formNotes, setFormNotes] = useState('')

  const [formSizeMatrix, setFormSizeMatrix] = useState<SizeMatrixRow[]>([
    { size: '16X20', sets: 100, ratio: 3, pcs: 300 },
    { size: '22X26', sets: 100, ratio: 3, pcs: 300 }
  ])

  // Handle local image file upload (convert to Base64 data URL)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB. Please choose a smaller image.')
        return
      }
      const reader = new FileReader()
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string
        setFormPictureUrl(result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Multi-Color Add/Remove handlers
  const handleAddBodyColor = () => {
    if (newBodyColorInput.trim()) {
      const parts = newBodyColorInput.split(',').map(s => s.trim()).filter(Boolean)
      setFormBodyColors(prev => [...prev, ...parts])
      setNewBodyColorInput('')
    }
  }

  const handleRemoveBodyColor = (idx: number) => {
    setFormBodyColors(prev => prev.filter((_, i) => i !== idx))
  }

  const handleAddPantColor = () => {
    if (newPantColorInput.trim()) {
      const parts = newPantColorInput.split(',').map(s => s.trim()).filter(Boolean)
      setFormPantColors(prev => [...prev, ...parts])
      setNewPantColorInput('')
    }
  }

  const handleRemovePantColor = (idx: number) => {
    setFormPantColors(prev => prev.filter((_, i) => i !== idx))
  }

  // Auto-fill when Art No changes
  const handleArtNoSelect = (artNoValue: string) => {
    setFormArtNo(artNoValue)
    const existing = articlesList.find(a => a.art_no?.toUpperCase() === artNoValue.trim().toUpperCase())
    if (existing) {
      if (existing.description) setFormDescription(existing.description)
      const meta = existing.size_rates?._meta
      if (meta) {
        if (meta.fabric) setFormFabric(meta.fabric)
        if (meta.pattern) setFormPatternNo(meta.pattern)
        if (meta.party) setFormBrand(meta.party)
        if (meta.picture_url) setFormPictureUrl(meta.picture_url)
        if (meta.mt_code) setFormMtCode(meta.mt_code)
      }
    }
  }

  const handleAddSizeRow = () => {
    setFormSizeMatrix(prev => [...prev, { size: 'Free Size', sets: 50, ratio: 3, pcs: 150 }])
  }

  const handleRemoveSizeRow = (index: number) => {
    setFormSizeMatrix(prev => prev.filter((_, i) => i !== index))
  }

  const handleSizeRowChange = (index: number, field: keyof SizeMatrixRow, value: any) => {
    setFormSizeMatrix(prev => {
      const copy = [...prev]
      const current = { ...copy[index] }
      
      if (field === 'sets') {
        const setsVal = parseInt(value, 10) || 0
        current.sets = setsVal
        current.pcs = setsVal * (current.ratio || 3)
      } else if (field === 'ratio') {
        const ratioVal = parseInt(value, 10) || 1
        current.ratio = ratioVal
        current.pcs = (current.sets || 0) * ratioVal
      } else if (field === 'pcs') {
        current.pcs = parseInt(value, 10) || 0
      } else {
        (current as any)[field] = value
      }

      copy[index] = current
      return copy
    })
  }

  const formTotalSets = useMemo(() => {
    return formSizeMatrix.reduce((acc, row) => acc + (Number(row.sets) || 0), 0)
  }, [formSizeMatrix])

  const formTotalPcs = useMemo(() => {
    return formSizeMatrix.reduce((acc, row) => acc + (Number(row.pcs) || 0), 0)
  }, [formSizeMatrix])

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch =
        searchQuery === '' ||
        o.art_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.sub_art_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.mt_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.pattern_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.brand?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchBrand = selectedBrand === 'ALL' || o.brand?.toUpperCase() === selectedBrand.toUpperCase()
      const matchStatus = selectedStatus === 'ALL' || o.status === selectedStatus
      const matchDate = selectedDate === 'ALL' || o.delivery_date === selectedDate

      return matchSearch && matchBrand && matchStatus && matchDate
    })
  }, [orders, searchQuery, selectedBrand, selectedStatus, selectedDate])

  // Summary Metrics
  const summary = useMemo(() => {
    let totalSets = 0
    let totalPcs = 0
    let inProd = 0
    let readyQc = 0
    let dispatched = 0
    let pending = 0

    orders.forEach(o => {
      const sets = o.size_matrix?.reduce((acc: number, r: any) => acc + (Number(r.sets) || 0), 0) || o.total_sets || 0
      const pcs = o.size_matrix?.reduce((acc: number, r: any) => acc + (Number(r.pcs) || 0), 0) || o.total_pcs || 0
      totalSets += sets
      totalPcs += pcs

      if (o.status === 'IN_PRODUCTION') inProd++
      else if (o.status === 'QC_PASSED') readyQc++
      else if (o.status === 'DISPATCHED') dispatched++
      else pending++
    })

    return {
      totalOrders: orders.length,
      totalSets,
      totalPcs,
      inProd,
      readyQc,
      dispatched,
      pending
    }
  }, [orders])

  // Unique Dates for Date Filter
  const dateOptions = useMemo(() => {
    const dates = new Set<string>()
    orders.forEach(o => {
      if (o.delivery_date) dates.add(o.delivery_date)
    })
    return Array.from(dates).sort()
  }, [orders])

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formArtNo || !formMtCode) {
      alert('Please fill in Article Number and Production/MT Lot Number.')
      return
    }

    const bodyColorsStr = formBodyColors.join(' / ')
    const pantColorsStr = formPantColors.length > 0 ? formPantColors.join(' / ') : bodyColorsStr

    const newOrderPayload: ProductionOrderPayload = {
      delivery_date: formDeliveryDate,
      art_no: formArtNo.trim().toUpperCase(),
      sub_art_no: formSubArtNo.trim().toUpperCase(),
      picture_url: formPictureUrl.trim(),
      mt_code: formMtCode.trim().toUpperCase(),
      fabric: formFabric,
      pattern_no: formPatternNo.trim().toUpperCase(),
      description: formDescription.trim(),
      body_color: bodyColorsStr,
      pant_color: pantColorsStr,
      brand: formBrand.trim().toUpperCase(),
      rib_status: formRibStatus,
      notes: formNotes.trim(),
      size_matrix: formSizeMatrix,
      status: 'IN_PRODUCTION'
    }

    startTransition(async () => {
      const res = await createProductionOrder(newOrderPayload)
      if (res?.error) {
        alert(res.error)
      } else {
        setOrders(prev => [
          {
            ...newOrderPayload,
            id: 'temp-' + Date.now(),
            total_sets: formTotalSets,
            total_pcs: formTotalPcs
          },
          ...prev
        ])
        setShowNewOrderModal(false)
        // Reset form
        setFormArtNo('')
        setFormSubArtNo('')
        setFormPatternNo('')
        setFormDescription('')
        setFormBodyColors(['Blue Printed'])
        setFormPantColors(['Blue Printed'])
        setFormPictureUrl('')
        setFormMtCode('')
      }
    })
  }

  const handleStatusChange = (orderId: string, newStatus: string) => {
    startTransition(async () => {
      await updateOrderStatus(orderId, newStatus)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    })
  }

  const handleDeleteOrder = (orderId: string) => {
    if (!confirm('Are you sure you want to delete this production order?')) return
    startTransition(async () => {
      await deleteProductionOrder(orderId)
      setOrders(prev => prev.filter(o => o.id !== orderId))
    })
  }

  const handleExportCSV = () => {
    const headers = ['Delivery Date', 'Art No', 'Sub Art', 'MT Lot', 'Fabric', 'Pattern', 'Description', 'Body Color', 'Pant Color', 'Brand', 'Sets', 'Pieces', 'Status']
    const rows = filteredOrders.map(o => [
      o.delivery_date,
      o.art_no,
      o.sub_art_no || '-',
      o.mt_code,
      o.fabric,
      o.pattern_no,
      `"${o.description?.replace(/"/g, '""') || ''}"`,
      `"${o.body_color || ''}"`,
      `"${o.pant_color || ''}"`,
      o.brand,
      o.size_matrix?.reduce((acc: number, r: any) => acc + (Number(r.sets) || 0), 0) || o.total_sets || 0,
      o.size_matrix?.reduce((acc: number, r: any) => acc + (Number(r.pcs) || 0), 0) || o.total_pcs || 0,
      o.status
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Nubira_Production_Chart_${todayStr}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">

      {/* ========================================================= */}
      {/* 1. TOP HEADER & ACTION BUTTONS                            */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--ink, #1C2733)' }}>
              Digital Production Planning Chart
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
              FACTORY LIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Exact cutting, lot order matrix & floor tracking matching factory challan sheet
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border bg-white shadow-2xs hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Excel/CSV</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border bg-white shadow-2xs hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Sheet</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewOrderModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 flex items-center gap-2 transition-all cursor-pointer"
            style={{ backgroundColor: 'var(--steel, #2B4C7E)' }}
          >
            <Plus className="w-4 h-4" />
            <span>+ New Production Order</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. KPI SUMMARY STRIP (Total Orders, Sets, Pieces)        */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-3.5 bg-white border rounded-[11px] shadow-2xs" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
          <p className="text-xl font-bold text-slate-800 mt-1">{summary.totalOrders}</p>
          <span className="text-[10px] font-semibold text-slate-400">Active Job Sheets</span>
        </div>

        <div className="p-3.5 bg-white border rounded-[11px] shadow-2xs" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Sets</span>
          <p className="text-xl font-bold text-[#2563EB] mt-1">{summary.totalSets.toLocaleString()}</p>
          <span className="text-[10px] font-semibold text-[#3B82F6]">Bundle Units</span>
        </div>

        <div className="p-3.5 bg-white border rounded-[11px] shadow-2xs" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Pieces</span>
          <p className="text-xl font-bold text-[#059669] mt-1">{summary.totalPcs.toLocaleString()}</p>
          <span className="text-[10px] font-semibold text-[#10B981]">Garment Pieces</span>
        </div>

        <div className="p-3.5 bg-white border rounded-[11px] shadow-2xs" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Production</span>
          <p className="text-xl font-bold text-[#D97706] mt-1">{summary.inProd}</p>
          <span className="text-[10px] font-semibold text-[#F59E0B]">On Sewing Lines</span>
        </div>

        <div className="p-3.5 bg-white border rounded-[11px] shadow-2xs" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ready in Store</span>
          <p className="text-xl font-bold text-[#16A34A] mt-1">{summary.readyQc}</p>
          <span className="text-[10px] font-semibold text-[#22C55E]">QC Passed</span>
        </div>

        <div className="p-3.5 bg-white border rounded-[11px] shadow-2xs" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dispatched</span>
          <p className="text-xl font-bold text-[#4F46E5] mt-1">{summary.dispatched}</p>
          <span className="text-[10px] font-semibold text-[#6366F1]">Gate Pass Done</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. SMART FILTERS BAR                                     */}
      {/* ========================================================= */}
      <div className="p-3.5 bg-white border rounded-[12px] shadow-2xs flex items-center justify-between gap-3 flex-wrap" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
        <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Art No, MT Lot, Pattern, Brand..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[var(--steel,#2B4C7E)]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Brand Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium">Brand:</span>
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none"
            >
              <option value="ALL">All Brands</option>
              {DEFAULT_BRANDS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Delivery Date Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium">Delivery:</span>
            <select
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none"
            >
              <option value="ALL">All Dates</option>
              {dateOptions.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PRODUCTION">In Production</option>
              <option value="QC_PASSED">Ready (QC Passed)</option>
              <option value="DISPATCHED">Dispatched</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. THE MASTER PRODUCTION CHART TABLE (EXACT PAPER REPLICA)*/}
      {/* ========================================================= */}
      <div className="bg-white border rounded-[12px] shadow-2xs overflow-hidden" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-100/80 border-b text-[11px] font-bold uppercase tracking-wider text-slate-600 select-none" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
                <th className="py-3 px-3 w-[100px]">Delivery</th>
                <th className="py-3 px-3 w-[110px]">Art No</th>
                <th className="py-3 px-2 w-[60px] text-center">Photo</th>
                <th className="py-3 px-3 w-[95px]">Prodn No</th>
                <th className="py-3 px-3 w-[120px]">Fabric</th>
                <th className="py-3 px-3 w-[110px]">Pattern</th>
                <th className="py-3 px-3 min-w-[180px]">Description</th>
                <th className="py-3 px-3 min-w-[170px]">Colors Assortment</th>
                <th className="py-3 px-3 w-[120px]">Size & Sets</th>
                <th className="py-3 px-3 w-[80px] text-right">Pcs</th>
                <th className="py-3 px-3 w-[90px]">Brand</th>
                <th className="py-3 px-3 w-[110px]">Status</th>
                <th className="py-3 px-2 w-[50px] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y text-[12.5px] font-medium" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-14 text-center text-slate-400">
                    <Layers className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-700">No Production Orders Recorded Yet</p>
                    <p className="text-xs text-slate-400 mt-1 mb-4">Click "+ New Production Order" to add your first factory job sheet</p>
                    <button
                      type="button"
                      onClick={() => setShowNewOrderModal(true)}
                      className="px-4 py-2 bg-[var(--steel,#2B4C7E)] text-white text-xs font-bold rounded-xl shadow-xs hover:opacity-95 cursor-pointer"
                    >
                      + Add Production Order
                    </button>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, idx) => {
                  const totalSets = order.size_matrix?.reduce((acc: number, r: any) => acc + (Number(r.sets) || 0), 0) || order.total_sets || 0
                  const totalPcs = order.size_matrix?.reduce((acc: number, r: any) => acc + (Number(r.pcs) || 0), 0) || order.total_pcs || 0

                  return (
                    <tr
                      key={order.id || idx}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* 1. Delivery Date */}
                      <td className="py-3 px-3 font-semibold text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{order.delivery_date || '-'}</span>
                        </div>
                      </td>

                      {/* 2. Art No + Sub Art */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 leading-tight">
                          {order.art_no}
                        </div>
                        {order.sub_art_no && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            {order.sub_art_no}
                          </span>
                        )}
                      </td>

                      {/* 3. Photo Thumbnail */}
                      <td className="py-3 px-2 text-center">
                        {order.picture_url ? (
                          <div
                            onClick={() => {
                              setPreviewPhoto(order.picture_url)
                              setPreviewTitle(`${order.art_no} - ${order.description || ''}`)
                            }}
                            className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shadow-2xs mx-auto cursor-pointer relative group/thumb hover:ring-2 hover:ring-[var(--steel,#2B4C7E)] transition-all bg-slate-100"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={order.picture_url}
                              alt={order.art_no}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
                            <Tag className="w-4 h-4" />
                          </div>
                        )}
                      </td>

                      {/* 4. Prodn No / MT Lot */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {order.mt_code || 'MT-1001'}
                        </span>
                      </td>

                      {/* 5. Fabric */}
                      <td className="py-3 px-3">
                        <span className="text-xs font-semibold text-slate-700">
                          {order.fabric || '-'}
                        </span>
                      </td>

                      {/* 6. Pattern No */}
                      <td className="py-3 px-3 font-mono text-xs font-bold text-indigo-700">
                        {order.pattern_no || '-'}
                      </td>

                      {/* 7. Description */}
                      <td className="py-3 px-3">
                        <p className="text-xs text-slate-800 leading-snug line-clamp-2" title={order.description}>
                          {order.description || '-'}
                        </p>
                      </td>

                      {/* 8. Body / Pant Color (Supports Multi-Colors) */}
                      <td className="py-3 px-3 text-xs leading-snug">
                        <div className="flex flex-wrap gap-1 items-center">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Body:</span>
                          <span className="font-semibold text-slate-800">{order.body_color || '-'}</span>
                        </div>
                        {order.pant_color && order.pant_color !== order.body_color && (
                          <div className="flex flex-wrap gap-1 items-center mt-1 pt-1 border-t border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Pant:</span>
                            <span className="font-medium text-slate-600">{order.pant_color}</span>
                          </div>
                        )}
                      </td>

                      {/* 9. Size & Sets */}
                      <td className="py-3 px-3 text-xs">
                        {order.size_matrix && order.size_matrix.length > 0 ? (
                          <div className="space-y-1 min-w-[130px]">
                            {order.size_matrix.map((s: any, sIdx: number) => (
                              <div key={sIdx} className="flex items-center justify-between text-xs bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                <span className="font-bold text-slate-700">{s.size}:</span>
                                <span className="font-semibold text-[#2563EB]">{s.sets} sets</span>
                              </div>
                            ))}
                            <div className="pt-0.5 border-t border-slate-200 text-[10px] font-bold text-slate-500">
                              Total: {totalSets} Sets
                            </div>
                          </div>
                        ) : (
                          <span className="font-semibold text-slate-600">{totalSets} Sets</span>
                        )}
                      </td>

                      {/* 10. Total Pieces */}
                      <td className="py-3 px-3 font-mono font-bold text-right text-xs text-[#059669]">
                        {totalPcs.toLocaleString()}
                      </td>

                      {/* 11. Brand */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {order.brand || 'OLLYPOP'}
                        </span>
                      </td>

                      {/* 12. Status Switcher */}
                      <td className="py-3 px-3">
                        <select
                          value={order.status || 'IN_PRODUCTION'}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                          className={`text-[11px] font-bold rounded-lg px-2 py-1 border cursor-pointer focus:outline-none ${
                            order.status === 'QC_PASSED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : order.status === 'DISPATCHED'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                              : order.status === 'IN_PRODUCTION'
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : 'bg-slate-50 text-slate-600 border-slate-300'
                          }`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="IN_PRODUCTION">IN PRODUCTION</option>
                          <option value="QC_PASSED">QC PASSED</option>
                          <option value="DISPATCHED">DISPATCHED</option>
                        </select>
                      </td>

                      {/* 13. Delete Action */}
                      <td className="py-3 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* ========================================================= */}
      {/* 5. MODAL: NEW PRODUCTION ORDER CREATION (MULTI-COLOR & UPLOAD)*/}
      {/* ========================================================= */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* Sticky Header */}
            <div className="p-4 sm:p-5 border-b flex items-center justify-between bg-slate-50 shrink-0" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--steel-mist,#EEF3FA)] text-[var(--steel,#2B4C7E)]">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Create New Production Order / Challan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enter factory lot matrix directly from client job sheet
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewOrderModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateOrder} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
                
                {/* Row 1: Delivery Date & Prodn/MT No */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Delivery Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formDeliveryDate}
                      onChange={e => setFormDeliveryDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-[var(--steel,#2B4C7E)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Production Lot / MT No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MT-1025"
                      value={formMtCode}
                      onChange={e => setFormMtCode(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-[var(--steel,#2B4C7E)] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Row 2: Brand & Fabric Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Brand / Party <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      list="brand-suggestions"
                      placeholder="e.g. OLLYPOP"
                      value={formBrand}
                      onChange={e => setFormBrand(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-[var(--steel,#2B4C7E)] focus:outline-none"
                    />
                    <datalist id="brand-suggestions">
                      {DEFAULT_BRANDS.map(b => (
                        <option key={b} value={b} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Fabric Type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      list="fabric-suggestions"
                      placeholder="e.g. PRINTED SINKER"
                      value={formFabric}
                      onChange={e => setFormFabric(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-[var(--steel,#2B4C7E)] focus:outline-none"
                    />
                    <datalist id="fabric-suggestions">
                      {DEFAULT_FABRICS.map(f => (
                        <option key={f} value={f} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Row 3: Art No, Sub-Art & Pattern No */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Art No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 8941"
                      value={formArtNo}
                      onChange={e => handleArtNoSelect(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-1 focus:ring-[var(--steel,#2B4C7E)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Sub-Variant (if any)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 8941A"
                      value={formSubArtNo}
                      onChange={e => setFormSubArtNo(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-[var(--steel,#2B4C7E)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Pattern Master Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. LB-816 / G-342"
                      value={formPatternNo}
                      onChange={e => setFormPatternNo(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-[var(--steel,#2B4C7E)] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Row 4: Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Product Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GIRLS FULL SLEEVE FRONT OPEN PEEPING NIGHT SUIT"
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-[var(--steel,#2B4C7E)] focus:outline-none"
                  />
                </div>

                {/* Row 5: MULTI-COLOR MANAGEMENT (BODY & PANT COLORS) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl">
                  
                  {/* Body Colors */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-indigo-600" />
                        Body Colors / Assortment
                      </label>
                      <span className="text-[10.5px] text-slate-400 font-semibold">
                        {formBodyColors.length} color{formBodyColors.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Color Chips */}
                    <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-white border border-slate-200 rounded-xl">
                      {formBodyColors.map((color, cIdx) => (
                        <span
                          key={cIdx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 animate-in fade-in"
                        >
                          <span>{color}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBodyColor(cIdx)}
                            className="text-indigo-400 hover:text-indigo-700 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add Color Input */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Type color (e.g. Deep Mustard) & press Enter"
                        value={newBodyColorInput}
                        onChange={e => setNewBodyColorInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddBodyColor()
                          }
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[var(--steel,#2B4C7E)]"
                      />
                      <button
                        type="button"
                        onClick={handleAddBodyColor}
                        className="px-3 py-1.5 bg-[var(--steel,#2B4C7E)] text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  {/* Pant Colors */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-emerald-600" />
                        Pant / Bottom Colors
                      </label>
                      <span className="text-[10.5px] text-slate-400 font-semibold">
                        {formPantColors.length} color{formPantColors.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Pant Color Chips */}
                    <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-white border border-slate-200 rounded-xl">
                      {formPantColors.map((color, cIdx) => (
                        <span
                          key={cIdx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-in fade-in"
                        >
                          <span>{color}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePantColor(cIdx)}
                            className="text-emerald-400 hover:text-emerald-700 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add Pant Color Input */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Type pant color & press Enter"
                        value={newPantColorInput}
                        onChange={e => setNewPantColorInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddPantColor()
                          }
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[var(--steel,#2B4C7E)]"
                      />
                      <button
                        type="button"
                        onClick={handleAddPantColor}
                        className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                </div>

                {/* Row 6: PHOTO UPLOAD (FILE UPLOAD OR URL) */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                      Product Sample Photo
                    </label>

                    {/* Switcher Tab */}
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setImageUploadType('FILE')}
                        className={`px-2.5 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                          imageUploadType === 'FILE'
                            ? 'bg-[var(--steel,#2B4C7E)] text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        📁 File Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUploadType('URL')}
                        className={`px-2.5 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                          imageUploadType === 'URL'
                            ? 'bg-[var(--steel,#2B4C7E)] text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        🔗 Image Link
                      </button>
                    </div>
                  </div>

                  {imageUploadType === 'FILE' ? (
                    <div>
                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />

                      {formPictureUrl ? (
                        <div className="flex items-center gap-3 p-2.5 bg-white border border-slate-200 rounded-xl">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={formPictureUrl}
                            alt="Preview"
                            className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              Sample photo uploaded successfully
                            </p>
                            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Ready for floor specification
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormPictureUrl('')
                              if (fileInputRef.current) fileInputRef.current.value = ''
                            }}
                            className="px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer border border-red-200"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-300 hover:border-[var(--steel,#2B4C7E)] bg-white rounded-xl p-5 text-center cursor-pointer transition-colors group"
                        >
                          <Upload className="w-6 h-6 mx-auto text-slate-400 group-hover:text-[var(--steel,#2B4C7E)] transition-colors mb-1.5" />
                          <p className="text-xs font-bold text-slate-700">
                            Click or Drag to Upload Sample Photo
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            PNG, JPG, JPEG, WEBP (Max 5MB)
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <input
                        type="url"
                        placeholder="https://... (paste direct image URL)"
                        value={formPictureUrl}
                        onChange={e => setFormPictureUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-[var(--steel,#2B4C7E)] focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Row 7: Size, Sets & Pieces Breakdown Matrix */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Size, Sets & Pieces Matrix
                    </span>
                    <button
                      type="button"
                      onClick={handleAddSizeRow}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-[var(--steel,#2B4C7E)] hover:bg-slate-100 cursor-pointer shadow-2xs"
                    >
                      + Add Size Row
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-[10.5px] font-bold uppercase text-slate-400 px-1">
                      <span className="col-span-4">Size Range</span>
                      <span className="col-span-3">Sets Qty</span>
                      <span className="col-span-2 text-center">Pcs/Set</span>
                      <span className="col-span-2 text-right">Total Pcs</span>
                      <span className="col-span-1 text-center">Del</span>
                    </div>

                    {formSizeMatrix.map((row, rIdx) => (
                      <div key={rIdx} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-4">
                          <input
                            type="text"
                            required
                            placeholder="e.g. 16X20"
                            value={row.size}
                            onChange={e => handleSizeRowChange(rIdx, 'size', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-1 focus:ring-[var(--steel,#2B4C7E)] focus:outline-none"
                          />
                        </div>

                        <div className="col-span-3">
                          <input
                            type="number"
                            min="1"
                            required
                            placeholder="Sets"
                            value={row.sets}
                            onChange={e => handleSizeRowChange(rIdx, 'sets', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#2563EB] focus:ring-1 focus:ring-[var(--steel,#2B4C7E)] focus:outline-none"
                          />
                        </div>

                        <div className="col-span-2">
                          <input
                            type="number"
                            min="1"
                            required
                            placeholder="Ratio"
                            value={row.ratio}
                            onChange={e => handleSizeRowChange(rIdx, 'ratio', e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-center text-slate-700 focus:ring-1 focus:ring-[var(--steel,#2B4C7E)] focus:outline-none"
                          />
                        </div>

                        <div className="col-span-2 text-right font-mono font-bold text-xs text-[#059669]">
                          {row.pcs} pcs
                        </div>

                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveSizeRow(rIdx)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">Total Matrix Calculation:</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#2563EB]">{formTotalSets} Sets</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-[#059669]">{formTotalPcs} Total Pieces</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Sticky Bottom Footer Submit Buttons */}
              <div className="p-3 sm:p-4 border-t flex items-center justify-end gap-3 bg-slate-50 shrink-0" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  style={{ backgroundColor: 'var(--steel, #2B4C7E)' }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isPending ? 'Saving to System...' : 'Save & Send to Floor 💾'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. MODAL: HD PHOTO ZOOM PREVIEW                           */}
      {/* ========================================================= */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
        >
          <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-800">{previewTitle}</h4>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-slate-50 rounded-xl min-h-[300px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewPhoto}
                alt="Product Spec Preview"
                className="max-h-[600px] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
