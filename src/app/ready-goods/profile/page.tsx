import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { DivisionProfileView } from '@/components/profile/DivisionProfileView'
import { resolveUserTenant } from '@/lib/tenant-context'
import { ROLE_MODULE_MAPPING } from '@/lib/access-control'

export const dynamic = 'force-dynamic'

export default async function ReadyGoodsProfilePage() {
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

        return mods.includes('/ready-goods')
      })

      headUser = staffList.find((p) => p.is_head) || staffList.find((p) => p.role === 'QC' || p.role === 'AQL_INSPECTOR')
    }
  } catch (err) {
    console.warn('Ready goods profile fetch notice:', err)
  }

  return (
    <AdminShell userEmail={user.email} userRole={tenant.role}>
      <DivisionProfileView
        divisionName="Ready Goods & Carton Packing"
        divisionSlug="/ready-goods"
        divisionCode="09"
        categoryBadge="FINAL QA & PACKAGING"
        companyName={tenant.companyName}
        userEmail={user.email || ''}
        userName={headUser?.username || tenant.adminDisplayName || 'QA Manager'}
        userRole={headUser?.designation || headUser?.role || 'QA_HEAD'}
        iconName="Boxes"
        supervisorName="Quality Assurance Head"
        departmentHead={headUser ? {
          name: headUser.username,
          designation: headUser.designation || 'Quality Assurance Head / AQL Manager',
          email: headUser.email,
          authorityScope: 'Final AQL Inspection Certificate, Carton Sealing Seal & Metal Detector Pass',
          appointmentDate: headUser.created_at ? new Date(headUser.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Active',
        } : null}
        operationalSpecs={[
          { label: 'Final AQL Audit Tables', value: '4 Dedicated Clean-Room Audit Tables', iconName: 'ShieldCheck' },
          { label: 'Carton Packaging Lines', value: 'Polybag Heat Seal & Taping Conveyor', iconName: 'PackageCheck' },
          { label: 'Barcode Scan Station', value: '100% UPC Hangtag SKU Verification', iconName: 'QrCode' },
          { label: 'Metal Detector Tunnel', value: '9-Point Calibrated Needle Detector (< 1.0mm)', iconName: 'CheckSquare' },
        ]}
        staff={staffList}
        shiftDetails="Shift A (08:30 AM - 05:30 PM)"
        qualityStandard="AQL 2.5 Normal Inspection Level II • 100% Needle Detector Clearance"
      />
    </AdminShell>
  )
}
