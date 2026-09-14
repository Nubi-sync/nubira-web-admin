import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { DivisionProfileView } from '@/components/profile/DivisionProfileView'
import { resolveUserTenant } from '@/lib/tenant-context'
import { ROLE_MODULE_MAPPING } from '@/lib/access-control'

export const dynamic = 'force-dynamic'

export default async function CuttingProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)

  // Fetch real staff and head for cutting
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

        return mods.includes('/cutting')
      })

      headUser = staffList.find((p) => p.is_head) || staffList.find((p) => p.role === 'CUTTING_MASTER' || p.role === 'ADMIN')
    }
  } catch (err) {
    console.warn('Cutting profile fetch notice:', err)
  }

  return (
    <AdminShell userEmail={user.email} userRole={tenant.role}>
      <DivisionProfileView
        divisionName="Cutting Floor & Spreading CAD"
        divisionSlug="/cutting"
        divisionCode="03"
        categoryBadge="PRIMARY FABRIC CUTTING"
        companyName={tenant.companyName}
        userEmail={user.email || ''}
        userName={headUser?.username || tenant.adminDisplayName || 'Cutting Master'}
        userRole={headUser?.designation || headUser?.role || 'CUTTING_MASTER'}
        iconName="Scissors"
        supervisorName="Cutting Floor In-Charge"
        departmentHead={headUser ? {
          name: headUser.username,
          designation: headUser.designation || 'Cutting Master / Cutting Floor Head',
          email: headUser.email,
          authorityScope: 'Fabric Lay Sign-off, Marker Ratio Approval & Bundle Release',
          appointmentDate: headUser.created_at ? new Date(headUser.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Active',
        } : null}
        operationalSpecs={[
          { label: 'Spreading Tables', value: '4 Heavy Industrial Tables (40m)', iconName: 'Layers' },
          { label: 'Computerized Auto-Cutters', value: '2 High-Ply CNC Auto-Cutters', iconName: 'Cpu' },
          { label: 'Marker Utilization Target', value: '> 88.5% CAD Efficiency', iconName: 'Gauge' },
          { label: 'Bundle Ticketing System', value: '100% QR Code Realtime Scan', iconName: 'QrCode' },
        ]}
        staff={staffList}
        shiftDetails="Shift A (08:00 AM - 05:30 PM)"
        qualityStandard="ASTM D5430 4-Point Fabric Audit • Zero Defect Ply Cleared"
      />
    </AdminShell>
  )
}
