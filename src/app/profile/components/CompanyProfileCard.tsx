'use client'

import { useState, useTransition } from 'react'
import { Building2, MapPin, Phone, Mail, FileText, CheckCircle2, Edit3, X, Loader2 } from 'lucide-react'
import { updateCompanySettings } from '../actions'

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

  const companyName = company.company_name || 'Nubira Creation'
  const factoryAddress = company.factory_address || 'Rafi Ahmed Kidwai Road, Kolkata 700055, West Bengal'
  const gstin = company.gstin || '19AADCO1064C1ZK'
  const contactPhone = company.contact_phone || '+91 98765 43210'
  const contactEmail = company.contact_email || 'creationnubira@gmail.com'

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
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs p-5 sm:p-7 relative transition-all flex flex-col justify-between">
        <div>
          {/* Header with Title & Edit Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {companyName}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#FAF7F0] text-slate-900 border border-black/15 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active Facility
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Primary garment manufacturing and apparel production unit
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#3A3564] bg-[#FAF7F0] hover:bg-[#F2ECE1] border border-black/10 shadow-2xs transition-all cursor-pointer w-fit self-start sm:self-center"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Info</span>
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-5">
            {/* Factory Address */}
            <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/80 transition-all shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 text-[#3A3564] border border-slate-200 shadow-2xs">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Factory Address
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 break-words mt-1 block leading-snug">
                  {factoryAddress}
                </span>
              </div>
            </div>

            {/* GSTIN No */}
            <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/80 transition-all shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 text-[#3A3564] border border-slate-200 shadow-2xs">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  GSTIN / Tax ID
                </span>
                <span className="text-xs sm:text-sm font-mono font-extrabold text-slate-900 mt-1 block">
                  {gstin}
                </span>
              </div>
            </div>

            {/* Official Phone */}
            <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/80 transition-all shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 text-[#3A3564] border border-slate-200 shadow-2xs">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Contact Phone
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 mt-1 block">
                  {contactPhone}
                </span>
              </div>
            </div>

            {/* Official Email */}
            <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/80 transition-all shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 text-[#3A3564] border border-slate-200 shadow-2xs">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Official Email
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 mt-1 block truncate" title={contactEmail}>
                  {contactEmail}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Company Details Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div 
            className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-black/10 my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">Edit Company Information</h3>
                  <p className="text-xs text-slate-500">Update factory identity and contact parameters</p>
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
                <label className="block text-xs font-bold font-mono uppercase tracking-wider text-slate-700 mb-1.5">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="company_name"
                  required
                  defaultValue={companyName}
                  className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all"
                  placeholder="e.g. Nubira Creation"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-mono uppercase tracking-wider text-slate-700 mb-1.5">
                  Factory Address *
                </label>
                <textarea
                  name="factory_address"
                  rows={2}
                  defaultValue={factoryAddress}
                  className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all resize-none"
                  placeholder="Factory premises, street, city, pin code..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold font-mono uppercase tracking-wider text-slate-700 mb-1.5">
                    GSTIN / Tax ID
                  </label>
                  <input
                    type="text"
                    name="gstin"
                    defaultValue={gstin}
                    className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm font-mono border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all"
                    placeholder="19AADCO1064C1ZK"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold font-mono uppercase tracking-wider text-slate-700 mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    name="contact_phone"
                    defaultValue={contactPhone}
                    className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold font-mono uppercase tracking-wider text-slate-700 mb-1.5">
                  Official Email
                </label>
                <input
                  type="email"
                  name="contact_email"
                  defaultValue={contactEmail}
                  className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all"
                  placeholder="contact@company.com"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isPending}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2d294e] shadow-2xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
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
