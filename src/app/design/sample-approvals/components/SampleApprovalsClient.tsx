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
  const [selectedStyle, setSelectedStyle] = useState(techPacks[0]?.style_number || 'ART-HD-8821')
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
      
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Sample Approvals & PPS Gate
            </h1>
            <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 tracking-wider">
              3-Stage Gate
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
            Proto fit, Size-Set grading verification, and Pre-Production Sample (PPS) golden piece sign-off
          </p>
        </div>

        <button
          onClick={() => setIsSubmitOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Sample Audit (Form 2)</span>
        </button>
      </div>

      {/* 3-Stage Visual Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Stage 1 • Proto Sample
            </span>
            <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              AESTHETICS
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900">Silhouette & Drape Validation</p>
          <p className="text-xs text-slate-500">Evaluates general fit, pocket placement, and design balance on physical form.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Stage 2 • Size Set
            </span>
            <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
              GRADING (XS–3XL)
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900">Cross-Size POM Calibration</p>
          <p className="text-xs text-slate-500">Verifies grade step increments (±0.5 cm limit) across the entire size breakdown.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#3A3564]">
              Stage 3 • PPS Golden Piece
            </span>
            <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
              BULK CUT SEAL
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900">Factory Production Authorization</p>
          <p className="text-xs text-slate-500">Final buyer-signed physical garment; unlocks fabric requisition and CAD marker lay.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(['ALL', 'PPS', 'SIZE_SET', 'PROTO'] as const).map(stg => (
          <button
            key={stg}
            onClick={() => setStageFilter(stg)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-tight transition-all shrink-0 cursor-pointer border ${
              stageFilter === stg
                ? 'bg-[#3A3564] text-[#FAF7F0] border-[#3A3564] shadow-2xs'
                : 'bg-white text-slate-600 border-black/10 hover:bg-slate-50'
            }`}
          >
            {stg === 'ALL' ? 'All Sample Stages' : `${stg} Audits`}
          </button>
        ))}
      </div>

      {/* Approvals Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-black/10 bg-[#FAF7F0]/60 text-slate-600 font-mono font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Style Ref</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Chest (Target / Measured)</th>
                <th className="py-3 px-4">Length (Target / Measured)</th>
                <th className="py-3 px-4">Tolerance Status</th>
                <th className="py-3 px-4">Approval Decision</th>
                <th className="py-3 px-4">Auditor / Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-semibold text-slate-700">
              {filteredApprovals.map(item => {
                const isPass = item.approval_status === 'APPROVED'
                const isRevise = item.approval_status === 'REVISE_FIT'
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[#3A3564] block">{item.style_number}</span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{item.style_name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-black/10 text-[#3A3564]">
                        {item.sample_stage}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {item.target_chest} cm / <span className="font-bold">{item.measured_chest} cm</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {item.target_length} cm / <span className="font-bold">{item.measured_length} cm</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.variance_status === 'WITHIN_TOLERANCE' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>±0.5cm Pass</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Out of Spec</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                        isPass 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : isRevise
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {item.approval_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      <p className="truncate max-w-[150px]">{item.buyer_reviewer_email}</p>
                      <p className="text-[10px] text-slate-400">{item.submitted_date}</p>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form 2 Submission Modal */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none">
          <div className="bg-white rounded-3xl border border-black/15 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-5 border-b border-black/10 bg-[#FAF7F0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#3A3564] text-[#FAF7F0] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Submit Sample Fit Audit (Form 2)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Physical sample dimensional measurement against locked POM specs
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSubmitOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                    Style Specification *
                  </label>
                  <select
                    value={selectedStyle}
                    onChange={e => setSelectedStyle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 text-xs font-mono font-bold text-slate-900 bg-white"
                  >
                    {techPacks.map(tp => (
                      <option key={tp.id} value={tp.style_number}>{tp.style_number} - {tp.category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                    Sample Stage *
                  </label>
                  <select
                    value={stage}
                    onChange={e => setStage(e.target.value as SampleStage)}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 text-xs font-mono font-bold text-slate-900 bg-white"
                  >
                    <option value="PROTO">Proto Sample (Aesthetic)</option>
                    <option value="SIZE_SET">Size Set Sample (Grading)</option>
                    <option value="PPS">Pre-Production Sample (PPS)</option>
                  </select>
                </div>
              </div>

              {/* Chest POM */}
              <div className="p-3 rounded-xl bg-slate-50 border border-black/5 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">Point 1: Half Chest Width (Tolerance: ±0.5 cm)</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Target Spec</span>
                    <input
                      type="number"
                      step="0.1"
                      value={targetChest}
                      onChange={e => setTargetChest(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-black/10 text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Measured Sample</span>
                    <input
                      type="number"
                      step="0.1"
                      value={measuredChest}
                      onChange={e => setMeasuredChest(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-black/10 text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Body Length POM */}
              <div className="p-3 rounded-xl bg-slate-50 border border-black/5 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">Point 2: Body Length from HPS (Tolerance: ±0.5 cm)</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Target Spec</span>
                    <input
                      type="number"
                      step="0.1"
                      value={targetLength}
                      onChange={e => setTargetLength(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-black/10 text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Measured Sample</span>
                    <input
                      type="number"
                      step="0.1"
                      value={measuredLength}
                      onChange={e => setMeasuredLength(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-black/10 text-xs font-mono font-bold"
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
                    <span>Variance exceeds ±0.5cm tolerance limit. Consider revision before approving.</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Measurements strictly within ASTM ±0.5cm tolerance.</span>
                  </>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                  Fit Specialist / Buyer Review Comments
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Drape on golden mannequin verified. Armhole pitch and pocket placement cleared."
                  value={fitComments}
                  onChange={e => setFitComments(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 text-xs text-slate-900 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                    Auditor Email *
                  </label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={e => setBuyerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 text-xs font-mono text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                    Approval Decision *
                  </label>
                  <select
                    value={approvalStatus}
                    onChange={e => setApprovalStatus(e.target.value as SampleApprovalStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 text-xs font-bold text-slate-900 bg-white"
                  >
                    <option value="APPROVED">APPROVED (Pass)</option>
                    <option value="REVISE_FIT">REVISE FIT (Re-cut)</option>
                    <option value="PENDING_REVIEW">PENDING BUYER REVIEW</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-black/10 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setIsSubmitOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitApproval}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer"
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
