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

  // If user is authenticated and didn't explicitly request the showcase view, take them to /dashboard
  if (user && !isShowcase) {
    redirect('/dashboard')
  }

  // Otherwise, render the introductory landing page
  return (
    <ZigzaLandingPageClient
      isAuthenticated={!!user}
      userEmail={user?.email || ''}
    />
  )
}
