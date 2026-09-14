'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Calculator,
  ChevronLeft,
  Plus,
  Search,
  Download
} from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  getBillingLedgers,
  EMBROIDERY_UPDATE_EVENT,
} from '../../utils/embroideryStorage'
import { StitchBillingLedger } from '../../types/embroidery'
import { CreateBillingModal } from './CreateBillingModal'

export function StitchBillingClient({
  initialLedgers
}: {
  initialLedgers?: StitchBillingLedger[]
} = {}) {
  const [ledgers, setLedgers] = useState<StitchBillingLedger[]>(() => {
    if (initialLedgers && initialLedgers.length > 0) return initialLedgers
    return []
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  function loadLedgers() {
    if (initialLedgers && initialLedgers.length > 0) {
      setLedgers(initialLedgers)
    } else {
      setLedgers(getBillingLedgers())
    }
  }

  useEffect(() => {
    if (initialLedgers && initialLedgers.length > 0) {
      setLedgers(initialLedgers)
    } else {
      loadLedgers()
    }
    window.addEventListener(EMBROIDERY_UPDATE_EVENT, loadLedgers)
    return () => window.removeEventListener(EMBROIDERY_UPDATE_EVENT, loadLedgers)
  }, [initialLedgers])

  const filteredLedgers = ledgers.filter(ledger => {
    const matchesSearch =
      ledger.invoice_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ledger.order_po.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ledger.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ledger.design_code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || ledger.billing_status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalBilledValue = ledgers.reduce((acc, l) => acc + l.total_amount, 0)
  const totalStitchesBilled = ledgers.reduce((acc, l) => acc + l.total_stitches_billed, 0)

  function handleExportCsv() {
    const headers = ['Invoice Code', 'Buyer', 'PO', 'DST Code', 'Pieces', 'Stitches/Pc', 'Total Stitches', 'Rate/1k', 'Backing/Pc', 'Total Amount', 'Status']
    const rows = filteredLedgers.map(l => [
      l.invoice_code,
      l.buyer_name,
      l.order_po,
      l.design_code,
      l.total_pieces,
      l.stitch_count_per_piece,
      l.total_stitches_billed,
      l.rate_per_thousand,
      l.backing_cost_per_piece,
      l.total_amount,
      l.billing_status
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `embroidery_billing_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto text-[#09090b] select-none">
      {/* 1. Breadcrumb */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Link
            href="/embroidery"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Embroidery Floor</span>
          </Link>
          <span className="text-slate-400 font-mono text-xs">/</span>
          <span className="text-xs font-mono font-bold text-slate-900">Stitch Billing</span>
        </div>

        <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
          Commercial Piece-Rate Ledgers
        </span>
      </div>

      {/* 2. Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Stitch Count & Billing Ledgers
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
                Piecewise Calculation
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Automated operator piece-rate compensation and buyer commercial billing based on running stitches.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-black/10 hover:bg-[#FAF7F0] text-slate-800 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Billing Ledger</span>
          </button>
        </div>
      </div>

      {/* 3. Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500">Total Billed Value</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            ₹{totalBilledValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs font-medium text-slate-600 mt-1">Direct jobwork ledger value</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500">Total Stitches Invoiced</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            {(totalStitchesBilled / 1000000).toFixed(2)}M Stitches
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">Across all approved runs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500">Standard Billing Formula</span>
          <div className="text-sm font-bold font-mono text-slate-800 mt-2">
            (Stitches / 1k) × Rate + Backing
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">ASTM standard piecewise rule</p>
        </div>
      </div>

      {/* 4. Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAF7F0]/30">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {(['ALL', 'APPROVED', 'INVOICED', 'PENDING_AUDIT'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-[#3A3564] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-[#3A3564] border border-black/10 hover:bg-[#FAF7F0]'
              }`}
            >
              {tab.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice, buyer, PO..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] bg-white text-slate-900 placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      {/* 5. Ledgers Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-[#FAF7F0]/60 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                <th className="p-4">Invoice & PO</th>
                <th className="p-4">Buyer & DST Code</th>
                <th className="p-4">Pieces Embroidered</th>
                <th className="p-4">Stitches / Total Billed</th>
                <th className="p-4">Piece-Rate Pricing</th>
                <th className="p-4">Total Amount (₹)</th>
                <th className="p-4">Billing Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-900">
              {filteredLedgers.length > 0 ? (
                filteredLedgers.map(l => {
                  const unitCost = ((l.stitch_count_per_piece / 1000) * l.rate_per_thousand) + l.backing_cost_per_piece
                  return (
                    <tr key={l.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{l.invoice_code}</div>
                        <div className="font-mono text-[11px] text-slate-500">{l.order_po}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{l.buyer_name}</div>
                        <div className="font-mono text-[11px] text-[#3A3564] font-bold">{l.design_code}</div>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-900">
                        {l.total_pieces.toLocaleString()} pcs
                      </td>
                      <td className="p-4 font-mono">
                        <div className="text-slate-800 font-semibold">{l.stitch_count_per_piece.toLocaleString()} sts/pc</div>
                        <div className="text-[11px] text-slate-500">{(l.total_stitches_billed / 1000000).toFixed(2)}M total</div>
                      </td>
                      <td className="p-4 font-mono">
                        <div className="text-slate-800">₹{l.rate_per_thousand.toFixed(2)} / 1k sts</div>
                        <div className="text-[11px] text-slate-500">Unit: ₹{unitCost.toFixed(2)}/pc</div>
                      </td>
                      <td className="p-4 font-mono font-black text-sm text-slate-900">
                        ₹{l.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                          {l.billing_status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-0">
                    <EmptyState
                      variant="seamless"
                      icon={Calculator}
                      title="No stitch billing ledgers found"
                      description="Commercial piece-rate calculations, running stitch logs, and buyer invoices will display once generated."
                      actionLabel="Create Billing Ledger"
                      onAction={() => setIsModalOpen(true)}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateBillingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
