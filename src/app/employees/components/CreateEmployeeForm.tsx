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
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs"
        >
          <UserPlus className="w-5 h-5" />
        </div>
        <div>
          <h2 
            className="text-base sm:text-lg font-bold font-[family-name:var(--font-heading)] text-slate-900"
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
            className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5"
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
            className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 shadow-2xs"
          />
        </div>

        {/* Password */}
        <div>
          <label 
            className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5"
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
            className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 shadow-2xs"
          />
        </div>

        {/* Role Select with Validation States */}
        <div>
          <label 
            className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5"
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
              className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none transition-all cursor-pointer shadow-2xs ${
                touchedRole && !isRoleValid
                  ? 'border-rose-400 bg-rose-50/50 text-slate-900'
                  : 'bg-slate-50/70 border-slate-200 hover:bg-white focus:bg-white focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 text-slate-900'
              }`}
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
            <p className="text-xs mt-1.5 font-medium flex items-center gap-1 text-rose-600">
              <AlertCircle className="w-3.5 h-3.5" /> Please select an operational role.
            </p>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div 
            className="p-3 rounded-xl text-xs font-medium flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div 
            className="p-3 rounded-xl text-xs font-medium flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Employee account created successfully!</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 mt-2 bg-[#3A3564] hover:bg-[#2A2649]"
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
