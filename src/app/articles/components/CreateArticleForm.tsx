'use client'

import { useState } from 'react'
import { createArticle } from '../actions'
import { PlusCircle, Loader2 } from 'lucide-react'

export function CreateArticleForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)
    setSuccess(false)
    
    const result = await createArticle(formData)
    
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
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <PlusCircle className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Add New Article</h2>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Article Number (Art No)</label>
          <input
            name="art_no"
            type="text"
            required
            placeholder="e.g. A2045"
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 uppercase"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <input
            name="description"
            type="text"
            placeholder="e.g. Blue Denim Jacket"
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Stitching Rate (₹)</label>
          <input
            name="stitching_rate"
            type="number"
            step="0.01"
            required
            placeholder="0.00"
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 outline-none transition-all duration-200"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 text-emerald-600 text-sm p-3 rounded-lg border border-emerald-100">
            Article added successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl px-4 py-2.5 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Adding...
            </>
          ) : (
            'Add Article'
          )}
        </button>
      </form>
    </div>
  )
}
