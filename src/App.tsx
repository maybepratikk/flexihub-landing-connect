import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';

import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ClientRoute } from './components/auth/ClientRoute';
import { FreelancerRoute } from './components/auth/FreelancerRoute';
import { AdminRoute } from './components/auth/AdminRoute';

import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import ApplicationsPage from './pages/applications/ApplicationsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerificationSentPage from './pages/VerificationSentPage';
import NotFound from './pages/NotFound';
import PostJobPage from './pages/PostJobPage';
import OnboardingPage from './pages/OnboardingPage';
import ContractPage from './pages/ContractPage';
import FindTalentPage from './pages/FindTalentPage';
import MessagesPage from './pages/MessagesPage';
import FreelancerProfilePage from './pages/FreelancerProfilePage';
import ClientProfilePage from './pages/ClientProfilePage';

import AdminPage from './pages/admin/AdminPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UsersPage from './pages/admin/UsersPage';
import JobsAdminPage from './pages/admin/JobsPage';
import ApplicationsAdminPage from './pages/admin/ApplicationsPage';
import ContractsPage from './pages/admin/ContractsPage';
import SettingsPage from './pages/admin/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/verify" element={<VerificationSentPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Admin routes - wrapping with AdminProvider moved to AdminPage component */}
          <Route path="/admin" element={<AdminPage />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="jobs" element={<JobsAdminPage />} />
            <Route path="applications" element={<ApplicationsAdminPage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Routes with main layout */}
          <Route element={<MainLayout />}>
            <Route path="/home" element={<HomePage />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/jobs" element={
              <ProtectedRoute>
                <JobsPage />
              </ProtectedRoute>
            } />
            <Route path="/jobs/:jobId" element={
              <ProtectedRoute>
                <JobDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/jobs/:jobId/applications" element={
              <ProtectedRoute>
                <ApplicationsPage />
              </ProtectedRoute>
            } />
            <Route path="/post-job" element={
              <ProtectedRoute>
                <PostJobPage />
              </ProtectedRoute>
            } />
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            } />
            <Route path="/contracts/:contractId" element={
              <ProtectedRoute>
                <ContractPage />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } />
            
            {/* Profile routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfileRouter />
              </ProtectedRoute>
            } />
            
            {/* Role-specific routes */}
            <Route path="/find-talent" element={
              <ClientRoute>
                <FindTalentPage />
              </ClientRoute>
            } />
            <Route path="/find-projects" element={
              <FreelancerRoute>
                <JobsPage />
              </FreelancerRoute>
            } />
            
            {/* Fallback route */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

function ProfileRouter() {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  const userType = user.user_metadata?.user_type || user.user_type;
  
  if (userType === 'freelancer') {
    return <FreelancerProfilePage />;
  } else if (userType === 'client') {
    return <ClientProfilePage />;
  } else {
    return <Navigate to="/dashboard" replace />;
  }
}

export default App;
