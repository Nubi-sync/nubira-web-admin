'use client'

import React from 'react'
import {
  X,
  FileText,
  Scissors,
  CheckCircle2,
  Clock,
  Truck,
  Layers,
  Calendar,
  IndianRupee,
  UserCheck,
  Tag,
  AlertCircle,
  Building2,
  Sparkles,
  PackageCheck,
  Image as ImageIcon
} from 'lucide-react'
import { BuyerArticleHistory } from '../actions'

interface ArticleContractDetailModalProps {
  isOpen: boolean
  article: BuyerArticleHistory | null
  buyerName: string
  buyerContact?: string
  buyerPhone?: string
  onClose: () => void
}

export function ArticleContractDetailModal({
  isOpen,
  article,
  buyerName,
  buyerContact,
  buyerPhone,
  onClose
}: ArticleContractDetailModalProps) {
  if (!isOpen || !article) return null

  const assigned = article.assignedQty || 0
  const delivered = article.deliveredQty || 0
  const remaining = Math.max(0, assigned - delivered)
  const percent = assigned > 0 ? Math.min(100, Math.round((delivered / assigned) * 100)) : 0

  const getStatusBadge = (status: BuyerArticleHistory['status']) => {
    switch (status) {
      case 'DELIVERED':
      case 'DISPATCHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Delivered ({percent}%)
          </span>
        )
      case 'QC_PASSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            QC Passed
          </span>
        )
      case 'IN_PRODUCTION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            In Production
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Pending Start
          </span>
        )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none overflow-y-auto">
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#F8FAFC] border-b border-slate-200/80 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-md bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs">
                {article.artNo}
              </span>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {buyerName}
              </span>
              {getStatusBadge(article.status)}
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)] truncate">
              {article.description || article.product || `Contract Details • ${article.artNo}`}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Challan #{article.challanNo} • Contracted on {article.contractDate}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-[#0B1220] hover:bg-slate-200/60 transition-colors shrink-0 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(92vh-160px)] text-[#0B1220]">
          
          {/* 1. Fulfillment Progress Card */}
          <div className="bg-[#F8FAFC] rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs sm:text-sm">
              <span className="font-bold text-[#0B1220] flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-[#14C8B4]" />
                Contract Delivery Fulfillment
              </span>
              <span className="font-mono font-bold text-slate-700">
                {delivered.toLocaleString()} / {assigned.toLocaleString()} Pcs ({percent}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  percent >= 100 
                    ? 'bg-emerald-500' 
                    : percent > 50 
                    ? 'bg-[#14C8B4]' 
                    : 'bg-[#1D4ED8]'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-medium">Contracted Qty</div>
                <div className="text-sm sm:text-base font-bold text-[#0B1220] font-mono">{assigned.toLocaleString()} pcs</div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="text-[11px] text-emerald-600 font-medium">Delivered Qty</div>
                <div className="text-sm sm:text-base font-bold text-emerald-700 font-mono">{delivered.toLocaleString()} pcs</div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-medium">Pending Delivery</div>
                <div className="text-sm sm:text-base font-bold text-amber-700 font-mono">{remaining.toLocaleString()} pcs</div>
              </div>
            </div>
          </div>

          {/* 2. Grid: Contract Form & Commercials | Design & Specs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            
            {/* Box A: Contract Form Details */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 font-bold text-xs sm:text-sm text-[#0B1220]">
                <FileText className="w-4 h-4 text-[#1D4ED8]" />
                Contract &amp; Order Form
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center gap-2 py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Challan / Contract No:</span>
                  <span className="font-bold text-[#0B1220] font-mono">{article.challanNo}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Contract Date:</span>
                  <span className="font-semibold text-slate-800">{article.contractDate || 'N/A'}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Target Delivery Date:</span>
                  <span className="font-semibold text-slate-800">{article.deliveryDate || 'As per floor schedule'}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Fabric Type:</span>
                  <span className="font-semibold text-[#0B1220]">{article.fabricType || 'Standard Fabric'}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Sample Provided:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    article.sampleGiven 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {article.sampleGiven ? 'Yes (Verified)' : 'No Sample'}
                  </span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1">
                  <span className="text-slate-500 font-medium">Floor In-Charge:</span>
                  <span className="font-semibold text-[#0B1220] flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    {article.assignedLinemanName || 'Shop Floor Team'}
                  </span>
                </div>
              </div>
            </div>

            {/* Box B: Article Design & Manufacturing Specs */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 font-bold text-xs sm:text-sm text-[#0B1220]">
                <Scissors className="w-4 h-4 text-[#14C8B4]" />
                Design &amp; Manufacturing Specs
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center gap-2 py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Article Code:</span>
                  <span className="font-bold text-[#0B1220] font-mono">{article.artNo}</span>
                </div>

                {article.patternNo && (
                  <div className="flex justify-between items-center gap-2 py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Pattern / Master CAD:</span>
                    <span className="font-semibold text-slate-800 font-mono">{article.patternNo}</span>
                  </div>
                )}

                <div className="flex justify-between items-center gap-2 py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Color / Print Pattern:</span>
                  <span className="font-semibold text-[#0B1220]">{article.colorPattern}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Size Range / Ratio:</span>
                  <span className="font-semibold text-[#0B1220]">{article.sizeRange}</span>
                </div>

                <div className="flex justify-between items-center gap-2 py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Packing Ratio:</span>
                  <span className="font-semibold text-slate-800">
                    {article.sets} sets × {article.pcsPerSet} pcs/set
                  </span>
                </div>

                {article.stitchingRate && (
                  <div className="flex justify-between items-center gap-2 py-1">
                    <span className="text-slate-500 font-medium">Stitching Job Rate:</span>
                    <span className="font-bold text-slate-900 font-mono flex items-center">
                      <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                      {article.stitchingRate.toFixed(2)} / pc
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. Notes / Special Instructions if present */}
          {article.challanNotes && (
            <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/80 space-y-1.5">
              <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Buyer Notes &amp; Special Contract Remarks
              </div>
              <p className="text-xs sm:text-sm text-amber-800/90 font-medium leading-relaxed">
                {article.challanNotes}
              </p>
            </div>
          )}

          {/* 4. Buyer Contact Snapshot */}
          <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-200/80 flex items-center justify-between gap-4 flex-wrap text-xs">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="font-bold text-[#0B1220]">{buyerName}</span>
                {buyerContact && <span className="text-slate-500 ml-1.5">({buyerContact})</span>}
              </div>
            </div>
            {buyerPhone && (
              <a
                href={`tel:+91${buyerPhone}`}
                className="font-mono font-bold text-[#0B1220] hover:underline bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs"
              >
                +91 {buyerPhone}
              </a>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[42px] px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          >
            Done / Close
          </button>
        </div>
      </div>
    </div>
  )
}
