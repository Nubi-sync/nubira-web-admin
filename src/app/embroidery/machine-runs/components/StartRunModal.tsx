'use client'

import React, { useState } from 'react'
import { X, Play, Cpu, Sparkles } from 'lucide-react'
import {
  EmbroideryMachineRun,
  EmbroideryDesign,
} from '../../types/embroidery'
import { saveMachineRun, getEmbroideryDesigns } from '../../utils/embroideryStorage'

interface StartRunModalProps {
  isOpen: boolean
  onClose: () => void
}

export function StartRunModal({ isOpen, onClose }: StartRunModalProps) {
  const designs = getEmbroideryDesigns()

  const [machineNumber, setMachineNumber] = useState('Machine 05 (20-Head Tajima)')
  const [operatorName, setOperatorName] = useState('Dinesh Kumar')
  const [selectedDesignId, setSelectedDesignId] = useState(designs[0]?.id || '')
  const [orderPo, setOrderPo] = useState(designs[0]?.order_id || 'PO-2026-ZARA-01')
  const [panelsLoaded, setPanelsLoaded] = useState(1000)
  const [rpmSpeed, setRpmSpeed] = useState(880)
  const [backingSpec, setBackingSpec] = useState('Tear-Away 40 GSM (Double Layer)')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const selectedDesign = designs.find(d => d.id === selectedDesignId) || designs[0]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    const newRun: EmbroideryMachineRun = {
      id: `run-emb-${Date.now()}`,
      run_number: `RUN-EMB-2026-${Math.floor(100 + Math.random() * 900)}`,
      machine_number: machineNumber,
      operator_name: operatorName,
      design_id: selectedDesign?.id || 'emb-des-001',
      design_code: selectedDesign?.design_code || 'DST-ZARA-04',
      order_po: orderPo,
      panels_loaded: Number(panelsLoaded),
      panels_completed: 0,
      thread_breaks_count: 0,
      total_stitches_run: 0,
      rpm_speed: Number(rpmSpeed),
      active_heads: 20,
      total_heads: 20,
      backing_spec: backingSpec,
      status: 'RUNNING',
      run_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    }

    saveMachineRun(newRun)
    setIsSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-black/10 flex items-center justify-between bg-[#FAF7F0]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Play className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Launch 20-Head Machine Run
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Allocate Punch File & Hooping Parameters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/60 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Machine Floor Target *
              </label>
              <select
                value={machineNumber}
                onChange={e => setMachineNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none bg-white font-medium"
              >
                <option value="Machine 01 (20-Head Tajima)">Machine 01 (20-Head Tajima)</option>
                <option value="Machine 02 (20-Head Barudan)">Machine 02 (20-Head Barudan)</option>
                <option value="Machine 03 (20-Head Tajima)">Machine 03 (20-Head Tajima)</option>
                <option value="Machine 04 (20-Head SWF)">Machine 04 (20-Head SWF)</option>
                <option value="Machine 05 (20-Head Tajima)">Machine 05 (20-Head Tajima)</option>
                <option value="Machine 06 (20-Head Barudan)">Machine 06 (20-Head Barudan)</option>
                <option value="Machine 07 (20-Head SWF)">Machine 07 (20-Head SWF)</option>
                <option value="Machine 08 (20-Head Tajima)">Machine 08 (20-Head Tajima)</option>
                <option value="Machine 09 (20-Head Barudan)">Machine 09 (20-Head Barudan)</option>
                <option value="Machine 10 (20-Head Tajima)">Machine 10 (20-Head Tajima)</option>
              </select>
            </div>
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Shift Operator *
              </label>
              <input
                type="text"
                required
                value={operatorName}
                onChange={e => setOperatorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Select Approved DST Design *
              </label>
              <select
                value={selectedDesignId}
                onChange={e => {
                  setSelectedDesignId(e.target.value)
                  const des = designs.find(d => d.id === e.target.value)
                  if (des) setOrderPo(des.order_id)
                }}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none bg-white font-medium"
              >
                {designs.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.design_code} ({d.total_stitches.toLocaleString()} sts)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Order PO Reference
              </label>
              <input
                type="text"
                value={orderPo}
                onChange={e => setOrderPo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Panels Batch Size (Loaded) *
              </label>
              <input
                type="number"
                required
                min={20}
                value={panelsLoaded}
                onChange={e => setPanelsLoaded(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Operating RPM Speed
              </label>
              <input
                type="number"
                min={600}
                max={1100}
                value={rpmSpeed}
                onChange={e => setRpmSpeed(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono"
              />
              <span className="text-[10px] text-slate-400">Target 850–920 RPM</span>
            </div>
          </div>

          <div>
            <label className="block font-mono font-bold text-slate-700 mb-1">
              Hooping & Backing Stabilizer Spec *
            </label>
            <input
              type="text"
              required
              value={backingSpec}
              onChange={e => setBackingSpec(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-black/10 text-slate-600 hover:bg-slate-100 font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Play className="w-4 h-4" />
              <span>Launch Run</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
