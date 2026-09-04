'use client'

import { useState, useTransition } from 'react'
import {
  AlertTriangle,
  Trash2,
  Mail,
  CheckCircle2,
  X,
  Loader2,
  Send,
  Building,
  User,
  Phone,
  ShieldAlert,
} from 'lucide-react'
import { requestAccountDeletion } from '../actions'

interface AccountDeletionDangerZoneProps {
  companyName?: string
  adminName?: string
  userEmail: string
  adminPhone?: string
}

export function AccountDeletionDangerZone({
  companyName = 'Nubira Creation',
  adminName = 'admin',
  userEmail,
  adminPhone = '',
}: AccountDeletionDangerZoneProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [confirmText, setConfirmText] = useState('')
  const [phoneInput, setPhoneInput] = useState(adminPhone)
  const [reasonInput, setReasonInput] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [mailPayload, setMailPayload] = useState<{
    targetEmail: string
    emailSubject: string
    emailBody: string
  } | null>(null)

  const isConfirmed = confirmText.trim().toUpperCase() === 'DELETE'

  async function handleRequestDeletion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!isConfirmed) return

    setErrorMsg(null)

    const formData = new FormData()
    formData.append('company_name', companyName)
    formData.append('admin_name', adminName)
    formData.append('email', userEmail)
    formData.append('phone', phoneInput)
    formData.append('reason', reasonInput || 'Admin initiated account deletion from Web Portal')

    startTransition(async () => {
      const res = await requestAccountDeletion(formData)
      if (res.success && res.targetEmail) {
        setMailPayload({
          targetEmail: res.targetEmail,
          emailSubject: res.emailSubject || 'Account Deletion Request',
          emailBody: res.emailBody || '',
        })
        setIsSuccess(true)
      } else {
        setErrorMsg(res.error || 'Failed to submit account deletion request.')
      }
    })
  }

  function handleOpenMailClient() {
    if (!mailPayload) return
    const mailtoUrl = `mailto:${mailPayload.targetEmail}?subject=${encodeURIComponent(
      mailPayload.emailSubject
    )}&body=${encodeURIComponent(mailPayload.emailBody)}`
    window.location.href = mailtoUrl
  }

  return (
    <>
      {/* Danger Zone Container (Minimal Executive Neutral Container with Refined Crimson Accents) */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs p-5 sm:p-7 relative transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center shrink-0 shadow-2xs">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Danger Zone: Account Decommission
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
                  IRREVERSIBLE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Need to delete or close this company account? Submit an official deletion request.
                Our administration desk at <strong className="text-slate-900 font-mono">team.anga9@gmail.com</strong> will
                verify your company credentials and securely archive all production records.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsOpen(true)
              setIsSuccess(false)
              setErrorMsg(null)
              setConfirmText('')
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-2xs transition-all shrink-0 cursor-pointer w-fit self-start sm:self-center"
          >
            <Trash2 className="w-4 h-4" />
            <span>Request Account Deletion</span>
          </button>
        </div>
      </div>

      {/* Account Deletion Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-black/10 my-auto animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Request Account Deletion
                  </h3>
                  <p className="text-xs text-slate-500">
                    Target Mail: <span className="font-mono text-slate-900 font-bold">team.anga9@gmail.com</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isSuccess ? (
              /* Success Confirmation Step */
              <div className="py-6 space-y-5 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm animate-in zoom-in-50 duration-300">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Deletion Request Submitted
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Your request has been logged and dispatched to{' '}
                    <strong className="text-slate-900 font-mono">team.anga9@gmail.com</strong>.
                    Our core team will verify your credentials and execute the account deletion.
                  </p>
                </div>

                {/* Request Payload Summary Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 font-mono">
                  <div className="flex justify-between border-b border-slate-200 pb-1.5 text-slate-600">
                    <span>Company:</span>
                    <span className="font-bold text-slate-900">{companyName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5 text-slate-600">
                    <span>Admin Name:</span>
                    <span className="font-bold text-slate-900">{adminName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5 text-slate-600">
                    <span>Email:</span>
                    <span className="font-bold text-slate-900">{userEmail}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Phone:</span>
                    <span className="font-bold text-slate-900">{phoneInput || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleOpenMailClient}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2d294e] shadow-2xs transition-all cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Open in Mail App</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Request Form */
              <form onSubmit={handleRequestDeletion} className="space-y-4 pt-4">
                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                    {errorMsg}
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs leading-relaxed space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Important Information</span>
                  </div>
                  <p className="text-amber-900/90 text-xs">
                    Submitting this form dispatches a formal decommission request to{' '}
                    <strong className="font-mono text-slate-900">team.anga9@gmail.com</strong>.
                    All supervisors, factory lots, challans, and stock logs under this company will be securely archived.
                  </p>
                </div>

                {/* Read-only verification fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-xs uppercase font-bold text-slate-500 font-mono flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" /> Company
                    </span>
                    <span className="font-bold text-slate-900 block truncate">
                      {companyName}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-xs uppercase font-bold text-slate-500 font-mono flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> Admin
                    </span>
                    <span className="font-bold text-slate-900 block truncate">
                      {adminName}
                    </span>
                  </div>

                  <div className="col-span-full space-y-0.5 border-t border-slate-200/60 pt-2">
                    <span className="text-xs uppercase font-bold text-slate-500 font-mono flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" /> Registered Email
                    </span>
                    <span className="font-bold text-slate-900 block truncate font-mono">
                      {userEmail}
                    </span>
                  </div>
                </div>

                {/* Contact Phone input for verification */}
                <div>
                  <label className="block text-xs font-bold font-mono uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Contact Phone Number *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-mono"
                    placeholder="+91 98765 43210"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Used to reach you for identity verification before final decommission.
                  </p>
                </div>

                {/* Reason input */}
                <div>
                  <label className="block text-xs font-bold font-mono uppercase tracking-wider text-slate-700 mb-1.5">
                    Reason for Deletion (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
                    placeholder="e.g. Factory operations relocation or closure..."
                  />
                </div>

                {/* Confirmation type check */}
                <div>
                  <label className="block text-xs font-bold text-rose-900 mb-1.5">
                    Type <span className="font-mono font-black text-rose-600">DELETE</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm font-mono font-bold tracking-widest border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all bg-rose-50/20"
                    placeholder="DELETE"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isPending}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isConfirmed || isPending || !phoneInput.trim()}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-2xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
