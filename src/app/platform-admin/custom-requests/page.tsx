'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Search,
  Phone,
  Mail,
  Key,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Cpu,
  MapPin,
  FileText,
  Filter,
  Check,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import { PlatformAdminShell } from '../components/PlatformAdminShell'
import { DemoRequestInquiry, DemoRequestStatus } from '../types/platform'
import { fetchDemoRequestsAction, updateDemoRequestStatusAction } from '../actions'
import { ProvisionTenantModal } from '../components/ProvisionTenantModal'

export default function CustomEnterpriseRequestsPage() {
  const [requests, setRequests] = useState<DemoRequestInquiry[]>([])
  const [isLiveDatabase, setIsLiveDatabase] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | DemoRequestStatus>('ALL')
  const [selectedInquiryForProvision, setSelectedInquiryForProvision] = useState<DemoRequestInquiry | null>(null)
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const res = await fetchDemoRequestsAction()
      if (res.data) {
        // Filter specifically for CUSTOM enterprise inquiries
        const customOnly = res.data.filter(item => item.preferredPlan === 'CUSTOM')
        setRequests(customOnly)
        setIsLiveDatabase(res.isLiveDatabase)
      }
    } catch (err) {
      console.warn('Custom enterprise inquiries fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleStatusChange = async (id: string, newStatus: DemoRequestStatus) => {
    setUpdatingId(id)
    try {
      const res = await updateDemoRequestStatusAction(id, newStatus)
      if (res.success) {
        setRequests(prev =>
          prev.map(r => (r.id === id ? { ...r, status: newStatus } : r))
        )
      } else {
        alert(res.error || 'Failed to update request status')
      }
    } catch (err) {
      console.error('Status update failed:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const openProvisionModal = (inquiry: DemoRequestInquiry) => {
    setSelectedInquiryForProvision(inquiry)
    setIsProvisionModalOpen(true)
  }

  const filteredRequests = requests.filter(req => {
    const matchesSearch =
      req.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.cityState && req.cityState.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (req.notes && req.notes.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Metrics
  const totalCount = requests.length
  const newCount = requests.filter(r => r.status === 'NEW_LEAD').length
  const contactedCount = requests.filter(r => r.status === 'CONTACTED' || r.status === 'DEMO_SCHEDULED').length
  const provisionedCount = requests.filter(r => r.status === 'PROVISIONED_TENANT').length

  const getStatusBadge = (status: DemoRequestStatus) => {
    switch (status) {
      case 'NEW_LEAD':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>New Inquiry</span>
          </span>
        )
      case 'CONTACTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            <span>In Discussion</span>
          </span>
        )
      case 'DEMO_SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
            <span>Walkthrough Scheduled</span>
          </span>
        )
      case 'PROVISIONED_TENANT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>Tenant Provisioned</span>
          </span>
        )
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Archived
          </span>
        )
      default:
        return null
    }
  }

  return (
    <PlatformAdminShell userEmail="admin@zigza.in">
      <div className="p-4 sm:p-6 md:p-8 space-y-5 max-w-7xl w-full mx-auto text-[#09090b]">
        
        {/* Layer 1: Breadcrumb Hierarchy */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/platform-admin" className="hover:text-[#3A3564] transition-colors">
            Platform Root
          </Link>
          <span>/</span>
          <span className="font-bold text-slate-900">Custom Enterprise Requests</span>
        </div>

        {/* Layer 2: Top Header Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                  Custom Enterprise Requests
                </h1>
                <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#3A3564] text-white shadow-2xs">
                  Bespoke Pipeline
                </span>
                {isLiveDatabase && (
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Live Supabase Hook
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)]">
                Manage inbound client requests for custom machinery integrations, proprietary SAP/Oracle bridges, and bespoke floor architecture
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-black/10 hover:bg-slate-100 transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Layer 3: Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block">
              Total Inquiries
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 mt-1.5">
              {totalCount}
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              Bespoke builds requested
            </span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs">
            <span className="text-xs font-mono font-bold text-amber-700 uppercase tracking-wider block">
              Pending Review
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-600 mt-1.5">
              {newCount}
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              Awaiting architecture call
            </span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs">
            <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-wider block">
              In Discussion
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-600 mt-1.5">
              {contactedCount}
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              Active engineering scoping
            </span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs">
            <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider block">
              Custom Factories
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 mt-1.5">
              {provisionedCount}
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              Tenants provisioned
            </span>
          </div>
        </div>

        {/* Layer 4: Search & Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search company, plant head, requirements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <span className="text-xs font-mono text-slate-500 mr-1 hidden sm:inline">Status:</span>
            {(['ALL', 'NEW_LEAD', 'CONTACTED', 'DEMO_SCHEDULED', 'PROVISIONED_TENANT'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 ${
                  statusFilter === st
                    ? 'bg-[#3A3564] text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {st === 'ALL' ? 'All' : st === 'NEW_LEAD' ? 'New' : st === 'PROVISIONED_TENANT' ? 'Provisioned' : st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Layer 5: Inbound Custom Requests Cards */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-black/10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] border border-black/10 text-[#3A3564] flex items-center justify-center mx-auto shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
              No Custom Enterprise Requests Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Inquiries from clients requesting bespoke hardware, machine telemetry, or customized floor divisions will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req) => {
              const cleanDigits = req.phone.replace(/\D/g, '')
              const whatsappLink = `https://wa.me/${cleanDigits.startsWith('91') ? cleanDigits : `91${cleanDigits}`}?text=${encodeURIComponent(`Hi ${req.applicantName}, I am reaching out from Zigza MES regarding your Custom Enterprise Build inquiry for ${req.companyName}. When would be convenient for an architectural walkthrough?`)}`
              const mailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(req.email)}&su=${encodeURIComponent(`Zigza MES Custom Build Scope - ${req.companyName}`)}&body=${encodeURIComponent(`Hi ${req.applicantName},\n\nThank you for reaching out regarding custom engineering on Zigza MES for ${req.companyName}.\n\nWe have reviewed your requirements:\n"${req.notes || 'Custom Enterprise Build'}"\n\nLet us connect to outline the technical integration roadmap.\n\nBest regards,\nPlatform Engineering Team\nZigza MES`)}`

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden transition-all hover:border-[#3A3564]/30"
                >
                  <div className="p-5 sm:p-6 space-y-4">
                    
                    {/* Card Top Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                            Custom Build Inquiry
                          </span>
                          {getStatusBadge(req.status)}
                          <span className="text-xs font-mono text-slate-400">
                            ID: {req.id.slice(0, 8)}
                          </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1 font-[family-name:var(--font-heading)]">
                          {req.companyName}
                        </h2>
                        <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 flex-wrap font-medium">
                          <span>Contact: <strong>{req.applicantName}</strong></span>
                          {req.cityState && (
                            <span className="inline-flex items-center gap-1 text-slate-500">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{req.cityState}</span>
                            </span>
                          )}
                          {req.estimatedMachines ? (
                            <span className="inline-flex items-center gap-1 text-slate-500">
                              <Cpu className="w-3.5 h-3.5" />
                              <span>{req.estimatedMachines} Machines Floor Scale</span>
                            </span>
                          ) : null}
                          <span className="inline-flex items-center gap-1 text-slate-400 font-mono">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{new Date(req.submittedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          </span>
                        </div>
                      </div>

                      {/* Top Right Action: Provision Custom Factory */}
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <button
                          type="button"
                          onClick={() => openProvisionModal(req)}
                          className="px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold font-mono transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Provision Custom Factory</span>
                        </button>
                      </div>
                    </div>

                    {/* Requirements & Scope Details */}
                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                        Client Scope & Bespoke Requirements:
                      </span>
                      <div className="bg-[#FAF7F0] p-4 rounded-xl border border-black/10 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {req.notes || 'Client requested Custom Enterprise Build without detailed notes.'}
                      </div>
                    </div>

                    {/* Card Bottom Row: Contact & Status Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>WhatsApp {req.phone}</span>
                          <ExternalLink className="w-3 h-3 text-emerald-600" />
                        </a>

                        <a
                          href={mailLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5 text-[#3A3564]" />
                          <span>Email {req.email}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </div>

                      {/* Quick Workflow Status Buttons */}
                      <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
                        <span className="text-[11px] font-mono text-slate-500">Update Status:</span>
                        {req.status !== 'CONTACTED' && (
                          <button
                            type="button"
                            disabled={updatingId === req.id}
                            onClick={() => handleStatusChange(req.id, 'CONTACTED')}
                            className="px-2.5 py-1 rounded-lg border border-black/10 hover:bg-slate-50 text-[11px] font-mono font-bold text-slate-700 transition-colors cursor-pointer"
                          >
                            Mark In Discussion
                          </button>
                        )}
                        {req.status !== 'DEMO_SCHEDULED' && (
                          <button
                            type="button"
                            disabled={updatingId === req.id}
                            onClick={() => handleStatusChange(req.id, 'DEMO_SCHEDULED')}
                            className="px-2.5 py-1 rounded-lg border border-black/10 hover:bg-slate-50 text-[11px] font-mono font-bold text-slate-700 transition-colors cursor-pointer"
                          >
                            Walkthrough Scheduled
                          </button>
                        )}
                        {req.status !== 'ARCHIVED' && (
                          <button
                            type="button"
                            disabled={updatingId === req.id}
                            onClick={() => handleStatusChange(req.id, 'ARCHIVED')}
                            className="px-2.5 py-1 rounded-lg border border-black/10 hover:bg-rose-50 hover:text-rose-700 text-[11px] font-mono font-bold text-slate-500 transition-colors cursor-pointer"
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Provisioning Modal */}
        <ProvisionTenantModal
          isOpen={isProvisionModalOpen}
          onClose={() => setIsProvisionModalOpen(false)}
          inquiry={selectedInquiryForProvision}
          onSuccess={loadData}
        />

      </div>
    </PlatformAdminShell>
  )
}
