'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  UserPlus,
  Scissors,
  Box,
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Phone,
  RefreshCw,
  Sparkles,
  Building2
} from 'lucide-react'
import { ReadyGoodsWorker, ReadyGoodsWorkerRole } from '../../types/readyGoods'
import { getReadyGoodsWorkers, saveReadyGoodsWorker, READY_GOODS_UPDATE_EVENT } from '../../utils/readyGoodsStorage'
import { AddWorkerModal } from '../../components/AddWorkerModal'
import { toast } from 'sonner'

interface WorkersManagementClientProps {
  userEmail?: string
  companyName?: string
}

export function WorkersManagementClient({ userEmail, companyName }: WorkersManagementClientProps) {
  const [workers, setWorkers] = useState<ReadyGoodsWorker[]>([])
  const [roleFilter, setRoleFilter] = useState<'ALL' | ReadyGoodsWorkerRole>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const reloadWorkers = () => {
    setWorkers(getReadyGoodsWorkers(companyName))
  }

  useEffect(() => {
    reloadWorkers()

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', reloadWorkers)
      window.addEventListener(READY_GOODS_UPDATE_EVENT, reloadWorkers)
      return () => {
        window.removeEventListener('storage', reloadWorkers)
        window.removeEventListener(READY_GOODS_UPDATE_EVENT, reloadWorkers)
      }
    }
  }, [companyName])

  // Metrics
  const totalWorkers = workers.length
  const checkerCount = workers.filter(w => w.role === 'CHECKER').length
  const packerCount = workers.filter(w => w.role === 'PACKER').length
  const dualCount = workers.filter(w => w.role === 'BOTH').length

  const filteredWorkers = workers.filter(w => {
    if (roleFilter !== 'ALL' && w.role !== roleFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const matchesName = w.worker_name.toLowerCase().includes(q)
      const matchesPhone = w.phone_number.includes(q)
      const matchesStation = w.assigned_station.toLowerCase().includes(q)
      return matchesName || matchesPhone || matchesStation
    }
    return true
  })

  const toggleWorkerStatus = (worker: ReadyGoodsWorker) => {
    const newStatus = worker.status === 'ACTIVE' ? 'ON_BREAK' : 'ACTIVE'
    saveReadyGoodsWorker({
      ...worker,
      status: newStatus
    })
    toast.success(`Worker ${worker.worker_name} marked as ${newStatus}`)
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#3A3564] uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Finishing Quality & Packing Floor Workforce</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-[family-name:var(--font-heading)]">
            Floor Workers & Roles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage Quality Checkers (post-wash & iron inspection), Packing Operators, and Dual-Role Specialists.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/ready-goods/worker"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-black bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 transition-all cursor-pointer"
          >
            <span>Worker Terminal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Worker</span>
          </button>
        </div>
      </div>

      {/* Workforce KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-black/15">
          <span className="text-xs font-medium text-slate-500 block mb-1">Total Workforce</span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono">{totalWorkers}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Active on Floor</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-black/15">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Quality Checkers</span>
            <Scissors className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-extrabold text-amber-700 font-mono">{checkerCount}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Cut/Print/Emb/Iron QC</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-black/15">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Packing Operators</span>
            <Box className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-extrabold text-blue-700 font-mono">{packerCount}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Hangtag & Carton Lines</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-black/15">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Dual-Role Staff</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-extrabold text-emerald-700 font-mono">{dualCount}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Checker + Packer</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-black/15 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => setRoleFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                roleFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Workers ({workers.length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('CHECKER')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                roleFilter === 'CHECKER'
                  ? 'bg-white text-amber-800 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Scissors className="w-3.5 h-3.5 text-amber-600" />
              <span>Quality Checkers ({checkerCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('PACKER')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                roleFilter === 'PACKER'
                  ? 'bg-white text-blue-800 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-blue-600" />
              <span>Packing Operators ({packerCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('BOTH')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                roleFilter === 'BOTH'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dual-Role ({dualCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by worker name, phone, or station..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#3A3564]"
            />
          </div>
        </div>

        {/* Worker Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Worker Profile</th>
                <th className="py-3 px-4">Contact / Login ID</th>
                <th className="py-3 px-4">Role & Specialization</th>
                <th className="py-3 px-4">Assigned Station</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4 text-right">Activity Stats</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No floor workers found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredWorkers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#3A3564]/10 text-[#3A3564] font-bold flex items-center justify-center text-xs">
                          {worker.worker_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{worker.worker_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {worker.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700 font-semibold">
                      +91 {worker.phone_number}
                    </td>

                    <td className="py-3 px-4">
                      {worker.role === 'CHECKER' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Scissors className="w-3.5 h-3.5" />
                          <span>Quality Checker</span>
                        </span>
                      )}
                      {worker.role === 'PACKER' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          <Box className="w-3.5 h-3.5" />
                          <span>Packing Operator</span>
                        </span>
                      )}
                      {worker.role === 'BOTH' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Dual-Role (QC & Pack)</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {worker.assigned_station}
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[11px] font-mono text-slate-600 block">
                        {worker.shift}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono">
                      <div className="text-[11px] text-slate-900 font-bold">
                        {worker.inspected_pieces} pcs checked
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {worker.packed_cartons} cartons packed
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleWorkerStatus(worker)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold cursor-pointer transition-all ${
                          worker.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${worker.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                        <span>{worker.status}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/ready-goods/worker?workerId=${worker.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#3A3564] hover:underline"
                      >
                        <span>Open Terminal</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Worker Modal */}
      <AddWorkerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => reloadWorkers()}
        companyName={companyName}
      />
    </div>
  )
}
