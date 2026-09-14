import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { DivisionProfileView } from '@/components/profile/DivisionProfileView'
import { resolveUserTenant } from '@/lib/tenant-context'
import { ROLE_MODULE_MAPPING } from '@/lib/access-control'

export const dynamic = 'force-dynamic'

export default async function StitchingSewingProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)

  // Fetch real staff and head for stitching
  let staffList: any[] = []
  let headUser: any = null

  try {
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, username, role, is_active, created_at, allowed_modules, is_head, designation, company_name')
      .order('created_at', { ascending: false })

    if (profiles) {
      const isNubira = !tenant.companyName || tenant.companyName.toLowerCase().includes('nubira')

      staffList = profiles.filter((p) => {
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

        return mods.includes('/stitching-sewing')
      })

      headUser = staffList.find((p) => p.is_head) || staffList.find((p) => p.role === 'PRODUCTION_MANAGER' || p.role === 'STITCHING_SUPERVISOR')
    }
  } catch (err) {
    console.warn('Stitching profile fetch notice:', err)
  }

  return (
    <AdminShell userEmail={user.email} userRole={tenant.role}>
      <DivisionProfileView
        divisionName="Stitching & Sewing Assembly Line"
        divisionSlug="/stitching-sewing/dashboard"
        divisionCode="06"
        categoryBadge="CORE SEWING ASSEMBLY"
        companyName={tenant.companyName}
        userEmail={user.email || ''}
        userName={headUser?.username || tenant.adminDisplayName || 'Sewing Supervisor'}
        userRole={headUser?.designation || headUser?.role || 'PRODUCTION_MANAGER'}
        iconName="Scissors"
        supervisorName="Floor Production Supervisor"
        departmentHead={headUser ? {
          name: headUser.username,
          designation: headUser.designation || 'Production Manager / Sewing Floor Head',
          email: headUser.email,
          authorityScope: 'Lineman Bundle Allocations, Rate Approvals & Final Lot Sign-off',
          appointmentDate: headUser.created_at ? new Date(headUser.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Active',
        } : null}
        operationalSpecs={[
          { label: 'Assembly Lines', value: 'Dedicated Multi-Line Setup', iconName: 'Layers' },
          { label: 'Machine Fleet', value: 'Single Needle, Overlock, Flatlock & Kansai', iconName: 'Zap' },
          { label: 'Daily Target Pcs', value: 'Dynamic Shift Output Allocation', iconName: 'Gauge' },
          { label: 'Quality Handover', value: '3-Stage In-Line QC & Lineman Sync', iconName: 'CheckCircle2' },
        ]}
        staff={staffList}
        shiftDetails="Shift A (08:30 AM - 05:30 PM)"
        qualityStandard="AQL 2.5 In-Line Inspection • 100% Bundle Lineage Tracked"
      />
    </AdminShell>
  )
}
