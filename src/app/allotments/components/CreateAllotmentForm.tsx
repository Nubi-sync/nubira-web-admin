'use client'

import { useState } from 'react'
import { createAllotment } from '../actions'
import { ClipboardList, Loader2 } from 'lucide-react'

type Profile = { id: string; username: string }
type Article = { id: string; art_no: string }

export function CreateAllotmentForm({ 
  linemen, 
  articles 
}: { 
  linemen: Profile[], 
  articles: Article[] 
}) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)
    setSuccess(false)
    
    const result = await createAllotment(formData)
    
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
    
    setIsPending(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
          <ClipboardList className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Assign Target</h2>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Select Lineman</label>
          <select
            name="lineman_id"
            required
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 rounded-xl px-4 py-2.5 text-slate-900 outline-none transition-all duration-200 appearance-none"
          >
            <option value="">-- Choose Lineman --</option>
            {linemen.map((lm) => (
              <option key={lm.id} value={lm.id}>{lm.username}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Select Article</label>
          <select
            name="article_id"
            required
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 rounded-xl px-4 py-2.5 text-slate-900 outline-none transition-all duration-200 appearance-none"
          >
            <option value="">-- Choose Article --</option>
            {articles.map((art) => (
              <option key={art.id} value={art.id}>{art.art_no}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Target Quantity</label>
          <input
            name="target_qty"
            type="number"
            min="1"
            required
            placeholder="e.g. 500"
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 outline-none transition-all duration-200"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 text-emerald-600 text-sm p-3 rounded-lg border border-emerald-100">
            Target assigned successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-xl px-4 py-2.5 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Assigning...
            </>
          ) : (
            'Assign Target'
          )}
        </button>
      </form>
    </div>
  )
}
