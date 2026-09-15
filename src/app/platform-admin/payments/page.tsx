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
  Plus
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

  // Extension modal state
  const [selectedTenant, setSelectedTenant] = useState<TenantFactory | null>(null)
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false)
  const [daysToAdd, setDaysToAdd] = useState(30)
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

  // Helper calculations
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
    // Tab filtering
    if (activeTab === 'DEMO_TRIAL' && tenant.accessType !== 'DEMO_TRIAL') return false
    if (activeTab === 'FULL_ACCESS' && tenant.accessType !== 'FULL_ACCESS') return false
    if (activeTab === 'EXPIRED' && !isTenantExpired(tenant)) return false
    if (activeTab === 'EXPIRING_SOON') {
      const days = getDaysLeft(tenant)
      if (days === null || days < 0 || days > 3 || isTenantExpired(tenant)) return false
    }

    // Search query filtering
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    return (
      tenant.companyName?.toLowerCase().includes(q) ||
      tenant.adminEmail?.toLowerCase().includes(q) ||
      tenant.adminName?.toLowerCase().includes(q) ||
      tenant.phone?.toLowerCase().includes(q) ||
      tenant.cityState?.toLowerCase().includes(q)
    )
  })

  // Action Handlers
  const handleSendReminder = (tenant: TenantFactory) => {
    startTransition(async () => {
      const res = await sendPaymentReminderAction(tenant.id)
      if (res.success) {
        showToast(
          res.simulated
            ? `Reminder email simulated for ${tenant.companyName} (API Key not set).`
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
      } else {
        showToast(res.error || 'Failed to extend expiry.', 'error')
      }
    })
  }

  const handleConfirmCustomExtend = () => {
    if (!selectedTenant) return
    startTransition(async () => {
      const res = await extendTenantExpiryAction(selectedTenant.id, daysToAdd)
      if (res.success) {
        showToast(`Added +${daysToAdd} days to ${selectedTenant.companyName}!`)
        setIsExtendModalOpen(false)
        loadData()
      } else {
        showToast(res.error || 'Failed to update validity.', 'error')
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
        setIsExtendModalOpen(false)
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
      } else {
        showToast(res.error || 'Failed to update access standing', 'error')
      }
    })
  }

  return (
    <PlatformAdminShell
      headerTitle="Subscriptions & Expiry Management"
      headerSubtitle="Real-time license validity, trial tracking, automated reminder dispatch, and manual contract renewals."
    >
      <div className="space-y-6">
        {/* Toast Alert */}
        {toastMsg && (
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 shadow-sm animate-in fade-in duration-200 ${
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

        {/* 1. Metric Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {/* Card 1: Total Tenants */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-slate-500">
                Total Factories
              </span>
              <Building2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-mono">
              {totalTenantsCount}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Provisioned tenant organizations
            </span>
          </div>

          {/* Card 2: Demo Trials */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-amber-700">
                7-Day Trials
              </span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-2 font-mono">
              {demoTrialsCount}
            </div>
            <span className="text-[11px] text-amber-700 mt-1 block font-medium">
              Evaluating accounts
            </span>
          </div>

          {/* Card 3: Expiring Soon */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-orange-700">
                Expiring Soon
              </span>
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-orange-900 mt-2 font-mono">
              {expiringSoonCount}
            </div>
            <span className="text-[11px] text-orange-700 mt-1 block font-medium">
              Within next 3 days
            </span>
          </div>

          {/* Card 4: Expired / Locked */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-rose-700">
                Expired / Locked
              </span>
              <Lock className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-900 mt-2 font-mono">
              {expiredCount}
            </div>
            <span className="text-[11px] text-rose-700 mt-1 block font-medium">
              Isolated to Profile only
            </span>
          </div>

          {/* Card 5: Projected MRR */}
          <div className="bg-[#FAF7F0] p-4 sm:p-5 rounded-2xl border border-black/15 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-[#3A3564]">
                Projected MRR
              </span>
              <CreditCard className="w-4 h-4 text-[#3A3564]" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#3A3564] mt-2 font-mono">
              ₹{totalMrrInr.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-600 mt-1 block">
              Active full paid retainers
            </span>
          </div>
        </div>

        {/* 2. Filter Tabs & Search Command */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'ALL'
                    ? 'bg-[#3A3564] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Tenants ({tenants.length})
              </button>
              <button
                onClick={() => setActiveTab('DEMO_TRIAL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'DEMO_TRIAL'
                    ? 'bg-[#3A3564] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Demo Trials ({demoTrialsCount})
              </button>
              <button
                onClick={() => setActiveTab('EXPIRING_SOON')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'EXPIRING_SOON'
                    ? 'bg-[#3A3564] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Expiring Soon ({expiringSoonCount})
              </button>
              <button
                onClick={() => setActiveTab('EXPIRED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'EXPIRED'
                    ? 'bg-[#3A3564] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Expired / Locked ({expiredCount})
              </button>
              <button
                onClick={() => setActiveTab('FULL_ACCESS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'FULL_ACCESS'
                    ? 'bg-[#3A3564] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Full Access Paid ({tenants.filter(t => t.accessType === 'FULL_ACCESS').length})
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadData}
              disabled={isLoading || isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer w-fit self-end md:self-center"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by factory name, admin email, phone, city..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
            />
          </div>
        </div>

        {/* 3. Subscriptions & Expiry Table */}
        <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Factory / Organization</th>
                  <th className="py-3.5 px-4">Model & Tier</th>
                  <th className="py-3.5 px-4">Start / Issue Date</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-4">Health Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions & Management</th>
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
                      No tenant subscriptions matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((tenant) => {
                    const daysLeft = getDaysLeft(tenant)
                    const isExpired = isTenantExpired(tenant)
                    const isTrial = tenant.accessType === 'DEMO_TRIAL'

                    const issueDateStr = tenant.provisionedAt
                      ? new Date(tenant.provisionedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                      : '15-Sep-2026'

                    const expiryDateStr = tenant.expiresAt
                      ? new Date(tenant.expiresAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'Continuous'

                    return (
                      <tr key={tenant.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* 1. Factory & Admin Info */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="font-extrabold text-slate-900">{tenant.companyName}</div>
                          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>{tenant.adminName || 'Admin'}</span>
                            <span>•</span>
                            <span className="font-mono">{tenant.adminEmail}</span>
                            {tenant.phone && (
                              <>
                                <span>•</span>
                                <span className="font-mono">{tenant.phone}</span>
                              </>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{tenant.cityState}</div>
                        </td>

                        {/* 2. Access Model & Tier */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            {isTrial ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                7-Day Demo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                Full Access
                              </span>
                            )}
                            <span className="text-xs font-bold text-slate-700">
                              {tenant.subscriptionTier === 'FULL_PLANT_AI'
                                ? 'Full Plant AI'
                                : (tenant.subscriptionTier === 'MODULAR' ? 'Modular' : 'Custom')}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">
                              ₹{(tenant.monthlyBillingInr || 4999).toLocaleString('en-IN')}/mo
                            </span>
                          </div>
                        </td>

                        {/* 3. Start / Issue Date */}
                        <td className="py-4 px-4 font-mono text-xs text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{issueDateStr}</span>
                          </div>
                        </td>

                        {/* 4. Expiry Date */}
                        <td className="py-4 px-4 font-mono text-xs">
                          <div className={`flex items-center gap-1.5 ${isExpired ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{expiryDateStr}</span>
                          </div>
                        </td>

                        {/* 5. Health Status Badge */}
                        <td className="py-4 px-4">
                          {isExpired ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <Lock className="w-3 h-3" />
                              Expired (Locked)
                            </span>
                          ) : daysLeft !== null && daysLeft <= 3 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              {daysLeft} {daysLeft === 1 ? 'Day Left' : 'Days Left'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {daysLeft !== null ? `${daysLeft} Days Active` : 'Permanent Active'}
                            </span>
                          )}

                          {tenant.lastPaymentReminderAt && (
                            <span className="text-[10px] text-slate-400 block mt-1">
                              Reminded: {new Date(tenant.lastPaymentReminderAt).toLocaleDateString('en-IN')}
                            </span>
                          )}
                        </td>

                        {/* 6. Management Action Buttons */}
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Send Reminder Email */}
                            <button
                              type="button"
                              onClick={() => handleSendReminder(tenant)}
                              disabled={isPending}
                              title="Send Expiry Reminder Email from noreply@zigza.in"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#3A3564] bg-[#FAF7F0] hover:bg-[#F2ECE1] border border-black/10 shadow-2xs transition-colors cursor-pointer"
                            >
                              <Send className="w-3 h-3" />
                              <span>Remind</span>
                            </button>

                            {/* Quick +7d */}
                            <button
                              type="button"
                              onClick={() => handleQuickExtend(tenant.id, 7)}
                              disabled={isPending}
                              title="Add +7 days validity"
                              className="px-2 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                            >
                              +7d
                            </button>

                            {/* Quick +30d */}
                            <button
                              type="button"
                              onClick={() => handleQuickExtend(tenant.id, 30)}
                              disabled={isPending}
                              title="Add +30 days validity"
                              className="px-2 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                            >
                              +30d
                            </button>

                            {/* Custom Extend / Upgrade Modal Trigger */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTenant(tenant)
                                setIsExtendModalOpen(true)
                              }}
                              disabled={isPending}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] shadow-2xs transition-colors cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              <span>Manage Plan</span>
                            </button>

                            {/* Suspend / Reactivate */}
                            <button
                              type="button"
                              onClick={() => handleToggleRevoke(tenant)}
                              disabled={isPending}
                              className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                tenant.status === 'SUSPENDED'
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              }`}
                            >
                              {tenant.status === 'SUSPENDED' ? 'Unsuspend' : 'Suspend'}
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
      </div>

      {/* Manual Extend / Upgrade Modal */}
      {isExtendModalOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-black/10 my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Manage Tenant License & Expiry
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manual override for {selectedTenant.companyName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExtendModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 pt-4">
              {/* Option A: Extend Expiry */}
              <div className="p-4 rounded-xl bg-[#FAF7F0] border border-black/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#3A3564]">
                    Option 1 • Extend Current Validity
                  </span>
                  <Clock className="w-4 h-4 text-[#3A3564]" />
                </div>
                <div className="flex items-center gap-2">
                  {[7, 14, 30, 90, 365].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDaysToAdd(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        daysToAdd === d
                          ? 'bg-[#3A3564] text-white shadow-2xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      +{d}d
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleConfirmCustomExtend}
                  disabled={isPending}
                  className="w-full py-2 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2A2649] transition-colors cursor-pointer shadow-2xs"
                >
                  Apply +{daysToAdd} Days Extension
                </button>
              </div>

              {/* Option B: Upgrade to Full Plan */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                    Option 2 • Mark Paid & Switch to Full Access
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Plan Tier</label>
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
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Duration</label>
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
                  className="w-full py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer shadow-2xs"
                >
                  Convert & Mark Full Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PlatformAdminShell>
  )
}
