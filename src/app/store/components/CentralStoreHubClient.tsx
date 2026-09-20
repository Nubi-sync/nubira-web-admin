'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Layers,
  ArrowRight,
  Plus,
  Search,
  Check,
  X,
  Clock,
  Truck,
  Building2,
  Box,
  Scale,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react'
import { CentralStoreBespokeIcon, MaterialFlowBespokeIcon } from '@/components/icons/CustomStoreIcons'
import {
  CentralFabricInventoryRow,
  MaterialIssueRecord,
  MaterialReceiptRecord,
  CentralStoreHubKpis
} from '../types/store'
import {
  upsertFabricInventoryEntry,
  bookFabricForArticle,
  createMaterialIssueChallan,
  acknowledgeMaterialReceipt
} from '../actions'

interface CentralStoreHubClientProps {
  userEmail: string
  isSuperAdmin: boolean
  companyName: string
  initialFabrics: CentralFabricInventoryRow[]
  initialIssues: MaterialIssueRecord[]
  initialReceipts: MaterialReceiptRecord[]
  initialTruckInwards: any[]
  kpis: CentralStoreHubKpis
}

type TabType = 'OVERVIEW' | 'FABRIC' | 'MERCHANDISE' | 'ISSUES' | 'RECEIPTS' | 'TRUCKS'

export function CentralStoreHubClient({
  userEmail,
  isSuperAdmin,
  companyName,
  initialFabrics,
  initialIssues,
  initialReceipts,
  initialTruckInwards,
  kpis
}: CentralStoreHubClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW')
  const [searchQuery, setSearchQuery] = useState('')

  // State collections
  const [fabrics, setFabrics] = useState<CentralFabricInventoryRow[]>(initialFabrics)
  const [issues, setIssues] = useState<MaterialIssueRecord[]>(initialIssues)
  const [receipts, setReceipts] = useState<MaterialReceiptRecord[]>(initialReceipts)
  const [truckInwards, setTruckInwards] = useState<any[]>(initialTruckInwards)

  // Modals state
  const [isAddFabricOpen, setIsAddFabricOpen] = useState(false)
  const [isBookFabricOpen, setIsBookFabricOpen] = useState(false)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [selectedFabricForBooking, setSelectedFabricForBooking] = useState<CentralFabricInventoryRow | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Add Fabric Form State
  const [fabricType, setFabricType] = useState('')
  const [fabricColor, setFabricColor] = useState('')
  const [fabricSupplier, setFabricSupplier] = useState('')
  const [fabricMeters, setFabricMeters] = useState<number | ''>('')
  const [fabricWeight, setFabricWeight] = useState<number | ''>('')
  const [fabricRolls, setFabricRolls] = useState<number | ''>('')
  const [fabricRack, setFabricRack] = useState('RACK-01')
  const [fabricNotes, setFabricNotes] = useState('')

  // Book Fabric Form State
  const [bookArticleNo, setBookArticleNo] = useState('')
  const [bookMeters, setBookMeters] = useState<number | ''>('')

  // Issue Challan Form State
  const [issueFrom, setIssueFrom] = useState('MERCHANDISE')
  const [issueTo, setIssueTo] = useState('CUTTING')
  const [issueArticleNo, setIssueArticleNo] = useState('')
  const [issueBuyerName, setIssueBuyerName] = useState('')
  const [issueFabricType, setIssueFabricType] = useState('')
  const [issueColor, setIssueColor] = useState('')
  const [issueQuantity, setIssueQuantity] = useState<number | ''>('')
  const [issueUnit, setIssueUnit] = useState('meters')
  const [issueRollsCount, setIssueRollsCount] = useState<number | ''>('')
  const [issueNotes, setIssueNotes] = useState('')

  // Live KPI Calculations
  const totalFabricMeters = fabrics.reduce((sum, f) => sum + (Number(f.total_meters) || 0), 0)
  const totalFabricRolls = fabrics.reduce((sum, f) => sum + (Number(f.total_rolls) || 0), 0)
  const totalWeightKg = fabrics.reduce((sum, f) => sum + (Number(f.total_weight_kg) || 0), 0)
  const totalBookedMeters = fabrics.reduce((sum, f) => sum + (Number(f.booked_meters) || 0), 0)
  const totalAvailableMeters = Math.max(0, totalFabricMeters - totalBookedMeters)
  const activeIssuesCount = issues.filter(i => i.status === 'ISSUED' || i.status === 'IN_TRANSIT').length

  // Quick action: Open book modal
  const handleOpenBookModal = (fabric: CentralFabricInventoryRow) => {
    setSelectedFabricForBooking(fabric)
    setBookArticleNo(fabric.booked_for_article || '')
    setBookMeters('')
    setFormError(null)
    setIsBookFabricOpen(true)
  }

  // Quick action: Issue directly to Cutting from Merchandise
  const handleQuickIssueToCutting = (fabric: CentralFabricInventoryRow) => {
    setIssueFrom('MERCHANDISE')
    setIssueTo('CUTTING')
    setIssueFabricType(fabric.fabric_type)
    setIssueColor(fabric.color)
    setIssueArticleNo(fabric.booked_for_article || '')
    setIssueQuantity(fabric.available_meters || '')
    setIssueUnit('meters')
    setIssueRollsCount(fabric.total_rolls || '')
    setIssueNotes('')
    setFormError(null)
    setIsIssueModalOpen(true)
  }

  // Submit: Add Fabric
  const handleSaveFabric = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fabricType.trim() || !fabricColor.trim() || !fabricMeters || Number(fabricMeters) <= 0) {
      setFormError('Enter fabric type, color, and valid meterage.')
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    const res = await upsertFabricInventoryEntry({
      fabric_type: fabricType.trim(),
      color: fabricColor.trim(),
      supplier_name: fabricSupplier.trim() || null,
      total_meters: Number(fabricMeters),
      total_weight_kg: Number(fabricWeight) || 0,
      total_rolls: Number(fabricRolls) || 0,
      rack_location: fabricRack.trim() || 'RACK-01',
      notes: fabricNotes.trim() || null,
      company_name: companyName,
    })

    setIsSubmitting(false)
    if (res.error) {
      setFormError(res.error)
    } else if (res.data) {
      setFabrics([res.data, ...fabrics])
      setIsAddFabricOpen(false)
      // Reset form
      setFabricType('')
      setFabricColor('')
      setFabricSupplier('')
      setFabricMeters('')
      setFabricWeight('')
      setFabricRolls('')
      setFabricNotes('')
    }
  }

  // Submit: Book Fabric
  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFabricForBooking) return
    if (!bookArticleNo.trim() || !bookMeters || Number(bookMeters) <= 0) {
      setFormError('Enter article number and valid meters to book.')
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    const res = await bookFabricForArticle(
      selectedFabricForBooking.id,
      bookArticleNo.trim(),
      Number(bookMeters)
    )

    setIsSubmitting(false)
    if (res.error) {
      setFormError(res.error)
    } else {
      setFabrics(
        fabrics.map(f => {
          if (f.id === selectedFabricForBooking.id) {
            const newBooked = (Number(f.booked_meters) || 0) + Number(bookMeters)
            return {
              ...f,
              booked_for_article: bookArticleNo.trim(),
              booked_meters: newBooked,
              available_meters: Math.max(0, (Number(f.total_meters) || 0) - newBooked),
            }
          }
          return f
        })
      )
      setIsBookFabricOpen(false)
      setSelectedFabricForBooking(null)
    }
  }

  // Submit: Issue Challan
  const handleSaveIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!issueQuantity || Number(issueQuantity) <= 0) {
      setFormError('Enter valid issue quantity.')
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    const res = await createMaterialIssueChallan({
      from_division: issueFrom,
      to_division: issueTo,
      article_no: issueArticleNo.trim() || undefined,
      buyer_name: issueBuyerName.trim() || undefined,
      fabric_type: issueFabricType.trim() || undefined,
      color: issueColor.trim() || undefined,
      quantity: Number(issueQuantity),
      unit: issueUnit,
      rolls_count: Number(issueRollsCount) || 0,
      notes: issueNotes.trim() || undefined,
      company_name: companyName,
    })

    setIsSubmitting(false)
    if (res.error) {
      setFormError(res.error)
    } else if (res.data) {
      setIssues([res.data, ...issues])
      setIsIssueModalOpen(false)
      // Reset form
      setIssueArticleNo('')
      setIssueBuyerName('')
      setIssueFabricType('')
      setIssueColor('')
      setIssueQuantity('')
      setIssueRollsCount('')
      setIssueNotes('')
    }
  }

  // Filtered queries
  const filteredFabrics = fabrics.filter(f => {
    const q = searchQuery.toLowerCase()
    return (
      (f.fabric_type || '').toLowerCase().includes(q) ||
      (f.color || '').toLowerCase().includes(q) ||
      (f.rack_location || '').toLowerCase().includes(q) ||
      (f.booked_for_article || '').toLowerCase().includes(q) ||
      (f.supplier_name || '').toLowerCase().includes(q)
    )
  })

  const filteredIssues = issues.filter(i => {
    const q = searchQuery.toLowerCase()
    return (
      (i.issue_challan_no || '').toLowerCase().includes(q) ||
      (i.article_no || '').toLowerCase().includes(q) ||
      (i.from_division || '').toLowerCase().includes(q) ||
      (i.to_division || '').toLowerCase().includes(q) ||
      (i.fabric_type || '').toLowerCase().includes(q) ||
      (i.color || '').toLowerCase().includes(q)
    )
  })

  const filteredReceipts = receipts.filter(r => {
    const q = searchQuery.toLowerCase()
    return (
      (r.issue?.issue_challan_no || '').toLowerCase().includes(q) ||
      (r.division_code || '').toLowerCase().includes(q) ||
      (r.rack_location || '').toLowerCase().includes(q) ||
      (r.received_by || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto text-[#09090b]">
      {/* Layer 1: Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link href="/modules" className="hover:text-[#3A3564] transition-colors">
          Modules
        </Link>
        <span>/</span>
        <span className="font-bold text-slate-900">Central Store & Warehouse</span>
      </div>

      {/* Layer 2: Encapsulated Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <CentralStoreBespokeIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Central Store Hub
              </h1>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs tracking-wider">
                DIV 11
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Central fabric stock, merchandise booking, and inter-module production flow
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => {
              setFormError(null)
              setIsAddFabricOpen(true)
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-[#FAF7F0] hover:bg-slate-100 border border-black/10 shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#3A3564]" />
            <span>Add Cloth Stock</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFormError(null)
              setIsIssueModalOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Issue Challan</span>
          </button>
        </div>
      </div>

      {/* Layer 3: Executive KPI Metric Cards (Grid of 4) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1: Total Fabric Stock */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              IN GODOWN
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Total Cloth Stock
            </div>
            <div className="text-[11px] text-slate-400 font-medium">{totalFabricRolls} Rolls on hand</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-mono tabular-nums text-slate-900">
              {totalFabricMeters.toLocaleString()}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              Meters
            </span>
          </div>
        </div>

        {/* Metric 2: Available Fabric */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Box className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              AVAILABLE
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Unreserved Fabric
            </div>
            <div className="text-[11px] text-slate-400 font-medium">{totalBookedMeters.toLocaleString()}m Booked</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-mono tabular-nums text-slate-900">
              {totalAvailableMeters.toLocaleString()}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              Meters
            </span>
          </div>
        </div>

        {/* Metric 3: Active Material Issues */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <MaterialFlowBespokeIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              PIPELINE
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Active Issues
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Inter-module transfers</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-mono tabular-nums text-slate-900">
              {activeIssuesCount}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              In Transit
            </span>
          </div>
        </div>

        {/* Metric 4: Total Weight */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Scale className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              WEIGHT
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Total Weight
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Stock mass</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-mono tabular-nums text-slate-900">
              {totalWeightKg.toLocaleString()}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              KG
            </span>
          </div>
        </div>
      </div>

      {/* Production Route Handover Strip */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs">
        <div className="text-xs font-mono font-bold uppercase text-slate-500 mb-2.5">
          Production Chain & Module Floor Stores
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
          {[
            { label: 'Merchandise', code: 'MERCH', route: '/merchandising', role: 'Book & Sourcing' },
            { label: 'Cutting Floor', code: 'CUT', route: '/cutting/store', role: 'Rolls & Spreading' },
            { label: 'Printing Div', code: 'PRINT', route: '/printing/store', role: 'Screen & Digital' },
            { label: 'Embroidery', code: 'EMB', route: '/embroidery/store', role: 'Borer & Multi-head' },
            { label: 'Washing Ops', code: 'WASH', route: '/washing/store', role: 'Enzyme & Hydro' },
            { label: 'Ironing Ops', code: 'IRON', route: '/iron/store', role: 'Steam & Press' },
          ].map((m, idx) => (
            <Link
              key={m.code}
              href={m.route}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-[#FAF7F0] border border-slate-200 hover:border-[#3A3564]/30 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-[#3A3564]">
                  0{idx + 1}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#3A3564] transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="font-bold text-slate-900 mt-1">{m.label}</div>
              <div className="text-[10px] text-slate-500">{m.role}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Layer 4 & 5: Tabbed Container & Primary Tables */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        {/* Toolbar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            {[
              { key: 'OVERVIEW', label: 'Overview' },
              { key: 'FABRIC', label: `Fabric Inventory (${fabrics.length})` },
              { key: 'MERCHANDISE', label: 'Merchandise Store' },
              { key: 'ISSUES', label: `Material Issues (${issues.length})` },
              { key: 'RECEIPTS', label: `Module Receipts (${receipts.length})` },
              { key: 'TRUCKS', label: `Truck GRN (${truckInwards.length})` },
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-[#3A3564] text-white shadow-2xs font-bold'
                    : 'text-slate-600 bg-[#FAF7F0] border border-black/5 hover:bg-black/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search fabric, article, challan..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
            />
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quick Stock Summary Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">
                    Fabric Stock Summary
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('FABRIC')}
                    className="text-xs font-bold text-[#3A3564] hover:underline"
                  >
                    View All &rarr;
                  </button>
                </div>
                <div className="divide-y divide-slate-200 text-xs">
                  {fabrics.slice(0, 5).map(f => (
                    <div key={f.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 font-mono">{f.fabric_type}</div>
                        <div className="text-[11px] text-slate-500">
                          {f.color} • Rack {f.rack_location}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-900">
                          {Number(f.total_meters).toLocaleString()}m
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {Number(f.available_meters).toLocaleString()}m free
                        </div>
                      </div>
                    </div>
                  ))}
                  {fabrics.length === 0 && (
                    <div className="py-4 text-center text-slate-400">No cloth stock registered yet.</div>
                  )}
                </div>
              </div>

              {/* Quick Active Pipeline Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">
                    Recent Material Dispatches
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ISSUES')}
                    className="text-xs font-bold text-[#3A3564] hover:underline"
                  >
                    View All &rarr;
                  </button>
                </div>
                <div className="divide-y divide-slate-200 text-xs">
                  {issues.slice(0, 5).map(i => (
                    <div key={i.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-mono font-bold text-[#3A3564]">{i.issue_challan_no}</div>
                        <div className="text-[11px] text-slate-500">
                          {i.from_division} &rarr; {i.to_division} {i.article_no ? `• Art #${i.article_no}` : ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-900">
                          {Number(i.quantity).toLocaleString()} {i.unit}
                        </div>
                        <span
                          className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                            i.status === 'RECEIVED'
                              ? 'bg-slate-100 text-slate-800 border-slate-300'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {i.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {issues.length === 0 && (
                    <div className="py-4 text-center text-slate-400">No active dispatches recorded.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FABRIC INVENTORY (MANUAL CLOTH ENTRY) */}
        {activeTab === 'FABRIC' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0]">
                  <th className="py-3 px-4">Fabric Type</th>
                  <th className="py-3 px-4">Color</th>
                  <th className="py-3 px-4">Rack</th>
                  <th className="py-3 px-4 text-right">Total Meters</th>
                  <th className="py-3 px-4 text-right">Weight (kg)</th>
                  <th className="py-3 px-4 text-right">Rolls</th>
                  <th className="py-3 px-4">Booked Article</th>
                  <th className="py-3 px-4 text-right">Available</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredFabrics.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 font-medium">
                      No fabric inventory entries match your search.
                    </td>
                  </tr>
                ) : (
                  filteredFabrics.map(f => (
                    <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {f.fabric_type}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {f.color}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {f.rack_location}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {Number(f.total_meters).toLocaleString()}m
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        {Number(f.total_weight_kg).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        {f.total_rolls}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {f.booked_for_article ? (
                          <span className="font-bold text-[#3A3564]">
                            Art #{f.booked_for_article} ({Number(f.booked_meters).toLocaleString()}m)
                          </span>
                        ) : (
                          <span className="text-slate-400">Unreserved</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {Number(f.available_meters).toLocaleString()}m
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenBookModal(f)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#3A3564] bg-[#FAF7F0] hover:bg-slate-100 border border-black/10 cursor-pointer shadow-2xs"
                        >
                          Book Art
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: MERCHANDISE FABRIC STORE */}
        {activeTab === 'MERCHANDISE' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">
                  Merchandise Cloth Sourcing Matrix
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Check available colors and meters to reserve for articles or dispatch to Cutting
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredFabrics.map(f => (
                <div
                  key={f.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#3A3564]/40 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900 font-mono text-sm">{f.fabric_type}</div>
                      <div className="text-xs text-slate-500 font-medium">Color: {f.color}</div>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                      {f.rack_location}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center font-mono">
                    <div>
                      <div className="text-[10px] text-slate-400">Total</div>
                      <div className="font-bold text-slate-900 text-xs">{Number(f.total_meters).toLocaleString()}m</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Booked</div>
                      <div className="font-bold text-slate-600 text-xs">{Number(f.booked_meters).toLocaleString()}m</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Free</div>
                      <div className="font-bold text-slate-900 text-xs">{Number(f.available_meters).toLocaleString()}m</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenBookModal(f)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                    >
                      Book Article
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickIssueToCutting(f)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] cursor-pointer"
                    >
                      Issue to Cut
                    </button>
                  </div>
                </div>
              ))}
              {filteredFabrics.length === 0 && (
                <div className="col-span-3 py-8 text-center text-slate-400">
                  No fabric lots available in store.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: MATERIAL ISSUES LEDGER */}
        {activeTab === 'ISSUES' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0]">
                  <th className="py-3 px-4">Challan Ref</th>
                  <th className="py-3 px-4">From</th>
                  <th className="py-3 px-4">To</th>
                  <th className="py-3 px-4">Article / Material</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Issuer</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                      No material issue records found.
                    </td>
                  </tr>
                ) : (
                  filteredIssues.map(i => (
                    <tr key={i.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#3A3564]">
                        {i.issue_challan_no}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                          {i.from_division}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                          {i.to_division}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 font-mono">
                          {i.article_no ? `Art #${i.article_no}` : 'General Stock'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {i.fabric_type || ''} {i.color ? `• ${i.color}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {Number(i.quantity).toLocaleString()} {i.unit}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                            i.status === 'RECEIVED'
                              ? 'bg-slate-100 text-slate-800 border-slate-300'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {i.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {i.issued_by || '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        {i.issue_date || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: MODULE RECEIPTS LEDGER */}
        {activeTab === 'RECEIPTS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0]">
                  <th className="py-3 px-4">Challan Ref</th>
                  <th className="py-3 px-4">Receiving Floor</th>
                  <th className="py-3 px-4">Article / Material</th>
                  <th className="py-3 px-4 text-right">Received Qty</th>
                  <th className="py-3 px-4 text-right">Shortage</th>
                  <th className="py-3 px-4">Rack</th>
                  <th className="py-3 px-4">Receiver</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredReceipts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                      No division receipts recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredReceipts.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#3A3564]">
                        {r.issue?.issue_challan_no || 'MANUAL-REC'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                          {r.division_code}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 font-mono">
                          {r.issue?.article_no ? `Art #${r.issue.article_no}` : 'General Stock'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {r.issue?.fabric_type || ''} {r.issue?.color ? `• ${r.issue.color}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {Number(r.received_quantity).toLocaleString()} {r.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {Number(r.shortage_quantity) > 0 ? (
                          <span className="text-rose-700 font-bold">
                            -{Number(r.shortage_quantity).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {r.rack_location || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {r.received_by || '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        {r.received_at ? new Date(r.received_at).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 6: TRUCK INWARDS */}
        {activeTab === 'TRUCKS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0]">
                  <th className="py-3 px-4">Supplier / Party</th>
                  <th className="py-3 px-4">Challan No</th>
                  <th className="py-3 px-4">Vehicle No</th>
                  <th className="py-3 px-4">Garment / Material</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Inward Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {truckInwards.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      No truck inward records found.
                    </td>
                  </tr>
                ) : (
                  truckInwards.map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                        {t.party_name || '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {t.challan_no || '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {t.truck_no || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {t.garment_type || t.article_no || 'Raw Material'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                          {t.status || 'VERIFIED'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        {t.inward_date || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Add Fabric Stock Entry */}
      {isAddFabricOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
            <div className="px-6 py-5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-white text-[#3A3564] border border-black/10 shadow-2xs">
                  INWARD STOCK
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1 font-[family-name:var(--font-heading)]">
                  Add Fabric / Cloth Entry
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddFabricOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFabric}>
              <div className="p-6 max-h-[72vh] overflow-y-auto space-y-4 text-xs sm:text-[13px]">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      Fabric Type <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fabricType}
                      onChange={e => setFabricType(e.target.value)}
                      placeholder="e.g. Cotton Twill 280 GSM"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      Color / Shade <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fabricColor}
                      onChange={e => setFabricColor(e.target.value)}
                      placeholder="e.g. Olive Green"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      Supplier / Mill
                    </label>
                    <input
                      type="text"
                      value={fabricSupplier}
                      onChange={e => setFabricSupplier(e.target.value)}
                      placeholder="e.g. Vardhman Mills"
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      Rack Location
                    </label>
                    <input
                      type="text"
                      value={fabricRack}
                      onChange={e => setFabricRack(e.target.value)}
                      placeholder="e.g. RACK-01"
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-mono uppercase text-slate-900 outline-none shadow-2xs transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      Total Meters <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={fabricMeters}
                      onChange={e => setFabricMeters(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0"
                      min="0.1"
                      step="any"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 outline-none shadow-2xs transition-all"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={fabricWeight}
                      onChange={e => setFabricWeight(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0"
                      min="0"
                      step="any"
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-mono text-slate-900 outline-none shadow-2xs transition-all"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      Rolls
                    </label>
                    <input
                      type="number"
                      value={fabricRolls}
                      onChange={e => setFabricRolls(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0"
                      min="0"
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-mono text-slate-900 outline-none shadow-2xs transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={fabricNotes}
                    onChange={e => setFabricNotes(e.target.value)}
                    placeholder="Lot number, remarks, etc."
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-[#FAF7F0] border-t border-black/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddFabricOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-black/10 hover:bg-slate-100 rounded-xl shadow-2xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Book Fabric for Article */}
      {isBookFabricOpen && selectedFabricForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
            <div className="px-6 py-5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-white text-[#3A3564] border border-black/10 shadow-2xs">
                  MERCHANDISE ALLOCATION
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1 font-[family-name:var(--font-heading)]">
                  Book Fabric for Article
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsBookFabricOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBooking}>
              <div className="p-6 max-h-[72vh] overflow-y-auto space-y-4 text-xs sm:text-[13px]">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                    {formError}
                  </div>
                )}

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Fabric:</span>
                    <span className="font-bold text-slate-900">{selectedFabricForBooking.fabric_type}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Color:</span>
                    <span className="font-bold text-slate-900">{selectedFabricForBooking.color}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Available:</span>
                    <span className="font-bold text-[#3A3564]">{Number(selectedFabricForBooking.available_meters).toLocaleString()}m</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Article Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bookArticleNo}
                    onChange={e => setBookArticleNo(e.target.value)}
                    placeholder="e.g. 9437"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-mono font-bold uppercase text-[#3A3564] outline-none shadow-2xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Meters to Book <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={bookMeters}
                    onChange={e => setBookMeters(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    min="0.1"
                    max={selectedFabricForBooking.available_meters}
                    step="any"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 outline-none shadow-2xs transition-all"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-[#FAF7F0] border-t border-black/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBookFabricOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-black/10 hover:bg-slate-100 rounded-xl shadow-2xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Create Material Issue Challan */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
            <div className="px-6 py-5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-white text-[#3A3564] border border-black/10 shadow-2xs">
                  INTER-MODULE ISSUE
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1 font-[family-name:var(--font-heading)]">
                  Issue Material Challan
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsIssueModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIssue}>
              <div className="p-6 max-h-[72vh] overflow-y-auto space-y-4 text-xs sm:text-[13px]">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      From Division <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={issueFrom}
                      onChange={e => setIssueFrom(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                    >
                      <option value="MERCHANDISE">Merchandise Fabric Store</option>
                      <option value="CUTTING">Cutting Floor</option>
                      <option value="PRINTING">Printing Division</option>
                      <option value="EMBROIDERY">Embroidery Division</option>
                      <option value="SEWING">Sewing Floor</option>
                      <option value="WASHING">Washing Operations</option>
                      <option value="IRONING">Ironing Operations</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      To Division <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={issueTo}
                      onChange={e => setIssueTo(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                    >
                      <option value="CUTTING">Cutting Floor</option>
                      <option value="PRINTING">Printing Division</option>
                      <option value="EMBROIDERY">Embroidery Division</option>
                      <option value="SEWING">Sewing Floor</option>
                      <option value="WASHING">Washing Operations</option>
                      <option value="IRONING">Ironing Operations</option>
                      <option value="PACKING">Ready Goods & Packing</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      Article Number
                    </label>
                    <input
                      type="text"
                      value={issueArticleNo}
                      onChange={e => setIssueArticleNo(e.target.value)}
                      placeholder="e.g. 9437"
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-mono font-bold uppercase text-[#3A3564] outline-none shadow-2xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      Buyer Name
                    </label>
                    <input
                      type="text"
                      value={issueBuyerName}
                      onChange={e => setIssueBuyerName(e.target.value)}
                      placeholder="e.g. Zara / HM"
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      Fabric / Item Type
                    </label>
                    <input
                      type="text"
                      value={issueFabricType}
                      onChange={e => setIssueFabricType(e.target.value)}
                      placeholder="e.g. Cotton Twill 280 GSM"
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      Color / Shade
                    </label>
                    <input
                      type="text"
                      value={issueColor}
                      onChange={e => setIssueColor(e.target.value)}
                      placeholder="e.g. Navy Blue"
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      Quantity <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={issueQuantity}
                      onChange={e => setIssueQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0"
                      min="0.1"
                      step="any"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 outline-none shadow-2xs transition-all"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      Unit
                    </label>
                    <select
                      value={issueUnit}
                      onChange={e => setIssueUnit(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                    >
                      <option value="meters">Meters</option>
                      <option value="pcs">Pieces</option>
                      <option value="kg">Kilograms</option>
                      <option value="rolls">Rolls</option>
                    </select>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      Rolls
                    </label>
                    <input
                      type="number"
                      value={issueRollsCount}
                      onChange={e => setIssueRollsCount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0"
                      min="0"
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-mono text-slate-900 outline-none shadow-2xs transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={issueNotes}
                    onChange={e => setIssueNotes(e.target.value)}
                    placeholder="Instructions, lot numbers, etc."
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-[#FAF7F0] border-t border-black/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-black/10 hover:bg-slate-100 rounded-xl shadow-2xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Confirm Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
