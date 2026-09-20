'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Search,
  Check,
  X,
  Clock,
  Layers,
  FileText,
  AlertCircle
} from 'lucide-react'
import { CentralStoreBespokeIcon, MaterialFlowBespokeIcon } from '@/components/icons/CustomStoreIcons'
import { MaterialIssueRecord, MaterialReceiptRecord, MaterialFlowDivision } from '@/app/store/types/store'
import { createMaterialIssueChallan, acknowledgeMaterialReceipt } from '@/app/store/actions'

interface ModuleStoreDashboardProps {
  moduleName: string
  divisionCode: MaterialFlowDivision | string
  moduleNumber: string
  baseRoute: string
  initialReceipts: MaterialReceiptRecord[]
  initialIssues: MaterialIssueRecord[]
  pendingIssuesForMe: MaterialIssueRecord[]
  companyName: string
}

export function ModuleStoreDashboard({
  moduleName,
  divisionCode,
  moduleNumber,
  baseRoute,
  initialReceipts,
  initialIssues,
  pendingIssuesForMe,
  companyName
}: ModuleStoreDashboardProps) {
  const [activeTab, setActiveTab] = useState<'RECEIPTS' | 'ISSUES' | 'PENDING'>('RECEIPTS')
  const [searchQuery, setSearchQuery] = useState('')
  const [receipts, setReceipts] = useState<MaterialReceiptRecord[]>(initialReceipts)
  const [issues, setIssues] = useState<MaterialIssueRecord[]>(initialIssues)
  const [pendingIssues, setPendingIssues] = useState<MaterialIssueRecord[]>(pendingIssuesForMe)

  // Modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [isAcknowledgeModalOpen, setIsAcknowledgeModalOpen] = useState(false)
  const [selectedPendingIssue, setSelectedPendingIssue] = useState<MaterialIssueRecord | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Issue Form State
  const [targetDivision, setTargetDivision] = useState<string>('SEWING')
  const [issueArticleNo, setIssueArticleNo] = useState('')
  const [issueBuyerName, setIssueBuyerName] = useState('')
  const [issueFabricType, setIssueFabricType] = useState('')
  const [issueColor, setIssueColor] = useState('')
  const [issueQuantity, setIssueQuantity] = useState<number | ''>('')
  const [issueUnit, setIssueUnit] = useState('meters')
  const [issueRolls, setIssueRolls] = useState<number | ''>('')
  const [issueNotes, setIssueNotes] = useState('')

  // Acknowledge Form State
  const [ackReceivedQty, setAckReceivedQty] = useState<number | ''>('')
  const [ackShortageQty, setAckShortageQty] = useState<number | ''>(0)
  const [ackReceiverName, setAckReceiverName] = useState('')
  const [ackRackLocation, setAckRackLocation] = useState('')
  const [ackNotes, setAckNotes] = useState('')

  // KPI calculations
  const totalReceivedQty = receipts.reduce((sum, r) => sum + (Number(r.received_quantity) || 0), 0)
  const totalIssuedQty = issues.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0)
  const pendingCount = pendingIssues.length
  const totalShortageQty = receipts.reduce((sum, r) => sum + (Number(r.shortage_quantity) || 0), 0)

  // Handlers
  const handleOpenAcknowledge = (issue: MaterialIssueRecord) => {
    setSelectedPendingIssue(issue)
    setAckReceivedQty(Number(issue.quantity) || '')
    setAckShortageQty(0)
    setAckReceiverName('')
    setAckRackLocation('FLOOR-STORE')
    setAckNotes('')
    setFormError(null)
    setIsAcknowledgeModalOpen(true)
  }

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!issueQuantity || Number(issueQuantity) <= 0) {
      setFormError('Enter valid quantity.')
      return
    }
    setIsSubmitting(true)
    setFormError(null)

    const res = await createMaterialIssueChallan({
      from_division: divisionCode,
      to_division: targetDivision,
      article_no: issueArticleNo.trim() || undefined,
      buyer_name: issueBuyerName.trim() || undefined,
      fabric_type: issueFabricType.trim() || undefined,
      color: issueColor.trim() || undefined,
      quantity: Number(issueQuantity),
      unit: issueUnit,
      rolls_count: Number(issueRolls) || 0,
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
      setIssueRolls('')
      setIssueNotes('')
    }
  }

  const handleSubmitAcknowledge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPendingIssue) return
    if (!ackReceivedQty || Number(ackReceivedQty) <= 0) {
      setFormError('Enter valid received quantity.')
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    const res = await acknowledgeMaterialReceipt({
      issue_id: selectedPendingIssue.id,
      division_code: divisionCode,
      received_quantity: Number(ackReceivedQty),
      shortage_quantity: Number(ackShortageQty) || 0,
      unit: selectedPendingIssue.unit || 'meters',
      received_by: ackReceiverName.trim() || undefined,
      rack_location: ackRackLocation.trim() || undefined,
      notes: ackNotes.trim() || undefined,
      company_name: companyName,
    })

    setIsSubmitting(false)
    if (res.error) {
      setFormError(res.error)
    } else if (res.data) {
      const newReceipt: MaterialReceiptRecord = {
        ...res.data,
        issue: selectedPendingIssue
      }
      setReceipts([newReceipt, ...receipts])
      setPendingIssues(pendingIssues.filter(p => p.id !== selectedPendingIssue.id))
      setIsAcknowledgeModalOpen(false)
      setSelectedPendingIssue(null)
    }
  }

  // Filtered lists
  const filteredReceipts = receipts.filter(r => {
    const q = searchQuery.toLowerCase()
    return (
      (r.issue?.issue_challan_no || '').toLowerCase().includes(q) ||
      (r.issue?.article_no || '').toLowerCase().includes(q) ||
      (r.issue?.from_division || '').toLowerCase().includes(q) ||
      (r.rack_location || '').toLowerCase().includes(q) ||
      (r.issue?.fabric_type || '').toLowerCase().includes(q)
    )
  })

  const filteredIssues = issues.filter(i => {
    const q = searchQuery.toLowerCase()
    return (
      (i.issue_challan_no || '').toLowerCase().includes(q) ||
      (i.article_no || '').toLowerCase().includes(q) ||
      (i.to_division || '').toLowerCase().includes(q) ||
      (i.fabric_type || '').toLowerCase().includes(q) ||
      (i.buyer_name || '').toLowerCase().includes(q)
    )
  })

  const filteredPending = pendingIssues.filter(p => {
    const q = searchQuery.toLowerCase()
    return (
      (p.issue_challan_no || '').toLowerCase().includes(q) ||
      (p.article_no || '').toLowerCase().includes(q) ||
      (p.from_division || '').toLowerCase().includes(q) ||
      (p.fabric_type || '').toLowerCase().includes(q)
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
        <Link href={baseRoute} className="hover:text-[#3A3564] transition-colors">
          {moduleName}
        </Link>
        <span>/</span>
        <span className="font-bold text-slate-900">Floor Store</span>
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
                {moduleName} Store
              </h1>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs tracking-wider">
                DIV {moduleNumber}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Material receipts from preceding stage and handoff issues to next line
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
            onClick={() => {
              setFormError(null)
              setIsIssueModalOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Challan</span>
          </button>
        </div>
      </div>

      {/* Layer 3: Executive KPI Metric Cards (Grid of 4) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1: Received */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              INWARD
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Total Received
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Inward logged</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-mono tabular-nums text-slate-900">
              {totalReceivedQty.toLocaleString()}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {receipts.length} Lots
            </span>
          </div>
        </div>

        {/* Metric 2: Issued */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              OUTWARD
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Total Issued
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Next line handoff</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-mono tabular-nums text-slate-900">
              {totalIssuedQty.toLocaleString()}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {issues.length} Challans
            </span>
          </div>
        </div>

        {/* Metric 3: Pending Inward */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              PENDING
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Pending Inwards
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Awaiting receipt</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-mono tabular-nums text-slate-900">
              {pendingCount}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              In Transit
            </span>
          </div>
        </div>

        {/* Metric 4: Shortages */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              SHORTAGE
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Logged Variance
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Inward discrepancy</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-mono tabular-nums text-slate-900">
              {totalShortageQty.toLocaleString()}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              Units
            </span>
          </div>
        </div>
      </div>

      {/* Layer 4 & 5: Tabbed Container & Primary Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        {/* Toolbar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('RECEIPTS')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'RECEIPTS'
                  ? 'bg-[#3A3564] text-white shadow-2xs font-bold'
                  : 'text-slate-600 bg-[#FAF7F0] border border-black/5 hover:bg-black/5'
              }`}
            >
              Inwards Received ({receipts.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ISSUES')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'ISSUES'
                  ? 'bg-[#3A3564] text-white shadow-2xs font-bold'
                  : 'text-slate-600 bg-[#FAF7F0] border border-black/5 hover:bg-black/5'
              }`}
            >
              Outward Issues ({issues.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PENDING')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'PENDING'
                  ? 'bg-[#3A3564] text-white shadow-2xs font-bold'
                  : 'text-slate-600 bg-[#FAF7F0] border border-black/5 hover:bg-black/5'
              }`}
            >
              Pending Inward ({pendingIssues.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search challan, article, division..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
            />
          </div>
        </div>

        {/* Tab 1: Receipts Table */}
        {activeTab === 'RECEIPTS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0]">
                  <th className="py-3 px-4">Challan Ref</th>
                  <th className="py-3 px-4">From</th>
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
                      No material receipts recorded yet.
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
                          {r.issue?.from_division || 'STORE'}
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

        {/* Tab 2: Outward Issues Table */}
        {activeTab === 'ISSUES' && (
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
                      No outward issues dispatched yet.
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

        {/* Tab 3: Pending Inwards Table (Awaiting Acknowledgment) */}
        {activeTab === 'PENDING' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0]">
                  <th className="py-3 px-4">Challan Ref</th>
                  <th className="py-3 px-4">From</th>
                  <th className="py-3 px-4">Article / Material</th>
                  <th className="py-3 px-4 text-right">Dispatched Qty</th>
                  <th className="py-3 px-4">Date Sent</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPending.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      No pending inwards. All dispatched lots have been acknowledged.
                    </td>
                  </tr>
                ) : (
                  filteredPending.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#3A3564]">
                        {p.issue_challan_no}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                          {p.from_division}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 font-mono">
                          {p.article_no ? `Art #${p.article_no}` : 'General Stock'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {p.fabric_type || ''} {p.color ? `• ${p.color}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {Number(p.quantity).toLocaleString()} {p.unit}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {p.issue_date || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenAcknowledge(p)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Create Issue Challan */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
            <div className="px-6 py-5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-white text-[#3A3564] border border-black/10 shadow-2xs">
                  DIV {moduleNumber} OUTWARD
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

            <form onSubmit={handleSubmitIssue}>
              <div className="p-6 max-h-[72vh] overflow-y-auto space-y-4 text-xs sm:text-[13px]">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      Destination <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={targetDivision}
                      onChange={e => setTargetDivision(e.target.value)}
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
                </div>

                <div className="grid grid-cols-2 gap-3">
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

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Fabric / Item Type
                  </label>
                  <input
                    type="text"
                    value={issueFabricType}
                    onChange={e => setIssueFabricType(e.target.value)}
                    placeholder="e.g. Cotton Single Jersey 220 GSM"
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                  />
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
                      value={issueRolls}
                      onChange={e => setIssueRolls(e.target.value === '' ? '' : Number(e.target.value))}
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
                    placeholder="Remarks or instructions..."
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

      {/* MODAL 2: Acknowledge Pending Inward */}
      {isAcknowledgeModalOpen && selectedPendingIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
            <div className="px-6 py-5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-white text-[#3A3564] border border-black/10 shadow-2xs">
                  INWARD ACKNOWLEDGMENT
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1 font-[family-name:var(--font-heading)]">
                  Receive {selectedPendingIssue.issue_challan_no}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAcknowledgeModalOpen(false)
                  setSelectedPendingIssue(null)
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAcknowledge}>
              <div className="p-6 max-h-[72vh] overflow-y-auto space-y-4 text-xs sm:text-[13px]">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                    {formError}
                  </div>
                )}

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">From Division:</span>
                    <span className="font-bold text-slate-900">{selectedPendingIssue.from_division}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Article:</span>
                    <span className="font-bold text-slate-900">{selectedPendingIssue.article_no || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Dispatched Qty:</span>
                    <span className="font-bold text-[#3A3564]">{selectedPendingIssue.quantity} {selectedPendingIssue.unit}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      Actual Received <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={ackReceivedQty}
                      onChange={e => setAckReceivedQty(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0"
                      min="0.1"
                      step="any"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 outline-none shadow-2xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      Shortage Qty
                    </label>
                    <input
                      type="number"
                      value={ackShortageQty}
                      onChange={e => setAckShortageQty(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0"
                      min="0"
                      step="any"
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-mono text-slate-900 outline-none shadow-2xs transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      Rack / Floor Location
                    </label>
                    <input
                      type="text"
                      value={ackRackLocation}
                      onChange={e => setAckRackLocation(e.target.value)}
                      placeholder="e.g. CUT-STAGE-01"
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-mono uppercase text-slate-900 outline-none shadow-2xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      Received By
                    </label>
                    <input
                      type="text"
                      value={ackReceiverName}
                      onChange={e => setAckReceiverName(e.target.value)}
                      placeholder="Supervisor Name"
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={ackNotes}
                    onChange={e => setAckNotes(e.target.value)}
                    placeholder="Inspection remarks..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-[#FAF7F0] border-t border-black/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAcknowledgeModalOpen(false)
                    setSelectedPendingIssue(null)
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-black/10 hover:bg-slate-100 rounded-xl shadow-2xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Confirm Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
