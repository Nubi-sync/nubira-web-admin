'use client'

import React from 'react'
import Link from 'next/link'
import {
  Scissors,
  ArrowLeft,
  User,
  Phone,
  Lock,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react'
import { StitchingWorker } from '../../../types/stitching'

interface WorkerProfileClientProps {
  userEmail?: string
  userName?: string
  userPhone?: string
  userId?: string
  userRole?: string
  workerRecord?: StitchingWorker
}

export function WorkerProfileClient({
  userEmail,
  userName,
  userPhone,
  userRole,
  workerRecord
}: WorkerProfileClientProps) {
  const normPhone = (userPhone || workerRecord?.phone_number || '').replace(/\D/g, '').slice(-10)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-3.5">
        <Link
          href="/stitching-sewing/worker"
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
            Tailor Profile & Credentials
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Sewing operator workstation badge & assigned floor skills
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        
        {/* Top Accent Strip */}
        <div className="h-28 bg-[#3A3564] p-6 flex items-end justify-between relative">
          <div className="absolute top-4 right-4 text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-xs">
            Assembly Line 06
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          
          {/* Avatar */}
          <div className="-mt-12 flex items-end justify-between mb-4">
            <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center font-bold text-2xl text-[#3A3564] font-mono bg-[#FAF7F0]">
              {userName ? userName.slice(0, 2).toUpperCase() : 'TA'}
            </div>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active on Floor
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 font-[family-name:var(--font-heading)]">
              {userName || workerRecord?.worker_name || 'Tailor Operator'}
            </h3>
            <p className="text-sm font-medium text-slate-500">
              {workerRecord?.machine_specialty || workerRecord?.role || 'Master Tailor / Assembly Specialist'}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
            
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Mobile ID (Workstation Login)
              </div>
              <div className="text-sm font-bold font-mono text-slate-900 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-400" />
                +91 {normPhone || '9876543210'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Machine Specialty
              </div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-[#3A3564]" />
                {workerRecord?.machine_specialty || 'Single Needle (SNLS)'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Assigned Floor Shift
              </div>
              <div className="text-sm font-bold text-slate-900 capitalize flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                {workerRecord?.shift ? `${workerRecord.shift.toLowerCase()} shift` : 'Morning shift (08:00 - 17:00)'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Standard Piece Rate
              </div>
              <div className="text-sm font-bold text-[#3A3564] font-mono flex items-center gap-1.5">
                ₹{workerRecord?.piece_rate_inr || 14.5}/pc
              </div>
            </div>

          </div>

          {/* Sign Out Button */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Logged in as Stitching Operator
            </span>

            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out Workstation</span>
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  )
}
