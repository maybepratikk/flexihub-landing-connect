
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Briefcase, 
  FileText, 
  FileClock, 
  Settings, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

interface AdminSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function AdminSidebar({ open, setOpen }: AdminSidebarProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
    { name: 'Applications', href: '/admin/applications', icon: FileText },
    { name: 'Contracts', href: '/admin/contracts', icon: FileClock },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-10 flex flex-col bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out",
        open ? "w-64" : "w-16"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b">
        <div className={cn("font-bold text-lg transition-opacity", open ? "opacity-100" : "opacity-0")}>
          Admin Panel
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-4 px-2">
        <nav className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all",
                isActive(item.href)
                  ? "bg-gray-100 dark:bg-gray-700 text-primary"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              <item.icon className={cn("flex-shrink-0 h-5 w-5", isActive(item.href) ? "text-primary" : "")} />
              <span className={cn("ml-3 transition-opacity", open ? "opacity-100" : "opacity-0")}>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
