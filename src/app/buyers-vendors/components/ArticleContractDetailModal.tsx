'use client'

import React, { useState } from 'react'
import {
  X,
  FileText,
  Scissors,
  CheckCircle2,
  Clock,
  Layers,
  Calendar,
  IndianRupee,
  DollarSign,
  Euro,
  UserCheck,
  Building2,
  Sparkles,
  PackageCheck,
  TrendingUp,
  Palette,
  Package,
  Shirt,
  Image as ImageIcon,
  Loader2,
  ArrowRight
} from 'lucide-react'
import { BuyerArticleHistory } from '../actions'
import { parseFabricAndBOM } from '../utils/buyerUtils'

interface ArticleContractDetailModalProps {
  isOpen: boolean
  article: BuyerArticleHistory | null
  buyerName: string
  buyerContact?: string
  buyerPhone?: string
  onClose: () => void
}

type ModalTab = 'techpack' | 'contract' | 'progress'

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL']

function formatEmbellishmentSequence(seq?: string): string {
  if (!seq || seq === 'NONE') return 'No Embroidery, No Printing (Cut & Sew)'
  if (seq === 'ONLY_PRINTING') return 'Only Printing'
  if (seq === 'ONLY_EMBROIDERY') return 'Only Embroidery'
  if (seq === 'EMBROIDERY_FIRST_THEN_PRINT') return 'Embroidery First, Then Printing'
  if (seq === 'PRINT_FIRST_THEN_EMBROIDERY') return 'Printing First, Then Embroidery'
  return seq
}

export function ArticleContractDetailModal({
  isOpen,
  article,
  buyerName,
  buyerContact,
  buyerPhone,
  onClose
}: ArticleContractDetailModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>('progress')
  const [isTabLoading, setIsTabLoading] = useState(false)

  if (!isOpen || !article) return null

  const assigned = article.assignedQty || 0
  const delivered = article.deliveredQty || 0
  const remaining = Math.max(0, assigned - delivered)
  const percent = assigned > 0 ? Math.min(100, Math.round((delivered / assigned) * 100)) : 0

  // Robust parsing of fabric composition and embedded BOM_JSON
  const rawFabric = article.techPack?.fabricComposition || article.fabricType || ''
  const { cleanFabric, materials: parsedBOM } = parseFabricAndBOM(rawFabric)

  const effectiveBOM = (article.techPack?.bomMaterials && article.techPack.bomMaterials.length > 0)
    ? article.techPack.bomMaterials
    : (parsedBOM && parsedBOM.length > 0 ? parsedBOM : [])

  const techPack = {
    styleNumber: article.techPack?.styleNumber || article.artNo,
    category: article.techPack?.category || article.category || 'Apparel Master',
    fabricComposition: cleanFabric,
    targetGsm: article.techPack?.targetGsm || 180,
    embellishmentSequence: article.techPack?.embellishmentSequence || 'ONLY_EMBROIDERY',
    bomMaterials: effectiveBOM,
    cadFrontUrl: article.techPack?.cadFrontUrl || '',
    cadBackUrl: article.techPack?.cadBackUrl || '',
    constructionNotes: article.techPack?.constructionNotes || article.challanNotes || ''
  }

  const contract = article.contract || {
    poNumber: article.challanNo,
    buyerName: buyerName,
    fobPrice: 12.5,
    currency: 'USD',
    totalContractValue: assigned * 12.5,
    season: 'SS 2026',
    orderDate: article.contractDate,
    deliveryDate: article.deliveryDate || 'As per factory schedule',
    commercialStatus: article.status,
    colorMatrix: []
  }

  const floorReview = article.floorReview || {
    inPending: 0,
    inCutting: 0,
    inPrinting: 0,
    inEmbroidery: 0,
    inSewing: 0,
    iron: 0,
    washing: 0,
    alter: 0
  }

  const handleTabSwitch = (tab: ModalTab) => {
    if (tab === activeTab) return
    setIsTabLoading(true)
    setActiveTab(tab)
    setTimeout(() => {
      setIsTabLoading(false)
    }, 180)
  }

  const currencySymbol = contract.currency === 'EUR' ? '€' : contract.currency === 'INR' ? '₹' : '$'

  const stagesList = [
    { label: '1. In Pending', count: floorReview.inPending },
    { label: '2. In Cutting', count: floorReview.inCutting },
    { label: '3. In Printing', count: floorReview.inPrinting },
    { label: '4. In Embroidery', count: floorReview.inEmbroidery },
    { label: '5. In Sewing', count: floorReview.inSewing },
    { label: '6. Iron', count: floorReview.iron },
    { label: '7. Washing', count: floorReview.washing },
    { label: '8. Alter', count: floorReview.alter },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none overflow-y-auto">
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 bg-[#F8FAFC] border-b border-slate-200/80 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-md bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs">
                {article.artNo}
              </span>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {buyerName}
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                article.sourceType === 'MERCHANDISING_PO' 
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                {article.sourceType === 'MERCHANDISING_PO' ? 'Merchandising PO' : 'Floor Challan'}
              </span>
              <span className="text-xs font-mono font-bold text-slate-700">
                PO #{article.challanNo}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)] truncate">
              {article.description || article.product || `Contract Hub • ${article.artNo}`}
            </h2>
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

        {/* 3 Interactive Tabs Bar */}
        <div className="px-4 sm:px-6 pt-3 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Tab 1: Related Tech Pack */}
            <button
              type="button"
              onClick={() => handleTabSwitch('techpack')}
              className={`px-3.5 sm:px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
                activeTab === 'techpack'
                  ? 'border-[#1D4ED8] text-[#1D4ED8] bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Shirt className="w-4 h-4" />
              <span>Related Tech Pack</span>
            </button>

            {/* Tab 2: Buyer Contract */}
            <button
              type="button"
              onClick={() => handleTabSwitch('contract')}
              className={`px-3.5 sm:px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
                activeTab === 'contract'
                  ? 'border-[#1D4ED8] text-[#1D4ED8] bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Buyer Contract</span>
            </button>

            {/* Tab 3: Live Article Progress */}
            <button
              type="button"
              onClick={() => handleTabSwitch('progress')}
              className={`px-3.5 sm:px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
                activeTab === 'progress'
                  ? 'border-[#1D4ED8] text-[#1D4ED8] bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-[#14C8B4]" />
              <span>Live Article Progress</span>
            </button>
          </div>

          {/* Tab Switching Loading Indicator Animation */}
          <div className="flex items-center min-w-[32px] justify-end pb-1.5">
            {isTabLoading && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] animate-in fade-in duration-150">
                <Loader2 className="w-4 h-4 animate-spin text-[#1D4ED8]" />
                <span className="hidden md:inline text-[11px]">Loading...</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(92vh-175px)] text-[#0B1220] flex-1">
          
          {/* ================================================================ */}
          {/* TAB 1: RELATED TECH PACK                                          */}
          {/* ================================================================ */}
          {activeTab === 'techpack' && (
            <div className={`space-y-5 animate-in fade-in duration-200 ${isTabLoading ? 'opacity-50' : 'opacity-100'}`}>
              
              {/* Tech Pack Header Information */}
              <div className="bg-[#F8FAFC] p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Master Technical Specification
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
                    {techPack.styleNumber} • {techPack.category || 'Apparel Master'}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Fabric: <strong>{techPack.fabricComposition}</strong> • Target GSM: <strong>{techPack.targetGsm} GSM</strong>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] font-mono font-bold uppercase text-slate-400 block">Routing Flow</span>
                  <span className="inline-block mt-1 px-3 py-1 rounded-md bg-[#F0FDFA] text-[#0B1220] font-mono font-bold text-xs border border-black/15 shadow-2xs">
                    {formatEmbellishmentSequence(techPack.embellishmentSequence)}
                  </span>
                </div>
              </div>

              {/* CAD Drawings Previews */}
              {(techPack.cadFrontUrl || techPack.cadBackUrl) ? (
                <div className="bg-white p-4.5 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#0B1220]" />
                    <span>CAD Visuals &amp; Technical Drawings</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {techPack.cadFrontUrl && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center">
                        <img 
                          src={techPack.cadFrontUrl} 
                          alt="Front CAD Design" 
                          className="h-36 w-auto max-w-full object-contain rounded-lg shadow-2xs bg-white p-1 border border-slate-100" 
                        />
                        <span className="text-[11px] font-mono font-bold text-slate-700 mt-2 uppercase">Front CAD Sketch</span>
                      </div>
                    )}
                    {techPack.cadBackUrl && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center">
                        <img 
                          src={techPack.cadBackUrl} 
                          alt="Back CAD Design" 
                          className="h-36 w-auto max-w-full object-contain rounded-lg shadow-2xs bg-white p-1 border border-slate-100" 
                        />
                        <span className="text-[11px] font-mono font-bold text-slate-700 mt-2 uppercase">Back CAD Sketch</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-center space-y-2">
                  <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">No standalone CAD sketch uploaded for this article code.</p>
                  <p className="text-[11px] text-slate-400">Garment specifications are tracked via the production routing profile below.</p>
                </div>
              )}

              {/* Bill of Materials (BOM) & Trims Table */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#0B1220]" />
                    <span>Bill of Materials (BOM) &amp; Trims</span>
                  </h4>
                  <span className="text-[11px] font-mono font-bold bg-[#F0FDFA] text-[#0B1220] px-2 py-0.5 rounded border border-black/15">
                    {techPack.bomMaterials.length} {techPack.bomMaterials.length === 1 ? 'Item' : 'Items'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[480px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[10.5px] font-mono font-bold uppercase text-slate-600">
                        <th className="py-2.5 px-3">Component Type</th>
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-3">Consumption</th>
                        <th className="py-2.5 px-3">Placement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 text-slate-700 font-medium">
                      {techPack.bomMaterials.length > 0 ? (
                        techPack.bomMaterials.map((mat: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{mat.component_type || 'Material'}</td>
                            <td className="py-2.5 px-3">{mat.item_name || '-'}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-[#0B1220]">{mat.consumption || '-'}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">{mat.placement || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-xs text-slate-500 font-medium italic">
                            No additional BOM trims recorded for this tech pack.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Technical / Construction Notes */}
              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Construction &amp; Seam Notes
                </span>
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                  {techPack.constructionNotes || 'Standard 4-thread overlock with 1/4" margin. Double-needle bottom hem and sleeve cuffs. Heat-seal barcode sticker on polybag.'}
                </p>
              </div>

            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 2: BUYER CONTRACT                                            */}
          {/* ================================================================ */}
          {activeTab === 'contract' && (
            <div className={`space-y-5 animate-in fade-in duration-200 ${isTabLoading ? 'opacity-50' : 'opacity-100'}`}>
              
              {/* Top 3 Contract KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Total Ordered Volume */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                    Total Ordered Volume
                  </span>
                  <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                    {assigned.toLocaleString('en-IN')} <span className="text-sm font-semibold text-slate-500">Pcs</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Contracted commercial piece volume
                  </p>
                </div>

                {/* Unit Price & Total Value */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                    Unit FOB &amp; Contract Value
                  </span>
                  <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                    {currencySymbol}{contract.fobPrice.toFixed(2)}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Total: <strong>{currencySymbol}{contract.totalContractValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </p>
                </div>

                {/* Target Delivery Date */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                    Target Ex-Factory Date
                  </span>
                  <div className="text-lg font-bold font-mono text-[#0B1220] mt-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{contract.deliveryDate}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Status: <strong className="uppercase">{article.status.replace('_', ' ')}</strong>
                  </p>
                </div>
              </div>

              {/* Colorway & Size Matrix Table */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#0B1220]" />
                  <span>Colorway &amp; Size Breakdown Matrix</span>
                </h4>

                {contract.colorMatrix && contract.colorMatrix.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-[10.5px] font-mono font-bold uppercase text-slate-600">
                          <th className="py-2 px-3">Colorway</th>
                          {DEFAULT_SIZES.map(s => (
                            <th key={s} className="py-2 px-3 text-center">{s}</th>
                          ))}
                          <th className="py-2 px-3 text-right">Total Pcs</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 text-slate-800 font-mono">
                        {contract.colorMatrix.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">{row.color}</td>
                            {DEFAULT_SIZES.map(s => (
                              <td key={s} className="py-2.5 px-3 text-center text-slate-700">
                                {row.sizes?.[s] ? row.sizes[s].toLocaleString('en-IN') : '0'}
                              </td>
                            ))}
                            <td className="py-2.5 px-3 text-right font-bold text-[#0B1220]">
                              {(row.total || 0).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900 font-mono">
                          <td className="py-2.5 px-3 uppercase text-[11px]">Total Breakdown</td>
                          {DEFAULT_SIZES.map(s => {
                            const colTotal = contract.colorMatrix.reduce((sum, r) => sum + (r.sizes?.[s] || 0), 0)
                            return (
                              <td key={s} className="py-2.5 px-3 text-center">
                                {colTotal.toLocaleString('en-IN')}
                              </td>
                            )
                          })}
                          <td className="py-2.5 px-3 text-right text-[#0B1220]">
                            {assigned.toLocaleString('en-IN')} Pcs
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-xl text-center text-xs text-slate-500 font-medium">
                    Standard Colorway: <strong>{article.colorPattern || 'Primary Colorway'}</strong> • Size Ratio: <strong>{article.sizeRange}</strong> ({assigned.toLocaleString()} Pcs Total)
                  </div>
                )}
              </div>

              {/* Commercial & Contract Terms */}
              <div className="bg-[#F8FAFC] rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-[#0B1220]">
                  <FileText className="w-4 h-4 text-[#1D4ED8]" />
                  <span>Buyer Commercial Terms &amp; Order Form</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Contract / PO Number:</span>
                    <span className="font-bold font-mono text-[#0B1220]">{article.challanNo}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Contract Date:</span>
                    <span className="font-semibold text-slate-800">{article.contractDate || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Buyer Entity:</span>
                    <span className="font-semibold text-slate-800">{buyerName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Delivery Ex-Factory:</span>
                    <span className="font-semibold text-slate-800">{article.deliveryDate || 'As scheduled'}</span>
                  </div>
                </div>

                {article.challanNotes && (
                  <div className="pt-2 text-xs text-amber-800 bg-amber-50/70 p-3 rounded-xl border border-amber-200/70">
                    <strong>Special Buyer Remarks:</strong> {article.challanNotes}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 3: LIVE ARTICLE PROGRESS (8 Live Review Stages)              */}
          {/* ================================================================ */}
          {activeTab === 'progress' && (
            <div className={`space-y-5 animate-in fade-in duration-200 ${isTabLoading ? 'opacity-50' : 'opacity-100'}`}>
              
              {/* Live Review Header Strip (Matches Screenshot 2) */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shrink-0 shadow-2xs">
                      <TrendingUp className="w-4 h-4 text-[#0B1220]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                        Live Review
                      </h3>
                      <p className="text-xs text-slate-500">
                        Commercial lead-time and factory floor conversion • {buyerName} • {article.artNo}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs sm:text-sm font-semibold text-slate-500">
                      Total Booked: <strong className="text-slate-900 font-mono">{assigned.toLocaleString('en-IN')} pcs</strong>
                    </span>
                  </div>
                </div>

                {/* 8 Production Stage Cards Distributed Evenly across 2 Rows (4 cols x 2 rows) */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {stagesList.map((stg, idx) => {
                    const stgPercent = assigned > 0 ? Math.round((stg.count / assigned) * 100) : 0
                    return (
                      <div 
                        key={idx}
                        className="bg-white border border-slate-200 border-l-4 border-l-[#14C8B4] rounded-xl p-3.5 shadow-2xs hover:border-black/25 transition-all flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                            {stg.label}
                          </span>
                          <span className="text-xs font-extrabold font-mono px-2 py-0.5 rounded-full shadow-2xs text-[#0B1220] bg-[#F0FDFA] border border-[#14C8B4]/40">
                            {stgPercent}%
                          </span>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                          <p className="text-lg sm:text-xl font-bold font-[family-name:var(--font-heading)] text-slate-900 font-mono">
                            {stg.count.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                          <div 
                            className="bg-[#1D4ED8] h-full rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, stgPercent)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Delivery Outward Status Banner */}
              <div className="bg-[#F8FAFC] rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs sm:text-sm">
                  <span className="font-bold text-[#0B1220] flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4 text-[#14C8B4]" />
                    Contract Outward Gate Delivery Status
                  </span>
                  <span className="font-mono font-bold text-slate-700">
                    {delivered.toLocaleString('en-IN')} / {assigned.toLocaleString('en-IN')} Pcs ({percent}%)
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
                    <div className="text-sm sm:text-base font-bold text-[#0B1220] font-mono">{assigned.toLocaleString('en-IN')} pcs</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <div className="text-[11px] text-emerald-600 font-medium">Dispatched &amp; Delivered</div>
                    <div className="text-sm sm:text-base font-bold text-emerald-700 font-mono">{delivered.toLocaleString('en-IN')} pcs</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <div className="text-[11px] text-slate-500 font-medium">In Factory WIP</div>
                    <div className="text-sm sm:text-base font-bold text-amber-700 font-mono">{remaining.toLocaleString('en-IN')} pcs</div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 text-center pt-1 font-medium">
                  • Delivered quantity strictly reflects verified outward gate pass dispatches (0 while WIP remains in embroidery / floor stages).
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            Article <strong className="text-slate-900 font-mono">{article.artNo}</strong> • Buyer <strong className="text-slate-900">{buyerName}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-6 py-2 bg-[#0B1220] hover:bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer active:scale-[0.98] ml-auto"
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  )
}
