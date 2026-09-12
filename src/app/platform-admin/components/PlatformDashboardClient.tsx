'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Inbox,
  Building2,
  Key,
  Activity,
  ShieldCheck,
  Search,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Zap,
  Layers,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react'
import { DemoRequestInquiry, DemoRequestStatus, PlatformMetrics } from '../types/platform'
import {
  getDemoRequests,
  updateDemoRequestStatus,
  getPlatformMetrics,
  PLATFORM_UPDATE_EVENT
} from '../utils/platformStorage'
import { ProvisionTenantModal } from './ProvisionTenantModal'

export function PlatformDashboardClient() {
  const [demos, setDemos] = useState<DemoRequestInquiry[]>([])
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

  const loadData = () => {
    setDemos(getDemoRequests())
    setMetrics(getPlatformMetrics())
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

  const handleStatusChange = (id: string, newStatus: DemoRequestStatus) => {
    updateDemoRequestStatus(id, newStatus)
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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
      
      {/* Top Banner */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="font-extrabold text-[#3A3564]">
              Zigza Platform Super Admin
            </span>
            <span className="text-slate-300">/</span>
            <span>Infrastructure & Tenant Provisioning Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
            Demo Leads & Access Provisioning
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-600 mt-0.5">
            Review incoming live demo inquiries from prospective apparel factories and grant Super Admin access to the 11-division MES
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={openNewProvisionModal}
            className="px-4 py-2.5 rounded-xl bg-[#3A3564] text-white text-xs font-mono font-bold hover:bg-[#2c284e] transition-all shadow-2xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Key className="w-4 h-4" />
            <span>Provision New Factory</span>
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Total Demo Inquiries
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            {metrics.totalDemoLeads} <span className="text-sm font-normal text-slate-500">Leads</span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            Submitted from introductory site
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Pending First Review
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-600">
            {metrics.pendingReviewCount} <span className="text-sm font-normal text-slate-500">New</span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            Awaiting WhatsApp/Call contact
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Provisioned Tenants
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700">
            {metrics.provisionedFactoriesCount} <span className="text-sm font-normal text-slate-500">Plants</span>
          </div>
          <p className="text-[11px] font-mono text-emerald-700 mt-1">
            {metrics.activeTenantsCount} Currently Active on MES
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Active Monthly ARR/MRR
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-700">
            ₹{metrics.totalProjectedMrrInr.toLocaleString()}
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            Conversion rate: {metrics.conversionRatePercent}%
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
            placeholder="Search by applicant, company name, phone, email, or city..."
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'NEW_LEAD', 'CONTACTED', 'DEMO_SCHEDULED', 'PROVISIONED_TENANT'] as const).map(tab => {
            const label = tab === 'ALL' ? 'All Inquiries' : tab.replace('_', ' ')
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

      {/* Demo Leads Manifest Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-black/10 font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Applicant & Company</th>
                <th className="py-3 px-4">Contact Channels</th>
                <th className="py-3 px-4">Location & Plant Size</th>
                <th className="py-3 px-4">Requested Plan</th>
                <th className="py-3 px-4">Submission Time</th>
                <th className="py-3 px-4">Inquiry Status</th>
                <th className="py-3 px-4 text-right">Infrastructure Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-medium text-slate-800">
              {filteredDemos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-mono text-xs">
                    No demo request inquiries match your search filter.
                  </td>
                </tr>
              ) : (
                filteredDemos.map(d => {
                  const cleanPhone = d.phone.replace(/[^0-9]/g, '')
                  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${d.applicantName}, this is Sumit from Zigza MES regarding your live demo request for ${d.companyName}.`)}`
                  const isProvisioned = d.status === 'PROVISIONED_TENANT'

                  return (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {d.companyName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          Contact: {d.applicantName}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:underline inline-flex items-center gap-1"
                            title="Chat on WhatsApp"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{d.phone}</span>
                          </a>
                        </div>
                        <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{d.email}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">
                          {d.cityState || 'India'}
                        </div>
                        {d.estimatedMachines && (
                          <div className="text-[10px] font-mono text-slate-500">
                            ~{d.estimatedMachines} Machines
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase border ${
                          d.preferredPlan === 'FULL_PLANT_AI'
                            ? 'bg-[#3A3564]/10 text-[#3A3564] border-[#3A3564]/20'
                            : d.preferredPlan === 'MODULAR'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {d.preferredPlan.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {new Date(d.submittedAt).toLocaleDateString()} • {new Date(d.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={d.status}
                          onChange={(e) => handleStatusChange(d.id, e.target.value as DemoRequestStatus)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border cursor-pointer ${
                            d.status === 'NEW_LEAD'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : d.status === 'CONTACTED'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : d.status === 'DEMO_SCHEDULED'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : d.status === 'PROVISIONED_TENANT'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value="NEW_LEAD">New Lead</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="DEMO_SCHEDULED">Demo Scheduled</option>
                          <option value="PROVISIONED_TENANT">Provisioned</option>
                          <option value="ARCHIVED">Archived</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {!isProvisioned ? (
                          <button
                            onClick={() => openProvisionModal(d)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#3A3564] hover:bg-[#2c284e] text-white text-xs font-mono font-bold transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>Provision Super Admin</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-mono font-bold text-emerald-700 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Live Tenant ({d.provisionedTenantId || 'Active'})</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <ProvisionTenantModal
        isOpen={isProvisionModalOpen}
        onClose={() => setIsProvisionModalOpen(false)}
        inquiry={selectedInquiry}
      />

    </div>
  )
}
