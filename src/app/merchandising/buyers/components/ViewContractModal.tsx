'use client'

import React from 'react'
import { 
  X, 
  Building2, 
  Layers, 
  DollarSign, 
  User, 
  Mail, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Link as LinkIcon,
  Sparkles,
  ShieldCheck
} from 'lucide-react'
import { ActiveBuyer } from '../../types/merchandising'

interface ViewContractModalProps {
  isOpen: boolean
  buyer: ActiveBuyer | null
  onClose: () => void
  onOpenLinkModal?: (buyer: ActiveBuyer) => void
}

export function ViewContractModal({
  isOpen,
  buyer,
  onClose,
  onOpenLinkModal
}: ViewContractModalProps) {
  if (!isOpen || !buyer) return null

  const currSym = buyer.currency === 'INR' ? '₹' : buyer.currency === 'USD' ? '$' : buyer.currency === 'EUR' ? '€' : '£'
  const isLinked = Boolean(buyer.linked_article_number)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl border border-black/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 font-[family-name:var(--font-heading)]">
                  {buyer.buyer_name}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  isLinked 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {isLinked ? 'Contract Active' : 'Pending Article Link'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Ref Code: <span className="font-bold text-[#3A3564]">{buyer.buyer_code}</span>
                {buyer.brand_name && <span className="ml-2 font-normal">• Brand: {buyer.brand_name}</span>}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Key Financial & Volume Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-[#FAF7F0] border border-black/10">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">
                Ordered Volume
              </span>
              <span className="text-xl font-extrabold font-mono text-[#3A3564] mt-1 block">
                {buyer.contracted_volume.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-600">Pcs</span>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7F0] border border-black/10">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">
                Price / Piece
              </span>
              <span className="text-xl font-extrabold font-mono text-slate-900 mt-1 block">
                {currSym}{buyer.price_per_piece.toFixed(2)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7F0] border border-black/10">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">
                Total Contract Value
              </span>
              <span className="text-xl font-extrabold font-mono text-slate-900 mt-1 block">
                {currSym}{buyer.total_contract_value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Linked Article Status Section */}
          <div className="p-4 rounded-xl border border-black/10 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#3A3564]" />
                Allocated Tech Pack Article
              </span>
              {isLinked ? (
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Linked &amp; Active
                </span>
              ) : (
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Action Required
                </span>
              )}
            </div>

            {isLinked ? (
              <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
                <div>
                  <div className="font-mono font-bold text-sm text-[#3A3564]">
                    {buyer.linked_article_number}
                  </div>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    {buyer.linked_article_name || `Article ${buyer.linked_article_number}`}
                  </div>
                </div>
                {onOpenLinkModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onOpenLinkModal(buyer)
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-[#3A3564] border border-black/15 shadow-2xs transition-all cursor-pointer"
                  >
                    Change Article
                  </button>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200 flex items-center justify-between">
                <p className="text-xs text-amber-800">
                  No article linked yet. Link an approved Tech Pack article to count this volume in the Dashboard.
                </p>
                {onOpenLinkModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onOpenLinkModal(buyer)
                    }}
                    className="shrink-0 ml-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#3A3564] hover:bg-[#2A2649] text-white shadow-2xs transition-all cursor-pointer"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Link Now</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Contract Details Table / Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl border border-black/10 bg-[#FAF7F0]/50 space-y-2">
              <span className="font-mono font-bold uppercase text-[10px] text-slate-400 block">
                Commercial Information
              </span>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-slate-500">Target Season:</span>
                <span className="font-semibold text-slate-800">{buyer.target_season || 'AW26'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-slate-500">Currency:</span>
                <span className="font-mono font-bold text-slate-800">{buyer.currency}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Created Date:</span>
                <span className="font-mono text-slate-700">
                  {buyer.created_at ? new Date(buyer.created_at).toLocaleDateString('en-GB') : '—'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-black/10 bg-[#FAF7F0]/50 space-y-2">
              <span className="font-mono font-bold uppercase text-[10px] text-slate-400 block">
                Point of Contact
              </span>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-slate-500">Contact Person:</span>
                <span className="font-semibold text-slate-800">{buyer.contact_person || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-slate-500">Contact Email:</span>
                <span className="font-mono text-slate-800 truncate max-w-[140px]">{buyer.contact_email || '—'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Contract ID:</span>
                <span className="font-mono text-[11px] text-slate-600 truncate max-w-[140px]">{buyer.id}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {buyer.notes && (
            <div className="p-3.5 rounded-xl border border-black/10 bg-slate-50 text-xs">
              <span className="font-mono font-bold uppercase text-[10px] text-slate-400 block mb-1">
                Contract Terms &amp; Special Conditions
              </span>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{buyer.notes}</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 bg-[#FAF7F0] border-t border-black/10 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
