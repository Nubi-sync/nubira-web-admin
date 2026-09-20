'use client'

import { useState } from 'react'
import { createEmployee } from '../actions'
import { UserPlus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface CreateEmployeeFormProps {
  forcedModule?: string
  moduleTitle?: string
  allowedDivisions?: string[]
}

const MODULE_ROLE_OPTIONS: Record<string, Array<{ value: string; label: string }>> = {
  '/design': [
    { value: 'DESIGN', label: 'Design Studio Specialist' },
    { value: 'DESIGNER', label: 'CAD Pattern Designer' },
    { value: 'CAD_MASTER', label: 'CAD Master / Grading Technician' },
  ],
  '/merchandising': [
    { value: 'MERCHANDISING', label: 'Merchandiser (Buyer POs & Specs)' },
    { value: 'MERCHANDISER', label: 'Sampling & Sourcing Assistant' },
    { value: 'SOURCING_HEAD', label: 'Trim & Sourcing Officer' },
  ],
  '/cutting': [
    { value: 'CUTTING', label: 'Cutting Floor Operator' },
    { value: 'CUTTING_MASTER', label: 'Cutting Master / Marker Specialist' },
    { value: 'SPREADER_OPERATOR', label: 'Spreader Operator / Lay Specialist' },
  ],
  '/printing': [
    { value: 'PRINTING', label: 'Screen Print Operator' },
    { value: 'PRINTING_MASTER', label: 'Printing Master / Color Matcher' },
  ],
  '/embroidery': [
    { value: 'EMBROIDERY', label: 'Embroidery Machine Operator' },
    { value: 'EMBROIDERY_MASTER', label: 'Punch Digitizer / Unit Master' },
  ],
  '/stitching-sewing': [
    { value: 'PRODUCTION_MANAGER', label: 'Production Manager (Floor & Line Incharge)' },
    { value: 'LINEMAN', label: 'Lineman (Floor Allotment & Machine Line)' },
    { value: 'STITCHING', label: 'Tailor / Stitching Operator' },
    { value: 'QC', label: 'Floor QC Inspector (Inline & End-Line QC)' },
    { value: 'MENDING', label: 'Mending / Alteration Tailor (Stitch Repair)' },
    { value: 'STORE', label: 'Store Keeper (BOM & Trims Handover)' },
  ],
  '/washing': [
    { value: 'WASHING', label: 'Washing Tumbler Operator' },
    { value: 'WASHING_MASTER', label: 'Washing Master / Wet Processing' },
  ],
  '/iron': [
    { value: 'IRON', label: 'Steam Ironing Operator' },
    { value: 'IRONING_MASTER', label: 'Finishing Table Incharge' },
  ],
  '/ready-goods': [
    { value: 'QC', label: 'QC Inspector (End-Line & AQL)' },
    { value: 'PACKING', label: 'Packing Staff (Barcode, Polybag & Box)' },
    { value: 'AQL_INSPECTOR', label: 'AQL Quality Auditor' },
  ],
  '/alter': [
    { value: 'MENDING', label: 'Mending Operator (Stitch Repair)' },
    { value: 'ALTERATION', label: 'Alteration Tailor (Seam Re-stitching)' },
    { value: 'REPAIR_TAILOR', label: 'Specialist Repair Tailor' },
  ],
  '/store': [
    { value: 'STORE', label: 'Store Keeper (Roll & Trim Receiving)' },
    { value: 'STORE_SUPERVISOR', label: 'Godown Assistant / Bin Manager' },
    { value: 'GODOWN', label: 'Fabric Vault Keeper' },
  ],
  '/dispatch': [
    { value: 'DISPATCH', label: 'Dispatch Clerk (Challans & Gate-Out)' },
    { value: 'LOGISTICS', label: 'Logistics & Cargo Handler' },
  ],
}

const DIVISION_LABELS: Record<string, string> = {
  '/design': '01. Design Studio',
  '/merchandising': '02. Merchandising',
  '/cutting': '03. Cutting Floor',
  '/printing': '04. Printing Unit',
  '/embroidery': '05. Embroidery Unit',
  '/stitching-sewing': 'Stitching Floor',
  '/washing': '07. Washing Unit',
  '/iron': '08. Steam Pressing',
  '/ready-goods': '09. Ready Goods & QC',
  '/alter': '10. Alteration Clinic',
  '/store': '11. Central Store',
  '/dispatch': '12. Dispatch Hub',
}

export function CreateEmployeeForm({ forcedModule, moduleTitle, allowedDivisions }: CreateEmployeeFormProps = {}) {
  const defaultInitialRole = forcedModule && MODULE_ROLE_OPTIONS[forcedModule]
    ? MODULE_ROLE_OPTIONS[forcedModule][0].value
    : 'LINEMAN'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [selectedRole, setSelectedRole] = useState(defaultInitialRole)
  const [touchedRole, setTouchedRole] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)
    setSuccess(false)
    
    const roleVal = formData.get('role') as string
    if (!roleVal) {
      setError('Please select a valid role.')
      setIsPending(false)
      return
    }

    const result = await createEmployee(formData)
    
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setUsername('')
      setPassword('')
      setTouchedRole(false)
      // reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3500)
    }
    
    setIsPending(false)
  }

  const isRoleValid = !!selectedRole

  return (
    <div 
      className="bg-white rounded-2xl border border-black/10 shadow-2xs p-5 sm:p-6 space-y-5"
    >
      {/* Card Header */}
      <div className="flex items-center gap-3">
        <div 
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10"
        >
          <UserPlus className="w-4 h-4" />
        </div>
        <div>
          <h2 
            className="text-base font-extrabold text-slate-900 font-[family-name:var(--font-heading)]"
          >
            {moduleTitle ? `Add ${moduleTitle} Staff` : 'Add New Employee'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {moduleTitle ? `Create floor login for ${moduleTitle}` : 'Create floor staff login credentials'}
          </p>
        </div>
      </div>

      <form action={handleSubmit} autoComplete="off" className="space-y-4 text-xs sm:text-[13px]">
        
        {/* Hidden dummy fields to absorb aggressive browser autofill */}
        <input type="text" name="prevent_autofill_user" tabIndex={-1} className="hidden" autoComplete="off" />
        <input type="password" name="prevent_autofill_pwd" tabIndex={-1} className="hidden" autoComplete="new-password" />
        <input type="hidden" name="forcedModule" value={forcedModule || ''} />

        {/* Username */}
        <div>
          <label 
            className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5"
          >
            Username
          </label>
          <input
            name="username"
            type="text"
            required
            autoComplete="off"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. ramesh_stitch"
            className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 shadow-2xs outline-none transition-all"
          />
        </div>

        {/* Password */}
        <div>
          <label 
            className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5"
          >
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 shadow-2xs outline-none transition-all"
          />
        </div>

        {/* Role Select with Validation States */}
        <div>
          <label 
            className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5"
          >
            Role Assignment
          </label>
          <div className="relative">
            <select
              name="role"
              required
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value)
                setTouchedRole(true)
              }}
              onBlur={() => setTouchedRole(true)}
              className={`w-full bg-slate-50/70 hover:bg-white focus:bg-white border focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-2xs outline-none transition-all cursor-pointer ${
                touchedRole && !isRoleValid
                  ? 'border-rose-300 bg-rose-50/50 text-rose-900'
                  : 'border-slate-200'
              }`}
            >
              {forcedModule && MODULE_ROLE_OPTIONS[forcedModule] ? (
                MODULE_ROLE_OPTIONS[forcedModule].map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              ) : (
                <>
                  <option value="ADMIN">Admin (Executive Full Access - All Divisions)</option>
                  {Object.keys(MODULE_ROLE_OPTIONS)
                    .filter(route => !allowedDivisions || allowedDivisions.length === 0 || allowedDivisions.includes(route))
                    .map(route => (
                      <optgroup key={route} label={DIVISION_LABELS[route] || route}>
                        {MODULE_ROLE_OPTIONS[route].map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                </>
              )}
            </select>
          </div>
          {touchedRole && !isRoleValid && (
            <p className="text-xs mt-1.5 font-semibold flex items-center gap-1 text-rose-600">
              <AlertCircle className="w-3.5 h-3.5" /> Please select an operational role.
            </p>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div 
            className="p-3 rounded-xl text-xs font-semibold flex items-center gap-2 bg-rose-50 text-rose-700 border border-rose-200"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div 
            className="p-3 rounded-xl text-xs font-semibold flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Employee account created successfully!</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 mt-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Create Employee</span>
          )}
        </button>
      </form>
    </div>
  )
}
