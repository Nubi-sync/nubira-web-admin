'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Building2,
  ChevronLeft,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Key,
  Layers,
  Phone,
  Mail,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react'
import { PlatformAdminShell } from '../components/PlatformAdminShell'
import { TenantFactory, TenantStatus } from '../types/platform'
import { getTenantFactories, PLATFORM_UPDATE_EVENT } from '../utils/platformStorage'
import { ProvisionTenantModal } from '../components/ProvisionTenantModal'

export default function TenantFactoriesPage() {
  const [tenants, setTenants] = useState<TenantFactory[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | TenantStatus>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadTenants = () => {
    setTenants(getTenantFactories())
  }

  useEffect(() => {
    loadTenants()
    const handleUpdate = () => loadTenants()
    window.addEventListener(PLATFORM_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(PLATFORM_UPDATE_EVENT, handleUpdate)
  }, [])

  const totalTenants = tenants.length
  const activeCount = tenants.filter(t => t.status === 'ACTIVE').length
  const fullAccessCount = tenants.filter(t => t.subscriptionTier === 'FULL_PLANT_AI').length
  const totalMrr = tenants.reduce((acc, t) => acc + (t.monthlyBillingInr || 0), 0)

  const filteredTenants = tenants.filter(t => {
    const matchesSearch =
      t.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.plantSlug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.cityState.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery)

    if (!matchesSearch) return false
    if (statusFilter === 'ALL') return true
    return t.status === statusFilter
  })

  return (
    <PlatformAdminShell userEmail="admin@zigza.in">
      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/platform-admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Platform Command</span>
          </Link>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            Tenant Factories & Company Infrastructure
          </span>
        </div>

        {/* Header Banner */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#3A3564]/10 text-[#3A3564] border border-[#3A3564]/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  Tenant Factories Directory
                </h1>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 tracking-wider">
                  {activeCount} Active Plants
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
                Authorized garment factory clients running Zigza Enterprise MES across multi-division production floors
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#3A3564] text-white text-xs font-mono font-bold hover:bg-[#2c284e] transition-all shadow-2xs inline-flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Provision New Tenant</span>
          </button>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                Total Factory Tenants
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {totalTenants} <span className="text-sm font-normal text-slate-500">Factories</span>
            </div>
            <p className="text-[11px] font-mono text-slate-500 mt-1">
              Onboarded & Provisioned
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                Full 11-Division Plants
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-700">
              {fullAccessCount} <span className="text-sm font-normal text-slate-500">Plants</span>
            </div>
            <p className="text-[11px] font-mono text-slate-500 mt-1">
              End-to-End Synchronized MES
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                Active Tenant Ratio
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700">
              {totalTenants > 0 ? Math.round((activeCount / totalTenants) * 100) : 100}%
            </div>
            <p className="text-[11px] font-mono text-emerald-700 mt-1">
              {activeCount} of {totalTenants} Live Daily
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                Monthly Contracted MRR
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-blue-700">
              ₹{totalMrr.toLocaleString()}
            </div>
            <p className="text-[11px] font-mono text-slate-500 mt-1">
              Recurring SaaS billing
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company name, slug, email, phone, or city..."
              className="w-full pl-9 pr-4 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['ALL', 'ACTIVE', 'PENDING_SETUP', 'SUSPENDED'] as const).map(tab => {
              const label = tab === 'ALL' ? 'All Factories' : tab.replace('_', ' ')
              const active = statusFilter === tab
              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                    active 
                      ? 'bg-[#3A3564] text-white shadow-2xs' 
                      : 'bg-[#FAF7F0] text-slate-600 hover:text-slate-900 border border-black/10'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tenant Factories Table */}
        <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF7F0] border-b border-black/10 font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Company & Slug</th>
                  <th className="py-3 px-4">Super Admin Contact</th>
                  <th className="py-3 px-4">Plant Location</th>
                  <th className="py-3 px-4">Plan & Billing</th>
                  <th className="py-3 px-4">Active Divisions</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Last Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-medium text-slate-800">
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-mono text-xs">
                      No tenant factories found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {t.companyName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          Slug: {t.plantSlug}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="font-bold text-slate-900">
                          {t.adminName}
                        </div>
                        <div className="text-slate-500">
                          {t.adminEmail} • {t.phone}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span>{t.cityState}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span className="font-bold text-[#3A3564]">
                          {t.subscriptionTier.replace(/_/g, ' ')}
                        </span>
                        <div className="text-[10px] text-slate-500">
                          ₹{t.monthlyBillingInr.toLocaleString()}/mo
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[10px] border border-slate-200">
                          {t.activeDivisionsCount} of 11 Units
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {t.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Live Active
                          </span>
                        ) : t.status === 'PENDING_SETUP' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase border border-amber-200">
                            <Clock className="w-3 h-3" />
                            Pending Setup
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-mono font-bold uppercase border border-rose-200">
                            Suspended
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-500">
                        {t.lastActiveAt ? new Date(t.lastActiveAt).toLocaleDateString() : 'Just Now'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        <ProvisionTenantModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          inquiry={null}
        />

      </div>
    </PlatformAdminShell>
  )
}
