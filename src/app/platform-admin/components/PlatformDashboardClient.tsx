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
  updateDemoRequestStatus,
  getPlatformMetrics,
  PLATFORM_UPDATE_EVENT
} from '../utils/platformStorage'
import {
  fetchDemoRequestsAction,
  updateDemoRequestStatusAction
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
      const res = await fetchDemoRequestsAction()
      if (res.data) {
        setDemos(res.data)
        setIsLiveDatabase(res.isLiveDatabase)

        const total = res.data.length
        const pending = res.data.filter(d => d.status === 'NEW_LEAD' || d.status === 'CONTACTED').length
        const provisioned = res.data.filter(d => d.status === 'PROVISIONED_TENANT').length
        setMetrics({
          totalDemoLeads: total,
          pendingReviewCount: pending,
          provisionedFactoriesCount: provisioned,
          activeTenantsCount: Math.max(4, provisioned + 3),
          conversionRatePercent: total > 0 ? Math.round((provisioned / total) * 100) : 0,
          totalProjectedMrrInr: 21996
        })
      }
    } catch (err) {
      console.warn('Backend fetch notice:', err)
      setDemos(getDemoRequests())
      setMetrics(getPlatformMetrics())
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
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
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Demo Leads & Access Provisioning
              </h1>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs tracking-wider">
                {demos.length} Active Leads
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)]">
              Review incoming live demo inquiries from prospective apparel factories and grant Super Admin access to the 11-division MES
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={openNewProvisionModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <Key className="w-4 h-4" />
            <span>Provision New Factory</span>
          </button>
        </div>
      </div>

      {/* Layer 3: Executive KPI Metric Cards (Grid of 4) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Metric 01: Total Leads */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Inbox className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              METRIC 01
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Total Inquiries
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Inbound Factory Leads</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
              {metrics.totalDemoLeads}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              Live Leads
            </span>
          </div>
        </div>

        {/* Metric 02: Awaiting Contact */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              METRIC 02
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Awaiting Contact
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Requires Engineer Call</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-amber-700">
              {metrics.pendingReviewCount}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Follow Up
            </span>
          </div>
        </div>

        {/* Metric 03: Active Factory Tenants */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              METRIC 03
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Active Factories
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Live On-Floor MES Units</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-emerald-700">
              {metrics.activeTenantsCount}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              11 Divisions
            </span>
          </div>
        </div>

        {/* Metric 04: Contracted MRR */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shadow-2xs">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              METRIC 04
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Contracted MRR
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Recurring SaaS Billing</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-blue-700 font-mono">
              ₹{metrics.totalProjectedMrrInr.toLocaleString()}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              Monthly
            </span>
          </div>
        </div>

      </div>

      {/* Layer 4 & 5: Unified Toolbar & Primary Data Table Container */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        
        {/* Layer 4: Toolbar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold pb-1 sm:pb-0">
            {(['ALL', 'NEW_LEAD', 'CONTACTED', 'DEMO_SCHEDULED', 'PROVISIONED_TENANT', 'ARCHIVED'] as const).map(tab => {
              const label = tab === 'ALL' ? 'All Leads' : tab.replace(/_/g, ' ')
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
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search leads, plant, email, phone..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
            />
          </div>
        </div>

        {/* Layer 5: Primary Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0]">
                <th className="py-3 px-4">Applicant & Company</th>
                <th className="py-3 px-4">Contact Channels</th>
                <th className="py-3 px-4">Plant Location</th>
                <th className="py-3 px-4">Requested Plan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submission Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredDemos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-mono text-xs">
                    No demo requests found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredDemos.map((item) => {
                  const whatsappCleanPhone = item.phone.replace(/[^0-9]/g, '')
                  const whatsappMsg = `Hi ${item.applicantName}, I am reaching out from Zigza MES regarding your live demo request for ${item.companyName}. When would be a good time for a 20-minute floor walkthrough?`
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
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                          <Phone className="w-3 h-3 text-[#3A3564]" />
                          <span>{item.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[160px]">{item.email}</span>
                        </div>
                      </td>

                      {/* City & State */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-700 font-medium">
                          {item.cityState || 'India'}
                        </span>
                      </td>

                      {/* Preferred Plan */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-[#3A3564]">
                          {item.preferredPlan ? item.preferredPlan.replace(/_/g, ' ') : 'FULL PLANT AI'}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as DemoRequestStatus)}
                          className={`text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border cursor-pointer outline-none ${
                            item.status === 'NEW_LEAD'
                              ? 'bg-indigo-50 text-[#3A3564] border-indigo-200'
                              : item.status === 'CONTACTED'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : item.status === 'DEMO_SCHEDULED'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : item.status === 'PROVISIONED_TENANT'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="NEW_LEAD">New Lead</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="DEMO_SCHEDULED">Demo Scheduled</option>
                          <option value="PROVISIONED_TENANT">Provisioned</option>
                          <option value="ARCHIVED">Archived</option>
                        </select>
                      </td>

                      {/* Submitted At */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(item.submittedAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Chat via WhatsApp"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => openProvisionModal(item)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-[11px] font-mono font-bold transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer active:scale-[0.98]"
                          >
                            <Key className="w-3 h-3" />
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
