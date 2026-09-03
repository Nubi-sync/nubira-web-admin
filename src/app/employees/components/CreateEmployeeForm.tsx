'use client'

import { useState } from 'react'
import { createEmployee } from '../actions'
import { UserPlus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export function CreateEmployeeForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
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
            Add New Employee
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create floor staff login credentials
          </p>
        </div>
      </div>

      <form action={handleSubmit} autoComplete="off" className="space-y-4 text-xs">
        
        {/* Hidden dummy fields to absorb aggressive browser autofill */}
        <input type="text" name="prevent_autofill_user" tabIndex={-1} className="hidden" autoComplete="off" />
        <input type="password" name="prevent_autofill_pwd" tabIndex={-1} className="hidden" autoComplete="new-password" />

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
            autoComplete="off"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
              <option value="PRODUCTION_MANAGER">Production Manager (Live Floor & Pipeline Dashboard)</option>
              <option value="MENDING">Mending (Piece Counting & Matrix Reconciliation)</option>
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

        {/* Submit Button (Midnight Violet, rounded-xl, full width) */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 mt-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
            </>
          ) : (
            'Create Employee'
          )}
        </button>
      </form>
    </div>
  )
}
