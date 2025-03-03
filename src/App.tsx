
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import LandingPage from '@/pages/LandingPage';
import SignInPage from '@/pages/SignInPage';
import SignUpPage from '@/pages/SignUpPage';
import DashboardPage from '@/pages/DashboardPage';
import OnboardingPage from '@/pages/OnboardingPage';
import NotFound from '@/pages/NotFound';
import PostJobPage from '@/pages/PostJobPage';
import JobDetailPage from '@/pages/JobDetailPage';
import JobsPage from '@/pages/JobsPage';
import ApplicationsPage from '@/pages/ApplicationsPage';
import ContractPage from '@/pages/ContractPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import VerificationSentPage from '@/pages/VerificationSentPage';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import './App.css';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verification-sent" element={<VerificationSentPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/post-job" element={<PostJobPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:jobId" element={<JobDetailPage />} />
            <Route path="/jobs/:jobId/applications" element={<ApplicationsPage />} />
            <Route path="/contracts/:contractId" element={<ContractPage />} />
          </Route>
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}
