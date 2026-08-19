'use client'

import { toggleEmployeeStatus, updateEmployeeRole } from '../actions'
import { useState } from 'react'

type Profile = {
  id: string
  username: string
  role: string
  is_active: boolean
  created_at: string
}

export function EmployeeList({ employees }: { employees: Profile[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

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
                  <td className="px-6 py-4 text-right">
                    {emp.username !== 'admin' && (
                      <button
                        onClick={() => handleToggle(emp.id, emp.is_active)}
                        disabled={loadingId === emp.id}
                        className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
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
    </div>
  )
}
