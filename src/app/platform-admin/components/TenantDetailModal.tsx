'use client'

import React, { useState, useEffect } from 'react'
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
  RefreshCw,
  Trash2,
  MessageSquare
} from 'lucide-react'
import { TenantFactory, AccessType } from '../types/platform'
import { ENTERPRISE_DIVISIONS_CATALOG } from '../data/initialPlatformData'
import {
  updateTenantAllowedDivisionsAction,
  revokeTenantAccessAction,
  reactivateTenantAccessAction,
  sendPaymentReminderAction,
  deleteTenantFactoryAction
} from '../actions'
import {
  updateTenantDivisions,
  revokeTenantAccess,
  reactivateTenantAccess,
  recordPaymentReminder,
  deleteTenantFactory
} from '../utils/platformStorage'

interface TenantDetailModalProps {
  isOpen: boolean
  onClose: () => void
  tenant: TenantFactory | null
  onTenantUpdated?: (updated: TenantFactory) => void
  onTenantDeleted?: (tenantId: string) => void
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

export function TenantDetailModal({
  isOpen,
  onClose,
  tenant: propTenant,
  onTenantUpdated,
  onTenantDeleted
}: TenantDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [tenantState, setTenantState] = useState<TenantFactory | null>(propTenant)
  const [isEditingDivisions, setIsEditingDivisions] = useState(false)
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Reminder, Revoke, Reactivate & Delete state
  const [isSendingReminder, setIsSendingReminder] = useState(false)
  const [reminderMessage, setReminderMessage] = useState<{ text: string; isError?: boolean } | null>(null)
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false)
  const [isRevoking, setIsRevoking] = useState(false)
  const [showReactivateModal, setShowReactivateModal] = useState(false)
  const [reactivateType, setReactivateType] = useState<AccessType>('FULL_ACCESS')
  const [isReactivating, setIsReactivating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setTenantState(propTenant)
    setSelectedDivisions(Array.isArray(propTenant?.allowedDivisions) ? propTenant!.allowedDivisions : [])
    setIsEditingDivisions(false)
    setSaveSuccess(false)
    setReminderMessage(null)
    setShowRevokeConfirm(false)
    setShowReactivateModal(false)
    setShowDeleteConfirm(false)
    setIsDeleting(false)
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

  const handleDeleteTenant = async () => {
    setIsDeleting(true)
    try {
      const res = await deleteTenantFactoryAction(tenant.id)
      if (res.success) {
        deleteTenantFactory(tenant.id)
        setShowDeleteConfirm(false)
        onTenantDeleted?.(tenant.id)
        onClose()
      } else {
        alert(res.error || 'Failed to delete company from tenant registry.')
      }
    } catch (err: any) {
      console.error('Failed to delete tenant factory:', err)
      alert(err?.message || 'Error deleting tenant factory')
    } finally {
      setIsDeleting(false)
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
  const cleanPhoneDigits = (tenant.phone || '').replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/91${cleanPhoneDigits.slice(-10)}?text=${encodeURIComponent(`Hi ${tenant.adminName}, reaching out regarding your Zigza MES workspace for ${tenant.companyName}.`)}`

  return (
    <div 
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden transition-all text-[#0B1220]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Modal Top Header (Responsive & Clean) */}
        <div className="bg-[#F0FDFA] border-b border-slate-200/80 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#14C8B4]/40 flex items-center justify-center shrink-0 shadow-xs text-[#0B1220]">
              <Building2 className="w-6 h-6 text-[#0B1220]" />
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-[#0B1220] tracking-tight">
                  {tenant.companyName}
                </h2>
                
                {/* Status Badge */}
                <span className={`text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border shadow-2xs ${
                  isSuspended
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : tenant.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {isSuspended ? 'Access Revoked' : tenant.status === 'ACTIVE' ? 'Active Workspace' : 'Pending Setup'}
                </span>

                {/* Access Model Badge */}
                <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-white text-[#0B1220] border border-[#14C8B4]/30 shadow-2xs">
                  {isTrial ? '7-Day Demo Trial' : 'Full Enterprise Access'}
                </span>

                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 shadow-2xs">
                  {tenant.subscriptionTier === 'FULL_PLANT_AI' ? 'Full Plant AI (12 Div)' : tenant.subscriptionTier.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Subtitle / Metadata row */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 font-mono">
                  <span>Slug:</span>
                  <strong className="text-[#0B1220] font-bold">{tenant.plantSlug}</strong>
                  <button
                    type="button"
                    onClick={() => handleCopy(tenant.plantSlug, 'slug')}
                    className="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer ml-0.5"
                    title="Copy slug"
                  >
                    {copiedField === 'slug' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="self-end sm:self-center w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-all cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Modal Body (Scrollable & Responsive) */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* Alert / Notice Banner if reminder was sent */}
          {reminderMessage && (
            <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs shadow-xs transition-all ${
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
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-900 shadow-xs">
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
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                Reactivate Workspace
              </button>
            </div>
          )}

          {/* Section A: Subscription & Billing Overview */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-[#0B1220]" />
              <span>Subscription &amp; Billing Overview</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Card 1: Subscription Tier & Access Model */}
              <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                    Access Model &amp; Tier
                  </span>
                  <span className="text-base font-extrabold text-[#0B1220] mt-1 block">
                    {tenant.subscriptionTier === 'FULL_PLANT_AI' ? 'FULL PLANT AI' : tenant.subscriptionTier.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="text-xs text-slate-600 mt-2 block font-mono font-bold">
                  ₹{tenant.monthlyBillingInr.toLocaleString()} / month
                </span>
              </div>

              {/* Card 2: Activation / Provisioned Date */}
              <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                    Provisioned Date
                  </span>
                  <span className="text-base font-extrabold text-[#0B1220] mt-1 block font-mono">
                    {provisionDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <span className="text-xs text-slate-500 mt-2 block font-medium">
                  Initial workspace setup
                </span>
              </div>

              {/* Card 3: License Expiry / Contract Status */}
              <div className={`p-4.5 rounded-2xl border flex flex-col justify-between ${
                isSuspended
                  ? 'bg-rose-50/70 border-rose-200'
                  : isTrial
                  ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20 shadow-xs'
                  : 'bg-[#F0FDFA] border-[#14C8B4]/30'
              }`}>
                <div>
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                    {isSuspended ? 'Access Status' : isTrial ? 'Trial Expiry Date' : 'Contract Status'}
                  </span>
                  <span className={`text-base font-extrabold mt-1 block font-mono ${
                    isSuspended ? 'text-rose-700' : isTrial ? 'text-amber-900' : 'text-[#0B1220]'
                  }`}>
                    {isSuspended
                      ? 'Access Suspended'
                      : isTrial && expiryDate
                      ? expiryDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'Active Enterprise'}
                  </span>
                </div>
                <span className={`text-xs mt-2 block font-medium ${
                  isSuspended ? 'text-rose-600' : isTrial ? 'text-amber-800 font-bold' : 'text-emerald-700'
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
              <div className="mt-3 px-4 py-2.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span>Last Payment Reminder Email:</span>
                <span className="font-mono font-semibold text-[#0B1220]">
                  {new Date(tenant.lastPaymentReminderAt).toLocaleString()} (via noreply@zigza.in)
                </span>
              </div>
            )}
          </div>

          {/* Section B: Super Administrator Credentials */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0B1220]" />
              <span>Super Administrator Credentials</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Admin Name */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase text-slate-400 font-bold tracking-wider block">
                  Admin Name
                </span>
                <div className="text-sm font-bold text-[#0B1220] flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{tenant.adminName}</span>
                </div>
              </div>

              {/* Admin Email */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase text-slate-400 font-bold tracking-wider block">
                  Login Email
                </span>
                <div className="text-xs font-bold text-[#0B1220] font-mono flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate" title={tenant.adminEmail}>{tenant.adminEmail}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(tenant.adminEmail, 'email')}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer shrink-0"
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
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase text-slate-400 font-bold tracking-wider block">
                  Phone Contact
                </span>
                <div className="text-xs font-bold text-[#0B1220] font-mono flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{tenant.phone}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-emerald-700 hover:underline"
                      title="Chat on WhatsApp"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Section C: Allocated Manufacturing Divisions (Wide Responsive Layout) */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#0B1220]" />
                  <span>Allocated Manufacturing Divisions</span>
                </h3>
                {saveSuccess && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Saved
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30 shadow-2xs">
                  {isEditingDivisions ? selectedDivisions.length : allowedRoutes.length} of {ENTERPRISE_DIVISIONS_CATALOG.length} divisions active
                </span>

                {!isEditingDivisions ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingDivisions(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-[#0B1220] bg-white border border-slate-200 hover:bg-[#F0FDFA] rounded-xl shadow-2xs transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Modules</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg cursor-pointer shadow-2xs"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDivisions(Array.isArray(tenant?.allowedDivisions) ? tenant.allowedDivisions : [])
                        setIsEditingDivisions(false)
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg cursor-pointer shadow-2xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleSaveDivisions}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>Save</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Responsive Division Cards (Fit on Mobile, Tablet & Desktop without awkward truncated names) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
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
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 transition-all ${
                      isEditingDivisions ? 'cursor-pointer select-none hover:border-[#0B1220]/50' : ''
                    } ${
                      isAssigned
                        ? 'bg-white border-slate-200/90 shadow-2xs' + (isEditingDivisions ? ' ring-2 ring-[#0B1220]/20 border-[#0B1220]' : '')
                        : 'bg-slate-50/50 border-dashed border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isAssigned
                          ? 'bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        <DivIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#0B1220] truncate" title={div.name}>
                          {div.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate">
                          {div.route}
                        </div>
                      </div>
                    </div>

                    {isEditingDivisions ? (
                      <div className="shrink-0 text-[#0B1220]">
                        {isAssigned ? (
                          <CheckSquare className="w-4 h-4 text-[#0B1220]" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                    ) : isAssigned ? (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                        Active
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                        Locked
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* 3. Modal Footer (Organized, Mobile & Desktop Responsive) */}
        <div className="bg-slate-50/90 border-t border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopy(`Factory: ${tenant.companyName}\nAdmin: ${tenant.adminEmail}\nPhone: ${tenant.phone}\nAccess Model: ${isTrial ? '7-Day Demo Trial' : 'Full Access'}\nPlan: ${tenant.subscriptionTier}\nStatus: ${tenant.status}`, 'summary')}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs w-full sm:w-auto"
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

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Send Payment Reminder Button */}
            <button
              type="button"
              disabled={isSendingReminder}
              onClick={handleSendPaymentReminder}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#0B1220] bg-white border border-slate-300 hover:bg-[#F0FDFA] transition-all cursor-pointer shadow-2xs disabled:opacity-50 flex-1 sm:flex-none"
              title="Dispatches official payment reminder from noreply@zigza.in"
            >
              {isSendingReminder ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Send Reminder</span>
            </button>

            {/* Revoke Access Button (When Active) */}
            {!isSuspended ? (
              <button
                type="button"
                onClick={() => setShowRevokeConfirm(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer shadow-2xs flex-1 sm:flex-none"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Revoke Access</span>
              </button>
            ) : (
              /* Reactivate Button (When Suspended) */
              <button
                type="button"
                onClick={() => setShowReactivateModal(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer shadow-2xs flex-1 sm:flex-none"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reactivate</span>
              </button>
            )}

            {/* Delete Company Button */}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 transition-all cursor-pointer shadow-2xs active:scale-95 flex-1 sm:flex-none"
              title={`Permanently delete ${tenant.companyName} from the tenant directory`}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Delete</span>
            </button>

            {/* Close Details Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] transition-all cursor-pointer shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 active:scale-[0.98] w-full sm:w-auto"
            >
              Close Details
            </button>
          </div>
        </div>

        {/* Confirmation Modal: Delete Tenant Permanently */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl border border-rose-200 p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-start gap-3.5 text-rose-600">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0 shadow-xs">
                  <Trash2 className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">
                    Delete Factory Company Record?
                  </h4>
                  <p className="text-xs text-rose-600 font-semibold mt-0.5">
                    Permanent &amp; Irreversible Workspace Removal
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs text-rose-950 space-y-2">
                <p className="leading-relaxed">
                  You are about to permanently delete <strong>{tenant.companyName}</strong> (Plant Slug: <span className="font-mono font-bold text-rose-900">{tenant.plantSlug}</span>, Admin: <span className="font-mono">{tenant.adminEmail}</span>).
                </p>
                <ul className="list-disc pl-4 space-y-1 text-rose-900/90 text-[11px]">
                  <li>All tenant provisioning records &amp; allotted division mappings will be deleted immediately.</li>
                  <li>Super Admin access for this company will be terminated.</li>
                  <li>This company will be removed from the active Tenant Factories directory.</li>
                </ul>
              </div>

              <p className="text-xs text-slate-500 font-medium">
                Are you sure you want to permanently delete this company?
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteTenant}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs cursor-pointer transition-all disabled:opacity-50 active:scale-95"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>Yes, Delete Company</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal: Revoke Access */}
        {showRevokeConfirm && (
          <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
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
          <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-emerald-600">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Reactivate Factory Workspace</h4>
                  <p className="text-xs text-slate-500">Restore client portal &amp; division access</p>
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
