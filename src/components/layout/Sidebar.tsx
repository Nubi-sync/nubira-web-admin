import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Box, Package, LogOut, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Product Allotment', href: '/allotment', icon: Package },
    { name: 'Inventory', href: '/inventory', icon: Box },
    { name: 'Employees', href: '/employees', icon: Users },
    { name: 'Audit Logs', href: '/audit', icon: FileText },
  ];

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-wider text-blue-400">NUBIRA</h1>
        <p className="text-xs text-slate-400 mt-1">Admin Control Panel</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="mb-4 px-4">
          <p className="text-sm font-semibold">{user?.name || 'Admin User'}</p>
          <p className="text-xs text-slate-400">{user?.role || 'Administrator'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center w-full space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-900/50 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
