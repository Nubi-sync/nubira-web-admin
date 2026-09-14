import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { DivisionProfileView } from '@/components/profile/DivisionProfileView'
import { resolveUserTenant } from '@/lib/tenant-context'
import { ROLE_MODULE_MAPPING } from '@/lib/access-control'

export const dynamic = 'force-dynamic'

export default async function StoreProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)

  // Fetch real staff and head for store
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

        return mods.includes('/store')
      })

      headUser = staffList.find((p) => p.is_head) || staffList.find((p) => p.role === 'STORE' || p.role === 'STORE_SUPERVISOR')
    }
  } catch (err) {
    console.warn('Store profile fetch notice:', err)
  }

  return (
    <AdminShell userEmail={user.email} userRole={tenant.role}>
      <DivisionProfileView
        divisionName="Central Store & Finished Export Vault"
        divisionSlug="/store"
        divisionCode="11"
        categoryBadge="CENTRAL GODOWN & VAULT"
        companyName={tenant.companyName}
        userEmail={user.email || ''}
        userName={headUser?.username || tenant.adminDisplayName || 'Godown Keeper'}
        userRole={headUser?.designation || headUser?.role || 'STORE_SUPERVISOR'}
        iconName="Store"
        supervisorName="Chief Storekeeper"
        departmentHead={headUser ? {
          name: headUser.username,
          designation: headUser.designation || 'Store Manager / Chief Godown Keeper',
          email: headUser.email,
          authorityScope: 'Raw Material GRN Approval, Cutting Roll Issuance & Finished Pallet Staging',
          appointmentDate: headUser.created_at ? new Date(headUser.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Active',
        } : null}
        operationalSpecs={[
          { label: 'Raw Fabric Godown', value: '50+ Tons Storage & ASTM 4-Pt Audit', iconName: 'Layers' },
          { label: 'Trims Warehouse (ROL)', value: 'Bin Locations with Reorder Level Alerts', iconName: 'Tag' },
          { label: 'Truck Inward Gate', value: 'Automated GRN Delivery Slips', iconName: 'Truck' },
          { label: 'Finished Export Bay', value: '50,000 Pcs Staging Bay 3–5', iconName: 'Warehouse' },
        ]}
        staff={staffList}
        shiftDetails="Shift A (08:00 AM - 06:00 PM)"
        qualityStandard="100% Stock Ledger Accuracy • Barcode Verified Physical Inward"
      />
    </AdminShell>
  )
}
