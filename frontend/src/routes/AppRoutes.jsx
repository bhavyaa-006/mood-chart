import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';

// Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import OnboardingPage from '../pages/OnboardingPage';
import DashboardPage from '../pages/DashboardPage';
import MoodsPage from '../pages/MoodsPage';
import JournalPage from '../pages/JournalPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import ActivitiesPage from '../pages/ActivitiesPage';
import AchievementsPage from '../pages/AchievementsPage';
import InsightsPage from '../pages/InsightsPage';
import SettingsPage from '../pages/SettingsPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Onboarding Wizard (Protected, does not require onboarding complete) */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute requireOnboarded={false}>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      {/* Protected App Layout & Authenticated Pages */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/moods" element={<MoodsPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
