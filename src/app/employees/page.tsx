import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CreateEmployeeForm } from './components/CreateEmployeeForm'
import { EmployeeList } from './components/EmployeeList'
import { Users } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function EmployeesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch employees
  const { data: employees } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

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
            Employees
          </span>
        </div>

        {/* 2. Page Header (No "Back to Dashboard" button) */}
        <div 
          className="bg-white p-5 sm:p-6 rounded-[11px] border shadow-sm flex items-center justify-between gap-4"
          style={{ borderColor: 'var(--border, #E2E8F0)' }}
        >
          <div className="flex items-center gap-3.5">
            <div 
              className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center shrink-0 shadow-xs"
              style={{ backgroundColor: 'var(--steel, #2B4C7E)', color: '#FFFFFF' }}
            >
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 
                className="text-[20px] sm:text-[22px] font-bold font-[family-name:var(--font-heading)] leading-tight"
                style={{ color: 'var(--ink, #1C2733)' }}
              >
                Employees & Staff Management
              </h1>
              <p className="text-[13px] mt-0.5" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
                Manage factory workers, assign floor roles, and reset authentication credentials
              </p>
            </div>
          </div>
        </div>

        {/* 3. Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-1">
            <CreateEmployeeForm />
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-2">
            <EmployeeList employees={employees || []} />
          </div>
        </div>

      </div>
    </AdminShell>
  )
}
