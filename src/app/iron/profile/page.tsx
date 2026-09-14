import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { DivisionProfileView } from '@/components/profile/DivisionProfileView'
import { resolveUserTenant } from '@/lib/tenant-context'
import { ROLE_MODULE_MAPPING } from '@/lib/access-control'

export const dynamic = 'force-dynamic'

export default async function IronProfilePage() {
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

        return mods.includes('/iron')
      })

      headUser = staffList.find((p) => p.is_head) || staffList.find((p) => p.role === 'IRON' || p.role === 'IRONING_MASTER')
    }
  } catch (err) {
    console.warn('Iron profile fetch notice:', err)
  }

  return (
    <AdminShell userEmail={user.email} userRole={tenant.role}>
      <DivisionProfileView
        divisionName="Steam Pressing & Ironing Floor"
        divisionSlug="/iron"
        divisionCode="08"
        categoryBadge="FINISHING & PRESSING"
        companyName={tenant.companyName}
        userEmail={user.email || ''}
        userName={headUser?.username || tenant.adminDisplayName || 'Ironing In-Charge'}
        userRole={headUser?.designation || headUser?.role || 'IRONING_MASTER'}
        iconName="Flame"
        supervisorName="Finishing In-Charge"
        departmentHead={headUser ? {
          name: headUser.username,
          designation: headUser.designation || 'Finishing & Ironing Incharge',
          email: headUser.email,
          authorityScope: 'Steam Boiler Pressure Clearance, Pressing Line Pace & Fold Audit',
          appointmentDate: headUser.created_at ? new Date(headUser.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Active',
        } : null}
        operationalSpecs={[
          { label: 'Vacuum Pressing Tables', value: '12 Industrial Vacuum Boards', iconName: 'Layers' },
          { label: 'Central Steam Boiler', value: 'Continuous High-Pressure Steam Circuit', iconName: 'Flame' },
          { label: 'Inline Finish Audit', value: '100% Crease & Shine-Free Check', iconName: 'CheckCircle' },
          { label: 'Cooling Suction Unit', value: 'Instant De-Moisturizing Extraction', iconName: 'Wind' },
        ]}
        staff={staffList}
        shiftDetails="Shift A (08:30 AM - 05:30 PM)"
        qualityStandard="Zero Shine Marks • Zero Thermal Scorching • Crisp Crease Form"
      />
    </AdminShell>
  )
}
