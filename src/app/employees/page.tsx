"use client";

import { useEffect, useState } from 'react';
import { UserPlus, MoreVertical, Loader2 } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import { CreateEmployeeModal } from './components/CreateEmployeeModal';

interface Employee {
  id: string;
  name: string;
  username: string;
  role: string;
  line_no: string | null;
  created_at: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/users');
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Admin</span>;
      case 'LINEMAN': return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Lineman</span>;
      case 'PRODUCTION': return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">QC</span>;
      case 'STORE': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">Store</span>;
      case 'DISPATCH': return <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">Dispatch</span>;
      default: return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">{role}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Employees Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage shop-floor workers and administrative access.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm shadow-blue-200 flex items-center space-x-2"
        >
          <UserPlus size={18} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Data Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>Loading employees...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                  <th className="py-4 px-6 font-medium">Name</th>
                  <th className="py-4 px-6 font-medium">Username</th>
                  <th className="py-4 px-6 font-medium">Role</th>
                  <th className="py-4 px-6 font-medium">Line No</th>
                  <th className="py-4 px-6 font-medium">Joined Date</th>
                  <th className="py-4 px-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">{emp.name}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-mono text-sm">{emp.username}</td>
                    <td className="py-4 px-6">{getRoleBadge(emp.role)}</td>
                    <td className="py-4 px-6 text-slate-500">
                      {emp.line_no ? <span className="font-mono bg-slate-100 px-2 py-1 rounded">{emp.line_no}</span> : '-'}
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-sm">
                      {new Date(emp.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-slate-300 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-blue-50 opacity-0 group-hover:opacity-100">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateEmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          fetchEmployees();
        }}
      />
    </div>
  );
}
