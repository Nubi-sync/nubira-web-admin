'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Users, 
  ChevronLeft, 
  Plus, 
  Search, 
  UserPlus, 
  Mail, 
  Phone, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  MoreVertical, 
  ClipboardList, 
  Trash2, 
  Loader2,
  ShieldCheck
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
  const [members, setMembers] = useState<DesignTeamMember[]>(initialMembers)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State for Add Member
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')

  // Quick Allocate Brief State
  const [allocateMember, setAllocateMember] = useState<DesignTeamMember | null>(null)
  const [garmentType, setGarmentType] = useState('T-Shirt')
  const [category, setCategory] = useState<BriefCategory>('Casual')
  const [maxColors, setMaxColors] = useState(3)
  const [instructions, setInstructions] = useState('')
  const [isAllocating, setIsAllocating] = useState(false)

  // Delete State
  const [memberToDelete, setMemberToDelete] = useState<DesignTeamMember | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const activeMembers = members.filter(m => m.status === 'ACTIVE')
  const suspendedMembers = members.filter(m => m.status === 'SUSPENDED')

  const filteredMembers = members.filter(m => {
    const q = searchQuery.toLowerCase()
    return (
      m.designer_name.toLowerCase().includes(q) ||
      m.designer_email.toLowerCase().includes(q) ||
      (m.designer_phone && m.designer_phone.includes(q))
    )
  })

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim()) {
      toast.error('Name and email are required.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await addDesignTeamMemberAction({
        ph_user_id: currentUserId,
        designer_name: newName.trim(),
        designer_email: newEmail.trim(),
        designer_phone: newPhone.trim() || undefined,
        company_name: companyName
      })

      if (res.success && res.data) {
        toast.success(`Designer ${newName} added to team successfully.`)
        setMembers(prev => [res.data!, ...prev])
        setNewName('')
        setNewEmail('')
        setNewPhone('')
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
        setInstructions('')
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
          Team Management Portal
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
              Provisional Head controls for onboarding creative designers and delegating apparel concepts
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Designer</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Active Team Members
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-2">
            {activeMembers.length} Designers
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
            Temporary pause on task allocations
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Verification Chain
          </span>
          <div className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)] mt-2">
            Designer → PH → SA
          </div>
          <div className="text-xs text-slate-500 mt-1">
            3-Tier Approval Pipeline Enforced
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
              placeholder="Search by name, email, phone..."
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
            <span>View Design Briefs Queue</span>
          </Link>
        </div>

        {filteredMembers.length === 0 ? (
          <EmptyState
            icon={Users}
            title={searchQuery ? "No matching team members" : "No designers onboarded yet"}
            description={
              searchQuery
                ? "Try adjusting your search query."
                : "Add your first creative apparel designer to begin allocating design briefs."
            }
            actionLabel="Add Designer"
            onAction={() => setIsAddOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto border border-black/10 rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-black/10 bg-[#FAF7F0] text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Designer Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Phone / WhatsApp</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
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
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{member.designer_email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                      {member.designer_phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{member.designer_phone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-md border font-semibold ${
                        member.status === 'ACTIVE'
                          ? 'bg-[#FAF7F0] text-[#3A3564] border-black/10'
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
                          title="Remove Member"
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
                <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                  Onboard Creative Designer
                </h2>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Email Address <span className="text-rose-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="designer@brand.com"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Phone / WhatsApp (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>

              <div className="bg-[#FAF7F0] p-3 rounded-xl border border-black/10 text-xs text-slate-600">
                <span className="font-bold text-[#3A3564] block mb-0.5">Role & Access Scope:</span>
                The designer will have restricted portal access to view only their assigned design briefs and submit up to 2 concept photos per brief.
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
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save & Onboard</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Brief Modal */}
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
                    Assigning to <span className="font-semibold text-[#3A3564]">{allocateMember.designer_name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAllocateMember(null)}
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
                    value={garmentType}
                    onChange={e => setGarmentType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  >
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
                    value={category}
                    onChange={e => setCategory(e.target.value as BriefCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  >
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
                  value={maxColors}
                  onChange={e => setMaxColors(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Design Instructions & Creative Guidelines
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Oversized drop-shoulder fit, minimal chest branding, organic earth tones..."
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setAllocateMember(null)}
                  className="px-4 py-2 rounded-xl border border-black/10 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAllocating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {isAllocating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Allocate to Designer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!memberToDelete}
        title={`Remove Designer "${memberToDelete?.designer_name}"?`}
        description={`Are you sure you want to remove ${memberToDelete?.designer_name} from your team? They will no longer have access to allocated briefs.`}
        confirmText="Yes, Remove Member"
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
