'use client'

import React from 'react'
import { 
  X, 
  Building2, 
  Shirt, 
  Calendar, 
  Layers, 
  Package, 
  Sparkles, 
  Scissors, 
  CheckCircle2, 
  IndianRupee, 
  Palette,
  ArrowRight,
  FileText,
  Image as ImageIcon
} from 'lucide-react'
import { MerchandisingOrder } from '../../types/merchandising'

interface ViewOrderDetailModalProps {
  isOpen: boolean
  onClose: () => void
  order: MerchandisingOrder | null
}

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL']

export function ViewOrderDetailModal({ isOpen, onClose, order }: ViewOrderDetailModalProps) {
  if (!isOpen || !order) return null

  const currencySymbol = order.currency === 'USD' ? '$' : order.currency === 'EUR' ? '€' : '₹'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-white text-[#3A3564] border border-black/10 shadow-2xs">
                  Buyer PO Specification
                </span>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  {order.po_number}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1 font-[family-name:var(--font-heading)]">
                {order.brand_name} • {order.style_ref}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-900 flex-1">
          
          {/* Top 3 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            
            {/* Ordered Volume */}
            <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-black/10 shadow-2xs">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Total Ordered Volume
              </span>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                {order.total_quantity.toLocaleString('en-IN')} <span className="text-sm font-semibold text-slate-500">Pcs</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Contracted commercial piece volume
              </p>
            </div>

            {/* Unit Price & Total Value */}
            <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-black/10 shadow-2xs">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Unit FOB &amp; Contract Value
              </span>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                {currencySymbol}{order.unit_fob_price.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Total: <strong>{currencySymbol}{order.total_contract_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </p>
            </div>

            {/* Target Delivery Date */}
            <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-black/10 shadow-2xs">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Target Ex-Factory Date
              </span>
              <div className="text-lg font-bold font-mono text-[#3A3564] mt-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{order.ex_factory_date}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Status: <strong className="uppercase">{order.status.replace('_', ' ')}</strong>
              </p>
            </div>

          </div>

          {/* Attached Design Reference & CAD Visuals */}
          {(order.cad_front_url || order.cad_back_url) && (
            <div className="bg-white p-4.5 rounded-2xl border border-black/10 space-y-3 shadow-2xs">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#3A3564]" />
                <span>Attached Design Reference &amp; CAD Artwork</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {order.cad_front_url && (
                  <div className="p-3 bg-[#FAF7F0] rounded-xl border border-black/10 flex flex-col items-center">
                    <img 
                      src={order.cad_front_url} 
                      alt="Front CAD" 
                      className="h-28 w-auto max-w-full object-contain rounded-lg shadow-2xs bg-white p-1 border border-black/5" 
                    />
                    <span className="text-[10.5px] font-mono font-bold text-slate-700 mt-2 uppercase">Front View Design</span>
                  </div>
                )}
                {order.cad_back_url && (
                  <div className="p-3 bg-[#FAF7F0] rounded-xl border border-black/10 flex flex-col items-center">
                    <img 
                      src={order.cad_back_url} 
                      alt="Back CAD" 
                      className="h-28 w-auto max-w-full object-contain rounded-lg shadow-2xs bg-white p-1 border border-black/5" 
                    />
                    <span className="text-[10.5px] font-mono font-bold text-slate-700 mt-2 uppercase">Back View Design</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Garment Blueprint & Embellishment Routing */}
          <div className="bg-white p-4.5 rounded-2xl border border-black/10 space-y-3 shadow-2xs">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Shirt className="w-4 h-4 text-[#3A3564]" />
              <span>Garment Blueprint &amp; Production Routing</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-slate-400 font-mono text-[10.5px] uppercase block">Style Description</span>
                <p className="font-bold text-slate-900">{order.style_name || `${order.style_ref} Apparel`}</p>
                {order.fabric_composition && (
                  <p className="text-slate-600 font-medium">{order.fabric_composition} {order.target_gsm ? `• ${order.target_gsm} GSM` : ''}</p>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-slate-400 font-mono text-[10.5px] uppercase block">Embellishment Flow</span>
                <span className="inline-block px-2.5 py-1 rounded-md bg-[#FAF7F0] text-[#3A3564] font-mono font-bold border border-black/10">
                  {order.embellishment_sequence === 'NONE' ? 'No Embroidery, No Printing' :
                   order.embellishment_sequence === 'ONLY_PRINTING' ? 'Only Printing' :
                   order.embellishment_sequence === 'ONLY_EMBROIDERY' ? 'Only Embroidery' :
                   order.embellishment_sequence === 'EMBROIDERY_FIRST_THEN_PRINT' ? 'Embroidery First, Then Printing' :
                   order.embellishment_sequence === 'PRINT_FIRST_THEN_EMBROIDERY' ? 'Printing First, Then Embroidery' :
                   order.embellishment_sequence || 'Standard Cut & Sew Routing'}
                </span>
              </div>
            </div>
          </div>

          {/* Bill of Materials (BOM) Trims & Specs (if present) */}
          {order.bom_materials && order.bom_materials.length > 0 && (
            <div className="bg-white p-4.5 rounded-2xl border border-black/10 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#3A3564]" />
                  <span>Bill of Materials (BOM) &amp; Trims</span>
                </h3>
                <span className="text-[11px] font-mono font-bold bg-[#FAF7F0] text-[#3A3564] px-2 py-0.5 rounded border border-black/10">
                  {order.bom_materials.length} Items
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-black/10 bg-[#FAF7F0] text-[10.5px] font-mono font-bold uppercase text-slate-600">
                      <th className="py-2 px-3">Component Type</th>
                      <th className="py-2 px-3">Item Description</th>
                      <th className="py-2 px-3">Consumption</th>
                      <th className="py-2 px-3">Placement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-slate-700">
                    {order.bom_materials.map((mat: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-900">{mat.component_type || 'Material'}</td>
                        <td className="py-2 px-3">{mat.item_name || '-'}</td>
                        <td className="py-2 px-3 font-mono font-bold text-[#3A3564]">{mat.consumption || '-'}</td>
                        <td className="py-2 px-3 font-mono text-slate-500">{mat.placement || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Color & Size Distribution Breakdown Table */}
          <div className="bg-white p-4.5 rounded-2xl border border-black/10 space-y-3 shadow-2xs">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#3A3564]" />
              <span>Colorway &amp; Size Breakdown Matrix</span>
            </h3>

            {order.color_matrix && order.color_matrix.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-black/10 bg-[#FAF7F0] text-[10.5px] font-mono font-bold uppercase text-slate-600">
                      <th className="py-2 px-3">Colorway</th>
                      {DEFAULT_SIZES.map(s => (
                        <th key={s} className="py-2 px-3 text-center">{s}</th>
                      ))}
                      <th className="py-2 px-3 text-right">Total Pcs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-slate-800 font-mono">
                    {order.color_matrix.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">{row.color}</td>
                        {DEFAULT_SIZES.map(s => (
                          <td key={s} className="py-2.5 px-3 text-center text-slate-700">
                            {row.sizes?.[s] ? row.sizes[s].toLocaleString('en-IN') : '0'}
                          </td>
                        ))}
                        <td className="py-2.5 px-3 text-right font-bold text-[#3A3564]">
                          {(row.total || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 bg-[#FAF7F0] font-bold text-slate-900 font-mono">
                      <td className="py-2.5 px-3 uppercase text-[11px]">Total Breakdown</td>
                      {DEFAULT_SIZES.map(s => {
                        const colTotal = order.color_matrix.reduce((sum, r) => sum + (r.sizes?.[s] || 0), 0)
                        return (
                          <td key={s} className="py-2.5 px-3 text-center">
                            {colTotal.toLocaleString('en-IN')}
                          </td>
                        )
                      })}
                      <td className="py-2.5 px-3 text-right text-[#3A3564]">
                        {order.total_quantity.toLocaleString('en-IN')} Pcs
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No colorway matrix registered.</p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAF7F0] border-t border-black/10 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            Close Specification
          </button>
        </div>

      </div>
    </div>
  )
}
