'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Building2,
  Calendar,
  CreditCard,
  Layers,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Globe,
  Mail,
  Phone,
  User,
  CheckCircle2,
  Sparkles,
  Palette,
  Briefcase,
  Scissors,
  Printer,
  Waves,
  Flame,
  Boxes,
  Wrench,
  Store,
  Truck,
  Edit3,
  CheckSquare,
  Square,
  Save,
  Loader2,
  Send,
  AlertTriangle,
  ShieldAlert,
  RefreshCw
} from 'lucide-react'
import { TenantFactory, AccessType } from '../types/platform'
import { ENTERPRISE_DIVISIONS_CATALOG } from '../data/initialPlatformData'
import {
  updateTenantAllowedDivisionsAction,
  revokeTenantAccessAction,
  reactivateTenantAccessAction,
  sendPaymentReminderAction
} from '../actions'
import {
  updateTenantDivisions,
  revokeTenantAccess,
  reactivateTenantAccess,
  recordPaymentReminder
} from '../utils/platformStorage'

interface TenantDetailModalProps {
  isOpen: boolean
  onClose: () => void
  tenant: TenantFactory | null
  onTenantUpdated?: (updated: TenantFactory) => void
}

const DIVISION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  '/design': Palette,
  '/merchandising': Briefcase,
  '/cutting': Scissors,
  '/printing': Printer,
  '/embroidery': Sparkles,
  '/stitching-sewing': Layers,
  '/washing': Waves,
  '/iron': Flame,
  '/ready-goods': Boxes,
  '/alter': Wrench,
  '/store': Store,
  '/dispatch': Truck,
}

export function TenantDetailModal({ isOpen, onClose, tenant: propTenant, onTenantUpdated }: TenantDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [tenantState, setTenantState] = useState<TenantFactory | null>(propTenant)
  const [isEditingDivisions, setIsEditingDivisions] = useState(false)
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Reminder, Revoke & Reactivate state
  const [isSendingReminder, setIsSendingReminder] = useState(false)
  const [reminderMessage, setReminderMessage] = useState<{ text: string; isError?: boolean } | null>(null)
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false)
  const [isRevoking, setIsRevoking] = useState(false)
  const [showReactivateModal, setShowReactivateModal] = useState(false)
  const [reactivateType, setReactivateType] = useState<AccessType>('FULL_ACCESS')
  const [isReactivating, setIsReactivating] = useState(false)

  useEffect(() => {
    setTenantState(propTenant)
    setSelectedDivisions(Array.isArray(propTenant?.allowedDivisions) ? propTenant!.allowedDivisions : [])
    setIsEditingDivisions(false)
    setSaveSuccess(false)
    setReminderMessage(null)
    setShowRevokeConfirm(false)
    setShowReactivateModal(false)
  }, [propTenant, isOpen])

  if (!isOpen || !propTenant) return null
  const tenant = tenantState || propTenant

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldKey)
    setTimeout(() => setCopiedField(null), 2500)
  }

  const toggleDivision = (route: string) => {
    setSelectedDivisions(prev =>
      prev.includes(route) ? prev.filter(r => r !== route) : [...prev, route]
    )
  }

  const selectAll = () => {
    setSelectedDivisions(ENTERPRISE_DIVISIONS_CATALOG.map(d => d.route))
  }

  const handleSaveDivisions = async () => {
    if (selectedDivisions.length === 0) {
      alert('Please keep at least 1 division module active.')
      return
    }

    setIsSaving(true)
    try {
      const res = await updateTenantAllowedDivisionsAction(tenant.id, selectedDivisions)
      if (res.success) {
        updateTenantDivisions(tenant.id, selectedDivisions)
        const updated: TenantFactory = {
          ...tenant,
          allowedDivisions: selectedDivisions,
          activeDivisionsCount: selectedDivisions.length,
          lastActiveAt: new Date().toISOString()
        }
        setTenantState(updated)
        setIsEditingDivisions(false)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
        onTenantUpdated?.(updated)
      } else {
        alert(res.error || 'Failed to update tenant divisions.')
      }
    } catch (err) {
      console.error('Failed to save tenant divisions:', err)
      alert('An unexpected error occurred while saving divisions.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendPaymentReminder = async () => {
    setIsSendingReminder(true)
    setReminderMessage(null)
    try {
      const res = await sendPaymentReminderAction(tenant.id)
      if (res.success) {
        recordPaymentReminder(tenant.id)
        const updated: TenantFactory = {
          ...tenant,
          lastPaymentReminderAt: new Date().toISOString()
        }
        setTenantState(updated)
        onTenantUpdated?.(updated)
        setReminderMessage({
          text: res.simulated
            ? `Reminder email simulated for ${tenant.adminEmail} (RESEND_API_KEY not configured).`
            : `Payment reminder email successfully dispatched to ${tenant.adminEmail} from noreply@zigza.in.`
        })
      } else {
        setReminderMessage({ text: res.error || 'Failed to send payment reminder email', isError: true })
      }
    } catch (err: any) {
      setReminderMessage({ text: err?.message || 'Error dispatching payment reminder', isError: true })
    } finally {
      setIsSendingReminder(false)
    }
  }

  const handleRevokeAccess = async () => {
    setIsRevoking(true)
    try {
      const res = await revokeTenantAccessAction(tenant.id)
      if (res.success) {
        revokeTenantAccess(tenant.id)
        const updated: TenantFactory = {
          ...tenant,
          status: 'SUSPENDED',
          revokedAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString()
        }
        setTenantState(updated)
        setShowRevokeConfirm(false)
        onTenantUpdated?.(updated)
      } else {
        alert(res.error || 'Failed to revoke tenant access.')
      }
    } catch (err: any) {
      alert(err?.message || 'Error revoking access')
    } finally {
      setIsRevoking(false)
    }
  }

  const handleReactivateAccess = async () => {
    setIsReactivating(true)
    try {
      const res = await reactivateTenantAccessAction(tenant.id, reactivateType)
      if (res.success) {
        reactivateTenantAccess(tenant.id, reactivateType)
        const expiresAt = reactivateType === 'DEMO_TRIAL'
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          : undefined
        const updated: TenantFactory = {
          ...tenant,
          status: 'ACTIVE',
          accessType: reactivateType,
          revokedAt: undefined,
          expiresAt,
          lastActiveAt: new Date().toISOString()
        }
        setTenantState(updated)
        setShowReactivateModal(false)
        onTenantUpdated?.(updated)
      } else {
        alert(res.error || 'Failed to reactivate tenant workspace.')
      }
    } catch (err: any) {
      alert(err?.message || 'Error reactivating workspace')
    } finally {
      setIsReactivating(false)
    }
  }

  // Calculate subscription dates
  const provisionDate = new Date(tenant.provisionedAt)
  const isTrial = tenant.accessType === 'DEMO_TRIAL'
  const isSuspended = tenant.status === 'SUSPENDED'

  const expiryDate = tenant.expiresAt ? new Date(tenant.expiresAt) : null
  const today = new Date()
  const daysRemaining = expiryDate
    ? Math.max(0, Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
    : null

  const allowedRoutes = Array.isArray(tenant.allowedDivisions) ? tenant.allowedDivisions : []

  return (
    <div 
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Modal Top Banner & Header */}
        <div className="bg-[#FAF7F0] border-b border-black/10 p-5 sm:p-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white border border-black/10 flex items-center justify-center shrink-0 shadow-2xs text-[#3A3564]">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-[family-name:var(--font-heading)]">
                  {tenant.companyName}
                </h2>
                
                {/* Status Badge */}
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                  isSuspended
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : tenant.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {isSuspended ? 'Access Revoked' : tenant.status === 'ACTIVE' ? 'Active Workspace' : 'Pending Setup'}
                </span>

                {/* Access Model Badge */}
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                  isTrial
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-indigo-50 text-indigo-900 border-indigo-200'
                }`}>
                  {isTrial ? '7-Day Demo Trial' : 'Full Enterprise Access'}
                </span>

                <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-white text-slate-700 border border-black/10">
                  {tenant.subscriptionTier.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                <span>Slug: <strong className="text-slate-700 font-mono">{tenant.plantSlug}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  {tenant.cityState}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-all cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Modal Body Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* Alert / Notice Banner if reminder was sent */}
          {reminderMessage && (
            <div className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs transition-all ${
              reminderMessage.isError
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                reminderMessage.isError ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {reminderMessage.isError ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
              <div className="flex-1 min-w-0 font-medium leading-relaxed">
                {reminderMessage.text}
              </div>
              <button
                type="button"
                onClick={() => setReminderMessage(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Suspended Alert Banner */}
          {isSuspended && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-xs text-rose-900">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <span className="font-bold">Plant Workspace Access is Suspended</span>
                  <span className="block text-rose-700 mt-0.5">
                    User and factory employees cannot log into production modules until reactivated.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReactivateModal(true)}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 shadow-2xs cursor-pointer"
              >
                Reactivate Workspace
              </button>
            </div>
          )}

          {/* Section A: Plan, Billing & License Expiry Cards */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-[#3A3564]" />
              <span>Subscription & Billing Overview</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Card 1: Subscription Tier & Access Model */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                <span className="text-xs text-slate-500 font-medium block">
                  Access Model & Tier
                </span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {tenant.subscriptionTier.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-600 mt-0.5 block font-mono font-semibold">
                  ₹{tenant.monthlyBillingInr.toLocaleString()} / month
                </span>
              </div>

              {/* Card 2: Activation / Provisioned Date */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                <span className="text-xs text-slate-500 font-medium block">
                  Provisioned Date
                </span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {provisionDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Initial workspace setup
                </span>
              </div>

              {/* Card 3: License Expiry / Contract Status */}
              <div className={`p-4 rounded-xl border ${
                isSuspended
                  ? 'bg-rose-50/70 border-rose-200'
                  : isTrial
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-white border-slate-200'
              }`}>
                <span className="text-xs text-slate-500 font-medium block">
                  {isSuspended ? 'Access Status' : isTrial ? 'Trial Expiry Date' : 'Contract Status'}
                </span>
                <span className={`text-base font-bold mt-1 block ${
                  isSuspended ? 'text-rose-700' : isTrial ? 'text-amber-900' : 'text-slate-900'
                }`}>
                  {isSuspended
                    ? 'Access Suspended'
                    : isTrial && expiryDate
                    ? expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'Active Enterprise'}
                </span>
                <span className={`text-xs mt-0.5 block ${
                  isSuspended ? 'text-rose-600' : isTrial ? 'text-amber-800 font-semibold' : 'text-emerald-700'
                }`}>
                  {isSuspended
                    ? (tenant.revokedAt ? `Revoked ${new Date(tenant.revokedAt).toLocaleDateString('en-GB')}` : 'Access Locked')
                    : isTrial
                    ? (daysRemaining !== null ? `${daysRemaining} days remaining (Revocable)` : '7-Day Trial')
                    : 'Unrestricted Production Access'}
                </span>
              </div>
            </div>

            {/* Last payment reminder tracker */}
            {tenant.lastPaymentReminderAt && (
              <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
                <span>Last Payment Reminder Email:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {new Date(tenant.lastPaymentReminderAt).toLocaleString()} (via noreply@zigza.in)
                </span>
              </div>
            )}
          </div>

          {/* Section B: Super Admin Contact & Credentials */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#3A3564]" />
              <span>Super Administrator Credentials</span>
            </h3>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Admin Name */}
                <div>
                  <span className="text-xs text-slate-500 font-medium block">
                    Admin Name
                  </span>
                  <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 mt-1">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{tenant.adminName}</span>
                  </div>
                </div>

                {/* Admin Email */}
                <div>
                  <span className="text-xs text-slate-500 font-medium block">
                    Login Email
                  </span>
                  <div className="text-sm font-semibold text-slate-900 flex items-center justify-between gap-1.5 mt-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate font-mono text-xs">{tenant.adminEmail}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(tenant.adminEmail, 'email')}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                      title="Copy email"
                    >
                      {copiedField === 'email' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Admin Phone */}
                <div>
                  <span className="text-xs text-slate-500 font-medium block">
                    Phone Contact
                  </span>
                  <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 mt-1 font-mono text-xs">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{tenant.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section C: Allocated Manufacturing Divisions */}
          <div>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#3A3564]" />
                  <span>Allocated Manufacturing Divisions</span>
                </h3>
                {saveSuccess && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Saved
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-[#FAF7F0] text-slate-700 border border-black/10">
                  {isEditingDivisions ? selectedDivisions.length : allowedRoutes.length} of {ENTERPRISE_DIVISIONS_CATALOG.length} divisions active
                </span>

                {!isEditingDivisions ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingDivisions(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#3A3564] bg-white border border-slate-200 hover:bg-[#FAF7F0] rounded-lg shadow-2xs transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Modules</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg cursor-pointer"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDivisions(Array.isArray(tenant?.allowedDivisions) ? tenant.allowedDivisions : [])
                        setIsEditingDivisions(false)
                      }}
                      className="px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleSaveDivisions}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-lg shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {ENTERPRISE_DIVISIONS_CATALOG.map((div) => {
                const isAssigned = isEditingDivisions
                  ? selectedDivisions.includes(div.route)
                  : allowedRoutes.includes(div.route)
                const DivIcon = DIVISION_ICONS[div.route] || Layers

                return (
                  <div
                    key={div.id}
                    onClick={() => {
                      if (isEditingDivisions) {
                        toggleDivision(div.route)
                      }
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                      isEditingDivisions ? 'cursor-pointer select-none hover:border-[#3A3564]/50' : ''
                    } ${
                      isAssigned
                        ? 'bg-white border-slate-200 shadow-2xs' + (isEditingDivisions ? ' ring-2 ring-[#3A3564]/20 border-[#3A3564]' : '')
                        : 'bg-slate-50/50 border-dashed border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isAssigned
                          ? 'bg-[#FAF7F0] text-[#3A3564] border border-black/10'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        <DivIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {div.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate">
                          {div.route}
                        </div>
                      </div>
                    </div>

                    {isEditingDivisions ? (
                      <div className="shrink-0 text-[#3A3564]">
                        {isAssigned ? (
                          <CheckSquare className="w-4 h-4 text-[#3A3564]" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                    ) : isAssigned ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 shrink-0">
                        Locked
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section D: System Telemetry & Metadata */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#3A3564]" />
              <span>Platform Registry & Telemetry</span>
            </h3>

            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span>Tenant Registry ID:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-800">{tenant.id}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(tenant.id, 'id')}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Copy ID"
                  >
                    {copiedField === 'id' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Last Activity Sync:</span>
                <span className="font-semibold text-slate-800">
                  {tenant.lastActiveAt ? new Date(tenant.lastActiveAt).toLocaleString() : 'Live'}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Operating Gateway URL:</span>
                <span className="font-semibold text-[#3A3564]">https://app.zigza.in/modules</span>
              </div>
            </div>
          </div>

        </div>

        {/* 3. Modal Footer Actions */}
        <div className="bg-[#FAF7F0] border-t border-black/10 p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopy(`Factory: ${tenant.companyName}\nAdmin: ${tenant.adminEmail}\nAccess Model: ${isTrial ? '7-Day Demo Trial' : 'Full Access'}\nPlan: ${tenant.subscriptionTier}\nStatus: ${tenant.status}`, 'summary')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
            >
              {copiedField === 'summary' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Summary Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Summary</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            {/* Send Payment Reminder Button */}
            <button
              type="button"
              disabled={isSendingReminder}
              onClick={handleSendPaymentReminder}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#3A3564] bg-white border border-[#3A3564]/30 hover:bg-[#3A3564]/5 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
              title="Dispatches official payment reminder from noreply@zigza.in"
            >
              {isSendingReminder ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Send Payment Reminder</span>
            </button>

            {/* Revoke Access Button (When Active) */}
            {!isSuspended ? (
              <button
                type="button"
                onClick={() => setShowRevokeConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer shadow-2xs"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Revoke Access</span>
              </button>
            ) : (
              /* Reactivate Button (When Suspended) */
              <button
                type="button"
                onClick={() => setShowReactivateModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reactivate Workspace</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all cursor-pointer shadow-xs"
            >
              Close Details
            </button>
          </div>
        </div>

        {/* Confirmation Modal: Revoke Access */}
        {showRevokeConfirm && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-rose-200 p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Revoke Tenant Factory Access?</h4>
                  <p className="text-xs text-slate-500">Immediate workspace suspension</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                This will immediately suspend plant access for <strong className="text-slate-900">{tenant.companyName}</strong> ({tenant.adminEmail}). All factory floor divisions will be locked until an admin reactivates the account.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isRevoking}
                  onClick={() => setShowRevokeConfirm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isRevoking}
                  onClick={handleRevokeAccess}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isRevoking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                  <span>Confirm Revocation</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Reactivate Access with Model Selection */}
        {showReactivateModal && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-emerald-600">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Reactivate Factory Workspace</h4>
                  <p className="text-xs text-slate-500">Restore client portal & division access</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Reactivation Access Model:
                </label>
                
                <div className="space-y-2">
                  <label
                    onClick={() => setReactivateType('FULL_ACCESS')}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      reactivateType === 'FULL_ACCESS'
                        ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reactivateType"
                      checked={reactivateType === 'FULL_ACCESS'}
                      onChange={() => setReactivateType('FULL_ACCESS')}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Full Access (Paid Contract)</span>
                      <span className="text-slate-500 block mt-0.5">Unrestricted enterprise access. Monthly billing active.</span>
                    </div>
                  </label>

                  <label
                    onClick={() => setReactivateType('DEMO_TRIAL')}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      reactivateType === 'DEMO_TRIAL'
                        ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reactivateType"
                      checked={reactivateType === 'DEMO_TRIAL'}
                      onChange={() => setReactivateType('DEMO_TRIAL')}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="font-bold text-amber-950 block">7-Day Demo Trial (Revocable)</span>
                      <span className="text-amber-800 block mt-0.5">Extend evaluation for 7 more days. Revocable anytime.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isReactivating}
                  onClick={() => setShowReactivateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isReactivating}
                  onClick={handleReactivateAccess}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isReactivating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  <span>Confirm Reactivation</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
