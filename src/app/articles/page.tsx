import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ArticlesClient } from './components/ArticlesClient'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ArticlesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Parallel concurrent data fetching
  const [
    { data: articles },
    { data: rateHistory }
  ] = await Promise.all([
    supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false }),

    supabase
      .from('rate_history')
      .select('*')
      .order('created_at', { ascending: false })
  ])

  return (
    <AdminShell userEmail={user.email}>
      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-5">
        
        {/* 1. Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: 'var(--ink-faint, #8B9AAB)' }}>
          <span style={{ color: 'var(--ink-faint, #8B9AAB)' }}>
            Manage
          </span>
          <span>/</span>
          <span className="font-semibold" style={{ color: 'var(--steel-dark, #1F3A63)' }}>
            Articles & Rates
          </span>
        </div>

        {/* 2. Unified Full-Width Client Component */}
        <ArticlesClient 
          articles={(articles as any) || []} 
          rateHistory={(rateHistory as any) || []} 
        />

      </div>
    </AdminShell>
  )
}
