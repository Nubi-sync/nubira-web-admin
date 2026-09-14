import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { DivisionProfileView } from '@/components/profile/DivisionProfileView'
import { resolveUserTenant } from '@/lib/tenant-context'
import { ROLE_MODULE_MAPPING } from '@/lib/access-control'

export const dynamic = 'force-dynamic'

export default async function EmbroideryProfilePage() {
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

        return mods.includes('/embroidery')
      })

      headUser = staffList.find((p) => p.is_head) || staffList.find((p) => p.role === 'EMBROIDERY' || p.role === 'EMBROIDERY_MASTER')
    }
  } catch (err) {
    console.warn('Embroidery profile fetch notice:', err)
  }

  return (
    <AdminShell userEmail={user.email} userRole={tenant.role}>
      <DivisionProfileView
        divisionName="Multi-Head Embroidery Studio"
        divisionSlug="/embroidery"
        divisionCode="05"
        categoryBadge="MULTI-HEAD ART & DIGITIZING"
        companyName={tenant.companyName}
        userEmail={user.email || ''}
        userName={headUser?.username || tenant.adminDisplayName || 'Embroidery Master'}
        userRole={headUser?.designation || headUser?.role || 'EMBROIDERY_MASTER'}
        iconName="Sparkles"
        supervisorName="Embroidery Unit In-Charge"
        departmentHead={headUser ? {
          name: headUser.username,
          designation: headUser.designation || 'Embroidery Master / Unit Head',
          email: headUser.email,
          authorityScope: 'Stitch Punch Digitizing Approval, Thread Tension & Needle Clearance',
          appointmentDate: headUser.created_at ? new Date(headUser.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Active',
        } : null}
        operationalSpecs={[
          { label: 'Multi-Head Machines', value: '4 Heavy Computerized Machines (24 Heads)', iconName: 'Cpu' },
          { label: 'Stitch Speed Target', value: 'Up to 1,000 SPM Precision Operation', iconName: 'Gauge' },
          { label: 'Digitizing Unit', value: 'In-House Punching & Embroidery CAD', iconName: 'Layers' },
          { label: 'Thread Cones Store', value: 'Pantone Matched Poly/Viscose Filament Cones', iconName: 'Sparkles' },
        ]}
        staff={staffList}
        shiftDetails="Shift A (08:30 AM - 05:30 PM)"
        qualityStandard="Zero Puckering • 100% Backing Paper Trimming Clearance"
      />
    </AdminShell>
  )
}
