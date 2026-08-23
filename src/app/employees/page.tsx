import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CreateEmployeeForm } from './components/CreateEmployeeForm'
import { EmployeeList } from './components/EmployeeList'
import { Users } from 'lucide-react'

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
      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
              <p className="text-slate-500 mt-1">Manage factory workers and their roles</p>
            </div>
          </div>
          
          <a href="/" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors text-sm font-medium border border-slate-200 shadow-sm">
            Back to Dashboard
          </a>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
    </div>
    </AdminShell>
  )
}
