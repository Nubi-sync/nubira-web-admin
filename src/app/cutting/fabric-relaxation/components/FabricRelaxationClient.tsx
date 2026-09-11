'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  Clock,
  Search,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { FabricRollStaging, RollRelaxationStatus } from '../../types/cutting'
import { getFabricRolls, saveFabricRoll } from '../../utils/storage'

export function FabricRelaxationClient() {
  const [rolls, setRolls] = useState<FabricRollStaging[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedRoll, setSelectedRoll] = useState<FabricRollStaging | null>(null)
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    roll_barcode: '',
    fabric_lot_number: '',
    fabric_type: '100% Combed Cotton Single Jersey',
    colorway: 'Obsidian Black',
    weight_kg: 24.5,
    meters_length: 120,
    nominal_gsm: 180,
    tested_gsm: 182,
    relaxation_hours_required: 24,
    staging_rack: 'Rack B-01 (Air-Conditioned Bay)'
  })

  useEffect(() => {
    setRolls(getFabricRolls())
  }, [])

  const filteredRolls = rolls.filter(r => {
    const matchSearch =
      r.roll_barcode.toLowerCase().includes(search.toLowerCase()) ||
      r.fabric_lot_number.toLowerCase().includes(search.toLowerCase()) ||
      r.fabric_type.toLowerCase().includes(search.toLowerCase()) ||
      r.colorway.toLowerCase().includes(search.toLowerCase()) ||
      r.staging_rack.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleAdvanceStatus = (roll: FabricRollStaging) => {
    let next: RollRelaxationStatus = roll.status
    if (roll.status === 'ACCLIMATIZING') next = 'CONDITIONING_COMPLETED'
    else if (roll.status === 'CONDITIONING_COMPLETED') next = 'ALLOCATED_TO_LAY'

    const updated = saveFabricRoll({
      ...roll,
      status: next,
      relaxation_hours_elapsed: next === 'CONDITIONING_COMPLETED' ? roll.relaxation_hours_required : roll.relaxation_hours_elapsed
    })
    setRolls(updated)
    if (selectedRoll?.id === roll.id) {
      setSelectedRoll({ ...roll, status: next })
    }
  }

  const handleStageNewRoll = (e: React.FormEvent) => {
    e.preventDefault()
    const newRoll: FabricRollStaging = {
      id: `roll-${Date.now()}`,
      roll_barcode: formData.roll_barcode || `ROL-2026-${Math.floor(100 + Math.random() * 900)}`,
      fabric_lot_number: formData.fabric_lot_number || `LOT-TX-${Math.floor(1000 + Math.random() * 9000)}`,
      fabric_type: formData.fabric_type,
      colorway: formData.colorway,
      weight_kg: Number(formData.weight_kg) || 25,
      meters_length: Number(formData.meters_length) || 120,
      nominal_gsm: Number(formData.nominal_gsm) || 180,
      tested_gsm: Number(formData.tested_gsm) || 180,
      unrolled_at: new Date().toISOString(),
      relaxation_hours_required: Number(formData.relaxation_hours_required) || 24,
      relaxation_hours_elapsed: 0,
      status: 'ACCLIMATIZING',
      staging_rack: formData.staging_rack
    }

    const updated = saveFabricRoll(newRoll)
    setRolls(updated)
    setIsNewModalOpen(false)
  }

  // Summary Metrics
  const totalRolls = rolls.length
  const readyCount = rolls.filter(r => r.status === 'CONDITIONING_COMPLETED').length
  const inConditioningCount = rolls.filter(r => r.status === 'ACCLIMATIZING').length
  const totalFabricMeters = rolls.reduce((acc, r) => acc + r.meters_length, 0)

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
      {/* 1. Breadcrumb */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Link
            href="/cutting"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Floor Dashboard</span>
          </Link>
          <span className="text-slate-400 font-mono text-xs">/</span>
          <span className="text-xs font-mono font-bold text-slate-900">Fabric Relaxation & Roll Staging</span>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2e2a50] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Stage New Fabric Roll</span>
        </button>
      </div>

      {/* 2. Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Fabric Relaxation & Roll Staging Monitor
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
                24H Acclimatization Bay
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Tension relief monitoring, tested vs nominal GSM verification, shrinkage stabilization, and table allocation
            </p>
          </div>
        </div>
      </div>

      {/* 3. Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Acclimatizing Now</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-600 mt-2">{inConditioningCount} rolls</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Active tension release</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Ready for Lay</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 mt-2">{readyCount} rolls</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Passed 24h rest threshold</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Total Staged Fabric</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">{totalFabricMeters.toLocaleString()} m</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Across 4 staging racks</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Standard Rest Cycle</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-600 mt-2">24.0 Hours</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Strict anti-shrinkage protocol</p>
        </div>
      </div>

      {/* 4. Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search roll barcode, lot, fabric..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
            {(['ALL', 'ACCLIMATIZING', 'CONDITIONING_COMPLETED', 'ALLOCATED_TO_LAY'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-[#3A3564] text-white'
                    : 'bg-[#FAF7F0] text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Rolls Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] text-[#3A3564] font-mono uppercase text-[10px] tracking-wider border-b border-black/10">
              <tr>
                <th className="py-3 px-4 font-bold">Roll Barcode / Lot</th>
                <th className="py-3 px-4 font-bold">Fabric Spec & Color</th>
                <th className="py-3 px-4 font-bold">Weight & Meterage</th>
                <th className="py-3 px-4 font-bold">Tested GSM</th>
                <th className="py-3 px-4 font-bold">Relaxation Progress</th>
                <th className="py-3 px-4 font-bold">Staging Rack</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-medium">
              {filteredRolls.map(roll => {
                let badge = 'bg-slate-100 text-slate-700'
                if (roll.status === 'ACCLIMATIZING') badge = 'bg-amber-100 text-amber-800'
                if (roll.status === 'CONDITIONING_COMPLETED') badge = 'bg-emerald-100 text-emerald-800'
                if (roll.status === 'ALLOCATED_TO_LAY') badge = 'bg-sky-100 text-sky-800'

                const progressPct = Math.min(
                  Math.round((roll.relaxation_hours_elapsed / roll.relaxation_hours_required) * 100),
                  100
                )

                return (
                  <tr key={roll.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <div>{roll.roll_barcode}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{roll.fabric_lot_number}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{roll.colorway}</div>
                      <div className="text-[11px] text-slate-600 line-clamp-1">{roll.fabric_type}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{roll.weight_kg} kg</div>
                      <div className="text-[10px] text-slate-500">{roll.meters_length} meters</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{roll.tested_gsm} GSM</div>
                      <div className="text-[10px] text-slate-400">Nom: {roll.nominal_gsm} GSM</div>
                    </td>
                    <td className="py-3.5 px-4 w-44">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>{roll.relaxation_hours_elapsed}h of {roll.relaxation_hours_required}h</span>
                          <span className="font-bold text-slate-900">{progressPct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#FAF7F0] border border-black/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              progressPct >= 100 ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 text-[11px]">
                      {roll.staging_rack}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${badge}`}>
                        {roll.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {roll.status === 'ACCLIMATIZING' && (
                          <button
                            onClick={() => handleAdvanceStatus(roll)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold"
                          >
                            Mark Rested
                          </button>
                        )}
                        {roll.status === 'CONDITIONING_COMPLETED' && (
                          <button
                            onClick={() => handleAdvanceStatus(roll)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-mono text-[10px] font-bold"
                          >
                            Allocate Lay
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedRoll(roll)}
                          className="px-2 py-1 rounded-lg bg-white hover:bg-[#FAF7F0] border border-black/10 font-mono text-[11px] text-[#3A3564] font-bold shadow-2xs"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stage Roll Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-black/15 shadow-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <h3 className="font-bold text-base text-slate-900">Stage Fabric Roll for Relaxation</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStageNewRoll} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Roll Barcode</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ROL-2026-901"
                    value={formData.roll_barcode}
                    onChange={e => setFormData({ ...formData, roll_barcode: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Lot Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LOT-TX-8802"
                    value={formData.fabric_lot_number}
                    onChange={e => setFormData({ ...formData, fabric_lot_number: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Fabric Composition</label>
                  <input
                    type="text"
                    required
                    value={formData.fabric_type}
                    onChange={e => setFormData({ ...formData, fabric_type: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Colorway</label>
                  <input
                    type="text"
                    required
                    value={formData.colorway}
                    onChange={e => setFormData({ ...formData, colorway: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Roll Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight_kg}
                    onChange={e => setFormData({ ...formData, weight_kg: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Meterage (m)</label>
                  <input
                    type="number"
                    value={formData.meters_length}
                    onChange={e => setFormData({ ...formData, meters_length: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Nominal GSM</label>
                  <input
                    type="number"
                    value={formData.nominal_gsm}
                    onChange={e => setFormData({ ...formData, nominal_gsm: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Lab Tested GSM</label>
                  <input
                    type="number"
                    value={formData.tested_gsm}
                    onChange={e => setFormData({ ...formData, tested_gsm: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono font-bold text-indigo-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Required Rest Hours</label>
                  <input
                    type="number"
                    value={formData.relaxation_hours_required}
                    onChange={e => setFormData({ ...formData, relaxation_hours_required: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Staging Bay / Rack</label>
                  <input
                    type="text"
                    value={formData.staging_rack}
                    onChange={e => setFormData({ ...formData, staging_rack: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-black/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F0] hover:bg-slate-100 border border-black/10 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2e2a50] text-white text-xs font-bold"
                >
                  Begin 24H Relaxation Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Roll Detail Modal */}
      {selectedRoll && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-black/15 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Roll Staging Dossier</span>
                <h3 className="font-black text-lg text-slate-900">{selectedRoll.roll_barcode}</h3>
              </div>
              <button onClick={() => setSelectedRoll(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-[#FAF7F0]/60 border border-black/5">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Fabric Specification</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedRoll.fabric_type}</p>
                <p className="text-slate-600">Color: {selectedRoll.colorway} • Lot: {selectedRoll.fabric_lot_number}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-[#FAF7F0]/60 border border-black/5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Mass & Length</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedRoll.weight_kg} kg • {selectedRoll.meters_length} m</p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FAF7F0]/60 border border-black/5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">GSM Spec</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedRoll.tested_gsm} GSM (Tested)</p>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF7F0]/60 border border-black/5">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Location & Status</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedRoll.staging_rack}</p>
                <p className="font-mono text-slate-600 mt-0.5">Status: {selectedRoll.status.replace(/_/g, ' ')}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-black/10 flex justify-end">
              <button
                onClick={() => setSelectedRoll(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
