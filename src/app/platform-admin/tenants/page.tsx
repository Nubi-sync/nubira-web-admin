'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Building2,
  Search,
  CheckCircle2,
  Clock,
  Plus,
  Layers,
  Zap,
  Globe
} from 'lucide-react'
import { PlatformAdminShell } from '../components/PlatformAdminShell'
import { TenantFactory, TenantStatus } from '../types/platform'
import { PLATFORM_UPDATE_EVENT } from '../utils/platformStorage'
import { fetchTenantFactoriesAction } from '../actions'
import { ProvisionTenantModal } from '../components/ProvisionTenantModal'

export default function TenantFactoriesPage() {
  const [tenants, setTenants] = useState<TenantFactory[]>([])
  const [isLiveDatabase, setIsLiveDatabase] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | TenantStatus>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadTenants = async () => {
    setIsLoading(true)
    try {
      const res = await fetchTenantFactoriesAction()
      if (res.data) {
        setTenants(res.data)
        setIsLiveDatabase(res.isLiveDatabase)
      }
    } catch (err) {
      console.warn('Tenant factories fetch error:', err)
    } finally {
      setIsLoading(false)
    }
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
      <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto text-[#09090b]">
        
        {/* Layer 1: Breadcrumb Hierarchy Trail */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/platform-admin" className="hover:text-[#3A3564] transition-colors">
            Platform Root
          </Link>
          <span>/</span>
          <span>Tenant Management</span>
          <span>/</span>
          <span className="font-bold text-slate-900">Tenant Factories Directory</span>
        </div>

        {/* Layer 2: Encapsulated Top Header Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                  Tenant Factories Directory
                </h1>
                <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs tracking-wider">
                  {activeCount} Active Plants
                </span>
                {isLiveDatabase ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    PostgreSQL Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs tracking-wider">
                    Offline Cache
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)]">
                Authorized garment factory clients running Zigza Enterprise MES across multi-division production floors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Provision New Tenant</span>
            </button>
          </div>
        </div>

        {/* Layer 3: Executive KPI Metric Cards (Grid of 4) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          
          {/* Card 1: Total Tenants */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                STAGE 01
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Total Tenants
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Onboarded Plant Clients</div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
              <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
                {totalTenants}
              </div>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                Factories
              </span>
            </div>
          </div>

          {/* Card 2: Full 11-Division Plants */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-2xs">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                STAGE 02
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Full 11 Divisions
              </div>
              <div className="text-[11px] text-slate-400 font-medium">End-to-End Synchronized</div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
              <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-indigo-700">
                {fullAccessCount}
              </div>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                Full Plant
              </span>
            </div>
          </div>

          {/* Card 3: Active Ratio */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                STAGE 03
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Active Ratio
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Daily Active Operations</div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
              <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-emerald-700 font-mono">
                {totalTenants > 0 ? Math.round((activeCount / totalTenants) * 100) : 100}%
              </div>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {activeCount} Live
              </span>
            </div>
          </div>

          {/* Card 4: Contracted MRR */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shadow-2xs">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                STAGE 04
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Contracted MRR
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Monthly SaaS Invoicing</div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
              <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-blue-700 font-mono">
                ₹{totalMrr.toLocaleString()}
              </div>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                Monthly
              </span>
            </div>
          </div>

        </div>

        {/* Layer 4 & 5: Unified Toolbar & Data Table Container */}
        <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
          
          {/* Layer 4: Toolbar Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
            
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold pb-1 sm:pb-0">
              {(['ALL', 'ACTIVE', 'PENDING_SETUP', 'SUSPENDED'] as const).map(tab => {
                const label = tab === 'ALL' ? 'All Factories' : tab.replace('_', ' ')
                const active = statusFilter === tab
                return (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      active 
                        ? 'bg-[#3A3564] text-white shadow-2xs font-bold' 
                        : 'text-slate-600 bg-[#FAF7F0] border border-black/5 hover:bg-black/5'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search factory, slug, email, city..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
              />
            </div>
          </div>

          {/* Layer 5: Table Element */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0]">
                  <th className="py-3 px-4">Company & Slug</th>
                  <th className="py-3 px-4">Super Admin Contact</th>
                  <th className="py-3 px-4">Plant Location</th>
                  <th className="py-3 px-4">Plan & Billing</th>
                  <th className="py-3 px-4">Active Divisions</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Last Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400 font-mono text-xs">
                      No tenant factories found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm font-[family-name:var(--font-heading)]">
                          {t.companyName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                          Slug: {t.plantSlug}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="font-bold text-slate-900">
                          {t.adminName}
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          {t.adminEmail} • {t.phone}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <span>{t.cityState}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-[#3A3564]">
                          {t.subscriptionTier.replace(/_/g, ' ')}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          ₹{t.monthlyBillingInr.toLocaleString()}/mo
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-slate-800 font-bold text-[10px] border border-black/10">
                          {t.activeDivisionsCount} / 11 Units
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {t.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold uppercase border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : t.status === 'PENDING_SETUP' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-mono font-bold uppercase border border-amber-200">
                            <Clock className="w-3 h-3" />
                            Pending Setup
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-mono font-bold uppercase border border-rose-200">
                            Suspended
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-500">
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
          onSuccess={loadTenants}
        />

      </div>
    </PlatformAdminShell>
  )
}
