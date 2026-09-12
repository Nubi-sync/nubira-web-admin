import { createClient } from '../utils/supabase/server'
import { redirect } from 'next/navigation'
import { ZigzaLandingPageClient } from './components/ZigzaLandingPageClient'

export const dynamic = 'force-dynamic'

export default async function HomePage({
  searchParams
}: {
  searchParams?: Promise<{ showcase?: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const resolvedParams = searchParams ? await searchParams : {}
  const isShowcase = resolvedParams?.showcase === 'true'

  // If user is authenticated and didn't explicitly request the showcase view, route them to appropriate portal
  if (user && !isShowcase) {
    let targetRoute = '/modules'
    const isRootAdmin = user.email?.toLowerCase() === 'admin@zigza.in'

    if (isRootAdmin) {
      targetRoute = '/platform-admin'
    } else {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        const role = (profile?.role || '').toUpperCase()
        if (role === 'PLATFORM_SUPERADMIN' || role === 'SUPERADMIN') {
          targetRoute = '/platform-admin'
        } else if (role === 'STORE' || role === 'STORE_SUPERVISOR' || role === 'GODOWN' || user.email?.startsWith('store@')) {
          targetRoute = '/stitching-sewing/store'
        }
      } catch (_) {}
    }
    redirect(targetRoute)
  }

  // Otherwise, render the introductory landing page
  return (
    <ZigzaLandingPageClient
      isAuthenticated={!!user}
      userEmail={user?.email || ''}
    />
  )
}
