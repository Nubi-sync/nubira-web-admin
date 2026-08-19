import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CreateArticleForm } from './components/CreateArticleForm'
import { ArticleList } from './components/ArticleList'
import { Shirt } from 'lucide-react'

export default async function ArticlesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch articles
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Shirt className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Articles & Rates</h1>
              <p className="text-slate-500 mt-1">Manage Art No. and Stitching Rates</p>
            </div>
          </div>
          
          <a href="/" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors text-sm font-medium border border-slate-200 shadow-sm">
            Back to Dashboard
          </a>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-1">
            <CreateArticleForm />
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-2">
            <ArticleList articles={articles || []} />
          </div>
        </div>

      </div>
    </div>
  )
}
