'use client'

import { useState } from 'react'
import { createEmployee } from '../actions'
import { UserPlus, Loader2 } from 'lucide-react'

export function CreateEmployeeForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)
    setSuccess(false)
    
    const result = await createEmployee(formData)
    
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      // reset form manually or leave it
    }
    
    setIsPending(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <UserPlus className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Add New Employee</h2>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
          <input
            name="username"
            type="text"
            required
            placeholder="e.g. ramesh"
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
          <select
            name="role"
            required
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-4 py-2.5 text-slate-900 outline-none transition-all duration-200 appearance-none"
          >
            <option value="LINEMAN">Lineman (Stitching)</option>
            <option value="PRODUCTION">Production (Checking)</option>
            <option value="STORE">Store (Inward/Outward)</option>
            <option value="DISPATCH">Dispatch (Packing)</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 text-emerald-600 text-sm p-3 rounded-lg border border-emerald-100">
            Employee created successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl px-4 py-2.5 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating...
            </>
          ) : (
            'Create Employee'
          )}
        </button>
      </form>
    </div>
  )
}
