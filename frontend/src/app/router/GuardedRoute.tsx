import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../modules/auth/context/AuthContext';
import { Spinner } from '../../shared/components/ui/Spinner';
import { UserRole } from '../../shared/types';
import { ROUTES } from './routes.manifest';

export interface GuardedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const GuardedRoute: React.FC<GuardedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-12 text-center text-cyan-400 font-mono text-xs">
        <Spinner size="lg" label="Authenticating session token..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
};

export default GuardedRoute;
