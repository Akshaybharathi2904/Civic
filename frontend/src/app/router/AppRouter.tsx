import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ROUTES } from './routes.manifest';
import { GuardedRoute } from './GuardedRoute';
import { GuestRoute } from './GuestRoute';
import { MainLayout } from '../../shared/components/layout/MainLayout';
import { Spinner } from '../../shared/components/ui/Spinner';
import { ErrorBoundary } from '../../shared/components/feedback/ErrorBoundary';

// Lazy Loaded Page Components
const Home = lazy(() => import('../../pages/Home').then((m) => ({ default: m.Home })));
const LoginPage = lazy(() => import('../../modules/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../../modules/auth/pages/RegisterPage'));
const CitizenDashboardPage = lazy(() => import('../../modules/issues/pages/CitizenDashboardPage'));
const SubmitIssuePage = lazy(() => import('../../modules/issues/pages/SubmitIssuePage'));
const IssueDetailPage = lazy(() => import('../../modules/issues/pages/IssueDetailPage'));
const AIProcessingPage = lazy(() => import('../../modules/issues/pages/AIProcessingPage'));
const OfficialDashboardPage = lazy(() => import('../../modules/analytics/pages/OfficialDashboardPage'));
const AnalyticsPage = lazy(() => import('../../modules/analytics/pages/AnalyticsPage'));
const LiveMapPage = lazy(() => import('../../modules/maps/pages/LiveMapPage'));
const ProfilePage = lazy(() => import('../../modules/profile/pages/ProfilePage'));
const UsersPage = lazy(() => import('../../modules/users/pages/UsersPage'));
const NotFoundPage = lazy(() => import('../../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center p-12">
    <Spinner size="lg" label="Loading page resource..." />
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <Router>
      <MainLayout>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public & Guest Routes */}
              <Route path={ROUTES.HOME} element={<Home />} />
              <Route
                path={ROUTES.LOGIN}
                element={
                  <GuestRoute>
                    <LoginPage />
                  </GuestRoute>
                }
              />
              <Route
                path={ROUTES.REGISTER}
                element={
                  <GuestRoute>
                    <RegisterPage />
                  </GuestRoute>
                }
              />
              <Route path={ROUTES.LIVE_MAP} element={<LiveMapPage />} />

              {/* Protected Citizen Routes */}
              <Route
                path={ROUTES.CITIZEN_DASHBOARD}
                element={
                  <GuardedRoute allowedRoles={['citizen', 'admin']}>
                    <CitizenDashboardPage />
                  </GuardedRoute>
                }
              />
              <Route
                path={ROUTES.SUBMIT_ISSUE}
                element={
                  <GuardedRoute allowedRoles={['citizen', 'admin']}>
                    <SubmitIssuePage />
                  </GuardedRoute>
                }
              />
              <Route
                path={ROUTES.AI_PROCESSING}
                element={
                  <GuardedRoute>
                    <AIProcessingPage />
                  </GuardedRoute>
                }
              />
              <Route
                path={ROUTES.ISSUE_DETAIL}
                element={
                  <GuardedRoute>
                    <IssueDetailPage />
                  </GuardedRoute>
                }
              />

              {/* Protected Official Routes */}
              <Route
                path={ROUTES.OFFICIAL_DASHBOARD}
                element={
                  <GuardedRoute allowedRoles={['officer', 'department_head', 'admin']}>
                    <OfficialDashboardPage />
                  </GuardedRoute>
                }
              />
              <Route
                path={ROUTES.ANALYTICS}
                element={
                  <GuardedRoute allowedRoles={['officer', 'department_head', 'admin']}>
                    <AnalyticsPage />
                  </GuardedRoute>
                }
              />
              <Route
                path={ROUTES.USERS}
                element={
                  <GuardedRoute allowedRoles={['admin', 'department_head']}>
                    <UsersPage />
                  </GuardedRoute>
                }
              />

              {/* Protected Common Routes */}
              <Route
                path={ROUTES.PROFILE}
                element={
                  <GuardedRoute>
                    <ProfilePage />
                  </GuardedRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </MainLayout>
    </Router>
  );
};

export default AppRouter;
