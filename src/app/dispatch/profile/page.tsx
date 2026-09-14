import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { DivisionProfileView } from '@/components/profile/DivisionProfileView'
import { resolveUserTenant } from '@/lib/tenant-context'
import { ROLE_MODULE_MAPPING } from '@/lib/access-control'

export const dynamic = 'force-dynamic'

export default async function DispatchProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)

  // Fetch real profiles belonging to dispatch for this company
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

        return mods.includes('/dispatch')
      })

      headUser = staffList.find((p) => p.is_head) || staffList.find((p) => p.role === 'DISPATCH_MANAGER' || p.role === 'DISPATCH')
    }
  } catch (err) {
    console.warn('Dispatch profile fetch notice:', err)
  }

  return (
    <AdminShell userEmail={user.email} userRole={tenant.role}>
      <DivisionProfileView
        divisionName="Dispatch & Logistics Bay"
        divisionSlug="/dispatch"
        divisionCode="12"
        categoryBadge="OUTWARD LOGISTICS"
        companyName={tenant.companyName}
        userEmail={user.email || ''}
        userName={headUser?.username || tenant.adminDisplayName || 'Dispatch Head'}
        userRole={headUser?.designation || headUser?.role || 'DISPATCH_MANAGER'}
        iconName="Truck"
        supervisorName="Chief Dispatch Officer"
        departmentHead={headUser ? {
          name: headUser.username,
          designation: headUser.designation || 'Dispatch Manager / Logistics Head',
          email: headUser.email,
          authorityScope: 'Vehicle Gate-Out Clearance & Container Seal Sign-off',
          appointmentDate: headUser.created_at ? new Date(headUser.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Active',
        } : null}
        operationalSpecs={[
          { label: 'Export Loading Bays', value: '3 Dedicated High-Clearance Bays', iconName: 'Container' },
          { label: 'Carton Packing Check', value: '100% Barcode Verified Scan', iconName: 'Box' },
          { label: 'Weighbridge Gate Pass', value: 'Automated Gross/Tare Ledger', iconName: 'Scale' },
          { label: 'Container Stuffing', value: '20ft & 40ft High-Cube Compatible', iconName: 'Truck' },
        ]}
        staff={staffList}
        shiftDetails="Shift A (08:30 AM - 06:00 PM)"
        qualityStandard="100% Physical Count Audit • Zero Shortage Variance"
      />
    </AdminShell>
  )
}
