'use client'

import { useState, useTransition } from 'react'
import { ShieldCheck, User, Mail, Phone, Calendar, KeyRound, Edit3, X, CheckCircle2, Loader2 } from 'lucide-react'
import { updateAdminContact } from '../actions'

interface AdminIdentityCardProps {
  userEmail: string
  adminDisplayName?: string
  adminPhone?: string
  createdAt?: string
}

export function AdminIdentityCard({
  userEmail,
  adminDisplayName = 'admin',
  adminPhone = '+91 98765 43210',
  createdAt,
}: AdminIdentityCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const initials = adminDisplayName.substring(0, 2).toUpperCase() || 'AD'
  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '2026'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await updateAdminContact(formData)
      if (res.success) {
        setSuccessMsg('Admin contact details updated successfully!')
        setTimeout(() => {
          setIsEditing(false)
          setSuccessMsg(null)
        }, 1200)
      } else {
        setErrorMsg(res.error || 'Failed to update admin contact')
      }
    })
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs p-6 sm:p-7 relative transition-all">
        {/* Header with Avatar, Role & Edit Button */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs bg-[#3A3564] text-white text-base font-black">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {adminDisplayName}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#3A3564]" />
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Primary Factory Administrator & Account Holder
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#3A3564] bg-[#FAF7F0] hover:bg-[#F2ECE1] border border-black/10 shadow-2xs transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Contact
          </button>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 pt-5">
          {/* Email Address */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 text-slate-500 border border-slate-200 shadow-2xs">
              <Mail className="w-4 h-4 text-[#3A3564]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-400 block">
                Primary Login Email
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5 block truncate" title={userEmail}>
                {userEmail}
              </span>
            </div>
          </div>

          {/* Admin Mobile Phone */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 text-slate-500 border border-slate-200 shadow-2xs">
              <Phone className="w-4 h-4 text-[#3A3564]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-400 block">
                Direct Mobile Number
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5 block">
                {adminPhone || 'Not configured'}
              </span>
            </div>
          </div>

          {/* Security & Access Level */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 text-slate-500 border border-slate-200 shadow-2xs">
              <KeyRound className="w-4 h-4 text-[#3A3564]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-400 block">
                Security & Authorization
              </span>
              <span className="text-xs sm:text-sm font-bold text-emerald-700 mt-0.5 block">
                Full Root Authority & Control
              </span>
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 text-slate-500 border border-slate-200 shadow-2xs">
              <Calendar className="w-4 h-4 text-[#3A3564]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-400 block">
                Account Established
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5 block">
                {memberSince}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Admin Contact Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#3A3564] text-white flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Admin Contact Settings</h3>
                  <p className="text-xs text-slate-500">Update admin display name and phone number</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditing(false)}
                disabled={isPending}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  {successMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold font-mono uppercase tracking-wider text-slate-700 mb-1.5">
                  Admin Name / Username *
                </label>
                <input
                  type="text"
                  name="admin_display_name"
                  required
                  defaultValue={adminDisplayName}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all"
                  placeholder="e.g. admin"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-mono uppercase tracking-wider text-slate-700 mb-1.5">
                  Direct Mobile Phone *
                </label>
                <input
                  type="text"
                  name="admin_phone"
                  required
                  defaultValue={adminPhone}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2d294e] shadow-2xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Contact'
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
