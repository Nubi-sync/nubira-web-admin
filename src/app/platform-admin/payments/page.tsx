'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  RefreshCw,
  Mail,
  Loader2,
  X,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Sparkles,
  Zap,
  Lock,
  ArrowRight,
  Eye,
  Plus,
  Sliders,
  Phone
} from 'lucide-react'
import { PlatformAdminShell } from '../components/PlatformAdminShell'
import { TenantFactory, SubscriptionPlanTier, AccessType } from '../types/platform'
import {
  fetchTenantFactoriesAction,
  sendPaymentReminderAction,
  extendTenantExpiryAction,
  upgradeTenantToFullAccessAction,
  revokeTenantAccessAction,
  reactivateTenantAccessAction
} from '../actions'

export default function SubscriptionsAndExpiryPage() {
  const [tenants, setTenants] = useState<TenantFactory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'ALL' | 'DEMO_TRIAL' | 'EXPIRING_SOON' | 'EXPIRED' | 'FULL_ACCESS'>('ALL')
  const [isPending, startTransition] = useTransition()
  
  // Feedback alerts
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Selected Tenant for "View More / Manage" Modal
  const [selectedTenant, setSelectedTenant] = useState<TenantFactory | null>(null)
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  
  // Modal Action States
  const [customDaysToAdd, setCustomDaysToAdd] = useState(30)
  const [upgradeTier, setUpgradeTier] = useState<SubscriptionPlanTier>('FULL_PLANT_AI')
  const [upgradeDurationMonths, setUpgradeDurationMonths] = useState(1)

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type })
    setTimeout(() => setToastMsg(null), 4000)
  }

  const loadData = async () => {
    setIsLoading(true)
    try {
      const res = await fetchTenantFactoriesAction()
      if (res.data) {
        setTenants(res.data)
      }
    } catch (err) {
      console.warn('Failed to fetch tenant factories:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Time calculations
  const now = Date.now()

  const getDaysLeft = (tenant: TenantFactory) => {
    if (!tenant.expiresAt) return null
    const expTime = new Date(tenant.expiresAt).getTime()
    return Math.ceil((expTime - now) / (1000 * 60 * 60 * 24))
  }

  const isTenantExpired = (tenant: TenantFactory) => {
    if (tenant.status === 'SUSPENDED') return true
    if (!tenant.expiresAt) return false
    return new Date(tenant.expiresAt).getTime() < now
  }

  // Metrics
  const totalTenantsCount = tenants.length
  const demoTrialsCount = tenants.filter(t => t.accessType === 'DEMO_TRIAL').length
  const expiringSoonCount = tenants.filter(t => {
    const days = getDaysLeft(t)
    return days !== null && days >= 0 && days <= 3 && !isTenantExpired(t)
  }).length
  const expiredCount = tenants.filter(t => isTenantExpired(t)).length
  const totalMrrInr = tenants
    .filter(t => t.status === 'ACTIVE' && t.accessType === 'FULL_ACCESS')
    .reduce((acc, t) => acc + (t.monthlyBillingInr || 4999), 0)

  // Filtered tenants
  const filteredTenants = tenants.filter(tenant => {
    if (activeTab === 'DEMO_TRIAL' && tenant.accessType !== 'DEMO_TRIAL') return false
    if (activeTab === 'FULL_ACCESS' && tenant.accessType !== 'FULL_ACCESS') return false
    if (activeTab === 'EXPIRED' && !isTenantExpired(tenant)) return false
    if (activeTab === 'EXPIRING_SOON') {
      const days = getDaysLeft(tenant)
      if (days === null || days < 0 || days > 3 || isTenantExpired(tenant)) return false
    }

    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    return (
      tenant.companyName?.toLowerCase().includes(q) ||
      tenant.adminEmail?.toLowerCase().includes(q) ||
      tenant.adminName?.toLowerCase().includes(q) ||
      tenant.phone?.toLowerCase().includes(q) ||
      tenant.cityState?.toLowerCase().includes(q) ||
      tenant.plantSlug?.toLowerCase().includes(q)
    )
  })

  // Action Handlers
  const handleSendReminder = (tenant: TenantFactory) => {
    startTransition(async () => {
      const res = await sendPaymentReminderAction(tenant.id)
      if (res.success) {
        showToast(
          res.simulated
            ? `Reminder email simulated for ${tenant.companyName}.`
            : `Reminder email successfully dispatched to ${tenant.adminEmail}!`
        )
        loadData()
      } else {
        showToast(res.error || 'Failed to dispatch reminder email.', 'error')
      }
    })
  }

  const handleQuickExtend = (tenantId: string, days: number) => {
    startTransition(async () => {
      const res = await extendTenantExpiryAction(tenantId, days)
      if (res.success) {
        showToast(`Extended tenant validity by +${days} days!`)
        loadData()
        if (selectedTenant && selectedTenant.id === tenantId && res.newExpiresAt) {
          setSelectedTenant({ ...selectedTenant, expiresAt: res.newExpiresAt, status: 'ACTIVE' })
        }
      } else {
        showToast(res.error || 'Failed to extend expiry.', 'error')
      }
    })
  }

  const handleConfirmUpgrade = () => {
    if (!selectedTenant) return
    startTransition(async () => {
      const res = await upgradeTenantToFullAccessAction(
        selectedTenant.id,
        upgradeTier,
        upgradeDurationMonths
      )
      if (res.success) {
        showToast(`Upgraded ${selectedTenant.companyName} to Full Access (${upgradeTier})!`)
        setIsManageModalOpen(false)
        loadData()
      } else {
        showToast(res.error || 'Failed to upgrade account.', 'error')
      }
    })
  }

  const handleToggleRevoke = (tenant: TenantFactory) => {
    const isSuspended = tenant.status === 'SUSPENDED'
    startTransition(async () => {
      const res = isSuspended
        ? await reactivateTenantAccessAction(tenant.id, tenant.accessType)
        : await revokeTenantAccessAction(tenant.id)

      if (res.success) {
        showToast(isSuspended ? `Reactivated ${tenant.companyName}` : `Suspended ${tenant.companyName}`)
        loadData()
        if (selectedTenant && selectedTenant.id === tenant.id) {
          setSelectedTenant({ ...selectedTenant, status: isSuspended ? 'ACTIVE' : 'SUSPENDED' })
        }
      } else {
        showToast(res.error || 'Failed to update access standing', 'error')
      }
    })
  }

  const openManageModal = (tenant: TenantFactory) => {
    setSelectedTenant(tenant)
    setUpgradeTier(tenant.subscriptionTier || 'FULL_PLANT_AI')
    setIsManageModalOpen(true)
  }

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
          <span className="font-bold text-slate-900">Subscriptions & Expiry Directory</span>
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
                  Subscriptions & Expiry Management
                </h1>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-[#FAF7F0] text-slate-700 border border-black/10">
                  {totalTenantsCount} {totalTenantsCount === 1 ? 'tenant factory' : 'tenant factories'}
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)]">
                Garment factory subscription lifecycle, 7-day evaluation limits, and renewal management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
            <Link
              href="/platform-admin/provisioning"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>+ Provision New Tenant</span>
            </Link>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-200 ${
            toastMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-2.5">
              {toastMsg.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-bold">{toastMsg.text}</span>
            </div>
            <button
              onClick={() => setToastMsg(null)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Layer 3: Executive KPI Metric Cards (Clean 4-Card Grid matching Screenshot 2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Tenants */}
          <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Directory
              </span>
            </div>
            <div className="mt-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Total Tenants
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-mono">
                {totalTenantsCount}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Onboarded plant clients
              </p>
            </div>
          </div>

          {/* Card 2: 7-Day Demo Trials */}
          <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Evaluation
              </span>
            </div>
            <div className="mt-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
                7-Day Demo Trials
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-mono">
                {demoTrialsCount}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Evaluating trial factories
              </p>
            </div>
          </div>

          {/* Card 3: Expiring Soon / Expired */}
          <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Urgent Action
              </span>
            </div>
            <div className="mt-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Expiring Soon
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-mono">
                {expiringSoonCount}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Within next 3 days
              </p>
            </div>
          </div>

          {/* Card 4: Contracted MRR */}
          <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Billing
              </span>
            </div>
            <div className="mt-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Contracted MRR
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-mono">
                ₹{totalMrrInr.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Monthly recurring SaaS
              </p>
            </div>
          </div>
        </div>

        {/* Layer 4: Interactive Control Toolbar (Filter Tabs + Search Bar) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Filter Segment */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'ALL'
                  ? 'bg-[#3A3564] text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-black/10'
              }`}
            >
              All Factories ({tenants.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('DEMO_TRIAL')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'DEMO_TRIAL'
                  ? 'bg-[#3A3564] text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-black/10'
              }`}
            >
              Demo Trials ({demoTrialsCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('EXPIRING_SOON')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'EXPIRING_SOON'
                  ? 'bg-[#3A3564] text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-black/10'
              }`}
            >
              Expiring Soon ({expiringSoonCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('EXPIRED')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'EXPIRED'
                  ? 'bg-[#3A3564] text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-black/10'
              }`}
            >
              Expired / Suspended ({expiredCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('FULL_ACCESS')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'FULL_ACCESS'
                  ? 'bg-[#3A3564] text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-black/10'
              }`}
            >
              Full Access ({tenants.filter(t => t.accessType === 'FULL_ACCESS').length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px] lg:min-w-[320px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search factory, slug, email, city..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-black/10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
            />
          </div>
        </div>

        {/* Layer 5: Clean Subscriptions Table (Structured like Screenshot 2) */}
        <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Factory & Location</th>
                  <th className="py-3.5 px-4">Super Admin</th>
                  <th className="py-3.5 px-4">Plan & Model</th>
                  <th className="py-3.5 px-4">Validity & Status</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#3A3564]" />
                      Loading tenant subscriptions...
                    </td>
                  </tr>
                ) : filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No tenant factories matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((tenant) => {
                    const daysLeft = getDaysLeft(tenant)
                    const isExpired = isTenantExpired(tenant)
                    const isTrial = tenant.accessType === 'DEMO_TRIAL'
                    const isSuspended = tenant.status === 'SUSPENDED'

                    const expiryDateStr = tenant.expiresAt
                      ? new Date(tenant.expiresAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'Continuous'

                    return (
                      <tr key={tenant.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* 1. Factory & Location */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="font-extrabold text-slate-900 text-sm">{tenant.companyName}</div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="font-mono text-[11px] text-slate-500 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
                              {tenant.plantSlug || 'factory-slug'}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              • {tenant.cityState || 'India'}
                            </span>
                          </div>
                        </td>

                        {/* 2. Super Admin */}
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-800 text-xs">{tenant.adminName || 'Admin'}</div>
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">{tenant.adminEmail}</div>
                        </td>

                        {/* 3. Plan Tier & Model */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#FAF7F0] text-slate-800 border border-black/10">
                              {tenant.subscriptionTier === 'FULL_PLANT_AI'
                                ? 'FULL PLANT AI'
                                : (tenant.subscriptionTier === 'MODULAR' ? 'MODULAR' : 'CUSTOM')}
                            </span>
                            {isTrial ? (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                7-Day Demo
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                                Full Access
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 mt-1">
                            ₹{(tenant.monthlyBillingInr || 4999).toLocaleString('en-IN')}/mo
                          </div>
                        </td>

                        {/* 4. Validity & Expiry */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 text-xs font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className={isExpired ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                              {expiryDateStr}
                            </span>
                          </div>
                          <div className="mt-1">
                            {isExpired ? (
                              <span className="text-[11px] text-rose-600 font-bold">
                                Expired (Locked)
                              </span>
                            ) : daysLeft !== null ? (
                              <span className={`text-[11px] font-semibold ${daysLeft <= 3 ? 'text-amber-700' : 'text-slate-500'}`}>
                                {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                              </span>
                            ) : (
                              <span className="text-[11px] text-emerald-600 font-medium">
                                Permanent
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 5. Account Status */}
                        <td className="py-4 px-4">
                          {isSuspended ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Suspended
                            </span>
                          ) : isExpired ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Expired
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          )}
                        </td>

                        {/* 6. Action: Clean "View Details / Manage" Button (Matching Screenshot 2) */}
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <button
                            type="button"
                            onClick={() => openManageModal(tenant)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#3A3564] bg-[#FAF7F0] hover:bg-[#F2ECE1] border border-black/10 shadow-2xs transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Unified "View Details & Subscription Management" Modal */}
      {isManageModalOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div
            className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-black/10 my-auto animate-in zoom-in-95 duration-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {selectedTenant.companyName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Subscription management, validity extension, and billing controls
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManageModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Section 1: Tenant Information Overview */}
            <div className="p-4 rounded-xl bg-[#FAF7F0] border border-black/10 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Super Admin</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{selectedTenant.adminName || 'Admin'}</span>
                <span className="text-slate-600 font-mono text-[11px]">{selectedTenant.adminEmail}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Current Model</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {selectedTenant.accessType === 'DEMO_TRIAL' ? '7-Day Demo Trial' : 'Full Enterprise Plan'}
                </span>
                <span className="text-slate-600 text-[11px]">
                  ₹{(selectedTenant.monthlyBillingInr || 4999).toLocaleString('en-IN')}/month
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Issue / Start Date</span>
                <span className="font-bold text-slate-900 mt-0.5 block font-mono">
                  {selectedTenant.provisionedAt ? new Date(selectedTenant.provisionedAt).toLocaleDateString('en-IN') : '15-Sep-2026'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Expiry Date</span>
                <span className={`font-bold mt-0.5 block font-mono ${isTenantExpired(selectedTenant) ? 'text-rose-600' : 'text-slate-900'}`}>
                  {selectedTenant.expiresAt ? new Date(selectedTenant.expiresAt).toLocaleDateString('en-IN') : 'Continuous'}
                </span>
              </div>
            </div>

            {/* Section 2: Send Reminder Notice */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Dispatch Expiry Notice Email</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Sends an automated notification from noreply@zigza.in directing them to their Company Profile.
                </p>
                {selectedTenant.lastPaymentReminderAt && (
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Last sent: {new Date(selectedTenant.lastPaymentReminderAt).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleSendReminder(selectedTenant)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#3A3564] bg-[#FAF7F0] hover:bg-[#F2ECE1] border border-black/10 shadow-2xs shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Reminder</span>
              </button>
            </div>

            {/* Section 3: Quick Validity Extension */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                  Quick Validity Extension
                </span>
                <Clock className="w-4 h-4 text-slate-500" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[7, 14, 30, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleQuickExtend(selectedTenant.id, d)}
                    disabled={isPending}
                    className="py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 transition-colors shadow-2xs cursor-pointer text-center"
                  >
                    +{d} Days
                  </button>
                ))}
              </div>
            </div>

            {/* Section 4: Upgrade / Mark Paid Offline */}
            <div className="p-4 rounded-xl bg-[#FAF7F0] border border-black/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#3A3564]">
                  Convert to Full Access / Mark Paid
                </span>
                <ShieldCheck className="w-4 h-4 text-[#3A3564]" />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Select Plan</label>
                  <select
                    value={upgradeTier}
                    onChange={(e) => setUpgradeTier(e.target.value as SubscriptionPlanTier)}
                    className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="FULL_PLANT_AI">Full Plant AI (₹4,999/mo)</option>
                    <option value="MODULAR">Modular Plan (₹1,999/mo)</option>
                    <option value="CUSTOM">Custom Enterprise (₹9,999/mo)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Contract Duration</label>
                  <select
                    value={upgradeDurationMonths}
                    onChange={(e) => setUpgradeDurationMonths(Number(e.target.value))}
                    className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value={1}>1 Month</option>
                    <option value={3}>3 Months</option>
                    <option value={6}>6 Months</option>
                    <option value={12}>1 Year (12 Mo)</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmUpgrade}
                disabled={isPending}
                className="w-full py-2.5 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2A2649] transition-colors cursor-pointer shadow-2xs"
              >
                Mark Paid & Activate Full Access
              </button>
            </div>

            {/* Section 5: Suspend / Reactivate Account */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                {selectedTenant.status === 'SUSPENDED'
                  ? 'Account is currently suspended and locked.'
                  : 'Emergency override: revoke plant workspace access.'}
              </span>
              <button
                type="button"
                onClick={() => handleToggleRevoke(selectedTenant)}
                disabled={isPending}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  selectedTenant.status === 'SUSPENDED'
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                {selectedTenant.status === 'SUSPENDED' ? 'Unsuspend Factory' : 'Suspend Factory'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PlatformAdminShell>
  )
}
