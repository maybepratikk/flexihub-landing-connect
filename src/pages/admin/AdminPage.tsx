
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminProvider } from '@/contexts/AdminContext';
import { Outlet } from 'react-router-dom';

export function AdminPage() {
  return (
    <AdminProvider>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </AdminProvider>
  );
}

export default AdminPage;
