import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './shared/theme/ThemeContext';
import { AuthProvider, useAuth } from './modules/auth/context/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ToastProvider } from './shared/components/ui/Toast';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { SubmitComplaint } from './pages/SubmitComplaint';
import { AIProcessingPage } from './pages/AIProcessingPage';
import { ComplaintDetail } from './pages/ComplaintDetail';
import { OfficialDashboard } from './pages/OfficialDashboard';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LiveMapPage } from './pages/LiveMapPage';
import { ProfilePage } from './modules/profile/pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-12 text-center text-cyan-400 font-mono text-xs">
        Authenticating session token...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <SocketProvider>
              <Router>
                <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
                  <Navbar />

                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      {/* Citizen Routes */}
                      <Route
                        path="/citizen-dashboard"
                        element={
                          <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                            <CitizenDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/submit-complaint"
                        element={
                          <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                            <SubmitComplaint />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/ai-processing/:id"
                        element={
                          <ProtectedRoute>
                            <AIProcessingPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Shared Complaint Detail */}
                      <Route
                        path="/complaints/:id"
                        element={
                          <ProtectedRoute>
                            <ComplaintDetail />
                          </ProtectedRoute>
                        }
                      />

                      {/* User Profile */}
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <ProfilePage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Official Command Center & Analytics */}
                      <Route
                        path="/official-dashboard"
                        element={
                          <ProtectedRoute allowedRoles={['officer', 'department_head', 'admin']}>
                            <OfficialDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/analytics"
                        element={
                          <ProtectedRoute allowedRoles={['officer', 'department_head', 'admin']}>
                            <AnalyticsPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Public Live GIS Heatmap */}
                      <Route path="/live-map" element={<LiveMapPage />} />

                      {/* 404 Fallback */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </main>

                  <Footer />
                </div>
              </Router>
            </SocketProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
