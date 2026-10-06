'use client'

import React, { useState } from 'react'
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
  Send,
  Copy,
  Check,
  Sparkles
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
  const [copied, setCopied] = useState(false)

  if (!isOpen || !inquiry) return null

  const cleanDigits = (inquiry.phone || '').replace(/\D/g, '')
  const whatsappPhone = cleanDigits.slice(-10)
  const whatsappMsg = `Hi ${inquiry.applicantName}, I am reaching out from Zigza MES regarding your inquiry for ${inquiry.companyName}. How can we assist with your factory floor operations?`
  const whatsappUrl = `https://wa.me/91${whatsappPhone}?text=${encodeURIComponent(whatsappMsg)}`

  const messageText = (inquiry.notes || '').replace(/^\[WEBSITE QUERY\]:\s*/i, '').trim()

  const handleCopySummary = () => {
    const summary = `Lead: ${inquiry.applicantName} (${inquiry.companyName})\nPhone: ${inquiry.phone}\nEmail: ${inquiry.email}\nStatus: ${inquiry.status}\nMessage: ${messageText || 'N/A'}`
    navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header (Zigza MES Signature) */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/40 flex items-center justify-center text-[#0B1220] shrink-0 shadow-2xs">
              <MessageSquare className="w-5 h-5 text-[#0B1220]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-[#0B1220] tracking-tight">
                  Inbound Lead Details
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30 uppercase">
                  {inquiry.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                Submitted on {new Date(inquiry.submittedAt).toLocaleDateString()} at {new Date(inquiry.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
          
          {/* Metadata Grid (4 Cards in Zigza MES Styling) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Applicant Name */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Contact Person</span>
              </div>
              <div className="text-sm font-bold text-[#0B1220]">
                {inquiry.applicantName}
              </div>
            </div>

            {/* Factory / Company */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Factory / Company</span>
              </div>
              <div className="text-sm font-bold text-[#0B1220] truncate" title={inquiry.companyName}>
                {inquiry.companyName}
              </div>
            </div>

            {/* Phone Number */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Phone Number</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#0B1220] font-mono">
                  {inquiry.phone}
                </span>
                <a
                  href={`tel:${inquiry.phone.replace(/\s+/g, '')}`}
                  className="text-[11px] font-bold text-[#1D4ED8] hover:underline"
                >
                  Call
                </a>
              </div>
            </div>

            {/* Email Channel */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Channel</span>
              </div>
              <div className="text-xs font-bold text-[#0B1220] font-mono truncate" title={inquiry.email}>
                {inquiry.email}
              </div>
            </div>

          </div>

          {/* Full Query / Requirement Message */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>Inquiry / Query Message</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/90 text-sm text-[#0B1220] leading-relaxed font-medium whitespace-pre-wrap min-h-[100px]">
              {messageText || 'No custom query message text provided.'}
            </div>
          </div>

          {/* Status Workflow Selector */}
          {onStatusChange && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30 text-xs">
              <span className="font-bold text-[#0B1220] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0B1220]" />
                <span>Update Lead Stage:</span>
              </span>
              <select
                aria-label="Update Lead Status"
                value={inquiry.status}
                onChange={(e) => onStatusChange(inquiry.id, e.target.value as DemoRequestStatus)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 cursor-pointer outline-none focus:ring-2 focus:ring-[#14C8B4]/30 shadow-2xs"
              >
                <option value="NEW_LEAD">New Lead</option>
                <option value="CONTACTED">Contacted</option>
                <option value="DEMO_SCHEDULED">Demo Scheduled</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          )}

        </div>

        {/* Footer (Actions) */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Summary</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
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
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
