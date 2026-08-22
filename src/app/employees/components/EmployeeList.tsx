'use client'

import { toggleEmployeeStatus, updateEmployeeRole, resetEmployeePassword } from '../actions'
import { useState } from 'react'
import { KeyRound, X, CheckCircle2 } from 'lucide-react'

type Profile = {
  id: string
  username: string
  role: string
  is_active: boolean
  created_at: string
}

export function EmployeeList({ employees }: { employees: Profile[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // Reset Password Modal State
  const [selectedEmp, setSelectedEmp] = useState<Profile | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)

  async function handleToggle(id: string, currentStatus: boolean) {
    setLoadingId(id)
    await toggleEmployeeStatus(id, currentStatus)
    setLoadingId(null)
  }

  async function handleRoleChange(id: string, newRole: string) {
    setLoadingId(id)
    await updateEmployeeRole(id, newRole)
    setLoadingId(null)
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedEmp) return

    setIsResetting(true)
    setResetError(null)

    const res = await resetEmployeePassword(selectedEmp.id, newPassword)
    if (res?.error) {
      setResetError(res.error)
    } else {
      setResetSuccess(true)
      setTimeout(() => {
        setSelectedEmp(null)
        setNewPassword('')
        setResetSuccess(false)
      }, 1500)
    }
    setIsResetting(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <th className="px-6 py-4 font-semibold">Username</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No employees found. Add one from the form.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{emp.username}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={emp.role}
                      onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                      disabled={loadingId === emp.id || emp.username === 'admin'}
                      className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 outline-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="LINEMAN">LINEMAN</option>
                      <option value="PRODUCTION">PRODUCTION</option>
                      <option value="STORE">STORE</option>
                      <option value="DISPATCH">DISPATCH</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      emp.is_active 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {emp.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setSelectedEmp(emp)
                        setNewPassword('')
                        setResetError(null)
                        setResetSuccess(false)
                      }}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors inline-flex items-center gap-1"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                      Reset Password
                    </button>

                    {emp.username !== 'admin' && (
                      <button
                        onClick={() => handleToggle(emp.id, emp.is_active)}
                        disabled={loadingId === emp.id}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                          emp.is_active
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {emp.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Admin Direct Password Reset Modal */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl border border-slate-200 relative">
            <button
              onClick={() => setSelectedEmp(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Staff Password</h3>
                <p className="text-xs text-slate-500">User: <span className="font-semibold text-blue-600">{selectedEmp.username}</span></p>
              </div>
            </div>

            {resetSuccess ? (
              <div className="py-4 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-slate-800">Password Updated Successfully!</p>
                <p className="text-xs text-slate-500">Staff member can now log in with the new password.</p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>

                {resetError && (
                  <p className="text-xs font-medium text-rose-600">{resetError}</p>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEmp(null)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="flex-2 py-2 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-60"
                  >
                    {isResetting ? 'Saving...' : 'Set Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
