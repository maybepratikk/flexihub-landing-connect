
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { NotificationProvider } from '@/contexts/NotificationContext';

export function MainLayout() {
  return (
    <NotificationProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow w-full pt-16">
          <Outlet />
        </main>
        <Footer />
      </div>
    </NotificationProvider>
  );
}
