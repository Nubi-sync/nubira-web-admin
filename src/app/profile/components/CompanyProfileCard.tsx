'use client'

import { useState, useTransition } from 'react'
import { Building2, MapPin, FileText, Phone, Mail, CheckCircle2, Edit3, X, Loader2 } from 'lucide-react'
import { updateCompanySettings } from '../actions'
import { DashboardSectionHeader } from '../../dashboard/components/DashboardSectionHeader'

interface CompanyProfileCardProps {
  company: {
    company_name?: string
    factory_address?: string
    gstin?: string
    contact_phone?: string
    contact_email?: string
  }
}

export function CompanyProfileCard({ company }: CompanyProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const companyName = company.company_name || 'Company Profile'
  const factoryAddress = company.factory_address || 'Address not configured'
  const gstin = company.gstin || 'Not configured'
  const contactPhone = company.contact_phone || 'Not configured'
  const contactEmail = company.contact_email || 'Not configured'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await updateCompanySettings(formData)
      if (res.success) {
        setSuccessMsg('Company details updated successfully!')
        setTimeout(() => {
          setIsEditing(false)
          setSuccessMsg(null)
        }, 1200)
      } else {
        setErrorMsg(res.error || 'Failed to update company profile')
      }
    })
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 md:border-black/15 shadow-xs md:shadow-2xs p-4 md:p-7 relative transition-all flex flex-col justify-between">
        <div>
          {/* Mobile Header (< md) */}
          <div className="md:hidden pb-3.5 border-b border-slate-100">
            <DashboardSectionHeader
              icon={Building2}
              title="Factory"
              accent="Identity"
              badge="ACTIVE"
              withDivider={false}
              action={
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#0B1220] bg-[#F0FDFA] hover:bg-[#E6FFFA] border border-[#14C8B4]/40 shadow-2xs transition-all cursor-pointer font-[family-name:var(--font-heading)]"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              }
            />
          </div>

          {/* Desktop Header (>= md untouched) */}
          <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#F0FDFA] text-[#0B1220] border border-black/15">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-[family-name:var(--font-heading)]">
                    {companyName}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#F0FDFA] text-slate-900 border border-black/15 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active Facility
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)]">
                  Primary garment manufacturing and apparel production unit
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#0B1220] bg-[#F0FDFA] hover:bg-[#E6FFFA] border border-black/15 shadow-2xs transition-all cursor-pointer w-fit self-start sm:self-center"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Info</span>
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 pt-3.5 md:pt-5">
            {/* Factory Address */}
            <div className="flex items-start gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl bg-[#F8FAFC] md:bg-slate-50/70 md:hover:bg-white border border-slate-200/80 transition-all shadow-2xs">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-[#F0FDFA] flex items-center justify-center shrink-0 text-[#0B1220] border border-[#14C8B4]/40 md:border-slate-200 shadow-2xs">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-[#0B1220]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] md:text-xs font-[family-name:var(--font-public-sans)] md:font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Factory Address
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#0B1220] break-words mt-0.5 md:mt-1 block leading-snug font-[family-name:var(--font-heading)]">
                  {factoryAddress}
                </span>
              </div>
            </div>

            {/* GSTIN No */}
            <div className="flex items-start gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl bg-[#F8FAFC] md:bg-slate-50/70 md:hover:bg-white border border-slate-200/80 transition-all shadow-2xs">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-[#F0FDFA] flex items-center justify-center shrink-0 text-[#0B1220] border border-[#14C8B4]/40 md:border-slate-200 shadow-2xs">
                <FileText className="w-4 h-4 md:w-5 md:h-5 text-[#0B1220]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] md:text-xs font-[family-name:var(--font-public-sans)] md:font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  GSTIN / Tax ID
                </span>
                <span className="text-xs sm:text-sm font-[family-name:var(--font-heading)] tabular-nums md:font-mono font-extrabold text-[#0B1220] mt-0.5 md:mt-1 block">
                  {gstin}
                </span>
              </div>
            </div>

            {/* Contact Phone (if present or shown cleanly on mobile) */}
            {(company.contact_phone || company.contact_email) && (
              <>
                <div className="flex items-start gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl bg-[#F8FAFC] md:bg-slate-50/70 md:hover:bg-white border border-slate-200/80 transition-all shadow-2xs">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-[#F0FDFA] flex items-center justify-center shrink-0 text-[#0B1220] border border-[#14C8B4]/40 md:border-slate-200 shadow-2xs">
                    <Phone className="w-4 h-4 md:w-5 md:h-5 text-[#0B1220]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] md:text-xs font-[family-name:var(--font-public-sans)] md:font-mono font-bold uppercase tracking-wider text-slate-500 block">
                      Facility Helpline
                    </span>
                    <span className="text-xs sm:text-sm font-[family-name:var(--font-heading)] tabular-nums md:font-mono font-bold text-[#0B1220] mt-0.5 md:mt-1 block truncate">
                      {contactPhone}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl bg-[#F8FAFC] md:bg-slate-50/70 md:hover:bg-white border border-slate-200/80 transition-all shadow-2xs">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-[#F0FDFA] flex items-center justify-center shrink-0 text-[#0B1220] border border-[#14C8B4]/40 md:border-slate-200 shadow-2xs">
                    <Mail className="w-4 h-4 md:w-5 md:h-5 text-[#0B1220]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] md:text-xs font-[family-name:var(--font-public-sans)] md:font-mono font-bold uppercase tracking-wider text-slate-500 block">
                      Official Email
                    </span>
                    <span className="text-xs sm:text-sm font-[family-name:var(--font-heading)] tabular-nums md:font-mono font-bold text-[#0B1220] mt-0.5 md:mt-1 block truncate">
                      {contactEmail}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Company Details Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div 
            className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/40 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)]">Edit Company Information</h3>
                  <p className="text-xs text-slate-500 font-[family-name:var(--font-public-sans)]">Update factory identity and contact parameters</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isPending}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  {successMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold font-[family-name:var(--font-public-sans)] md:font-mono uppercase tracking-wider text-slate-700 mb-1.5">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="company_name"
                  required
                  defaultValue={companyName}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all font-[family-name:var(--font-public-sans)]"
                  placeholder="e.g. Factory or Company Name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-[family-name:var(--font-public-sans)] md:font-mono uppercase tracking-wider text-slate-700 mb-1.5">
                  Factory Address *
                </label>
                <textarea
                  name="factory_address"
                  rows={2}
                  defaultValue={factoryAddress === 'Address not configured' ? '' : factoryAddress}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all resize-none font-[family-name:var(--font-public-sans)]"
                  placeholder="Factory premises, street, city, pin code..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-[family-name:var(--font-public-sans)] md:font-mono uppercase tracking-wider text-slate-700 mb-1.5">
                  GSTIN / Tax ID
                </label>
                <input
                  type="text"
                  name="gstin"
                  defaultValue={gstin === 'Not configured' ? '' : gstin}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm font-[family-name:var(--font-heading)] tabular-nums md:font-mono border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all"
                  placeholder="e.g. 19AADCO1064C1ZK"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold font-[family-name:var(--font-public-sans)] md:font-mono uppercase tracking-wider text-slate-700 mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    name="contact_phone"
                    defaultValue={contactPhone === 'Not configured' ? '' : contactPhone}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm font-[family-name:var(--font-heading)] tabular-nums border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold font-[family-name:var(--font-public-sans)] md:font-mono uppercase tracking-wider text-slate-700 mb-1.5">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    defaultValue={contactEmail === 'Not configured' ? '' : contactEmail}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm font-[family-name:var(--font-public-sans)] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all"
                    placeholder="factory@company.com"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isPending}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.98]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
