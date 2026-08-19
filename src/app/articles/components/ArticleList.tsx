'use client'

import { useState } from 'react'
import { updateArticleRate, getRateHistory } from '../actions'
import { History, X } from 'lucide-react'

type Article = {
  id: string
  art_no: string
  description: string
  stitching_rate: number
  is_active: boolean
  created_at: string
}

export function ArticleList({ articles }: { articles: Article[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newRate, setNewRate] = useState<string>('')
  const [isPending, setIsPending] = useState(false)
  
  // History Modal State
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [historyData, setHistoryData] = useState<any[]>([])
  const [activeArticle, setActiveArticle] = useState<Article | null>(null)

  async function handleViewHistory(article: Article) {
    setActiveArticle(article)
    setHistoryModalOpen(true)
    const { data } = await getRateHistory(article.id)
    if (data) setHistoryData(data)
  }

  async function handleUpdateRate(articleId: string, oldRate: number) {
    const rateNum = parseFloat(newRate)
    if (isNaN(rateNum) || rateNum === oldRate) {
      setEditingId(null)
      return
    }

    setIsPending(true)
    await updateArticleRate(articleId, oldRate, rateNum)
    setEditingId(null)
    setIsPending(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <th className="px-6 py-4 font-semibold">Art No</th>
              <th className="px-6 py-4 font-semibold">Description</th>
              <th className="px-6 py-4 font-semibold">Stitching Rate (₹)</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {articles.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No articles found. Add one from the form.
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{article.art_no}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-600 text-sm">{article.description || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === article.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          value={newRate}
                          onChange={(e) => setNewRate(e.target.value)}
                          className="w-24 bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div className="font-medium text-slate-800">
                        ₹ {article.stitching_rate.toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingId === article.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          disabled={isPending}
                          className="text-xs font-medium px-2 py-1 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateRate(article.id, article.stitching_rate)}
                          disabled={isPending}
                          className="text-xs font-medium px-2 py-1 text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors disabled:opacity-50"
                        >
                          {isPending ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewHistory(article)}
                          className="text-sm font-medium px-2 py-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                          title="Rate History"
                        >
                          <History className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(article.id)
                            setNewRate(article.stitching_rate.toString())
                          }}
                          className="text-sm font-medium px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          Update Rate
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* History Modal */}
      {historyModalOpen && activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">
                Rate History: {activeArticle.art_no}
              </h3>
              <button 
                onClick={() => setHistoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              {historyData.length === 0 ? (
                <div className="text-center text-slate-500 py-4">No rate changes found.</div>
              ) : (
                <div className="space-y-4">
                  {historyData.map((record) => (
                    <div key={record.id} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 bg-slate-50">
                      <div>
                        <div className="text-sm font-medium text-slate-700">
                          ₹{record.old_rate} ➔ <span className="text-indigo-600 font-bold">₹{record.new_rate}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {new Date(record.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
