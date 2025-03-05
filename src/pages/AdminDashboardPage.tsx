
import { AdminRoute } from '@/components/auth/AdminRoute';
import { AdminDashboard } from './dashboard/AdminDashboard';

const AdminDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <main className="container mx-auto px-4 py-8">
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
