'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  CheckCircle2,
  Search,
  Plus,
  X,
  AlertTriangle,
  AlertCircle,
  FileCheck,
  Ruler,
  Layers,
  ArrowRight
} from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { PanelQcAudit, PanelQcResult, LaySheet } from '../../types/cutting'
import { getPanelAudits, savePanelAudit, getLaySheets } from '../../utils/cuttingStorage'

export function PanelQcClient() {
  const [audits, setAudits] = useState<PanelQcAudit[]>([])
  const [lays, setLays] = useState<LaySheet[]>([])
  const [search, setSearch] = useState('')
  const [resultFilter, setResultFilter] = useState<string>('ALL')
  const [selectedAudit, setSelectedAudit] = useState<PanelQcAudit | null>(null)
  const [isNewAuditModalOpen, setIsNewAuditModalOpen] = useState(false)

  // Form state
  const [formLayId, setFormLayId] = useState('')
  const [formComponent, setFormComponent] = useState('Front Body Panel')
  const [formSampledPlies, setFormSampledPlies] = useState('Top Ply #1, Mid Ply #40, Bottom Ply #80')
  const [formNotchCheck, setFormNotchCheck] = useState<'ACCURATE' | 'SHIFTED_1MM' | 'MISSING_NOTCH'>('ACCURATE')
  const [formVarianceMm, setFormVarianceMm] = useState(0.5)
  const [formDefectsFound, setFormDefectsFound] = useState('None detected')
  const [formAuditor, setFormAuditor] = useState('M. Anitha (Senior QC Inspector)')
  const [formResult, setFormResult] = useState<PanelQcResult>('PASSED')

  useEffect(() => {
    const loadedAudits = getPanelAudits()
    const loadedLays = getLaySheets()
    setAudits(loadedAudits)
    setLays(loadedLays)
    if (loadedLays.length > 0) {
      setFormLayId(loadedLays[0].id)
    }
  }, [])

  const filteredAudits = audits.filter(a => {
    const matchSearch =
      a.audit_number.toLowerCase().includes(search.toLowerCase()) ||
      a.lay_number.toLowerCase().includes(search.toLowerCase()) ||
      a.component_name.toLowerCase().includes(search.toLowerCase()) ||
      a.auditor_name.toLowerCase().includes(search.toLowerCase())
    const matchResult = resultFilter === 'ALL' || a.result === resultFilter
    return matchSearch && matchResult
  })

  const handleCreateAudit = (e: React.FormEvent) => {
    e.preventDefault()
    const lay = lays.find(l => l.id === formLayId)
    const newAudit: PanelQcAudit = {
      id: `qc-${Date.now()}`,
      audit_number: `QC-CUT-${Date.now().toString().slice(-4)}`,
      lay_sheet_id: formLayId,
      lay_number: lay?.lay_number || 'LAY-UNKNOWN',
      component_name: formComponent,
      sampled_plies: formSampledPlies.split(',').map(s => s.trim()),
      notch_alignment_check: formNotchCheck,
      top_bottom_ply_variance_mm: Number(formVarianceMm),
      defects_found: formDefectsFound.split(',').map(s => s.trim()),
      result: formResult,
      auditor_name: formAuditor,
      audit_timestamp: new Date().toISOString()
    }

    const updated = savePanelAudit(newAudit)
    setAudits(updated)
    setIsNewAuditModalOpen(false)
  }

  // Summary Metrics
  const totalAudits = audits.length
  const passedCount = audits.filter(a => a.result === 'PASSED').length
  const passRate = totalAudits > 0 ? Math.round((passedCount / totalAudits) * 100) : 100
  const avgVariance = totalAudits > 0
    ? (audits.reduce((acc, a) => acc + a.top_bottom_ply_variance_mm, 0) / totalAudits).toFixed(2)
    : '0.65'
  const recutOrdersCount = audits.filter(a => a.result === 'RECUT_REQUIRED').length

  return (
    <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto select-none text-[#09090b]">
      
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#F0FDFA] text-[#0B1220] border border-black/15">
            <CheckCircle2 className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#0B1220]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Cut Panel QC Audits &amp; Tolerance Inspection
              </h1>
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs tracking-wider">
                Multi-Ply Precision
              </span>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-1">
              Top ply vs bottom ply dimensional variance, notch depth calibration, stripe matching, and recut flags
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
          <Link
            href="/cutting"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-700 hover:text-[#0B1220] hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Floor</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsNewAuditModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#0B1220] hover:bg-[#162032] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Log QC Audit</span>
          </button>
        </div>
      </div>

      {/* 3. Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">QC Audits Conducted</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">{totalAudits} audits</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Across all live lay runs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">First-Time Pass Rate</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">{passRate}%</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Tolerance window &lt;1.0mm</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Avg Top/Bottom Variance</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">{avgVariance} mm</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Blade deflection tolerance</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Recut Directives</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">{recutOrdersCount} panels</div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Routed to end-bit recut rack</p>
        </div>
      </div>

      {/* 4. Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit #, lay, component, auditor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1220]/20"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
            {(['ALL', 'PASSED', 'PASSED_WITH_CONDITIONS', 'RECUT_REQUIRED'] as const).map(res => (
              <button
                key={res}
                onClick={() => setResultFilter(res)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  resultFilter === res
                    ? 'bg-[#0B1220] text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {res.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Audits Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredAudits.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No panel QC audits recorded"
              description="Log a multi-ply tolerance inspection to verify blade precision and notch alignment."
              actionLabel="Log Panel QC Audit"
              onAction={() => setIsNewAuditModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[720px]">
              <thead className="bg-slate-50 text-[#0B1220] font-mono uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Audit Ref</th>
                  <th className="py-3 px-4 font-bold">Lay Sheet</th>
                  <th className="py-3 px-4 font-bold">Component Checked</th>
                  <th className="py-3 px-4 font-bold">Notch Alignment</th>
                  <th className="py-3 px-4 font-bold">Ply Variance (mm)</th>
                  <th className="py-3 px-4 font-bold">Inspector</th>
                  <th className="py-3 px-4 font-bold">Verdict</th>
                  <th className="py-3 px-4 font-bold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-medium">
                {filteredAudits.map(audit => {
                  let badge = 'bg-slate-50 text-[#0B1220] border border-slate-200'
                  if (audit.result === 'RECUT_REQUIRED') {
                    badge = 'bg-slate-900 text-white border border-slate-900'
                  }
                  if (audit.result === 'PASSED_WITH_CONDITIONS') {
                    badge = 'bg-slate-100 text-slate-700 border border-slate-200'
                  }

                  return (
                    <tr key={audit.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {audit.audit_number}
                        <div className="text-[10px] text-slate-400 font-normal" suppressHydrationWarning>
                          {new Date(audit.audit_timestamp).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#0B1220] font-bold">
                        {audit.lay_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{audit.component_name}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{audit.sampled_plies.join(', ')}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 font-bold text-[10px]">
                          {audit.notch_alignment_check}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-slate-900">
                          ±{audit.top_bottom_ply_variance_mm} mm
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {audit.auditor_name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${badge}`}>
                          {audit.result.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedAudit(audit)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 font-mono text-[11px] text-[#0B1220] font-bold shadow-2xs"
                        >
                          Findings
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Audit Modal */}
      {isNewAuditModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">Log Cut Panel QC Inspection</h3>
              <button onClick={() => setIsNewAuditModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAudit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Target Lay Sheet</label>
                  <select
                    value={formLayId}
                    onChange={e => setFormLayId(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                  >
                    {lays.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.lay_number} ({l.style_name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Garment Component</label>
                  <input
                    type="text"
                    required
                    value={formComponent}
                    onChange={e => setFormComponent(e.target.value)}
                    placeholder="e.g. Front Body Panel, Sleeve, Rib Collar"
                    className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono font-bold text-slate-700 uppercase">Sampled Plies (comma separated)</label>
                <input
                  type="text"
                  required
                  value={formSampledPlies}
                  onChange={e => setFormSampledPlies(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Notch Alignment Status</label>
                  <select
                    value={formNotchCheck}
                    onChange={e => setFormNotchCheck(e.target.value as any)}
                    className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                  >
                    <option value="ACCURATE">Accurate / In-Spec</option>
                    <option value="SHIFTED_1MM">Shifted by ~1mm</option>
                    <option value="MISSING_NOTCH">Missing Notch</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Top to Bottom Ply Variance (mm)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={formVarianceMm}
                    onChange={e => setFormVarianceMm(Number(e.target.value))}
                    className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono font-bold text-slate-700 uppercase">Defects Noted (comma separated)</label>
                <input
                  type="text"
                  value={formDefectsFound}
                  onChange={e => setFormDefectsFound(e.target.value)}
                  placeholder="e.g. Minor fraying on edge, None"
                  className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">QC Inspector Name</label>
                  <input
                    type="text"
                    value={formAuditor}
                    onChange={e => setFormAuditor(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-700 uppercase">Final QC Verdict</label>
                  <select
                    value={formResult}
                    onChange={e => setFormResult(e.target.value as PanelQcResult)}
                    className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold"
                  >
                    <option value="PASSED">PASSED</option>
                    <option value="PASSED_WITH_CONDITIONS">PASSED WITH CONDITIONS</option>
                    <option value="RECUT_REQUIRED">RECUT REQUIRED</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewAuditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0B1220] hover:bg-[#2e2a50] text-white text-xs font-bold"
                >
                  Record Audit Findings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Audit Findings Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">QC Inspection Report</span>
                <h3 className="font-black text-lg text-slate-900">{selectedAudit.audit_number}</h3>
              </div>
              <button onClick={() => setSelectedAudit(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-slate-50/60 border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Lay Sheet</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedAudit.lay_number}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50/60 border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Component Checked</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedAudit.component_name}</p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/60 border border-slate-100">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Sampled Plies Range</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedAudit.sampled_plies.map((p: string) => (
                    <span key={p} className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] font-bold text-[#0B1220]">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-slate-50/60 border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Notch Alignment</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedAudit.notch_alignment_check}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50/60 border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Top/Bottom Ply Variance</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">±{selectedAudit.top_bottom_ply_variance_mm} mm</p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/60 border border-slate-100">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Defects Noted</span>
                <p className="font-medium text-slate-800 mt-0.5">{selectedAudit.defects_found.join(', ')}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/60 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">QC Inspector</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedAudit.auditor_name}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block text-right">Verdict</span>
                  <span className="font-mono font-black text-xs uppercase px-2 py-0.5 rounded bg-slate-900 text-white">
                    {selectedAudit.result.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedAudit(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
