import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../../../shared/types';
import authService, { AuthStrategyOptions } from '../services/auth.service';
import authStorage from '../utils/authStorage';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, options?: AuthStrategyOptions) => Promise<User>;
  register: (data: any, options?: AuthStrategyOptions) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authStorage.getUser());
  const [token, setToken] = useState<string | null>(() => authStorage.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    const currentToken = authStorage.getToken();
    if (!currentToken || authStorage.isTokenExpired(currentToken)) {
      logout();
      return null;
    }

    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (err) {
      console.warn('[AuthContext] Failed to validate session token:', err);
      logout();
      return null;
    }
  }, [logout]);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = authStorage.getToken();
      if (savedToken) {
        if (authStorage.isTokenExpired(savedToken)) {
          logout();
        } else {
          await refreshUser();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [refreshUser, logout]);

  const login = async (
    email: string,
    password?: string,
    options?: AuthStrategyOptions
  ): Promise<User> => {
    const authRes = await authService.login({ email, password }, options);
    setToken(authRes.token);
    setUser(authRes.user);
    return authRes.user;
  };

  const register = async (
    data: any,
    options?: AuthStrategyOptions
  ): Promise<User> => {
    const authRes = await authService.register(data, options);
    setToken(authRes.token);
    setUser(authRes.user);
    return authRes.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
