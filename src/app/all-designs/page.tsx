import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { SADesignApprovalsClient } from '../design/sa-approvals/components/SADesignApprovalsClient'
import { fetchDesignSubmissionsAction } from '../design/actions'
import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function AllDesignsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)
  const companyFilter = tenant.companyName

  const submissions = await fetchDesignSubmissionsAction({
    company_name: companyFilter,
    ph_verdict: 'APPROVED'
  })

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role} companyName={tenant.companyName}>
      <div className="p-3.5 sm:p-6 md:p-8 space-y-3.5 sm:space-y-6 max-w-[1536px] w-full mx-auto select-none">
        <SADesignApprovalsClient
          initialSubmissions={submissions}
          companyName={tenant.companyName}
          currentUserId={user.id}
          userRole={tenant.role}
          isModuleView={false}
        />
      </div>
    </AdminShell>
  )
}
