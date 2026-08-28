'use client'

import { useState } from 'react'
import { createEmployee } from '../actions'
import { UserPlus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export function CreateEmployeeForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [selectedRole, setSelectedRole] = useState('LINEMAN')
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
      // reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3500)
    }
    
    setIsPending(false)
  }

  const isRoleValid = !!selectedRole

  return (
    <div 
      className="bg-white rounded-[11px] border shadow-xs p-5 sm:p-6 space-y-5"
      style={{ borderColor: 'var(--border, #E2E8F0)' }}
    >
      {/* Card Header */}
      <div className="flex items-center gap-3">
        <div 
          className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'var(--steel-mist, #EEF3FA)', color: 'var(--steel, #2B4C7E)' }}
        >
          <UserPlus className="w-4 h-4" />
        </div>
        <div>
          <h2 
            className="text-base font-bold font-[family-name:var(--font-heading)]"
            style={{ color: 'var(--ink, #1C2733)' }}
          >
            Add New Employee
          </h2>
          <p className="text-[12px]" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
            Create floor staff login credentials
          </p>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-4 text-xs">
        
        {/* Username */}
        <div>
          <label 
            className="block text-[11px] font-semibold uppercase tracking-[1.5px] mb-1.5"
            style={{ color: 'var(--ink-soft, #5B6B7C)' }}
          >
            Username
          </label>
          <input
            name="username"
            type="text"
            required
            placeholder="e.g. ramesh_stitch"
            className="w-full bg-slate-50 border rounded-[8px] px-3.5 py-2.5 text-xs text-[var(--ink,#1C2733)] placeholder-slate-400 outline-none transition-all focus:bg-white"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--steel, #2B4C7E)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border, #E2E8F0)'}
          />
        </div>

        {/* Password */}
        <div>
          <label 
            className="block text-[11px] font-semibold uppercase tracking-[1.5px] mb-1.5"
            style={{ color: 'var(--ink-soft, #5B6B7C)' }}
          >
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full bg-slate-50 border rounded-[8px] px-3.5 py-2.5 text-xs text-[var(--ink,#1C2733)] placeholder-slate-400 outline-none transition-all focus:bg-white"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--steel, #2B4C7E)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border, #E2E8F0)'}
          />
        </div>

        {/* Role Select with Validation States */}
        <div>
          <label 
            className="block text-[11px] font-semibold uppercase tracking-[1.5px] mb-1.5"
            style={{ color: 'var(--ink-soft, #5B6B7C)' }}
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
              className="w-full bg-slate-50 border rounded-[8px] px-3.5 py-2.5 text-xs font-semibold outline-none transition-all cursor-pointer focus:bg-white"
              style={{
                borderColor: touchedRole && !isRoleValid 
                  ? 'var(--red, #C0392B)' 
                  : touchedRole && isRoleValid 
                    ? 'var(--green, #1F9D63)' 
                    : 'var(--border, #E2E8F0)',
                backgroundColor: touchedRole && !isRoleValid 
                  ? 'var(--red-mist, #FBEAE8)' 
                  : '#F8FAFC'
              }}
            >
              <option value="PRODUCTION_MANAGER">Production Manager (PPC & Floor Deadlines)</option>
              <option value="LINEMAN">Lineman (Stitching & Floor Allotment)</option>
              <option value="PRODUCTION">Production (QC Inspection & Finishing)</option>
              <option value="STORE">Store (Godown & Raw Trims)</option>
              <option value="DISPATCH">Dispatch (Packing & Delivery Challans)</option>
              <option value="ADMIN">Admin (Executive Full Access)</option>
            </select>
          </div>
          {touchedRole && !isRoleValid && (
            <p className="text-[11px] mt-1 font-medium flex items-center gap-1" style={{ color: 'var(--red, #C0392B)' }}>
              <AlertCircle className="w-3 h-3" /> Please select an operational role.
            </p>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div 
            className="p-3 rounded-[8px] text-xs font-medium flex items-center gap-2"
            style={{ backgroundColor: 'var(--red-mist, #FBEAE8)', color: 'var(--red, #C0392B)' }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div 
            className="p-3 rounded-[8px] text-xs font-medium flex items-center gap-2"
            style={{ backgroundColor: 'var(--green-mist, #E6F6EE)', color: 'var(--green, #1F9D63)' }}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Employee account created successfully!</span>
          </div>
        )}

        {/* Submit Button (Solid Steel, 8px radius, full width) */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 rounded-[8px] text-xs font-semibold text-white transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 mt-2"
          style={{ backgroundColor: 'var(--steel, #2B4C7E)' }}
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating Account...
            </>
          ) : (
            'Create Employee'
          )}
        </button>
      </form>
    </div>
  )
}
