'use client'

import { useState, useEffect } from 'react'
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  XCircle, 
  Filter, 
  Plus, 
  X, 
  Check, 
  ArrowRight,
  ShieldCheck,
  TrendingDown
} from 'lucide-react'
import { toast } from 'sonner'
import { SampleApproval, SampleStage, SampleApprovalStatus, TechPack } from '../../types/design'
import { getStoredSampleApprovals, saveStoredSampleApproval, getStoredTechPacks } from '../../utils/designStorage'
import { createSampleApprovalAction } from '../../actions'
import { EmptyState } from '@/components/ui/EmptyState'

interface SampleApprovalsClientProps {
  initialApprovals?: SampleApproval[]
  initialTechPacks?: TechPack[]
}

export function SampleApprovalsClient({ initialApprovals, initialTechPacks }: SampleApprovalsClientProps = {}) {
  const [approvals, setApprovals] = useState<SampleApproval[]>(() => {
    if (initialApprovals && initialApprovals.length > 0) return initialApprovals
    return []
  })
  const [stageFilter, setStageFilter] = useState<string>('ALL')
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const techPacks = initialTechPacks && initialTechPacks.length > 0 ? initialTechPacks : getStoredTechPacks()

  // Form 2 State
  const [selectedStyle, setSelectedStyle] = useState(techPacks[0]?.style_number || '')
  const [stage, setStage] = useState<SampleStage>('PPS')
  const [measuredChest, setMeasuredChest] = useState('53.2')
  const [targetChest, setTargetChest] = useState('53.0')
  const [measuredLength, setMeasuredLength] = useState('72.1')
  const [targetLength, setTargetLength] = useState('72.0')
  const [measuredSleeve, setMeasuredSleeve] = useState('87.0')
  const [targetSleeve, setTargetSleeve] = useState('87.0')
  const [fitComments, setFitComments] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('buyer.qa@brand.com')
  const [approvalStatus, setApprovalStatus] = useState<SampleApprovalStatus>('APPROVED')

  function loadApprovals() {
    const stored = getStoredSampleApprovals()
    if (stored && stored.length > 0) {
      setApprovals(stored)
    }
  }

  useEffect(() => {
    if (initialApprovals !== undefined) {
      setApprovals(initialApprovals)
      if (typeof window !== 'undefined') {
        localStorage.setItem('zigza_design_sample_approvals', JSON.stringify(initialApprovals))
      }
    } else {
      loadApprovals()
    }
    const handler = () => loadApprovals()
    window.addEventListener('zigza_sample_approvals_updated', handler)
    return () => window.removeEventListener('zigza_sample_approvals_updated', handler)
  }, [initialApprovals])

  const filteredApprovals = approvals.filter(item => {
    if (stageFilter === 'ALL') return true
    return item.sample_stage === stageFilter
  })

  // Check variance
  const chestDiff = Math.abs(Number(measuredChest) - Number(targetChest))
  const lengthDiff = Math.abs(Number(measuredLength) - Number(targetLength))
  const isOutOfTolerance = chestDiff > 0.5 || lengthDiff > 0.5

  async function handleSubmitApproval() {
    setIsSubmitting(true)
    const tp = techPacks.find(p => p.style_number === selectedStyle) || techPacks[0]
    const maxVar = Math.max(chestDiff, lengthDiff)
    const verdictDB = approvalStatus === 'APPROVED' ? 'APPROVED' : approvalStatus === 'REVISE_FIT' ? 'REVISE_FIT' : 'REJECTED'

    const newApproval: SampleApproval = {
      id: `sa-${Date.now()}`,
      tech_pack_id: tp?.id || 'tp-001',
      style_number: tp?.style_number || selectedStyle,
      style_name: tp?.style_name || 'Garment Sample',
      brand_name: tp?.brand_name || 'Brand Client',
      sample_stage: stage,
      measured_chest: Number(measuredChest),
      target_chest: Number(targetChest),
      measured_length: Number(measuredLength),
      target_length: Number(targetLength),
      measured_sleeve: Number(measuredSleeve),
      target_sleeve: Number(targetSleeve),
      variance_status: isOutOfTolerance ? 'OUT_OF_TOLERANCE' : 'WITHIN_TOLERANCE',
      fit_comments: fitComments || 'Verified against master dress form.',
      buyer_reviewer_email: buyerEmail,
      approval_status: approvalStatus,
      submitted_date: new Date().toISOString().split('T')[0],
      audit_date: approvalStatus === 'APPROVED' ? new Date().toISOString().split('T')[0] : undefined
    }

    if (tp?.id) {
      const res = await createSampleApprovalAction({
        tech_pack_id: tp.id,
        sample_stage: stage,
        measured_chest: Number(measuredChest),
        measured_length: Number(measuredLength),
        measured_sleeve: Number(measuredSleeve),
        variance_max_cm: maxVar,
        within_tolerance: !isOutOfTolerance,
        fit_comments: fitComments || 'Verified against master dress form.',
        buyer_reviewer_name: buyerEmail.split('@')[0],
        buyer_reviewer_email: buyerEmail,
        verdict: verdictDB as any
      })

      if (res.success) {
        toast.success(`Sample Audit recorded to Supabase!${stage === 'PPS' && verdictDB === 'APPROVED' ? ' (Tech-Pack auto-promoted to PPS APPROVED)' : ''}`)
      }
    }

    saveStoredSampleApproval(newApproval)
    setIsSubmitting(false)
    setIsSubmitOpen(false)
    loadApprovals()
  }

  return (
    <div className="space-y-6">
      
      {/* Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FAF7F0] border border-black/10 text-[#3A3564] flex items-center justify-center shrink-0 shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Sample Approvals & PPS Gate
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                3-stage gate
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Proto fit, size-set grading verification, and pre-production sample (PPS) golden piece sign-off
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsSubmitOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-sm font-semibold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Submit sample audit</span>
        </button>
      </div>

      {/* 3-Stage Visual Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              Stage 1 • Proto sample
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              Aesthetics
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-900">Silhouette & drape validation</p>
          <p className="text-xs text-slate-600 leading-relaxed">Evaluates general fit, pocket placement, and design balance on physical form.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              Stage 2 • Size set
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              Grading (XS–3XL)
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-900">Cross-size POM calibration</p>
          <p className="text-xs text-slate-600 leading-relaxed">Verifies grade step increments (within ±0.5 cm limit) across the entire size breakdown.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#3A3564]">
              Stage 3 • PPS golden piece
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              Bulk cut seal
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-900">Factory production authorization</p>
          <p className="text-xs text-slate-600 leading-relaxed">Final buyer-signed physical garment; unlocks fabric requisition and CAD marker lay.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['ALL', 'PPS', 'SIZE_SET', 'PROTO'] as const).map(stg => (
          <button
            key={stg}
            onClick={() => setStageFilter(stg)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium tracking-tight transition-all shrink-0 cursor-pointer border ${
              stageFilter === stg
                ? 'bg-[#3A3564] text-[#FAF7F0] border-[#3A3564] shadow-2xs'
                : 'bg-white text-slate-700 border-black/10 hover:bg-slate-50'
            }`}
          >
            {stg === 'ALL' ? 'All sample stages' : stg === 'PPS' ? 'PPS audits' : stg === 'SIZE_SET' ? 'Size set audits' : 'Proto audits'}
          </button>
        ))}
      </div>

      {/* Approvals Table or Empty State */}
      {filteredApprovals.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No sample audits recorded"
          description={
            stageFilter !== 'ALL'
              ? `No ${stageFilter} stage sample audits recorded yet. Submit a physical sample dimensional measurement against locked POM specs.`
              : "No sample fit audits have been recorded yet. Submit a dimensional fit audit for Proto, Size-Set, or PPS approval."
          }
          actionLabel="Submit sample audit"
          onAction={() => setIsSubmitOpen(true)}
          secondaryActionLabel={stageFilter !== 'ALL' ? "Show all stages" : undefined}
          onSecondaryAction={stageFilter !== 'ALL' ? () => setStageFilter('ALL') : undefined}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-black/10 bg-[#FAF7F0]/70 text-slate-700 text-xs font-semibold">
                  <th className="py-3 px-4">Style reference</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Chest (target / measured)</th>
                  <th className="py-3 px-4">Length (target / measured)</th>
                  <th className="py-3 px-4">Tolerance status</th>
                  <th className="py-3 px-4">Approval decision</th>
                  <th className="py-3 px-4">Auditor / date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-medium text-slate-700 text-xs">
                {filteredApprovals.map(item => {
                  const isPass = item.approval_status === 'APPROVED'
                  const isRevise = item.approval_status === 'REVISE_FIT'
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#3A3564] block text-sm">{item.style_number}</span>
                        <span className="text-xs text-slate-600 line-clamp-1">{item.style_name}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-black/10 text-[#3A3564]">
                          {item.sample_stage}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        {item.target_chest} cm / <span className="font-semibold text-slate-900">{item.measured_chest} cm</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        {item.target_length} cm / <span className="font-semibold text-slate-900">{item.measured_length} cm</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.variance_status === 'WITHIN_TOLERANCE' ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50/70 border border-emerald-200/60 px-2 py-0.5 rounded-md text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>±0.5 cm pass</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-rose-800 bg-rose-50/70 border border-rose-200/60 px-2 py-0.5 rounded-md text-xs font-medium">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>Out of spec</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${
                          isPass 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : isRevise
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {item.approval_status === 'APPROVED' ? 'Approved' : item.approval_status === 'REVISE_FIT' ? 'Revise fit' : 'Pending review'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <p className="truncate max-w-[150px] font-medium text-slate-800">{item.buyer_reviewer_email}</p>
                        <p className="text-[11px] text-slate-500">{item.submitted_date}</p>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form 2 Submission Modal */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in select-none">
          <div className="bg-white rounded-3xl border border-black/15 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-5 border-b border-black/10 bg-[#FAF7F0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 text-[#3A3564] flex items-center justify-center shadow-2xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Submit sample fit audit
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Physical sample dimensional measurement against locked POM specs
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSubmitOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Style specification *
                  </label>
                  <select
                    value={selectedStyle}
                    onChange={e => setSelectedStyle(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-black/15 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  >
                    {techPacks.map(tp => (
                      <option key={tp.id} value={tp.style_number}>{tp.style_number} - {tp.category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Sample stage *
                  </label>
                  <select
                    value={stage}
                    onChange={e => setStage(e.target.value as SampleStage)}
                    className="w-full px-3 py-2.5 rounded-xl border border-black/15 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  >
                    <option value="PROTO">Proto sample (aesthetic)</option>
                    <option value="SIZE_SET">Size set sample (grading)</option>
                    <option value="PPS">Pre-production sample (PPS)</option>
                  </select>
                </div>
              </div>

              {/* Chest POM */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F0]/40 border border-black/10 space-y-2">
                <span className="text-xs font-semibold text-slate-800 block">Point 1: Half chest width (Tolerance: ±0.5 cm)</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-slate-600 block mb-1">Target spec (cm)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={targetChest}
                      onChange={e => setTargetChest(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm font-semibold bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-slate-600 block mb-1">Measured sample (cm)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={measuredChest}
                      onChange={e => setMeasuredChest(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm font-semibold bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Body Length POM */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F0]/40 border border-black/10 space-y-2">
                <span className="text-xs font-semibold text-slate-800 block">Point 2: Body length from HPS (Tolerance: ±0.5 cm)</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-slate-600 block mb-1">Target spec (cm)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={targetLength}
                      onChange={e => setTargetLength(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm font-semibold bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-slate-600 block mb-1">Measured sample (cm)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={measuredLength}
                      onChange={e => setMeasuredLength(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm font-semibold bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Live Tolerance Alert */}
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                isOutOfTolerance 
                  ? 'bg-rose-50 border-rose-200 text-rose-800' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                {isOutOfTolerance ? (
                  <>
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Variance exceeds ±0.5 cm tolerance limit. Consider revision before approving.</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Measurements strictly within ASTM ±0.5 cm tolerance.</span>
                  </>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Fit specialist / buyer review comments
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Drape on golden mannequin verified. Armhole pitch and pocket placement cleared."
                  value={fitComments}
                  onChange={e => setFitComments(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-black/15 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Auditor email *
                  </label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={e => setBuyerEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-black/15 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Approval decision *
                  </label>
                  <select
                    value={approvalStatus}
                    onChange={e => setApprovalStatus(e.target.value as SampleApprovalStatus)}
                    className="w-full px-3 py-2.5 rounded-xl border border-black/15 text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  >
                    <option value="APPROVED">Approved (Pass)</option>
                    <option value="REVISE_FIT">Revise fit (Re-cut)</option>
                    <option value="PENDING_REVIEW">Pending buyer review</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-black/10 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setIsSubmitOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitApproval}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-sm font-semibold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Audit Sign-Off</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
