'use client'

import React, { useState, useEffect } from 'react'
import { X, Layers, CheckCircle2, AlertCircle, FileSpreadsheet, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'
import { ActiveBuyer } from '../../types/merchandising'
import { 
  AvailableTechPackArticle, 
  getAvailableTechPackArticles, 
  linkArticleToBuyer 
} from '../../utils/merchandisingStorage'

interface LinkArticleModalProps {
  isOpen: boolean
  buyer: ActiveBuyer | null
  onClose: () => void
  onArticleLinked: (updatedBuyer: ActiveBuyer) => void
}

export function LinkArticleModal({
  isOpen,
  buyer,
  onClose,
  onArticleLinked
}: LinkArticleModalProps) {
  const [articles, setArticles] = useState<AvailableTechPackArticle[]>([])
  const [selectedArticleId, setSelectedArticleId] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const list = getAvailableTechPackArticles()
      setArticles(list)
      if (buyer?.linked_article_id) {
        setSelectedArticleId(buyer.linked_article_id)
      } else if (list.length > 0) {
        // default select matching or first
        const match = list.find(a => a.art_number === buyer?.linked_article_number)
        setSelectedArticleId(match ? match.id : list[0].id)
      }
    }
  }, [isOpen, buyer])

  if (!isOpen || !buyer) return null

  const selectedArticle = articles.find(a => a.id === selectedArticleId || a.art_number === selectedArticleId)

  const handleLink = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedArticle) return

    setIsSubmitting(true)
    const updatedList = linkArticleToBuyer(
      buyer.id,
      selectedArticle.art_number || selectedArticle.style_number || '',
      selectedArticle.id,
      selectedArticle.style_name
    )

    const updated = updatedList.find(b => b.id === buyer.id)
    if (updated) {
      onArticleLinked(updated)
    }
    setIsSubmitting(false)
    onClose()
  }

  const currencySymbol = buyer.currency === 'INR' ? '₹' : buyer.currency === 'USD' ? '$' : buyer.currency === 'EUR' ? '€' : '£'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-xl rounded-2xl border border-black/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-[family-name:var(--font-heading)]">
                Link Tech Pack Article
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Assign an approved Tech Pack article to fulfill <span className="font-bold text-slate-800">{buyer.buyer_name}</span> order
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

        {/* Buyer Summary Card */}
        <div className="p-4 sm:px-6 bg-slate-50/70 border-b border-black/5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Buyer Contract</span>
            <span className="text-sm font-bold text-slate-900">{buyer.buyer_name}</span>
            <span className="text-xs text-slate-500 font-mono ml-2">({buyer.buyer_code})</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Contracted Volume</span>
              <span className="text-sm font-mono font-bold text-[#3A3564]">
                {buyer.contracted_volume.toLocaleString('en-IN')} Pcs
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Rate / Pc</span>
              <span className="text-sm font-mono font-bold text-slate-900">
                {currencySymbol}{buyer.price_per_piece.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLink} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {articles.length === 0 ? (
            <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
              <h4 className="text-sm font-bold text-amber-900">No Tech Packs Available</h4>
              <p className="text-xs text-amber-700 max-w-sm mx-auto">
                No active Tech Packs found. Please create and finalize a Tech Pack in the Design Studio first.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Select Tech Pack Article <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedArticleId}
                  onChange={e => setSelectedArticleId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden focus:border-[#3A3564] focus:ring-1 focus:ring-[#3A3564] transition-all cursor-pointer"
                >
                  <option value="" disabled>-- Select an Article Number with Approved Tech Pack --</option>
                  {articles.map(art => (
                    <option key={art.id} value={art.id}>
                      {art.art_number} — {art.style_name} ({art.category} | {art.fabric_composition})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Only articles with finalized Tech Packs in Design Studio appear in this dropdown.
                </p>
              </div>

              {/* Selected Article Detail Preview Card */}
              {selectedArticle && (
                <div className="p-4 rounded-xl bg-[#FAF7F0] border border-black/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#3A3564] text-white">
                        {selectedArticle.art_number}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {selectedArticle.style_name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Tech Pack Ready
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-black/5">
                    <div>
                      <span className="text-slate-400 font-mono text-[10px] uppercase block">Category &amp; Brand</span>
                      <span className="font-semibold text-slate-800">{selectedArticle.category} • {selectedArticle.brand_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono text-[10px] uppercase block">Fabric &amp; Target GSM</span>
                      <span className="font-semibold text-slate-800">{selectedArticle.fabric_composition} ({selectedArticle.target_gsm || 240} GSM)</span>
                    </div>
                  </div>

                  {selectedArticle.embellishment_sequence && (
                    <div className="pt-2 border-t border-black/5 text-xs">
                      <span className="text-slate-400 font-mono text-[10px] uppercase block">Embellishment Flow</span>
                      <span className="font-medium text-slate-700">
                        {selectedArticle.embellishment_sequence.replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Impact Callout */}
              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
                <Sparkles className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                <p>
                  Linking this article will immediately activate <span className="font-bold">{buyer.contracted_volume.toLocaleString('en-IN')} pieces</span> in the Merchandising Dashboard <span className="font-bold">In Order</span> tracker!
                </p>
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-black/15 bg-white hover:bg-slate-50 text-xs sm:text-sm font-bold text-slate-700 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedArticle || articles.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Linking...' : 'Confirm & Link Article'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
