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

// Role Badge Styling Lookup
const ROLE_BADGE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  ADMIN: {
    bg: '#3A3564',
    text: '#FFFFFF',
    label: 'ADMIN'
  },
  PRODUCTION_MANAGER: {
    bg: '#0F766E',
    text: '#FFFFFF',
    label: 'PROD MANAGER'
  },
  QC: {
    bg: '#7C3AED',
    text: '#FFFFFF',
    label: 'QC'
  },
  MENDING: {
    bg: '#0369A1',
    text: '#FFFFFF',
    label: 'MENDING'
  },
  PRODUCTION: {
    bg: '#7C3AED',
    text: '#FFFFFF',
    label: 'QC'
  },
  DISPATCH: {
    bg: '#FEF3C7',
    text: '#92400E',
    label: 'DISPATCH'
  },
  STORE: {
    bg: '#F1F5F9',
    text: '#334155',
    label: 'STORE'
  },
  LINEMAN: {
    bg: '#F1F5F9',
    text: '#334155',
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
      className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden"
    >
      {/* Search Toolbar */}
      <div 
        className="p-4 sm:p-5 border-b border-black/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-bold text-slate-900">
            Staff Directory
          </span>
          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
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
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-black/10 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-[13px] min-w-[660px]">
          <thead>
            <tr className="bg-[#FAF7F0] border-b border-black/10 text-xs font-mono uppercase tracking-wider font-bold text-slate-700">
              
              {/* Sortable Username */}
              <th 
                onClick={toggleSort}
                className="px-5 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors select-none font-bold whitespace-nowrap min-w-[150px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Username</span>
                  {sortOrder === 'asc' ? (
                    <ArrowUp className="w-3.5 h-3.5 text-[#3A3564]" />
                  ) : (
                    <ArrowDown className="w-3.5 h-3.5 text-[#3A3564]" />
                  )}
                </div>
              </th>

              <th className="px-4 py-3.5 font-bold whitespace-nowrap min-w-[190px]">Role Assignment</th>
              <th className="px-4 py-3.5 font-bold whitespace-nowrap min-w-[100px]">Status</th>
              <th className="px-5 py-3.5 font-bold text-right whitespace-nowrap min-w-[220px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Users className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-700">No staff members found matching "{searchTerm}"</p>
                    <p className="text-xs text-slate-500">Clear search or add a new employee from the left form.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => {
                const isAdminAccount = emp.username === 'admin'
                const roleBadge = ROLE_BADGE_STYLES[emp.role] || {
                  bg: '#F1F5F9',
                  text: '#334155',
                  label: emp.role
                }

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* Username */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>{emp.username}</span>
                        {isAdminAccount && (
                          <span 
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-bold font-mono bg-[#FAF7F0] text-[#3A3564] border border-black/10"
                          >
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5 whitespace-nowrap">
                        Created {emp.created_at?.split('T')[0]}
                      </div>
                    </td>

                    {/* Role Dropdown / Badge */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {isAdminAccount ? (
                        <span 
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold shadow-2xs"
                          style={{ backgroundColor: roleBadge.bg, color: roleBadge.text }}
                        >
                          {roleBadge.label}
                        </span>
                      ) : (
                        <select
                          value={emp.role}
                          onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                          disabled={loadingId === emp.id}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 outline-none cursor-pointer disabled:opacity-50 transition-colors shadow-2xs"
                        >
                          <option value="PRODUCTION_MANAGER">PROD MANAGER (Floor & Pipeline)</option>
                          <option value="QC">QC (Inspection & Packing)</option>
                          <option value="MENDING">MENDING (Matrix Counting)</option>
                          <option value="LINEMAN">LINEMAN (Stitching)</option>
                          <option value="STORE">STORE (Inventory)</option>
                          <option value="DISPATCH">DISPATCH (Packing)</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span 
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          emp.is_active 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${emp.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span>{emp.is_active ? 'Active' : 'Inactive'}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        {/* Reset Password */}
                        {isAdminAccount ? (
                          <span 
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-400 bg-slate-50 border border-slate-200/60 inline-flex items-center gap-1.5 cursor-not-allowed select-none"
                            title="Primary Admin credentials are protected"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                            <span>Protected</span>
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedEmp(emp)
                                setNewPassword('')
                                setResetError(null)
                                setResetSuccess(false)
                              }}
                              className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-black/10 bg-[#FAF7F0] hover:bg-slate-100 text-[#3A3564] transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-[#3A3564]" />
                              <span>Reset Password</span>
                            </button>

                            {/* Deactivate / Activate Button */}
                            <button
                              type="button"
                              onClick={() => setToggleDialog({ isOpen: true, employee: emp })}
                              disabled={loadingId === emp.id}
                              className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-50 shadow-2xs shrink-0 ${
                                emp.is_active
                                  ? 'text-amber-900 bg-amber-50 border-amber-300 hover:bg-amber-100'
                                  : 'text-emerald-800 bg-emerald-50 border-emerald-300 hover:bg-emerald-100'
                              }`}
                            >
                              {emp.is_active ? 'Deactivate' : 'Activate'}
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => setDeleteDialog({ isOpen: true, employee: emp })}
                              disabled={loadingId === emp.id}
                              className="p-1.5 rounded-lg border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all cursor-pointer disabled:opacity-50 shadow-2xs shrink-0"
                              title="Permanently delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-black/10 relative space-y-4 animate-in zoom-in-95 duration-200"
          >
            <button
              type="button"
              onClick={() => setSelectedEmp(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer absolute top-4 right-4"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs"
              >
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 
                  className="text-base sm:text-lg font-bold font-[family-name:var(--font-heading)] text-slate-900"
                >
                  Reset Staff Password
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  User: <span className="font-bold text-slate-900">{selectedEmp.username}</span>
                </p>
              </div>
            </div>

            {resetSuccess ? (
              <div className="py-4 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-slate-900">Password Updated Successfully!</p>
                <p className="text-xs text-slate-500">Staff member can now log in with the new password.</p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4 text-xs sm:text-[13px]">
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold outline-none bg-slate-50/70 focus:bg-white focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 transition-all shadow-2xs"
                  />
                </div>

                {resetError && (
                  <p className="text-xs font-semibold text-rose-600">
                    {resetError}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEmp(null)}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="flex-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white transition-all cursor-pointer disabled:opacity-60 shadow-xs bg-[#3A3564] hover:bg-[#2A2649] active:scale-[0.98]"
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
