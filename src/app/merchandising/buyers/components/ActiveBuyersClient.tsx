'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, 
  Building2, 
  Plus, 
  Search, 
  Layers, 
  DollarSign, 
  PackageCheck, 
  Link as LinkIcon, 
  Unlink, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  FileText
} from 'lucide-react'
import { ActiveBuyer } from '../../types/merchandising'
import { 
  getActiveBuyers, 
  saveActiveBuyer, 
  deleteActiveBuyer, 
  MERCHANDISING_UPDATE_EVENT,
  getAvailableTechPackArticles
} from '../../utils/merchandisingStorage'
import { CreateBuyerModal } from './CreateBuyerModal'
import { LinkArticleModal } from './LinkArticleModal'
import { ViewContractModal } from './ViewContractModal'
import { EmptyState } from '@/components/ui/EmptyState'

interface ActiveBuyersClientProps {
  initialBuyers?: ActiveBuyer[]
}

export function ActiveBuyersClient({ initialBuyers }: ActiveBuyersClientProps) {
  const [buyers, setBuyers] = useState<ActiveBuyer[]>(() => {
    if (initialBuyers && initialBuyers.length > 0) return initialBuyers
    return []
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LINKED' | 'PENDING_LINK'>('ALL')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [linkingBuyer, setLinkingBuyer] = useState<ActiveBuyer | null>(null)
  const [viewingBuyer, setViewingBuyer] = useState<ActiveBuyer | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  const reloadData = () => {
    const localBuyers = getActiveBuyers()
    if (initialBuyers && initialBuyers.length > 0) {
      const merged = [...initialBuyers]
      ;(localBuyers || []).forEach((lb: any) => {
        if (!merged.some(m => m.id === lb.id || (m.buyer_name && m.buyer_name.toLowerCase() === (lb.buyer_name || '').toLowerCase()))) {
          merged.push(lb)
        }
      })
      setBuyers(merged)
    } else {
      setBuyers(localBuyers || [])
    }
  }

  useEffect(() => {
    reloadData()
    window.addEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
    window.addEventListener('zigza_tech_packs_updated', reloadData)
    return () => {
      window.removeEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
      window.removeEventListener('zigza_tech_packs_updated', reloadData)
    }
  }, [])

  const handleManualSync = () => {
    setIsSyncing(true)
    reloadData()
    setTimeout(() => setIsSyncing(false), 500)
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove buyer contract "${name}"?`)) {
      const updated = deleteActiveBuyer(id)
      setBuyers(updated)
    }
  }

  const handleUnlink = (buyer: ActiveBuyer) => {
    if (confirm(`Unlink article "${buyer.linked_article_number}" from ${buyer.buyer_name}?`)) {
      const updatedBuyer: ActiveBuyer = {
        ...buyer,
        linked_article_id: undefined,
        linked_article_number: undefined,
        linked_article_name: undefined,
        linked_at: undefined,
        status: 'PENDING_LINK'
      }
      const list = saveActiveBuyer(updatedBuyer)
      setBuyers(list)
    }
  }

  // Filtered Buyers
  const filteredBuyers = buyers.filter(b => {
    const matchesSearch = 
      b.buyer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.buyer_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.brand_name && b.brand_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.linked_article_number && b.linked_article_number.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'LINKED' && Boolean(b.linked_article_number)) ||
      (statusFilter === 'PENDING_LINK' && !b.linked_article_number)

    return matchesSearch && matchesStatus
  })

  // Executive Metrics
  const totalBuyersCount = buyers.length
  const totalContractedPcs = buyers.reduce((sum, b) => sum + (Number(b.contracted_volume) || 0), 0)
  const totalContractValue = buyers.reduce((sum, b) => sum + (Number(b.total_contract_value) || 0), 0)
  const linkedBuyers = buyers.filter(b => Boolean(b.linked_article_number))
  const linkedPcs = linkedBuyers.reduce((sum, b) => sum + (Number(b.contracted_volume) || 0), 0)

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto text-[#09090b]">
      
      {/* 1. Breadcrumb Hierarchy Trail */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link href="/merchandising" className="hover:text-[#3A3564] transition-colors">
          Merchandising &amp; Sourcing
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold">Active Buyers</span>
      </div>

      {/* 2. Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
              Active Buyers &amp; Accounts
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Contracted buyer order volumes, piece-rate pricing, and Tech Pack article allocations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="p-2.5 rounded-xl border border-black/10 bg-[#FAF7F0] hover:bg-[#F2ECE1] text-[#3A3564] transition-all cursor-pointer shadow-2xs"
            title="Refresh database"
          >
            <RotateCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs sm:text-sm font-bold shadow-2xs cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Contract New Buyer</span>
          </button>
        </div>
      </div>

      {/* 3. Executive KPI Metric Cards (4 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* CARD 1: TOTAL BUYERS */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block truncate">
              Active Buyers
            </span>
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1 leading-none">
              {totalBuyersCount}
            </h3>
          </div>
        </div>

        {/* CARD 2: TOTAL CONTRACTED VOLUME */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block truncate">
              Contracted Volume
            </span>
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1 leading-none">
              {totalContractedPcs.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        {/* CARD 3: LINKED IN-ORDER PCS */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block truncate">
              In Order
            </span>
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1 leading-none">
              {linkedPcs.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        {/* CARD 4: TOTAL CONTRACT VALUE */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block truncate">
              Total Contract Value
            </span>
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1 leading-none">
              ₹{totalContractValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h3>
          </div>
        </div>

      </div>

      {/* 4. Toolbar & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search buyers by name, code, brand, or linked article #..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-black/15 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:border-[#3A3564]"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'LINKED', 'PENDING_LINK'] as const).map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                statusFilter === st
                  ? 'bg-[#3A3564] text-white'
                  : 'bg-[#FAF7F0] text-slate-700 hover:bg-[#F2ECE1] border border-black/10'
              }`}
            >
              {st === 'ALL' ? 'All Buyers' : st === 'LINKED' ? 'Article Linked' : 'Pending Link'}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Streamlined Primary Data Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        {filteredBuyers.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <EmptyState
              icon={Users}
              title="No Active Buyers Found"
              description={
                buyers.length === 0 
                  ? "Get started by contracting your first buyer account and assigning contracted order volumes."
                  : "No buyers match the current filter and search query."
              }
              actionLabel={buyers.length === 0 ? "Contract First Buyer" : undefined}
              onAction={buyers.length === 0 ? () => setIsCreateModalOpen(true) : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF7F0] text-slate-500 font-mono text-[11px] uppercase tracking-wider border-b border-black/10">
                  <th className="py-3.5 px-5 font-bold">Buyer</th>
                  <th className="py-3.5 px-5 font-bold">Article Number</th>
                  <th className="py-3.5 px-5 font-bold">Ordered Volume</th>
                  <th className="py-3.5 px-5 font-bold">Article Link</th>
                  <th className="py-3.5 px-5 font-bold text-right">Contract &amp; Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredBuyers.map(buyer => {
                  const isLinked = Boolean(buyer.linked_article_number)

                  return (
                    <tr key={buyer.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Buyer */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs">
                            {buyer.buyer_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{buyer.buyer_name}</div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {buyer.buyer_code}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Article Number */}
                      <td className="py-4 px-5">
                        {isLinked ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200">
                            <Layers className="w-3.5 h-3.5 text-[#3A3564]" />
                            <span className="font-mono font-bold text-xs text-[#3A3564]">
                              {buyer.linked_article_number}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">
                            — Not Linked —
                          </span>
                        )}
                      </td>

                      {/* Ordered Volume */}
                      <td className="py-4 px-5">
                        <span className="font-mono font-extrabold text-sm text-[#3A3564]">
                          {buyer.contracted_volume.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-500 font-medium ml-1">Pcs</span>
                      </td>

                      {/* Article Link Action */}
                      <td className="py-4 px-5">
                        {isLinked ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Linked
                            </span>
                            <button
                              type="button"
                              onClick={() => setLinkingBuyer(buyer)}
                              className="text-xs text-[#3A3564] hover:text-[#2A2649] font-semibold underline cursor-pointer"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUnlink(buyer)}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                              title="Unlink article"
                            >
                              <Unlink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setLinkingBuyer(buyer)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span>Link Article</span>
                          </button>
                        )}
                      </td>

                      {/* Contract Details & Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setViewingBuyer(buyer)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 bg-[#FAF7F0] hover:bg-[#F2ECE1] text-[#3A3564] text-xs font-bold transition-all cursor-pointer shadow-2xs"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View Contract</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(buyer.id, buyer.buyer_name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete buyer contract"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateBuyerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onBuyerCreated={newB => {
          reloadData()
          setLinkingBuyer(newB)
        }}
      />

      <LinkArticleModal
        isOpen={Boolean(linkingBuyer)}
        buyer={linkingBuyer}
        onClose={() => setLinkingBuyer(null)}
        onArticleLinked={updatedB => {
          reloadData()
        }}
      />

      <ViewContractModal
        isOpen={Boolean(viewingBuyer)}
        buyer={viewingBuyer}
        onClose={() => setViewingBuyer(null)}
        onOpenLinkModal={b => setLinkingBuyer(b)}
      />

    </div>
  )
}
