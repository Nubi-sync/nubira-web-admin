import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { DivisionProfileView } from '@/components/profile/DivisionProfileView'
import { resolveUserTenant } from '@/lib/tenant-context'
import { ROLE_MODULE_MAPPING } from '@/lib/access-control'

export const dynamic = 'force-dynamic'

export default async function MerchandisingProfilePage() {
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

        return mods.includes('/merchandising')
      })

      headUser = staffList.find((p) => p.is_head) || staffList.find((p) => p.role === 'MERCHANDISING' || p.role === 'MERCHANDISER')
    }
  } catch (err) {
    console.warn('Merchandising profile fetch notice:', err)
  }

  return (
    <AdminShell userEmail={user.email} userRole={tenant.role}>
      <DivisionProfileView
        divisionName="Merchandising & Sourcing Desk"
        divisionSlug="/merchandising"
        divisionCode="02"
        categoryBadge="COMMERCIAL OPS & SOURCING"
        companyName={tenant.companyName}
        userEmail={user.email || ''}
        userName={headUser?.username || tenant.adminDisplayName || 'Senior Merchandiser'}
        userRole={headUser?.designation || headUser?.role || 'MERCHANDISING_HEAD'}
        iconName="Briefcase"
        supervisorName="Head of Merchandising"
        departmentHead={headUser ? {
          name: headUser.username,
          designation: headUser.designation || 'Senior Merchandiser / Sourcing Head',
          email: headUser.email,
          authorityScope: 'Buyer PO Allocation, BOM Costing Authorization & Shipment Handover',
          appointmentDate: headUser.created_at ? new Date(headUser.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Active',
        } : null}
        operationalSpecs={[
          { label: 'Buyer Accounts Active', value: 'Multi-Account Commercial Portfolios', iconName: 'ShoppingBag' },
          { label: 'BOM Cost Realization', value: '> 98.2% Target Profit Margin', iconName: 'IndianRupee' },
          { label: 'Shipment Compliance', value: '100% On-Time Delivery (OTD) Tracking', iconName: 'Calendar' },
          { label: 'Trim Sourcing Lead Time', value: 'Automated Purchase Requisition (PR)', iconName: 'TrendingUp' },
        ]}
        staff={staffList}
        shiftDetails="General Shift (09:00 AM - 06:30 PM)"
        qualityStandard="AQL Pre-Shipment Inspection Pass • 100% BOM Cost Adherence"
      />
    </AdminShell>
  )
}
