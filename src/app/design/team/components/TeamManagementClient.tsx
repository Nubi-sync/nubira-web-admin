'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Users, 
  ChevronLeft, 
  Plus, 
  Search, 
  UserPlus, 
  Phone, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  ClipboardList, 
  Trash2, 
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Tag
} from 'lucide-react'
import { toast } from 'sonner'
import { DesignTeamMember, BriefCategory } from '../../types/design'
import { 
  addDesignTeamMemberAction, 
  updateDesignTeamMemberStatusAction, 
  deleteDesignTeamMemberAction,
  createDesignBriefAction 
} from '../../actions'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface TeamManagementClientProps {
  initialMembers: DesignTeamMember[]
  companyName: string
  currentUserId: string
  userRole?: string
}

export function TeamManagementClient({
  initialMembers,
  companyName,
  currentUserId,
  userRole
}: TeamManagementClientProps) {
  const [members, setMembers] = useState<DesignTeamMember[]>(initialMembers || [])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State for Add Designer
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Quick Allocate Brief State (Initialized empty with clean placeholders)
  const [allocateMember, setAllocateMember] = useState<DesignTeamMember | null>(null)
  const [garmentType, setGarmentType] = useState('')
  const [category, setCategory] = useState<string>('')
  const [maxColors, setMaxColors] = useState<string>('')
  const [instructions, setInstructions] = useState('')
  const [isAllocating, setIsAllocating] = useState(false)

  function resetAllocateForm() {
    setGarmentType('')
    setCategory('')
    setMaxColors('')
    setInstructions('')
  }

  // Delete State
  const [memberToDelete, setMemberToDelete] = useState<DesignTeamMember | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const activeMembers = members.filter(m => m.status === 'ACTIVE')
  const suspendedMembers = members.filter(m => m.status === 'SUSPENDED')

  const filteredMembers = members.filter(m => {
    const q = searchQuery.toLowerCase()
    const name = m.designer_name?.toLowerCase() || ''
    const username = m.username?.toLowerCase() || ''
    const phone = m.phone_number || m.designer_phone || ''
    return name.includes(q) || username.includes(q) || phone.includes(q)
  })

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault()
    const cleanedPhone = newPhone.replace(/\D/g, '')
    const phone10 = cleanedPhone.length >= 10 ? cleanedPhone.slice(-10) : cleanedPhone

    if (!newName.trim()) {
      toast.error('Designer full name is required.')
      return
    }

    if (phone10.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number.')
      return
    }

    if (!newPassword.trim() || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await addDesignTeamMemberAction({
        ph_user_id: currentUserId,
        designer_name: newName.trim(),
        phone_number: phone10,
        password: newPassword.trim(),
        company_name: companyName
      })

      if (res.success && res.data) {
        toast.success(`Designer ${newName.trim()} onboarded successfully! Login: ${phone10}`)
        setMembers(prev => [res.data!, ...prev])
        setNewName('')
        setNewPhone('')
        setNewPassword('')
        setIsAddOpen(false)
      } else {
        toast.error(res.error || 'Failed to add team member.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred while adding designer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleToggleStatus(member: DesignTeamMember) {
    const nextStatus = member.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    try {
      const res = await updateDesignTeamMemberStatusAction(member.id, nextStatus)
      if (res.success) {
        toast.success(`Status updated to ${nextStatus.toLowerCase()}`)
        setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: nextStatus } : m))
      } else {
        toast.error(res.error || 'Failed to update status')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating member status')
    }
  }

  async function handleDeleteMember() {
    if (!memberToDelete) return
    setIsDeleting(true)
    try {
      const res = await deleteDesignTeamMemberAction(memberToDelete.id)
      if (res.success) {
        toast.success(`Member ${memberToDelete.designer_name} removed`)
        setMembers(prev => prev.filter(m => m.id !== memberToDelete.id))
        setMemberToDelete(null)
      } else {
        toast.error(res.error || 'Failed to remove member')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error removing member')
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleAllocateBriefSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!allocateMember) return
    setIsAllocating(true)
    try {
      const res = await createDesignBriefAction({
        ph_user_id: currentUserId,
        designer_member_id: allocateMember.id,
        garment_type: garmentType,
        category: category,
        max_colors: Number(maxColors) || 3,
        instructions: instructions.trim() || undefined,
        company_name: companyName
      })

      if (res.success) {
        toast.success(`Brief allocated to ${allocateMember.designer_name} successfully!`)
        setAllocateMember(null)
        resetAllocateForm()
      } else {
        toast.error(res.error || 'Failed to allocate brief.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error allocating brief.')
    } finally {
      setIsAllocating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/design"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-semibold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Design Studio</span>
        </Link>
        <span className="text-xs font-mono font-medium text-slate-500">
          Provisional Head &bull; Team Management
        </span>
      </div>

      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
              Design Team Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Onboard creative designers with 10-digit phone login and allocate apparel briefs
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Onboard Designer</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Active Creative Designers
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-2">
            {activeMembers.length} Active
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Registered under {companyName}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Suspended Accounts
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-2">
            {suspendedMembers.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Temporary pause on brief allocations
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Login Credentials
          </span>
          <div className="text-base font-bold text-[#3A3564] font-mono mt-2">
            10-Digit Mobile + Password
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Direct access to restricted Designer Studio
          </div>
        </div>
      </div>

      {/* Team List Table */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, username, phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-black/10 text-xs sm:text-sm font-medium bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
            />
          </div>

          <Link
            href="/design/briefs"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-bold text-[#3A3564] hover:bg-[#F2ECE1] transition-all shadow-2xs"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>View Briefs Queue</span>
          </Link>
        </div>

        {filteredMembers.length === 0 ? (
          <EmptyState
            icon={Users}
            title={searchQuery ? "No matching team members" : "No designers onboarded yet"}
            description={
              searchQuery
                ? "Try adjusting your search query."
                : "Add your first creative apparel designer with their phone number and password."
            }
            actionLabel="Onboard Designer"
            onAction={() => setIsAddOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto border border-black/10 rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-black/10 bg-[#FAF7F0] text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Designer Name</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Login Mobile Number</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Onboarded Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-slate-700">
                {filteredMembers.map(member => (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#FAF7F0] border border-black/10 text-[#3A3564] flex items-center justify-center text-xs font-bold font-mono">
                          {member.designer_name.charAt(0).toUpperCase()}
                        </div>
                        <span>{member.designer_name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-[#3A3564] font-bold">
                      <div className="inline-flex items-center gap-1 bg-[#FAF7F0] px-2 py-0.5 rounded-md border border-black/5">
                        <Tag className="w-3 h-3 opacity-60" />
                        <span>{member.username || `${member.designer_name.toLowerCase().replace(/\s+/g, '_')}_nubira`}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-slate-800 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>+91 {member.phone_number || member.designer_phone || '—'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-md border font-semibold ${
                        member.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {member.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setAllocateMember(member)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#FAF7F0] bg-[#3A3564] hover:bg-[#2A2649] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-2xs"
                          title="Allocate Design Brief"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          <span>Allocate Brief</span>
                        </button>

                        <button
                          onClick={() => handleToggleStatus(member)}
                          className={`text-xs font-semibold px-2 py-1.5 rounded-lg border transition-all cursor-pointer shadow-2xs ${
                            member.status === 'ACTIVE'
                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200'
                          }`}
                        >
                          {member.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>

                        <button
                          onClick={() => setMemberToDelete(member)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 border border-black/5 transition-all cursor-pointer shadow-2xs"
                          title="Remove Designer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Designer Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-black/10 shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                    Onboard Creative Designer
                  </h2>
                  <p className="text-xs text-slate-500">
                    Creates credentials for Web &amp; Mobile designer portal login
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 text-xs sm:text-sm">
              {/* 1. Designer Name */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Designer Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>

              {/* 2. Phone Number (10 digits without +91) */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Mobile Number (Login ID) <span className="text-rose-600">*</span>
                </label>
                <div className="flex items-center rounded-xl border border-black/10 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#3A3564]">
                  <div className="px-3 py-2 bg-[#FAF7F0] border-r border-black/10 text-xs font-mono font-bold text-[#3A3564] select-none flex items-center gap-1.5">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="8010993993"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-transparent text-slate-900 font-mono text-sm focus:outline-none placeholder:text-slate-400 font-medium"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Enter 10 digits without +91. The designer will log in with this 10-digit number.
                </p>
              </div>

              {/* 3. Password */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Login Password <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Set designer password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-[#FAF7F0] p-3 rounded-xl border border-black/10 text-xs text-slate-600 space-y-1">
                <span className="font-bold text-[#3A3564] block">Automatic Username Generation:</span>
                <p className="text-slate-700">
                  A unique handle like <code className="bg-white px-1.5 py-0.5 rounded text-[#3A3564] font-bold border border-black/5 font-mono">{newName.trim() ? `${newName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').split('_')[0]}_${companyName.toLowerCase().replace(/[^a-z0-9]/g, '_').split('_')[0]}` : 'name_company'}</code> will be automatically assigned to avoid collisions.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-black/10 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newName.trim() || newPhone.replace(/\D/g, '').length !== 10 || !newPassword.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Designer Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Allocate Brief Modal */}
      {allocateMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-black/10 shadow-xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                    Allocate Design Brief
                  </h2>
                  <p className="text-xs text-slate-500">
                    Assigning to {allocateMember.designer_name} ({allocateMember.phone_number ? `+91 ${allocateMember.phone_number}` : (allocateMember.username ? `@${allocateMember.username}` : '')})
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setAllocateMember(null)
                  resetAllocateForm()
                }}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAllocateBriefSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Garment Silhouette <span className="text-rose-600">*</span>
                  </label>
                  <select
                    required
                    value={garmentType}
                    onChange={e => setGarmentType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  >
                    <option value="">Select silhouette...</option>
                    <option value="T-Shirt">T-Shirt</option>
                    <option value="Hoodie">Hoodie</option>
                    <option value="Polo">Polo</option>
                    <option value="Suit">Suit</option>
                    <option value="Pant">Pant</option>
                    <option value="Jogger">Jogger</option>
                    <option value="Kids Romper">Kids Romper</option>
                    <option value="Ethnic">Ethnic</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Category Style <span className="text-rose-600">*</span>
                  </label>
                  <select
                    required
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  >
                    <option value="">Select category style...</option>
                    <option value="Formal">Formal</option>
                    <option value="Informal">Informal</option>
                    <option value="Casual">Casual</option>
                    <option value="Ethnic">Ethnic</option>
                    <option value="Sportswear">Sportswear</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Colorways Limit (Max Colors) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  required
                  placeholder="e.g. 3"
                  value={maxColors}
                  onChange={e => setMaxColors(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Design Instructions &amp; Creative Guidelines
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Minimal branding on chest, drop shoulder cut, contrast collar..."
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => {
                    setAllocateMember(null)
                    resetAllocateForm()
                  }}
                  className="px-4 py-2 rounded-xl border border-black/10 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAllocating || !garmentType || !category || !maxColors}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {isAllocating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Allocate Brief</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Member Confirmation */}
      <ConfirmDialog
        isOpen={!!memberToDelete}
        title={`Remove Designer "${memberToDelete?.designer_name}"?`}
        description={`Are you sure you want to remove this designer from ${companyName}? They will no longer be able to log in or access allocated briefs.`}
        confirmText="Yes, Remove"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteMember}
        onClose={() => {
          if (!isDeleting) setMemberToDelete(null)
        }}
      />
    </div>
  )
}
