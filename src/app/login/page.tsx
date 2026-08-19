'use client'

import { useState } from 'react'
import { login } from './actions'
import { LogIn, Factory } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function clientAction(formData: FormData) {
    setIsPending(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-violet-100/50 blur-[100px]" />
      </div>

      <div className="z-10 w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="h-16 w-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-blue-900/5">
            <Factory className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">Nubira Factory</h1>
          <p className="text-slate-500">Sign in to the Web Admin Panel</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-2xl shadow-slate-200/50">
          <form action={clientAction} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700 ml-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="admin@nubira.local"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700 ml-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all duration-200"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg flex items-start">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-4 py-3 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 mt-4"
            >
              {isPending ? (
                <span className="animate-pulse">Signing in...</span>
              ) : (
                <>
                  Sign In <LogIn className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
