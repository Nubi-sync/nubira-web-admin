'use client'

import React from 'react'
import {
  X,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Building2,
  User,
  ExternalLink,
  CheckCircle2,
  Clock,
  Send
} from 'lucide-react'
import { DemoRequestInquiry, DemoRequestStatus } from '../types/platform'

interface ViewLeadMessageModalProps {
  isOpen: boolean
  onClose: () => void
  inquiry: DemoRequestInquiry | null
  onStatusChange?: (id: string, newStatus: DemoRequestStatus) => void
}

export function ViewLeadMessageModal({
  isOpen,
  onClose,
  inquiry,
  onStatusChange
}: ViewLeadMessageModalProps) {
  if (!isOpen || !inquiry) return null

  const cleanDigits = (inquiry.phone || '').replace(/\D/g, '')
  const whatsappPhone = cleanDigits.slice(-10)
  const whatsappMsg = `Hi ${inquiry.applicantName}, I am reaching out from Zigza MES regarding your inquiry for ${inquiry.companyName}. How can we assist with your factory operations?`
  const whatsappUrl = `https://wa.me/91${whatsappPhone}?text=${encodeURIComponent(whatsappMsg)}`

  const messageText = (inquiry.notes || '').replace(/^\[WEBSITE QUERY\]:\s*/i, '').trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30 flex items-center justify-center text-[#0B1220] shrink-0 shadow-2xs">
              <MessageSquare className="w-5 h-5 text-[#0B1220]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 truncate">
                Inbound Lead Details
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate">
                {inquiry.companyName} &bull; {inquiry.applicantName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Applicant */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-3 h-3 text-slate-400" />
                <span>Contact Person</span>
              </div>
              <div className="text-sm font-bold text-slate-800">
                {inquiry.applicantName}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {inquiry.companyName}
              </div>
            </div>

            {/* Phone & WhatsApp */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>Phone Number</span>
              </div>
              <div className="text-sm font-bold text-slate-800 font-mono">
                {inquiry.phone}
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
              >
                <span>Chat on WhatsApp</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Email Notification Channel */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>Email Channel</span>
              </div>
              <div className="text-xs font-bold text-slate-800 font-mono truncate" title={inquiry.email}>
                {inquiry.email}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Resend auto-alert destination
              </div>
            </div>

            {/* Submission Date & Status */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Submitted At</span>
              </div>
              <div className="text-xs font-bold text-slate-800 font-mono" suppressHydrationWarning>
                {new Date(inquiry.submittedAt).toLocaleDateString()} &bull; {new Date(inquiry.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="pt-0.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  {inquiry.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

          </div>

          {/* Full Query Message */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>Inquiry / Query Message</span>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#ECE7DE] text-sm text-slate-900 leading-relaxed font-medium whitespace-pre-wrap min-h-[90px]">
              {messageText || 'No custom query message text provided.'}
            </div>
          </div>

          {/* Status Update Row */}
          {onStatusChange && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <span className="font-semibold text-slate-600">Update Lead Status:</span>
              <select
                aria-label="Update Lead Status"
                value={inquiry.status}
                onChange={(e) => onStatusChange(inquiry.id, e.target.value as DemoRequestStatus)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 cursor-pointer outline-none focus:ring-2 focus:ring-[#0B1220]/10"
              >
                <option value="NEW_LEAD">New Lead</option>
                <option value="CONTACTED">Contacted</option>
                <option value="DEMO_SCHEDULED">Demo Scheduled</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <Send className="w-3.5 h-3.5 text-white" />
            <span>Reply via WhatsApp</span>
          </a>
        </div>

      </div>
    </div>
  )
}
