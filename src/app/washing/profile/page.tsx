import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { DivisionProfileView } from '@/components/profile/DivisionProfileView'
import { resolveUserTenant } from '@/lib/tenant-context'
import { ROLE_MODULE_MAPPING } from '@/lib/access-control'

export const dynamic = 'force-dynamic'

export default async function WashingProfilePage() {
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

        return mods.includes('/washing')
      })

      headUser = staffList.find((p) => p.is_head) || staffList.find((p) => p.role === 'WASHING' || p.role === 'WASHING_MASTER')
    }
  } catch (err) {
    console.warn('Washing profile fetch notice:', err)
  }

  return (
    <AdminShell userEmail={user.email} userRole={tenant.role}>
      <DivisionProfileView
        divisionName="Industrial Washing & Dyeing"
        divisionSlug="/washing"
        divisionCode="07"
        categoryBadge="WET PROCESSING & FINISHING"
        companyName={tenant.companyName}
        userEmail={user.email || ''}
        userName={headUser?.username || tenant.adminDisplayName || 'Washing Master'}
        userRole={headUser?.designation || headUser?.role || 'WASHING_MASTER'}
        iconName="Waves"
        supervisorName="Wet Processing Head"
        departmentHead={headUser ? {
          name: headUser.username,
          designation: headUser.designation || 'Washing Master / Wet Processing Head',
          email: headUser.email,
          authorityScope: 'Liquor Ratio Formulations, Silicon Enzyme Wash Release & Shade Match',
          appointmentDate: headUser.created_at ? new Date(headUser.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Active',
        } : null}
        operationalSpecs={[
          { label: 'Industrial Washing Drums', value: '6 Heavy Industrial Washing Units', iconName: 'Waves' },
          { label: 'Hydro-Extractors', value: '2 High-Speed Centrifugal De-Waterers', iconName: 'Wind' },
          { label: 'Chemical Ratio Tanks', value: 'Automated Dosing & pH Balancing Tank', iconName: 'Droplet' },
          { label: 'Eco-Wash Cycle', value: 'Low Water-to-Goods Liquor Ratio (< 1:5)', iconName: 'Gauge' },
        ]}
        staff={staffList}
        shiftDetails="Shift A (07:30 AM - 04:30 PM)"
        qualityStandard="Shrinkage Tolerance < 2.5% • Neutral pH Hand-Feel Verification"
      />
    </AdminShell>
  )
}
