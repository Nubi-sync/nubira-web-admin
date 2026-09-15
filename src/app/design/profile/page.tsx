import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { DivisionProfileView } from '@/components/profile/DivisionProfileView'
import { resolveUserTenant } from '@/lib/tenant-context'
import { ROLE_MODULE_MAPPING } from '@/lib/access-control'

export const dynamic = 'force-dynamic'

export default async function DesignProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)

  let staffList: any[] = []
  let headUser: any = null
  let currentDesignerMember: any = null

  try {
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, username, role, is_active, created_at, allowed_modules, is_head, designation, company_name')
      .order('created_at', { ascending: false })

    const { data: teamMembers } = await supabaseAdmin
      .from('design_team_members')
      .select('*')
      .order('created_at', { ascending: false })

    if (teamMembers) {
      const uEmail = (user.email || '').toLowerCase().trim()
      const rawDigits = uEmail.split('@')[0].replace(/\D/g, '')
      const phone10 = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits

      currentDesignerMember = teamMembers.find((m) =>
        m.designer_user_id === user.id ||
        (m.designer_email && m.designer_email.toLowerCase().trim() === uEmail) ||
        (phone10 && (m.phone_number === phone10 || m.designer_phone === phone10))
      )
    }

    const isNubira = !tenant.companyName || tenant.companyName.toLowerCase().includes('nubira')

    const profileStaff = (profiles || []).filter((p) => {
      if (p.role === 'PLATFORM_SUPERADMIN') return false

      if (isNubira) {
        const pComp = (p.company_name || '').toLowerCase()
        if (pComp && !pComp.includes('nubira')) return false
      } else {
        const pComp = (p.company_name || '').toLowerCase()
        if (!pComp.includes(tenant.companyName.toLowerCase())) return false
      }

      const mods = Array.isArray(p.allowed_modules) && p.allowed_modules.length > 0
        ? p.allowed_modules
        : (ROLE_MODULE_MAPPING[p.role?.toUpperCase() || ''] || [])

      return mods.some((m: string) => m.startsWith('/design'))
    })

    const designerStaff = (teamMembers || []).map((tm) => ({
      id: tm.id,
      username: tm.designer_name || tm.username || 'Designer',
      role: 'DESIGNER',
      designation: 'Creative Apparel Designer',
      is_active: tm.status === 'ACTIVE',
      created_at: tm.created_at,
      is_head: false,
    }))

    const seenNames = new Set<string>()
    staffList = [...profileStaff, ...designerStaff].filter((s) => {
      const key = `${s.username?.toLowerCase()}_${s.role}`
      if (seenNames.has(key)) return false
      seenNames.add(key)
      return true
    })

    headUser = staffList.find((p) => p.is_head) || staffList.find((p) => p.role === 'DESIGN' || p.role === 'CAD_MASTER')
  } catch (err) {
    console.warn('Design profile fetch notice:', err)
  }

  const isDesigner = (
    tenant.role === 'DESIGNER' ||
    (user.email || '').toLowerCase().includes('@designer.') ||
    (user.email || '').toLowerCase().endsWith('@designer.nubira.local')
  )

  const activeUserName = isDesigner
    ? (currentDesignerMember?.designer_name || tenant.adminDisplayName || 'Creative Designer')
    : (headUser?.username || tenant.adminDisplayName || 'Design Lead')

  const activeUserRole = isDesigner
    ? 'Creative Designer'
    : (headUser?.designation || headUser?.role || 'Design Studio Head')

  return (
    <AdminShell userEmail={user.email} userRole={tenant.role}>
      <DivisionProfileView
        divisionName={isDesigner ? "Designer Workspace" : "Design & Tech-Pack Studio"}
        divisionSlug={isDesigner ? "/design/designer" : "/design"}
        divisionCode="01"
        categoryBadge={isDesigner ? "CREATIVE DESIGNER" : "CREATIVE STUDIO & CAD"}
        companyName={tenant.companyName}
        userEmail={user.email || ''}
        userName={activeUserName}
        userRole={activeUserRole}
        iconName="Palette"
        supervisorName="Chief Creative Lead"
        backHref={isDesigner ? "/design/designer" : "/modules"}
        backLabel={isDesigner ? "Designer Workspace" : "Workspace Hub"}
        departmentHead={headUser ? {
          name: headUser.username,
          designation: headUser.designation || 'Design Studio Head / CAD Master',
          email: headUser.email,
          authorityScope: 'Pattern Grading Approval, 3D Tech-Pack Sign-off & Sample Release',
          appointmentDate: headUser.created_at ? new Date(headUser.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Active',
        } : null}
        operationalSpecs={[
          { label: 'CAD Workstations', value: '6 High-Performance CAD Stations', iconName: 'Monitor' },
          { label: 'Sample Iteration Suite', value: 'Physical & 3D Virtual Fit Prototyping', iconName: 'Sparkles' },
          { label: 'Digitizing & Plotting', value: 'Wide-Format Industrial Gerber Plotters', iconName: 'Cpu' },
          { label: 'Pattern Spec Standard', value: 'AAMA / ASTM D5586 Grading Compliance', iconName: 'FileText' },
        ]}
        staff={staffList}
        shiftDetails="General Shift (09:00 AM - 06:00 PM)"
        qualityStandard="Zero Tolerance Tech-Pack Specs • ISO 8559 Sizing Compliance"
      />
    </AdminShell>
  )
}
