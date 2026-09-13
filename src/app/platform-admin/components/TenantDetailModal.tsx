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
  Loader2
} from 'lucide-react'
import { TenantFactory } from '../types/platform'
import { ENTERPRISE_DIVISIONS_CATALOG } from '../data/initialPlatformData'
import { updateTenantAllowedDivisionsAction } from '../actions'
import { updateTenantDivisions } from '../utils/platformStorage'

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

  useEffect(() => {
    setTenantState(propTenant)
    setSelectedDivisions(Array.isArray(propTenant?.allowedDivisions) ? propTenant!.allowedDivisions : [])
    setIsEditingDivisions(false)
    setSaveSuccess(false)
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

  // Calculate subscription dates
  const provisionDate = new Date(tenant.provisionedAt)
  const expiryDate = tenant.expiresAt
    ? new Date(tenant.expiresAt)
    : new Date(new Date(provisionDate).setFullYear(provisionDate.getFullYear() + 1))

  const today = new Date()
  const daysRemaining = Math.max(
    0,
    Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  )

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
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-md border ${
                  tenant.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {tenant.status === 'ACTIVE' ? 'Active Factory' : 'Pending Setup'}
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

          {/* Section A: Plan, Billing & License Expiry Cards */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-[#3A3564]" />
              <span>Subscription & Billing Overview</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Card 1: Subscription Tier */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                <span className="text-xs text-slate-500 font-medium block">
                  Current Plan
                </span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {tenant.subscriptionTier.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block font-mono">
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
                  Initial launch cycle
                </span>
              </div>

              {/* Card 3: License Expiry Date */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium block">
                  License Expiry Date
                </span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <span className="text-xs text-slate-600 mt-0.5 block">
                  {daysRemaining} days remaining
                </span>
              </div>
            </div>
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
        <div className="bg-[#FAF7F0] border-t border-black/10 p-4 sm:p-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => handleCopy(`Factory: ${tenant.companyName}\nAdmin: ${tenant.adminEmail}\nPlan: ${tenant.subscriptionTier}\nExpires: ${expiryDate.toLocaleDateString()}`, 'summary')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
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

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all cursor-pointer shadow-xs"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  )
}
