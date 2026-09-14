import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { DivisionProfileView } from '@/components/profile/DivisionProfileView'
import { resolveUserTenant } from '@/lib/tenant-context'
import { ROLE_MODULE_MAPPING } from '@/lib/access-control'

export const dynamic = 'force-dynamic'

export default async function PrintingProfilePage() {
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

        return mods.includes('/printing')
      })

      headUser = staffList.find((p) => p.is_head) || staffList.find((p) => p.role === 'PRINTING' || p.role === 'PRINTING_MASTER')
    }
  } catch (err) {
    console.warn('Printing profile fetch notice:', err)
  }

  return (
    <AdminShell userEmail={user.email} userRole={tenant.role}>
      <DivisionProfileView
        divisionName="Screen & Digital Printing Studio"
        divisionSlug="/printing"
        divisionCode="04"
        categoryBadge="SURFACE EMBELLISHMENT"
        companyName={tenant.companyName}
        userEmail={user.email || ''}
        userName={headUser?.username || tenant.adminDisplayName || 'Printing Master'}
        userRole={headUser?.designation || headUser?.role || 'PRINTING_MASTER'}
        iconName="Printer"
        supervisorName="Printing Operations Head"
        departmentHead={headUser ? {
          name: headUser.username,
          designation: headUser.designation || 'Printing Master / Print Unit Head',
          email: headUser.email,
          authorityScope: 'Strike-Off Color Approvals, Screen Registration & Curing Sign-off',
          appointmentDate: headUser.created_at ? new Date(headUser.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Active',
        } : null}
        operationalSpecs={[
          { label: 'Screen Print Tables', value: '8 Semi-Automatic Print Tables', iconName: 'Layers' },
          { label: 'Digital DTG Printers', value: '2 Industrial High-Res Direct-to-Garment', iconName: 'Printer' },
          { label: 'Heat Curing Tunnel', value: 'Conveyor Infrared Curing Chambers', iconName: 'Flame' },
          { label: 'Strike-off Clearance', value: 'Pantone Color Shade Precision Match', iconName: 'Palette' },
        ]}
        staff={staffList}
        shiftDetails="Shift A (08:00 AM - 05:30 PM)"
        qualityStandard="Wash Fastness Grade 4-5 • Zero Cracking / Zero Bleeding Audit"
      />
    </AdminShell>
  )
}
