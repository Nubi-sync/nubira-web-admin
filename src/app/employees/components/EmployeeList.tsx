'use client'

import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { toggleEmployeeStatus, updateEmployeeRole, resetEmployeePassword, deleteEmployee } from '../actions'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useState, useMemo } from 'react'
import { 
  Trash2,
  KeyRound, 
  X, 
  CheckCircle2, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  ShieldAlert,
  Users
} from 'lucide-react'

type Profile = {
  id: string
  username: string
  role: string
  is_active: boolean
  created_at: string
}

// Role Badge Styling Lookup (Tiered Steel/Neutral Hierarchy - Zero Purple!)
const ROLE_BADGE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  ADMIN: {
    bg: 'var(--steel-dark, #1F3A63)',
    text: '#FFFFFF',
    label: 'ADMIN'
  },
  PRODUCTION_MANAGER: {
    bg: '#0F766E',
    text: '#FFFFFF',
    label: 'PROD MANAGER'
  },
  PRODUCTION: {
    bg: 'var(--steel, #2B4C7E)',
    text: '#FFFFFF',
    label: 'PRODUCTION'
  },
  DISPATCH: {
    bg: 'var(--steel-tint, #DBE6F5)',
    text: 'var(--steel-dark, #1F3A63)',
    label: 'DISPATCH'
  },
  STORE: {
    bg: 'var(--ink-mist, #F1F3F5)',
    text: 'var(--ink-soft, #5B6B7C)',
    label: 'STORE'
  },
  LINEMAN: {
    bg: 'var(--ink-mist, #F1F3F5)',
    text: 'var(--ink-soft, #5B6B7C)',
    label: 'LINEMAN'
  }
}

type SortOrder = 'asc' | 'desc'

export function EmployeeList({ employees }: { employees: Profile[] }) {
  const router = useRouter()
  const [localEmployees, setLocalEmployees] = useState<Profile[]>(employees)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // Professional Dialog States
  const [toggleDialog, setToggleDialog] = useState<{ isOpen: boolean; employee: Profile | null }>({ isOpen: false, employee: null })
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; employee: Profile | null }>({ isOpen: false, employee: null })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    setLocalEmployees(employees)
  }, [employees])

  // Reset Password Modal State
  const [selectedEmp, setSelectedEmp] = useState<Profile | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)

  // Filtered & Sorted Employees
  // Note: Client-side search is fast and responsive for factory staff.
  // If staff list grows beyond ~100 rows, this can be hooked to a Supabase ilike query.
  const filteredEmployees = useMemo(() => {
    let list = localEmployees.filter(emp => {
      if (!searchTerm.trim()) return true
      return emp.username.toLowerCase().includes(searchTerm.toLowerCase().trim())
    })

    list.sort((a, b) => {
      const uA = a.username.toLowerCase()
      const uB = b.username.toLowerCase()
      return sortOrder === 'asc' ? uA.localeCompare(uB) : uB.localeCompare(uA)
    })

    return list
  }, [localEmployees, searchTerm, sortOrder])

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  async function executeToggleEmployee() {
    const emp = toggleDialog.employee
    if (!emp) return

    setLoadingId(emp.id)
    const currentStatus = emp.is_active
    setToggleDialog({ isOpen: false, employee: null })

    // Instant optimistic update
    setLocalEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, is_active: !currentStatus } : e))

    try {
      const res = await toggleEmployeeStatus(emp.id, currentStatus)
      if (res?.error) {
        setErrorMessage(res.error)
        setLocalEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, is_active: currentStatus } : e))
      } else {
        router.refresh()
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to toggle status')
      setLocalEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, is_active: currentStatus } : e))
    } finally {
      setLoadingId(null)
    }
  }

  async function handleRoleChange(id: string, newRole: string) {
    setLoadingId(id)
    setLocalEmployees(prev => prev.map(e => e.id === id ? { ...e, role: newRole } : e))
    try {
      const res = await updateEmployeeRole(id, newRole)
      if (res?.error) {
        setErrorMessage(res.error)
      } else {
        router.refresh()
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to update role')
    } finally {
      setLoadingId(null)
    }
  }

  async function executeDeleteEmployee() {
    const emp = deleteDialog.employee
    if (!emp) return

    setLoadingId(emp.id)
    setDeleteDialog({ isOpen: false, employee: null })
    setLocalEmployees(prev => prev.filter(e => e.id !== emp.id))

    try {
      const res = await deleteEmployee(emp.id)
      if (res?.error) {
        setErrorMessage(res.error)
        router.refresh()
      } else {
        router.refresh()
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to delete employee')
      router.refresh()
    } finally {
      setLoadingId(null)
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedEmp) return

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.')
      return
    }

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
    <div 
      className="bg-white rounded-[11px] border shadow-xs overflow-hidden"
      style={{ borderColor: 'var(--border, #E2E8F0)' }}
    >
      {/* Search Toolbar */}
      <div 
        className="p-4 border-b flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50"
        style={{ borderColor: 'var(--border, #E2E8F0)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--ink,#1C2733)]">
            Staff Directory
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200/70 font-semibold text-slate-700">
            {filteredEmployees.length} {filteredEmployees.length === 1 ? 'user' : 'users'}
          </span>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border rounded-[7px] text-xs outline-none transition-colors"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--steel, #2B4C7E)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border, #E2E8F0)'}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b text-[11px] uppercase tracking-wider font-bold" style={{ borderColor: 'var(--border, #E2E8F0)', color: 'var(--ink-soft, #5B6B7C)' }}>
              
              {/* Sortable Username */}
              <th 
                onClick={toggleSort}
                className="px-5 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors select-none font-bold"
              >
                <div className="flex items-center gap-1.5">
                  <span>Username</span>
                  {sortOrder === 'asc' ? (
                    <ArrowUp className="w-3.5 h-3.5 text-[var(--steel,#2B4C7E)]" />
                  ) : (
                    <ArrowDown className="w-3.5 h-3.5 text-[var(--steel,#2B4C7E)]" />
                  )}
                </div>
              </th>

              <th className="px-4 py-3.5 font-bold">Role Assignment</th>
              <th className="px-4 py-3.5 font-bold">Status</th>
              <th className="px-5 py-3.5 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Users className="w-8 h-8 text-slate-300" />
                    <p className="text-xs font-semibold text-slate-600">No staff members found matching "{searchTerm}"</p>
                    <p className="text-[11px] text-slate-400">Clear search or add a new employee from the left form.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => {
                const isAdminAccount = emp.username === 'admin'
                const roleBadge = ROLE_BADGE_STYLES[emp.role] || {
                  bg: 'var(--ink-mist, #F1F3F5)',
                  text: 'var(--ink-soft, #5B6B7C)',
                  label: emp.role
                }

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* Username */}
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <span>{emp.username}</span>
                        {isAdminAccount && (
                          <span 
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9.5px] font-bold"
                            style={{ backgroundColor: 'var(--steel-mist, #EEF3FA)', color: 'var(--steel-dark, #1F3A63)' }}
                          >
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="text-[10.5px] text-slate-400 font-mono mt-0.5">
                        Created {emp.created_at?.split('T')[0]}
                      </div>
                    </td>

                    {/* Role Dropdown / Badge */}
                    <td className="px-4 py-3.5">
                      {isAdminAccount ? (
                        <span 
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] font-semibold shadow-2xs"
                          style={{ backgroundColor: roleBadge.bg, color: roleBadge.text }}
                        >
                          {roleBadge.label}
                        </span>
                      ) : (
                        <select
                          value={emp.role}
                          onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                          disabled={loadingId === emp.id}
                          className="inline-flex items-center px-2.5 py-1 rounded-[6px] text-xs font-semibold border outline-none cursor-pointer disabled:opacity-50 transition-colors"
                          style={{
                            borderColor: 'var(--border, #E2E8F0)',
                            backgroundColor: roleBadge.bg,
                            color: roleBadge.text
                          }}
                        >
                          <option value="PRODUCTION_MANAGER">PROD MANAGER (PPC & Floor)</option>
                          <option value="LINEMAN">LINEMAN (Stitching)</option>
                          <option value="PRODUCTION">PRODUCTION (QC)</option>
                          <option value="STORE">STORE (Inventory)</option>
                          <option value="DISPATCH">DISPATCH (Packing)</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold"
                        style={{
                          backgroundColor: emp.is_active ? 'var(--green-mist, #E6F6EE)' : 'var(--red-mist, #FBEAE8)',
                          color: emp.is_active ? 'var(--green, #1F9D63)' : 'var(--red, #C0392B)'
                        }}
                      >
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right space-x-2">
                      {/* Reset Password */}
                      {isAdminAccount ? (
                        <span 
                          className="text-[11px] font-medium px-2.5 py-1 rounded-[6px] text-slate-400 bg-slate-100 opacity-60 inline-flex items-center gap-1 cursor-not-allowed"
                          title="Primary Admin credentials are protected"
                        >
                          <KeyRound className="w-3 h-3 text-slate-400" />
                          Protected
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEmp(emp)
                            setNewPassword('')
                            setResetError(null)
                            setResetSuccess(false)
                          }}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-[6px] border bg-white hover:bg-slate-50 text-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                          style={{ borderColor: 'var(--border, #E2E8F0)' }}
                        >
                          <KeyRound className="w-3 h-3 text-slate-500" />
                          Reset Password
                        </button>
                      )}

                      {/* Deactivate / Activate Button */}
                      {!isAdminAccount && (
                        <>
                          <button
                            type="button"
                            onClick={() => setToggleDialog({ isOpen: true, employee: emp })}
                            disabled={loadingId === emp.id}
                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-[6px] border transition-colors cursor-pointer disabled:opacity-50 ${
                              emp.is_active
                                ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                                : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {emp.is_active ? 'Deactivate' : 'Activate'}
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteDialog({ isOpen: true, employee: emp })}
                            disabled={loadingId === emp.id}
                            className="text-[11px] font-semibold px-2 py-1 rounded-[6px] border text-red-600 bg-red-50 border-red-200 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
                            title="Permanently delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </>
                      )}
                    </td>

                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Admin Direct Password Reset Modal */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-sm bg-white rounded-[11px] p-6 shadow-2xl border relative space-y-4"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
          >
            <button
              type="button"
              onClick={() => setSelectedEmp(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--steel-mist, #EEF3FA)', color: 'var(--steel, #2B4C7E)' }}
              >
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 
                  className="text-base font-bold font-[family-name:var(--font-heading)]"
                  style={{ color: 'var(--ink, #1C2733)' }}
                >
                  Reset Staff Password
                </h3>
                <p className="text-xs text-slate-500">
                  User: <span className="font-semibold text-slate-900">{selectedEmp.username}</span>
                </p>
              </div>
            </div>

            {resetSuccess ? (
              <div className="py-4 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-slate-800">Password Updated Successfully!</p>
                <p className="text-xs text-slate-500">Staff member can now log in with the new password.</p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[1.5px] mb-1.5 text-slate-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full px-3 py-2 border rounded-[8px] text-xs outline-none bg-slate-50 focus:bg-white"
                    style={{ borderColor: 'var(--border, #E2E8F0)' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--steel, #2B4C7E)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border, #E2E8F0)'}
                  />
                </div>

                {resetError && (
                  <p className="text-[11px] font-medium" style={{ color: 'var(--red, #C0392B)' }}>
                    {resetError}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEmp(null)}
                    className="flex-1 py-2 px-3 rounded-[7px] text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="flex-2 py-2 px-4 rounded-[7px] text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-60 shadow-xs"
                    style={{ backgroundColor: 'var(--steel, #2B4C7E)' }}
                  >
                    {isResetting ? 'Saving...' : 'Set Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Toast Error Alert Banner */}
      {errorMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-red-600 text-white rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)} className="ml-2 text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Professional Toggle Status Modal */}
      <ConfirmDialog
        isOpen={toggleDialog.isOpen}
        title={toggleDialog.employee?.is_active ? 'Deactivate Staff Member?' : 'Activate Staff Member?'}
        description={
          toggleDialog.employee?.is_active
            ? `Are you sure you want to deactivate "${toggleDialog.employee?.username}"? They will not be able to log into the mobile app until reactivated.`
            : `Are you sure you want to activate "${toggleDialog.employee?.username}"? They will regain access to their assigned mobile floor role.`
        }
        confirmText={toggleDialog.employee?.is_active ? 'Deactivate' : 'Activate'}
        variant={toggleDialog.employee?.is_active ? 'warning' : 'success'}
        isLoading={loadingId === toggleDialog.employee?.id}
        onConfirm={executeToggleEmployee}
        onClose={() => setToggleDialog({ isOpen: false, employee: null })}
      />

      {/* Professional Delete Employee Modal */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Employee Account?"
        description={`Are you sure you want to permanently delete "${deleteDialog.employee?.username}"? This user account and all profile records will be permanently removed.`}
        confirmText="Delete Permanently"
        variant="danger"
        isLoading={loadingId === deleteDialog.employee?.id}
        onConfirm={executeDeleteEmployee}
        onClose={() => setDeleteDialog({ isOpen: false, employee: null })}
      />
    </div>
  )
}
