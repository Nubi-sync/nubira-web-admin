'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { X, Layers, ShieldCheck, CheckCircle2, AlertTriangle, Plus, Sparkles } from 'lucide-react'
import { FabricRoll, FabricShadeGroup, FabricInspectionStatus } from '../../types/store'
import { saveFabricRoll, calculate4PointScore } from '../../utils/storeStorage'
import { getOrders, getSourcingRequisitions } from '@/app/merchandising/utils/merchandisingStorage'

interface InwardFabricRollModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function InwardFabricRollModal({ isOpen, onClose, onSuccess }: InwardFabricRollModalProps) {
  const [activeColors, setActiveColors] = useState<{ name: string; shade: FabricShadeGroup }[]>([
    { name: 'Orange', shade: 'SHADE_A' },
    { name: 'Green', shade: 'SHADE_B' }
  ])
  const [activePo, setActivePo] = useState('PO-2026-9901')
  const [activeMaterial, setActiveMaterial] = useState('100% Combed Cotton French Terry (380 GSM)')
  const [activeVendor, setActiveVendor] = useState('Vardhman demo mills')

  const [rollBarcode, setRollBarcode] = useState('ROL-2026-9901')
  const [supplierName, setSupplierName] = useState('Vardhman demo mills')
  const [fabricType, setFabricType] = useState('100% Combed Cotton French Terry (380 GSM)')
  const [colorShade, setColorShade] = useState('Orange')
  const [shadeGroup, setShadeGroup] = useState<FabricShadeGroup>('SHADE_A')
  const [grossWeightKg, setGrossWeightKg] = useState<number>(250)
  const [netMeterage, setNetMeterage] = useState<number>(450)
  const [measuredGsm, setMeasuredGsm] = useState<number>(380)
  const [measuredWidthInches, setMeasuredWidthInches] = useState<number>(60)
  const [godownRackLocation, setGodownRackLocation] = useState('Bin A-04')
  const [inspectorName, setInspectorName] = useState('QA Fabric Auditor')

  // Defect breakdown
  const [points1, setPoints1] = useState<number>(1)
  const [points2, setPoints2] = useState<number>(1)
  const [points3, setPoints3] = useState<number>(0)
  const [points4, setPoints4] = useState<number>(0)
  const [notes, setNotes] = useState('Direct mill delivery inward - ASTM 4-Point Passed')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dynamically load active colors and specs from buyer order and sourcing PR
  useEffect(() => {
    if (typeof window === 'undefined') return
    const orders = getOrders()
    const prs = getSourcingRequisitions()

    const latestPo = orders.find(o => o.po_number === 'PO-2026-9901') || orders[0]
    const latestPr = prs.find(p => p.po_number === 'PO-2026-9901') || prs[0]

    let extractedColors: { name: string; shade: FabricShadeGroup }[] = []

    if (latestPo && latestPo.color_matrix && latestPo.color_matrix.length > 0) {
      extractedColors = latestPo.color_matrix.map((cb, idx) => ({
        name: cb.color,
        shade: (idx === 0 ? 'SHADE_A' : idx === 1 ? 'SHADE_B' : 'SHADE_C') as FabricShadeGroup
      }))
    } else if (latestPr && latestPr.material_name) {
      // Parse "(green and orange)" or similar from PR material description
      const match = latestPr.material_name.match(/\(([^)]+)\)/)
      if (match && match[1]) {
        const parts = match[1].split(/and|,|\//).map(s => s.trim()).filter(Boolean)
        if (parts.length > 0) {
          extractedColors = parts.map((p, idx) => ({
            name: p.charAt(0).toUpperCase() + p.slice(1),
            shade: (idx === 0 ? 'SHADE_A' : idx === 1 ? 'SHADE_B' : 'SHADE_C') as FabricShadeGroup
          }))
        }
      }
    }

    if (extractedColors.length === 0) {
      extractedColors = [
        { name: 'Orange', shade: 'SHADE_A' },
        { name: 'Green', shade: 'SHADE_B' }
      ]
    }

    setActiveColors(extractedColors)

    if (latestPo) {
      setActivePo(latestPo.po_number)
      if (latestPo.style_name) {
        setFabricType('100% Combed Cotton French Terry (380 GSM)')
      }
    }

    if (latestPr) {
      if (latestPr.vendor_name) {
        setActiveVendor(latestPr.vendor_name)
        setSupplierName(latestPr.vendor_name)
      }
    }

    // Default to the first color from user's PO
    if (extractedColors.length > 0) {
      setColorShade(extractedColors[0].name)
      setShadeGroup(extractedColors[0].shade)
    }
  }, [isOpen])

  // Preset Selection dynamically using user's actual colors
  const selectColorPreset = (colorName: string, shade: FabricShadeGroup, index: number) => {
    setColorShade(colorName)
    setShadeGroup(shade)
    setRollBarcode(`ROL-2026-${9901 + index}`)
    setGodownRackLocation(index === 0 ? 'Bin A-04' : `Bin B-0${2 + index}`)
    setNetMeterage(450)
    setGrossWeightKg(250)
  }

  // Live ASTM 4-Point Score Calculation
  const totalPoints = useMemo(() => {
    return points1 * 1 + points2 * 2 + points3 * 3 + points4 * 4
  }, [points1, points2, points3, points4])

  const { pointsPer100SqYd, verdict } = useMemo(() => {
    const lengthYards = (netMeterage || 100) * 1.09361
    return calculate4PointScore(totalPoints, lengthYards, measuredWidthInches || 60)
  }, [totalPoints, netMeterage, measuredWidthInches])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const newRoll: FabricRoll = {
        id: `roll-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        rollBarcode: rollBarcode.trim() || `ROL-${Date.now().toString().slice(-6)}`,
        supplierName: supplierName.trim() || activeVendor || 'Mill Supplier',
        fabricType: fabricType.trim() || activeMaterial || 'Knitted French Terry',
        colorShade: colorShade.trim() || 'Orange',
        shadeGroup,
        grossWeightKg: Number(grossWeightKg) || 250,
        netMeterage: Number(netMeterage) || 450,
        measuredGsm: Number(measuredGsm) || 380,
        targetGsm: 380,
        measuredWidthInches: Number(measuredWidthInches) || 60,
        targetWidthInches: 60,
        penaltyPointsTotal: totalPoints,
        pointsPer100SqYd,
        inspectionStatus: verdict,
        inspectorId: 'emp-qa-101',
        inspectorName: inspectorName.trim() || 'QA Inspector',
        inspectedAt: new Date().toISOString(),
        godownRackLocation: godownRackLocation.trim() || 'Bin A-04',
        isIssuedToCutting: false,
        allocatedOrderId: activePo || 'PO-2026-9901',
        defectBreakdown: {
          points1,
          points2,
          points3,
          points4
        },
        notes
      }

      saveFabricRoll(newRoll)
      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      console.error('Failed to inward fabric roll:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-black/10 rounded-2xl shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-bold shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 font-[family-name:var(--font-heading)]">
                Inward Fabric Roll &amp; 4-Point QC
              </h2>
              <p className="text-xs font-mono text-slate-500">
                Linked PO: <span className="font-bold text-[#3A3564]">{activePo}</span> • Central Store Godown
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Color Presets from User's PO Color Matrix */}
        <div className="bg-[#FAF7F0] p-3.5 rounded-xl border border-black/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#3A3564]" />
              Your Order Colorway Rolls ({activePo}):
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
              Click to Quick-Fill Roll
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {activeColors.map((c, idx) => {
              const isSelected = colorShade.toLowerCase() === c.name.toLowerCase()
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => selectColorPreset(c.name, c.shade, idx)}
                  className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#3A3564] text-white border-[#3A3564]'
                      : 'bg-white text-slate-800 border-black/10 hover:bg-[#FAF7F0]'
                  }`}
                >
                  <span>Roll {idx + 1} ({`ROL-2026-${9901 + idx}`}):</span>
                  <span className="capitalize underline">{c.name}</span>
                  <span className="text-[10px] opacity-80">({c.shade.replace('_', ' ')})</span>
                </button>
              )
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Roll Barcode */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Roll Barcode #
              </label>
              <input
                type="text"
                required
                value={rollBarcode}
                onChange={e => setRollBarcode(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#3A3564] focus:outline-none"
                placeholder="e.g. ROL-2026-9901"
              />
            </div>

            {/* Mill Supplier */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mill Supplier
              </label>
              <input
                type="text"
                required
                value={supplierName}
                onChange={e => setSupplierName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#3A3564] focus:outline-none"
                placeholder="e.g. Vardhman demo mills"
              />
            </div>

            {/* Fabric Specification */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Fabric Specification / Composition
              </label>
              <input
                type="text"
                required
                value={fabricType}
                onChange={e => setFabricType(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#3A3564] focus:outline-none"
                placeholder="e.g. 100% Combed Cotton French Terry (380 GSM)"
              />
            </div>

            {/* Color & Shade Group */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Colorway / Shade
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={colorShade}
                  onChange={e => setColorShade(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#3A3564] focus:outline-none capitalize"
                  placeholder="e.g. Orange"
                />
                {activeColors.length > 0 && (
                  <select
                    value={colorShade}
                    onChange={e => {
                      const sel = activeColors.find(c => c.name.toLowerCase() === e.target.value.toLowerCase())
                      if (sel) {
                        setColorShade(sel.name)
                        setShadeGroup(sel.shade)
                      } else {
                        setColorShade(e.target.value)
                      }
                    }}
                    className="px-2 py-2 bg-white border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-800"
                  >
                    {activeColors.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Shade Group Band
              </label>
              <select
                value={shadeGroup}
                onChange={e => setShadeGroup(e.target.value as FabricShadeGroup)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#3A3564] focus:outline-none"
              >
                <option value="SHADE_A">Shade Group A (Standard Target)</option>
                <option value="SHADE_B">Shade Group B (Slight Tint)</option>
                <option value="SHADE_C">Shade Group C (Acceptable Variance)</option>
              </select>
            </div>

            {/* Yardage & Weight */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Gross Meterage (Meters)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={netMeterage}
                onChange={e => setNetMeterage(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#3A3564] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Gross Weight (Kg)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={grossWeightKg}
                onChange={e => setGrossWeightKg(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#3A3564] focus:outline-none"
              />
            </div>

            {/* Width & Godown Rack */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cuttable Width (Inches)
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={measuredWidthInches}
                onChange={e => setMeasuredWidthInches(parseFloat(e.target.value) || 60)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#3A3564] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Storage Rack / Bin Location
              </label>
              <input
                type="text"
                required
                value={godownRackLocation}
                onChange={e => setGodownRackLocation(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#3A3564] focus:outline-none"
                placeholder="e.g. Bin A-04"
              />
            </div>
          </div>

          {/* ASTM 4-Point Inspection Score Breakdown */}
          <div className="p-4 bg-[#FAF7F0] rounded-xl border border-black/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#3A3564]" />
                ASTM D5430 4-Point Defect Scoring Table
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-700">
                  Rate: <span className="font-black text-[#3A3564]">{pointsPer100SqYd} pts/100 sq yds</span>
                </span>
                {verdict === 'PASSED' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-white text-[#3A3564] border border-black/15 shadow-2xs">
                    ✓ Passed A-Grade
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-white text-rose-700 border border-black/15 shadow-2xs">
                    ✕ Reject (&gt;28 Pts)
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded-lg border border-black/10">
                <div className="text-[10px] font-mono text-slate-500 font-bold">&le; 3" (1 pt)</div>
                <input
                  type="number"
                  min="0"
                  value={points1}
                  onChange={e => setPoints1(parseInt(e.target.value) || 0)}
                  className="w-full text-center font-mono font-bold text-xs py-1 mt-1 bg-[#FAF7F0] rounded border border-black/10"
                />
              </div>
              <div className="bg-white p-2 rounded-lg border border-black/10">
                <div className="text-[10px] font-mono text-slate-500 font-bold">3"-6" (2 pts)</div>
                <input
                  type="number"
                  min="0"
                  value={points2}
                  onChange={e => setPoints2(parseInt(e.target.value) || 0)}
                  className="w-full text-center font-mono font-bold text-xs py-1 mt-1 bg-[#FAF7F0] rounded border border-black/10"
                />
              </div>
              <div className="bg-white p-2 rounded-lg border border-black/10">
                <div className="text-[10px] font-mono text-slate-500 font-bold">6"-9" (3 pts)</div>
                <input
                  type="number"
                  min="0"
                  value={points3}
                  onChange={e => setPoints3(parseInt(e.target.value) || 0)}
                  className="w-full text-center font-mono font-bold text-xs py-1 mt-1 bg-[#FAF7F0] rounded border border-black/10"
                />
              </div>
              <div className="bg-white p-2 rounded-lg border border-black/10">
                <div className="text-[10px] font-mono text-slate-500 font-bold">&gt; 9"/Hole (4 pts)</div>
                <input
                  type="number"
                  min="0"
                  value={points4}
                  onChange={e => setPoints4(parseInt(e.target.value) || 0)}
                  className="w-full text-center font-mono font-bold text-xs py-1 mt-1 bg-[#FAF7F0] rounded border border-black/10"
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono font-bold text-slate-600 hover:text-slate-900 bg-[#FAF7F0] hover:bg-[#F2ECE1] rounded-xl border border-black/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-mono font-bold text-white bg-[#3A3564] hover:bg-[#2c284e] rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Accept Roll into {godownRackLocation || 'Godown'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
