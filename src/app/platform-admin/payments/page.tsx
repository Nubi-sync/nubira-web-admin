'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Send,
  Building2,
  RefreshCw,
  Mail,
  Loader2,
  X,
  Sparkles,
  ShieldCheck,
  ArrowRight
} from 'lucide-react'
import { PlatformAdminShell } from '../components/PlatformAdminShell'
import { PaymentLinkRecord, PaymentDashboardMetrics, SubscriptionPlanTier } from '../types/platform'
import { fetchPaymentLinksAction, createCustomPaymentLinkAction } from '../actions'

export default function PaymentLinksPage() {
  const [links, setLinks] = useState<PaymentLinkRecord[]>([])
  const [metrics, setMetrics] = useState<PaymentDashboardMetrics>({
    totalCollectedInr: 0,
    pendingReceivablesInr: 0,
    totalLinksIssued: 0,
    paidLinksCount: 0,
    pendingLinksCount: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isLiveDatabase, setIsLiveDatabase] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'ISSUED'>('ALL')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Create link modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalCompany, setModalCompany] = useState('')
  const [modalEmail, setModalEmail] = useState('')
  const [modalName, setModalName] = useState('')
  const [modalPhone, setModalPhone] = useState('')
  const [modalAmount, setModalAmount] = useState(4999)
  const [modalTier, setModalTier] = useState<SubscriptionPlanTier>('FULL_PLANT_AI')
  const [modalDescription, setModalDescription] = useState('')
  const [modalSendEmail, setModalSendEmail] = useState(true)
  const [isCreatingLink, setIsCreatingLink] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const res = await fetchPaymentLinksAction()
      if (res.data) {
        setLinks(res.data)
        setMetrics(res.metrics)
        setIsLiveDatabase(res.isLiveDatabase)
      }
    } catch (err) {
      console.warn('Failed to fetch payment links:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  const handleCreatePaymentLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalCompany || !modalEmail || !modalAmount) {
      alert('Please fill in company, email, and amount.')
      return
    }

    setIsCreatingLink(true)
    try {
      const res = await createCustomPaymentLinkAction({
        companyName: modalCompany,
        adminEmail: modalEmail,
        adminName: modalName || modalCompany,
        phone: modalPhone,
        amountInr: Number(modalAmount),
        subscriptionTier: modalTier,
        description: modalDescription || `Custom Retainer for ${modalCompany}`,
        sendEmail: modalSendEmail
      })

      if (res.success && res.paymentLink) {
        setIsModalOpen(false)
        setModalCompany('')
        setModalEmail('')
        setModalName('')
        setModalPhone('')
        setModalAmount(4999)
        setModalDescription('')
        loadData()
      } else {
        alert(res.error || 'Failed to issue Razorpay link.')
      }
    } catch (err: any) {
      alert(err?.message || 'Error generating payment link')
    } finally {
      setIsCreatingLink(false)
    }
  }

  const filteredLinks = links.filter(l => {
    const matchesSearch =
      l.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.razorpayLinkId.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false
    if (statusFilter === 'ALL') return true
    return l.status === statusFilter
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
          <span>Financial Engine</span>
          <span>/</span>
          <span className="font-bold text-slate-900">Payment Links & Receivables</span>
        </div>

        {/* Layer 2: Encapsulated Top Header Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                  Payment Links & Billing
                </h1>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-[#FAF7F0] text-slate-700 border border-black/10">
                  Razorpay Live Gateway
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)]">
                Manage automated subscription payment links, collect UPI/Card retainers, and track client settlements
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
            <button
              type="button"
              onClick={() => loadData()}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
              title="Refresh payment links data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Issue New Payment Link</span>
            </button>
          </div>
        </div>

        {/* Layer 3: Executive Financial KPI Metric Cards (Grid of 4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Realized Collections */}
          <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Settled
              </span>
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Realized Revenue
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-emerald-950 mt-1 font-mono">
                ₹{metrics.totalCollectedInr.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
              {metrics.paidLinksCount} invoices paid via Razorpay
            </div>
          </div>

          {/* Card 2: Pending Receivables */}
          <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                Pending
              </span>
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pending Receivables
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-amber-950 mt-1 font-mono">
                ₹{metrics.pendingReceivablesInr.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
              {metrics.pendingLinksCount} active links awaiting settlement
            </div>
          </div>

          {/* Card 3: Total Links Issued */}
          <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Links</span>
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Links Generated
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1">
                {metrics.totalLinksIssued}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
              Automated & custom links
            </div>
          </div>

          {/* Card 4: Webhook Integration Status */}
          <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                Live
              </span>
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Webhook Auto-Upgrade
              </div>
              <div className="text-base font-bold text-indigo-950 mt-1">
                Instant Promotion Active
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
              payment_link.paid handler active
            </div>
          </div>

        </div>

        {/* Layer 4: Interactive Control Bar & Search Filter */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-[#3A3564] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Invoices ({links.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('PAID')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'PAID'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Settled ({metrics.paidLinksCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('ISSUED')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'ISSUED'
                    ? 'bg-white text-amber-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending ({metrics.pendingLinksCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search factory, email, link ID..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] text-slate-900"
              />
            </div>
          </div>

          {/* Table Element */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider bg-[#FAF7F0]">
                  <th className="py-3.5 px-4">Factory Client</th>
                  <th className="py-3.5 px-4">Amount & Tier</th>
                  <th className="py-3.5 px-4">Razorpay Hosted Link</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  <th className="py-3.5 px-4">Issued On</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-4"><div className="h-4 w-36 bg-slate-200 rounded" /></td>
                      <td className="py-4 px-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                      <td className="py-4 px-4"><div className="h-4 w-40 bg-slate-200 rounded" /></td>
                      <td className="py-4 px-4"><div className="h-5 w-20 bg-slate-200 rounded-md" /></td>
                      <td className="py-4 px-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                      <td className="py-4 px-4 text-right"><div className="h-8 w-16 bg-slate-200 rounded-xl ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredLinks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
                          <CreditCard className="w-6 h-6 text-[#3A3564]" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                            {searchQuery || statusFilter !== 'ALL' ? 'No Matching Payment Links' : 'No Payment Links Generated Yet'}
                          </h4>
                          <p className="text-sm text-slate-500 font-medium font-[family-name:var(--font-public-sans)] leading-relaxed">
                            {searchQuery || statusFilter !== 'ALL'
                              ? 'Try refining your search query or reset the status filter tabs above.'
                              : 'When you provision a tenant with demo access or click "Send Payment Reminder", payment links will appear here automatically.'}
                          </p>
                        </div>
                        {!searchQuery && statusFilter === 'ALL' && (
                          <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-xs cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Issue First Payment Link</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLinks.map((link) => (
                    <tr key={link.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Factory Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm font-[family-name:var(--font-heading)]">
                          {link.companyName}
                        </div>
                        <div className="text-xs font-mono text-slate-500 mt-0.5">
                          {link.adminEmail}
                        </div>
                      </td>

                      {/* Amount & Plan */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 font-mono text-sm">
                          ₹{link.amountInr.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {link.subscriptionTier.replace(/_/g, ' ')}
                        </div>
                      </td>

                      {/* Razorpay Short URL */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-[#3A3564] bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10 max-w-[200px] truncate">
                            {link.shortUrl}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(link.shortUrl, link.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer"
                            title="Copy payment link URL"
                          >
                            {copiedId === link.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <a
                            href={link.shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                            title="Open Razorpay hosted payment page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          ID: {link.razorpayLinkId}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {link.status === 'PAID' ? (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Settled / Paid
                            </span>
                            {link.paidAt && (
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                {new Date(link.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                {link.paymentMethod ? ` via ${link.paymentMethod.toUpperCase()}` : ''}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-300">
                            <Clock className="w-3.5 h-3.5" />
                            Pending Payment
                          </span>
                        )}
                      </td>

                      {/* Issued Date */}
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                        {new Date(link.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleCopy(link.shortUrl, link.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#3A3564] bg-[#FAF7F0] hover:bg-[#3A3564] hover:text-white border border-black/10 transition-all cursor-pointer shadow-2xs"
                        >
                          {copiedId === link.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === link.id ? 'Copied' : 'Copy Link'}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create Custom Payment Link */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl border border-black/10 shadow-2xl max-w-lg w-full overflow-hidden">
              
              <div className="px-6 py-5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-white text-[#3A3564] border border-black/10">
                    Razorpay Live Engine
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1 font-[family-name:var(--font-heading)]">
                    Issue Hosted Payment Link
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePaymentLink} className="p-6 space-y-4 text-sm">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Factory / Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={modalCompany}
                    onChange={(e) => setModalCompany(e.target.value)}
                    placeholder="Vardhman Textiles"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#3A3564] rounded-xl text-sm outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                      Recipient Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={modalEmail}
                      onChange={(e) => setModalEmail(e.target.value)}
                      placeholder="admin@vardhman.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#3A3564] rounded-xl text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                      Admin Contact Name
                    </label>
                    <input
                      type="text"
                      value={modalName}
                      onChange={(e) => setModalName(e.target.value)}
                      placeholder="Ashok Singhania"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#3A3564] rounded-xl text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                      Amount (INR ₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={modalAmount}
                      onChange={(e) => setModalAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#3A3564] rounded-xl text-sm font-mono font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                      Subscription Plan Tier
                    </label>
                    <select
                      value={modalTier}
                      onChange={(e) => setModalTier(e.target.value as SubscriptionPlanTier)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#3A3564] rounded-xl text-sm outline-none"
                    >
                      <option value="FULL_PLANT_AI">Full Access + AI (₹4,999)</option>
                      <option value="MODULAR">Modular Floor (₹1,999)</option>
                      <option value="CUSTOM">Custom Enterprise (₹9,999)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Purpose / Invoice Description
                  </label>
                  <input
                    type="text"
                    value={modalDescription}
                    onChange={(e) => setModalDescription(e.target.value)}
                    placeholder="Monthly subscription retainer for factory operations"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#3A3564] rounded-xl text-sm outline-none"
                  />
                </div>

                <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={modalSendEmail}
                    onChange={(e) => setModalSendEmail(e.target.checked)}
                    className="w-4 h-4 rounded text-[#3A3564] focus:ring-[#3A3564]"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Dispatch email notification with Razorpay link from noreply@zigza.in
                  </span>
                </label>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={isCreatingLink}
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isCreatingLink}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isCreatingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Generate Razorpay Link</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PlatformAdminShell>
  )
}
