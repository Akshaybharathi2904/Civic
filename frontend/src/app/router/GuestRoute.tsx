import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../modules/auth/context/AuthContext';
import { Spinner } from '../../shared/components/ui/Spinner';
import { ROUTES } from './routes.manifest';

export interface GuestRouteProps {
  children: React.ReactNode;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-12 text-center text-cyan-400 font-mono text-xs">
        <Spinner size="lg" label="Checking active session..." />
      </div>
    );
  }

  if (isAuthenticated && user) {
    const targetDashboard =
      user.role === 'citizen' ? ROUTES.CITIZEN_DASHBOARD : ROUTES.OFFICIAL_DASHBOARD;
    return <Navigate to={targetDashboard} replace />;
  }

  return <>{children}</>;
};

export default GuestRoute;
