import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { SupervisorDeskClient } from '@/app/modules/supervisor-desk/SupervisorDeskClient'
import { resolveUserTenant } from '@/lib/tenant-context'
import { fetchSupervisorDeskDataAction } from '@/app/modules/supervisor-desk/actions'

export const dynamic = 'force-dynamic'

export default async function StitchingSupervisorDeskPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Centrally resolve tenant organization & identity
  const tenant = await resolveUserTenant(user)
  const userRole = tenant.role.toUpperCase()
  const targetCompany = (tenant.companyName || '').trim().toLowerCase()

  // 2. Fetch cached supervisor desk datasets
  const { rawAllotmentsData, rawLinemenProfiles, rawAllProfiles } =
    await fetchSupervisorDeskDataAction(tenant.companyName)

  // Multi-tenant scoping: Client factories only view allotments matching their company
  const isCompanyLineman = new Set(
    (rawLinemenProfiles || [])
      .filter((p: any) => {
        const comp = (p.company_name || '').toLowerCase()
        return !comp || comp === targetCompany || comp.includes(targetCompany)
      })
      .map((p: any) => p.id)
  )

  const allotmentsData = (rawAllotmentsData || []).filter(a => {
    if (!targetCompany) return true
    const brand = ((a.challans as any)?.brand || '').toLowerCase()
    const comp = ((a as any).company_name || '').toLowerCase()
    const notes = ((a.challans as any)?.notes || '').toLowerCase()
    const linemanComp = ((a.profiles as any)?.company_name || '').toLowerCase()
    const matNotes = (a.allotment_materials || []).map((m: any) => m.notes || '').join(' ').toLowerCase()
    const isMatMatch = matNotes.includes(targetCompany)

    return (
      brand === targetCompany ||
      brand.includes(targetCompany) ||
      comp.includes(targetCompany) ||
      notes.includes(targetCompany) ||
      linemanComp === targetCompany ||
      isLinemanMatch ||
      isMatMatch
    )
  })

  const linemenProfiles = (rawLinemenProfiles || []).filter((p: any) => {
    const comp = (p.company_name || '').toLowerCase()
    if (!comp) return true
    return comp === targetCompany || comp.includes(targetCompany)
  })

  const allProfiles = (rawAllProfiles || []).filter((p: any) => {
    const comp = (p.company_name || '').toLowerCase()
    if (!comp) return true
    return comp === targetCompany || comp.includes(targetCompany)
  })

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={userRole}>
      <SupervisorDeskClient
        initialAllotments={(allotmentsData as any) || []}
        linemenProfiles={linemenProfiles || []}
        allProfiles={allProfiles || []}
        currentUserEmail={tenant.userEmail}
        currentUserName={tenant.adminDisplayName || tenant.customUsername || user.email?.split('@')[0] || 'Floor Supervisor'}
        currentUserRole={tenant.isSuperAdmin ? 'Enterprise Master' : (userRole || 'Supervisor')}
        companyName={tenant.companyName}
      />
    </AdminShell>
  )
}
