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
  Globe,
  Eye
} from 'lucide-react'
import { PlatformAdminShell } from '../components/PlatformAdminShell'
import { TenantFactory, TenantStatus } from '../types/platform'
import { PLATFORM_UPDATE_EVENT } from '../utils/platformStorage'
import { fetchTenantFactoriesAction } from '../actions'
import { ProvisionTenantModal } from '../components/ProvisionTenantModal'
import { TenantDetailModal } from '../components/TenantDetailModal'
import { ENTERPRISE_DIVISIONS_CATALOG } from '../data/initialPlatformData'

export default function TenantFactoriesPage() {
  const [tenants, setTenants] = useState<TenantFactory[]>([])
  const [isLiveDatabase, setIsLiveDatabase] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | TenantStatus>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTenantForView, setSelectedTenantForView] = useState<TenantFactory | null>(null)

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
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                  Tenant Factories Directory
                </h1>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-[#FAF7F0] text-slate-700 border border-black/10">
                  {activeCount} {activeCount === 1 ? 'active plant' : 'active plants'}
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)]">
                Garment factory clients running Zigza Enterprise MES across multi-division production floors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Provision New Tenant</span>
            </button>
          </div>
        </div>

        {/* Layer 3: Executive KPI Metric Cards (Grid of 4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Tenants */}
          <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Directory</span>
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Tenants
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1">
                {totalTenants}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
              Onboarded plant clients
            </div>
          </div>

          {/* Card 2: Full 11-Division Plants */}
          <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Full Stack</span>
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Full {ENTERPRISE_DIVISIONS_CATALOG.length} Divisions
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1">
                {fullAccessCount}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
              Synchronized plant units
            </div>
          </div>

          {/* Card 3: Active Ratio */}
          <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Utilization</span>
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Ratio
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1 font-mono">
                {totalTenants > 0 ? Math.round((activeCount / totalTenants) * 100) : 0}%
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
              {activeCount} active operational floors
            </div>
          </div>

          {/* Card 4: Contracted MRR */}
          <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Billing</span>
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Contracted MRR
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1 font-mono">
                ₹{totalMrr.toLocaleString()}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
              Monthly SaaS invoicing
            </div>
          </div>

        </div>

        {/* Layer 4 & 5: Unified Toolbar & Data Table Container */}
        <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
          
          {/* Layer 4: Toolbar Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
            
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-sm pb-1 sm:pb-0">
              {(['ALL', 'ACTIVE', 'PENDING_SETUP', 'SUSPENDED'] as const).map(tab => {
                const label = tab === 'ALL' ? 'All Factories' : tab.replace('_', ' ')
                const active = statusFilter === tab
                return (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer text-sm ${
                      active 
                        ? 'bg-[#3A3564] text-white shadow-2xs font-semibold' 
                        : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 font-medium'
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
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] text-slate-900"
              />
            </div>
          </div>

          {/* Layer 5: Table Element */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider bg-[#FAF7F0]">
                  <th className="py-3.5 px-4">Factory & Location</th>
                  <th className="py-3.5 px-4">Super Admin</th>
                  <th className="py-3.5 px-4">Plan Tier</th>
                  <th className="py-3.5 px-4">Divisions</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-4">
                        <div className="h-4 w-36 bg-slate-200 rounded mb-1.5" />
                        <div className="h-3 w-28 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-28 bg-slate-200 rounded mb-1.5" />
                        <div className="h-3 w-36 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-5 w-24 bg-slate-200 rounded-md" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-20 bg-slate-200 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-5 w-20 bg-slate-200 rounded-md" />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="h-8 w-20 bg-slate-200 rounded-xl ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
                          <Building2 className="w-6 h-6 text-[#3A3564]" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                            {searchQuery || statusFilter !== 'ALL' ? 'No Matching Factories Found' : 'No Tenant Factories Provisioned Yet'}
                          </h4>
                          <p className="text-sm text-slate-500 font-medium font-[family-name:var(--font-public-sans)] leading-relaxed">
                            {searchQuery || statusFilter !== 'ALL'
                              ? 'Try searching with a different term or resetting the status filter tabs.'
                              : 'Click "Provision New Tenant" above to issue Super Admin credentials and allocate production units to your first apparel client.'}
                          </p>
                        </div>
                        {!searchQuery && statusFilter === 'ALL' && (
                          <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-xs cursor-pointer transition-all active:scale-[0.98]"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Provision First Client Factory</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map(t => (
                    <tr 
                      key={t.id} 
                      onClick={() => setSelectedTenantForView(t)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* 1. Factory & Location */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm font-[family-name:var(--font-heading)] group-hover:text-[#3A3564] transition-colors">
                          {t.companyName}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                          <span className="bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10 text-slate-700 font-medium font-mono text-[11px]">
                            {t.plantSlug}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                            {t.cityState}
                          </span>
                        </div>
                      </td>

                      {/* 2. Super Admin Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-sm">
                          {t.adminName}
                        </div>
                        <div className="text-xs font-mono text-slate-500 mt-0.5 truncate max-w-[220px]">
                          {t.adminEmail}
                        </div>
                      </td>

                      {/* 3. Plan & Tier */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block font-semibold text-xs text-[#3A3564] bg-[#FAF7F0] border border-black/10 px-2 py-0.5 rounded-md">
                          {t.subscriptionTier.replace(/_/g, ' ')}
                        </span>
                        <div className="text-xs text-slate-500 mt-1 font-mono">
                          ₹{t.monthlyBillingInr.toLocaleString()}/mo
                        </div>
                      </td>

                      {/* 4. Active Divisions */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-[#FAF7F0] text-slate-800 font-medium text-xs border border-black/10 inline-flex items-center gap-1.5">
                          {t.activeDivisionsCount} of {ENTERPRISE_DIVISIONS_CATALOG.length} divisions
                        </span>
                      </td>

                      {/* 5. Operational Status */}
                      <td className="py-3.5 px-4">
                        {t.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : t.status === 'PENDING_SETUP' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200">
                            <Clock className="w-3.5 h-3.5" />
                            Pending Setup
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                            Suspended
                          </span>
                        )}
                      </td>

                      {/* 6. Action Button (Eye Icon / View More) */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTenantForView(t)
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#3A3564] bg-[#FAF7F0] hover:bg-[#3A3564] hover:text-white border border-black/10 transition-all cursor-pointer shadow-2xs group-hover:border-[#3A3564]/30 active:scale-95"
                          title={`View complete dossier for ${t.companyName}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Provision New Factory */}
        <ProvisionTenantModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          inquiry={null}
          onSuccess={loadTenants}
        />

        {/* Modal: Comprehensive Factory Details Dialog */}
        <TenantDetailModal
          isOpen={!!selectedTenantForView}
          onClose={() => setSelectedTenantForView(null)}
          tenant={selectedTenantForView}
          onTenantUpdated={(updated) => {
            setTenants(prev => prev.map(t => t.id === updated.id ? updated : t))
            setSelectedTenantForView(updated)
          }}
        />

      </div>
    </PlatformAdminShell>
  )
}
