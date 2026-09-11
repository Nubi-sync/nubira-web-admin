'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  Recycle,
  Search,
  Plus,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Scissors
} from 'lucide-react'
import { EndLossRemnant, RemnantDisposition } from '../../types/cutting'
import { getEndLossRemnants, saveEndLossRemnant } from '../../utils/cuttingStorage'

export function EndLossClient() {
  const [remnants, setRemnants] = useState<EndLossRemnant[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedRemnant, setSelectedRemnant] = useState<EndLossRemnant | null>(null)
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    remnant_code: '',
    source_roll_barcode: 'ROL-2026-104',
    fabric_type: '100% Combed Cotton Single Jersey',
    colorway: 'Obsidian Black',
    length_meters: 1.8,
    width_inches: 60,
    reason: 'End of roll remnant insufficient for full marker lay',
    disposition: 'SALVAGED_FOR_POCKETS' as RemnantDisposition,
    allocated_to: 'Pocket linings & Neck tape trims'
  })

  useEffect(() => {
    setRemnants(getEndLossRemnants())
  }, [])

  const filteredRemnants = remnants.filter(r => {
    const matchSearch =
      r.remnant_code.toLowerCase().includes(search.toLowerCase()) ||
      r.source_roll_barcode.toLowerCase().includes(search.toLowerCase()) ||
      r.fabric_type.toLowerCase().includes(search.toLowerCase()) ||
      r.colorway.toLowerCase().includes(search.toLowerCase()) ||
      r.reason.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || r.disposition === statusFilter
    return matchSearch && matchStatus
  })

  const handleUpdateDisposition = (remnant: EndLossRemnant, newDisp: RemnantDisposition, note: string) => {
    const updated = saveEndLossRemnant({
      ...remnant,
      disposition: newDisp,
      allocated_to: note
    })
    setRemnants(updated)
    if (selectedRemnant?.id === remnant.id) {
      setSelectedRemnant({ ...remnant, disposition: newDisp, allocated_to: note })
    }
  }

  const handleCreateRemnant = (e: React.FormEvent) => {
    e.preventDefault()
    const newRemnant: EndLossRemnant = {
      id: `rem-${Date.now()}`,
      remnant_code: formData.remnant_code || `REM-2026-${Math.floor(100 + Math.random() * 900)}`,
      source_roll_barcode: formData.source_roll_barcode,
      fabric_type: formData.fabric_type,
      colorway: formData.colorway,
      length_meters: Number(formData.length_meters) || 1.5,
      width_inches: Number(formData.width_inches) || 60,
      reason: formData.reason,
      disposition: formData.disposition,
      allocated_to: formData.allocated_to,
      logged_at: new Date().toISOString()
    }

    const updated = saveEndLossRemnant(newRemnant)
    setRemnants(updated)
    setIsNewModalOpen(false)
  }

  // Summary Metrics
  const totalRemnants = remnants.length
  const salvagedLength = remnants
    .filter(r => r.disposition === 'SALVAGED_FOR_POCKETS')
    .reduce((acc, r) => acc + r.length_meters, 0)
    .toFixed(1)
  const totalMetersLogged = remnants.reduce((acc, r) => acc + r.length_meters, 0).toFixed(1)
  const salvageRate = Number(totalMetersLogged) > 0
    ? Math.round((Number(salvagedLength) / Number(totalMetersLogged)) * 100)
    : 72

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
          <span className="text-xs font-mono font-bold text-slate-900">End-Loss & Remnant Salvage</span>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2e2a50] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Remnant Cut Piece</span>
        </button>
      </div>

      {/* 2. Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Recycle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                End-Loss Log & Fabric Remnant Salvage
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
                Zero-Waste Yield Control
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Roll end bit tracking, pocket lining salvage allocation, defect cutoff triage, and industrial textile circularity
            </p>
          </div>
        </div>
      </div>

      {/* 3. Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Salvage Rate</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 mt-2">{salvageRate}%</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Rerouted from waste bin</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Salvaged Fabric</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">{salvagedLength} m</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Repurposed for small trims</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Total Remnants Logged</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-600 mt-2">{totalRemnants} pieces</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">{totalMetersLogged} meters tracked</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Scrap Diverted</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">142.4 kg</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Circular recycling partner</p>
        </div>
      </div>

      {/* 4. Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search remnant #, roll, fabric, reason..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
            {(['ALL', 'LOGGED', 'SALVAGED_FOR_POCKETS', 'SCRAP_DISPOSED', 'RETURNED_TO_MILL'] as const).map(st => (
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

      {/* 5. Remnants Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] text-[#3A3564] font-mono uppercase text-[10px] tracking-wider border-b border-black/10">
              <tr>
                <th className="py-3 px-4 font-bold">Remnant Serial</th>
                <th className="py-3 px-4 font-bold">Source Roll</th>
                <th className="py-3 px-4 font-bold">Fabric Spec & Color</th>
                <th className="py-3 px-4 font-bold">Dimensions</th>
                <th className="py-3 px-4 font-bold">Generation Reason</th>
                <th className="py-3 px-4 font-bold">Disposition</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-medium">
              {filteredRemnants.map(rem => {
                let badge = 'bg-slate-100 text-slate-700'
                if (rem.disposition === 'LOGGED') badge = 'bg-slate-100 text-slate-800'
                if (rem.disposition === 'SALVAGED_FOR_POCKETS') badge = 'bg-emerald-100 text-emerald-800'
                if (rem.disposition === 'SCRAP_DISPOSED') badge = 'bg-rose-100 text-rose-800'
                if (rem.disposition === 'RETURNED_TO_MILL') badge = 'bg-purple-100 text-purple-800'

                return (
                  <tr key={rem.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <div>{rem.remnant_code}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {new Date(rem.logged_at || rem.created_at || Date.now()).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#3A3564] font-bold">
                      {rem.source_roll_barcode}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{rem.colorway}</div>
                      <div className="text-[11px] text-slate-600 line-clamp-1">{rem.fabric_type}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {rem.length_meters}m × {rem.width_inches}&quot;
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px] max-w-xs">
                      {rem.reason}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${badge}`}>
                        {rem.disposition.replace(/_/g, ' ')}
                      </span>
                      {rem.allocated_to && (
                        <div className="text-[10px] text-slate-500 mt-0.5 font-medium">{rem.allocated_to}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {rem.disposition === 'LOGGED' && (
                          <button
                            onClick={() => handleUpdateDisposition(rem, 'SALVAGED_FOR_POCKETS', 'Allocated for pocket linings')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold"
                          >
                            Salvage Trim
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedRemnant(rem)}
                          className="px-2 py-1 rounded-lg bg-white hover:bg-[#FAF7F0] border border-black/10 font-mono text-[11px] text-[#3A3564] font-bold shadow-2xs"
                        >
                          Dossier
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

      {/* Log Remnant Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-black/15 shadow-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <h3 className="font-bold text-base text-slate-900">Log Remnant Fabric Cut Piece</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRemnant} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Remnant Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. REM-2026-904"
                    value={formData.remnant_code}
                    onChange={e => setFormData({ ...formData, remnant_code: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Source Roll Barcode</label>
                  <input
                    type="text"
                    required
                    value={formData.source_roll_barcode}
                    onChange={e => setFormData({ ...formData, source_roll_barcode: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Fabric Type</label>
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
                  <label className="font-mono font-bold text-slate-700 uppercase">Length (meters)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.length_meters}
                    onChange={e => setFormData({ ...formData, length_meters: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Usable Width (inches)</label>
                  <input
                    type="number"
                    value={formData.width_inches}
                    onChange={e => setFormData({ ...formData, width_inches: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono font-bold text-slate-700 uppercase">Reason for Remnant Generation</label>
                <input
                  type="text"
                  required
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Initial Disposition</label>
                  <select
                    value={formData.disposition}
                    onChange={e => setFormData({ ...formData, disposition: e.target.value as RemnantDisposition })}
                    className="w-full mt-1 p-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono"
                  >
                    <option value="LOGGED">LOGGED / HELD</option>
                    <option value="SALVAGED_FOR_POCKETS">SALVAGED FOR POCKETS / TRIMS</option>
                    <option value="SCRAP_DISPOSED">SCRAP / TEXTILE RECYCLING</option>
                    <option value="RETURNED_TO_MILL">RETURNED TO WEAVING / MILL</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Allocation Target Note</label>
                  <input
                    type="text"
                    value={formData.allocated_to}
                    onChange={e => setFormData({ ...formData, allocated_to: e.target.value })}
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
                  Record Remnant Cut
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remnant Details Modal */}
      {selectedRemnant && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-black/15 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Fabric Remnant Dossier</span>
                <h3 className="font-black text-lg text-slate-900">{selectedRemnant.remnant_code}</h3>
              </div>
              <button onClick={() => setSelectedRemnant(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-[#FAF7F0]/60 border border-black/5">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Fabric & Source</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedRemnant.fabric_type}</p>
                <p className="text-slate-600">Color: {selectedRemnant.colorway} • Roll: {selectedRemnant.source_roll_barcode}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF7F0]/60 border border-black/5">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Dimensions</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedRemnant.length_meters}m length × {selectedRemnant.width_inches}&quot; cut width</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF7F0]/60 border border-black/5">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Origin Reason</span>
                <p className="font-medium text-slate-800 mt-0.5">{selectedRemnant.reason}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF7F0]/60 border border-black/5">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Current Allocation</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedRemnant.disposition.replace(/_/g, ' ')}</p>
                {selectedRemnant.allocated_to && (
                  <p className="text-slate-600 text-[11px] mt-0.5">{selectedRemnant.allocated_to}</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-black/10 flex justify-end">
              <button
                onClick={() => setSelectedRemnant(null)}
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
