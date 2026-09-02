import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

export const dynamicConfig = 'force-dynamic'

// Client-only dynamic import to prevent any SSR hydration mismatch
const ZigzaAiClient = dynamic(
  () => import('./components/ZigzaAiClient').then((mod) => mod.ZigzaAiClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100dvh-57px)] lg:h-screen w-full items-center justify-center bg-[#FAFAF8]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#3A3564] text-[#FAF7F0] flex items-center justify-center shadow-md animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
            Loading Zigza AI...
          </span>
        </div>
      </div>
    ),
  }
)

export default async function ZigzaAiPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <AdminShell userEmail={user.email}>
      <ZigzaAiClient userEmail={user.email} />
    </AdminShell>
  )
}
