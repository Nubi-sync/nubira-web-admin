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
  Box,
  Scale,
  Scissors,
  Bookmark
} from 'lucide-react'
import { CentralStoreBespokeIcon, MaterialFlowBespokeIcon } from '@/components/icons/CustomStoreIcons'
import {
  CentralFabricInventoryRow,
  MaterialIssueRecord
} from '@/app/store/types/store'
import {
  bookFabricForArticle,
  createMaterialIssueChallan
} from '@/app/store/actions'

interface MerchandiseStoreClientProps {
  companyName: string
  initialFabrics: CentralFabricInventoryRow[]
  initialIssues: MaterialIssueRecord[]
}

export function MerchandiseStoreClient({
  companyName,
  initialFabrics,
  initialIssues
}: MerchandiseStoreClientProps) {
  const [activeTab, setActiveTab] = useState<'MATRIX' | 'DISPATCHES'>('MATRIX')
  const [searchQuery, setSearchQuery] = useState('')
  const [fabrics, setFabrics] = useState<CentralFabricInventoryRow[]>(initialFabrics)
  const [issues, setIssues] = useState<MaterialIssueRecord[]>(initialIssues)

  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [selectedFabric, setSelectedFabric] = useState<CentralFabricInventoryRow | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Book Form State
  const [bookArticleNo, setBookArticleNo] = useState('')
  const [bookMeters, setBookMeters] = useState<number | ''>('')

  // Issue Form State
  const [issueArticleNo, setIssueArticleNo] = useState('')
  const [issueBuyerName, setIssueBuyerName] = useState('')
  const [issueFabricType, setIssueFabricType] = useState('')
  const [issueColor, setIssueColor] = useState('')
  const [issueQuantity, setIssueQuantity] = useState<number | ''>('')
  const [issueUnit, setIssueUnit] = useState('meters')
  const [issueRollsCount, setIssueRollsCount] = useState<number | ''>('')
  const [issueNotes, setIssueNotes] = useState('')

  // KPI calculations
  const totalFabricMeters = fabrics.reduce((sum, f) => sum + (Number(f.total_meters) || 0), 0)
  const totalBookedMeters = fabrics.reduce((sum, f) => sum + (Number(f.booked_meters) || 0), 0)
  const totalAvailableMeters = Math.max(0, totalFabricMeters - totalBookedMeters)
  const totalDispatchedMeters = issues
    .filter(i => i.from_division === 'MERCHANDISE' && i.to_division === 'CUTTING')
    .reduce((sum, i) => sum + (Number(i.quantity) || 0), 0)

  // Open Book Modal
  const handleOpenBookModal = (fabric: CentralFabricInventoryRow) => {
    setSelectedFabric(fabric)
    setBookArticleNo(fabric.booked_for_article || '')
    setBookMeters('')
    setFormError(null)
    setIsBookModalOpen(true)
  }

  // Open Issue Modal
  const handleOpenIssueModal = (fabric?: CentralFabricInventoryRow) => {
    if (fabric) {
      setSelectedFabric(fabric)
      setIssueFabricType(fabric.fabric_type)
      setIssueColor(fabric.color)
      setIssueArticleNo(fabric.booked_for_article || '')
      setIssueQuantity(fabric.available_meters || '')
      setIssueRollsCount(fabric.total_rolls || '')
    } else {
      setSelectedFabric(null)
      setIssueFabricType('')
      setIssueColor('')
      setIssueArticleNo('')
      setIssueQuantity('')
      setIssueRollsCount('')
    }
    setIssueBuyerName('')
    setIssueUnit('meters')
    setIssueNotes('')
    setFormError(null)
    setIsIssueModalOpen(true)
  }

  // Submit Booking
  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFabric) return
    if (!bookArticleNo.trim() || !bookMeters || Number(bookMeters) <= 0) {
      setFormError('Enter article number and valid meters to book.')
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    const res = await bookFabricForArticle(
      selectedFabric.id,
      bookArticleNo.trim(),
      Number(bookMeters)
    )

    setIsSubmitting(false)
    if (res.error) {
      setFormError(res.error)
    } else {
      setFabrics(
        fabrics.map(f => {
          if (f.id === selectedFabric.id) {
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
      setIsBookModalOpen(false)
      setSelectedFabric(null)
    }
  }

  // Submit Issue to Cutting
  const handleSaveIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!issueQuantity || Number(issueQuantity) <= 0) {
      setFormError('Enter valid issue quantity.')
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    const res = await createMaterialIssueChallan({
      from_division: 'MERCHANDISE',
      to_division: 'CUTTING',
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
      setSelectedFabric(null)
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
      (i.to_division || '').toLowerCase().includes(q) ||
      (i.fabric_type || '').toLowerCase().includes(q) ||
      (i.color || '').toLowerCase().includes(q) ||
      (i.buyer_name || '').toLowerCase().includes(q)
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
        <Link href="/merchandising" className="hover:text-[#3A3564] transition-colors">
          Merchandising
        </Link>
        <span>/</span>
        <span className="font-bold text-slate-900">Store & Fabric Booking</span>
      </div>

      {/* Layer 2: Encapsulated Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <CentralStoreBespokeIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Merchandise Fabric Store
              </h1>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs tracking-wider">
                DIV 02
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Check color stock availability, book cloth for buyer POs, and issue rolls to Cutting floor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
          <Link
            href="/store"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-[#FAF7F0] hover:bg-slate-100 border border-black/10 shadow-2xs transition-all cursor-pointer"
          >
            <MaterialFlowBespokeIcon className="w-4 h-4" />
            <span>Central Store Hub</span>
          </Link>

          <button
            type="button"
            onClick={() => handleOpenIssueModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <Scissors className="w-4 h-4" />
            <span>Issue to Cutting</span>
          </button>
        </div>
      </div>

      {/* Layer 3: Executive KPI Metric Cards (Grid of 4) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1: Available Fabric */}
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
              Free Stock
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Unreserved cloth</div>
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

        {/* Metric 2: Booked Fabric */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Bookmark className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              RESERVED
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Booked Fabric
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Allocated to articles</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-mono tabular-nums text-slate-900">
              {totalBookedMeters.toLocaleString()}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              Meters
            </span>
          </div>
        </div>

        {/* Metric 3: Total On-Hand */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              TOTAL
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Total Stock
            </div>
            <div className="text-[11px] text-slate-400 font-medium">{fabrics.length} Registered lots</div>
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

        {/* Metric 4: Dispatched to Cutting */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Scissors className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              CUTTING
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Issued to Cut
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Transferred rolls</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-mono tabular-nums text-slate-900">
              {totalDispatchedMeters.toLocaleString()}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              Meters
            </span>
          </div>
        </div>
      </div>

      {/* Layer 4 & 5: Tabbed Container & Primary Tables */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        {/* Toolbar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('MATRIX')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'MATRIX'
                  ? 'bg-[#3A3564] text-white shadow-2xs font-bold'
                  : 'text-slate-600 bg-[#FAF7F0] border border-black/5 hover:bg-black/5'
              }`}
            >
              Fabric Stock Matrix ({fabrics.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('DISPATCHES')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'DISPATCHES'
                  ? 'bg-[#3A3564] text-white shadow-2xs font-bold'
                  : 'text-slate-600 bg-[#FAF7F0] border border-black/5 hover:bg-black/5'
              }`}
            >
              Cutting Dispatches ({issues.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search color, fabric, article..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
            />
          </div>
        </div>

        {/* Tab 1: Fabric Stock Matrix Cards */}
        {activeTab === 'MATRIX' && (
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredFabrics.map(f => (
                <div
                  key={f.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#3A3564]/40 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900 font-mono text-sm">{f.fabric_type}</div>
                      <div className="text-xs text-slate-600 font-medium mt-0.5">
                        Color: <span className="font-bold text-slate-900">{f.color}</span>
                      </div>
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

                  <div className="text-xs font-mono text-slate-600">
                    {f.booked_for_article ? (
                      <div>
                        Booked: <span className="font-bold text-[#3A3564]">Art #{f.booked_for_article}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Unreserved Stock</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenBookModal(f)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer shadow-2xs"
                    >
                      Book Art
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenIssueModal(f)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] cursor-pointer shadow-2xs"
                    >
                      Issue to Cut
                    </button>
                  </div>
                </div>
              ))}
              {filteredFabrics.length === 0 && (
                <div className="col-span-3 py-8 text-center text-slate-400">
                  No fabric lots matching search criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Dispatches to Cutting */}
        {activeTab === 'DISPATCHES' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0]">
                  <th className="py-3 px-4">Challan Ref</th>
                  <th className="py-3 px-4">To Division</th>
                  <th className="py-3 px-4">Article / Material</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Issuer</th>
                  <th className="py-3 px-4 text-right">Issue Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                      No cutting dispatches recorded yet.
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
      </div>

      {/* MODAL 1: Book Fabric for Article */}
      {isBookModalOpen && selectedFabric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
            <div className="px-6 py-5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-white text-[#3A3564] border border-black/10 shadow-2xs">
                  BOOKING ALLOCATION
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1 font-[family-name:var(--font-heading)]">
                  Reserve Fabric for Article
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
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
                    <span className="font-bold text-slate-900">{selectedFabric.fabric_type}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Color:</span>
                    <span className="font-bold text-slate-900">{selectedFabric.color}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Available:</span>
                    <span className="font-bold text-[#3A3564]">{Number(selectedFabric.available_meters).toLocaleString()}m</span>
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
                    max={selectedFabric.available_meters}
                    step="any"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 outline-none shadow-2xs transition-all"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-[#FAF7F0] border-t border-black/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
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

      {/* MODAL 2: Issue to Cutting Floor */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
            <div className="px-6 py-5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-white text-[#3A3564] border border-black/10 shadow-2xs">
                  DISPATCH TO CUTTING
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1 font-[family-name:var(--font-heading)]">
                  Issue Fabric Challan
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
                      Fabric Type
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
                    placeholder="Cutting floor instructions..."
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
                  {isSubmitting ? 'Saving...' : 'Confirm Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
