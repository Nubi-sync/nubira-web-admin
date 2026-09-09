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

  // Restrict Store Supervisors from admin articles management
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = (userProfile?.role || '').toUpperCase()
  if (userRole === 'STORE' || userRole === 'STORE_SUPERVISOR' || userRole === 'GODOWN' || user.email?.startsWith('store@')) {
    redirect('/store')
  }

  // Fetch all articles from master catalog (synced with production delivery challans)
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(2000)

  return (
    <AdminShell userEmail={user.email}>
      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-5">
        
        {/* 1. Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/dashboard" className="hover:text-[#3A3564] transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span>Manage</span>
          <span>/</span>
          <span className="font-bold text-slate-900">
            Articles
          </span>
        </div>

        {/* 2. Unified Full-Width Client Component */}
        <ArticlesClient 
          articles={(articles as any) || []} 
        />

      </div>
    </AdminShell>
  )
}
