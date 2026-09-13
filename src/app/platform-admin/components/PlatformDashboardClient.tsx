'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Inbox,
  Building2,
  Key,
  Clock,
  Zap,
  Search,
  Phone,
  Mail,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Send
} from 'lucide-react'
import { DemoRequestInquiry, DemoRequestStatus, PlatformMetrics } from '../types/platform'
import {
  getDemoRequests,
  getTenantFactories,
  updateDemoRequestStatus,
  PLATFORM_UPDATE_EVENT,
  clearAllPlatformData
} from '../utils/platformStorage'
import {
  fetchDemoRequestsAction,
  updateDemoRequestStatusAction,
  fetchTenantFactoriesAction
} from '../actions'
import { ProvisionTenantModal } from './ProvisionTenantModal'

export function PlatformDashboardClient() {
  const [demos, setDemos] = useState<DemoRequestInquiry[]>([])
  const [isLiveDatabase, setIsLiveDatabase] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    totalDemoLeads: 0,
    pendingReviewCount: 0,
    provisionedFactoriesCount: 0,
    activeTenantsCount: 0,
    conversionRatePercent: 0,
    totalProjectedMrrInr: 0
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | DemoRequestStatus>('ALL')
  const [selectedInquiry, setSelectedInquiry] = useState<DemoRequestInquiry | null>(null)
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [demosRes, tenantsRes] = await Promise.all([
        fetchDemoRequestsAction(),
        fetchTenantFactoriesAction()
      ])

      const demoList = demosRes.data || []
      const tenantList = tenantsRes.data || []

      setDemos(demoList)
      setIsLiveDatabase(demosRes.isLiveDatabase)

      const total = demoList.length
      const pending = demoList.filter(d => d.status === 'NEW_LEAD' || d.status === 'CONTACTED').length
      const provisioned = demoList.filter(d => d.status === 'PROVISIONED_TENANT').length
      const activeTenants = tenantList.filter(t => t.status === 'ACTIVE').length
      const totalMrr = tenantList.reduce((acc, t) => acc + (t.monthlyBillingInr || 0), 0)

      setMetrics({
        totalDemoLeads: total,
        pendingReviewCount: pending,
        provisionedFactoriesCount: tenantList.length,
        activeTenantsCount: activeTenants,
        conversionRatePercent: total > 0 ? Math.round((provisioned / total) * 100) : 0,
        totalProjectedMrrInr: totalMrr
      })
    } catch (err) {
      console.warn('Backend fetch notice:', err)
      const fallbackDemos = getDemoRequests()
      const fallbackTenants = getTenantFactories()
      setDemos(fallbackDemos)
      setMetrics({
        totalDemoLeads: fallbackDemos.length,
        pendingReviewCount: fallbackDemos.filter(d => d.status === 'NEW_LEAD').length,
        provisionedFactoriesCount: fallbackTenants.length,
        activeTenantsCount: fallbackTenants.filter(t => t.status === 'ACTIVE').length,
        conversionRatePercent: fallbackDemos.length > 0 ? 100 : 0,
        totalProjectedMrrInr: fallbackTenants.reduce((acc, t) => acc + (t.monthlyBillingInr || 0), 0)
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Purge any lingering old mock entries from client localStorage
    if (typeof window !== 'undefined') {
      try {
        const rawDemos = localStorage.getItem('zigza_platform_demo_requests_v1')
        if (rawDemos && (rawDemos.includes('demo-101') || rawDemos.includes('Tirupur Knitwear') || rawDemos.includes('b0000000'))) {
          localStorage.removeItem('zigza_platform_demo_requests_v1')
        }
        const rawTenants = localStorage.getItem('zigza_platform_tenants_v1')
        if (rawTenants && (rawTenants.includes('ten-01') || rawTenants.includes('Vardhman') || rawTenants.includes('c0000000'))) {
          localStorage.removeItem('zigza_platform_tenants_v1')
        }
      } catch (_) {}
    }
    loadData()
    const handleUpdate = () => loadData()
    window.addEventListener(PLATFORM_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(PLATFORM_UPDATE_EVENT, handleUpdate)
  }, [])

  const filteredDemos = demos.filter(d => {
    const matchesSearch =
      d.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.phone.includes(searchQuery) ||
      (d.cityState && d.cityState.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false
    if (statusFilter === 'ALL') return true
    return d.status === statusFilter
  })

  const handleStatusChange = async (id: string, newStatus: DemoRequestStatus) => {
    setDemos(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d))
    updateDemoRequestStatus(id, newStatus)
    await updateDemoRequestStatusAction(id, newStatus)
  }

  const openProvisionModal = (inquiry: DemoRequestInquiry) => {
    setSelectedInquiry(inquiry)
    setIsProvisionModalOpen(true)
  }

  const openNewProvisionModal = () => {
    setSelectedInquiry(null)
    setIsProvisionModalOpen(true)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto text-[#09090b]">
      
      {/* Layer 1: Breadcrumb Hierarchy Trail */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link href="/platform-admin" className="hover:text-[#3A3564] transition-colors">
          Platform Root
        </Link>
        <span>/</span>
        <span>Platform Command</span>
        <span>/</span>
        <span className="font-bold text-slate-900">Demo Leads & Access Provisioning</span>
      </div>

      {/* Layer 2: Encapsulated Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Demo Leads & Inquiries
              </h1>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-[#FAF7F0] text-slate-700 border border-black/10">
                {demos.length} {demos.length === 1 ? 'lead recorded' : 'leads recorded'}
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)]">
              Review incoming factory inquiries and provision access to the 11-division MES
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={openNewProvisionModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <Key className="w-4 h-4" />
            <span>Provision New Factory</span>
          </button>
        </div>
      </div>

      {/* Layer 3: Executive KPI Metric Cards (Grid of 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 01: Total Leads */}
        <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
              <Inbox className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-500 font-medium">Inbound</span>
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Inquiries
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1">
              {metrics.totalDemoLeads}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
            Factory lead pipeline
          </div>
        </div>

        {/* Metric 02: Awaiting Contact */}
        <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-500 font-medium">Pending</span>
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Awaiting Contact
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1">
              {metrics.pendingReviewCount}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
            Requires engineer call
          </div>
        </div>

        {/* Metric 03: Active Factory Tenants */}
        <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-500 font-medium">Active</span>
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Factories
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1">
              {metrics.activeTenantsCount}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
            Live on-floor MES units
          </div>
        </div>

        {/* Metric 04: Contracted MRR */}
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
              ₹{metrics.totalProjectedMrrInr.toLocaleString()}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
            Monthly recurring SaaS
          </div>
        </div>

      </div>

      {/* Layer 4 & 5: Unified Toolbar & Primary Data Table Container */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        
        {/* Layer 4: Toolbar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-sm pb-1 sm:pb-0">
            {(['ALL', 'NEW_LEAD', 'CONTACTED', 'DEMO_SCHEDULED', 'PROVISIONED_TENANT', 'ARCHIVED'] as const).map(tab => {
              const label = tab === 'ALL' ? 'All Leads' : tab.replace(/_/g, ' ')
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
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search leads, plant, email, phone..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] text-slate-900"
            />
          </div>
        </div>

        {/* Layer 5: Primary Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider bg-[#FAF7F0]">
                <th className="py-3.5 px-4">Applicant & Company</th>
                <th className="py-3.5 px-4">Contact Channels</th>
                <th className="py-3.5 px-4">Plant Location</th>
                <th className="py-3.5 px-4">Requested Plan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Submission Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredDemos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
                        <Inbox className="w-6 h-6 text-[#3A3564]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                          {searchQuery || statusFilter !== 'ALL' ? 'No Matching Leads Found' : 'No Inbound Demo Inquiries Yet'}
                        </h4>
                        <p className="text-sm text-slate-500 font-medium font-[family-name:var(--font-public-sans)] leading-relaxed">
                          {searchQuery || statusFilter !== 'ALL'
                            ? 'Try adjusting your search query or switching status filter tabs.'
                            : 'Prospective factory clients who submit the "Request Live Demo" form on your website will appear here in real-time.'}
                        </p>
                      </div>
                      {!searchQuery && statusFilter === 'ALL' && (
                        <button
                          type="button"
                          onClick={openNewProvisionModal}
                          className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-xs cursor-pointer transition-all active:scale-[0.98]"
                        >
                          <Key className="w-4 h-4" />
                          <span>Provision Factory Directly</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDemos.map((item) => {
                  const whatsappCleanPhone = item.phone.replace(/[^0-9]/g, '')
                  const whatsappMsg = `Hi ${item.applicantName}, I am reaching out from Zigza MES regarding your live demo request for ${item.companyName}. When would be a good time for a personalized floor walkthrough?`
                  const whatsappUrl = `https://wa.me/${whatsappCleanPhone}?text=${encodeURIComponent(whatsappMsg)}`

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      
                      {/* Company & Applicant */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm font-[family-name:var(--font-heading)]">
                          {item.companyName}
                        </div>
                        <div className="text-xs text-slate-600 font-medium font-[family-name:var(--font-public-sans)] mt-0.5">
                          {item.applicantName}
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4 text-xs font-mono">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <Phone className="w-3.5 h-3.5 text-[#3A3564]" />
                          <span>{item.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[160px]">{item.email}</span>
                        </div>
                      </td>

                      {/* City & State */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-700 font-medium text-sm">
                          {item.cityState || 'India'}
                        </span>
                      </td>

                      {/* Preferred Plan */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-xs text-[#3A3564]">
                          {item.preferredPlan ? item.preferredPlan.replace(/_/g, ' ') : 'FULL PLANT AI'}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as DemoRequestStatus)}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 cursor-pointer outline-none focus:border-[#3A3564]"
                        >
                          <option value="NEW_LEAD">New Lead</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="DEMO_SCHEDULED">Demo Scheduled</option>
                          <option value="PROVISIONED_TENANT">Provisioned</option>
                          <option value="ARCHIVED">Archived</option>
                        </select>
                      </td>

                      {/* Submitted At */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(item.submittedAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Chat via WhatsApp"
                            className="p-2 rounded-lg bg-[#FAF7F0] text-[#3A3564] hover:bg-black/5 border border-black/10 transition-colors cursor-pointer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => openProvisionModal(item)}
                            className="px-3 py-1.5 rounded-lg bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-semibold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>Provision</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provisioning Modal */}
      <ProvisionTenantModal
        isOpen={isProvisionModalOpen}
        onClose={() => setIsProvisionModalOpen(false)}
        inquiry={selectedInquiry}
        onSuccess={loadData}
      />

    </div>
  )
}
