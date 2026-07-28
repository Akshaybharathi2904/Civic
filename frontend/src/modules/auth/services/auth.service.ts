import api from '../../../shared/api/apiClient';
import { User } from '../../../shared/types';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth.types';
import authStorage from '../utils/authStorage';

export interface AuthStrategyOptions {
  strategy?: 'citizen' | 'official' | 'sso';
}

const buildUserObject = (data: any, fallbackEmail: string): User => {
  const cleanId = data.id || data._id || `user_${Date.now()}`;
  const userIdTag = data.userId || `USR-${cleanId.substring(cleanId.length - 6).toUpperCase()}`;

  return {
    _id: cleanId,
    id: cleanId,
    userId: userIdTag,
    name: data.name || fallbackEmail.split('@')[0],
    email: data.email || fallbackEmail,
    role: data.role || (fallbackEmail.includes('officer') ? 'officer' : 'citizen'),
    phone: data.phone || '+91-9988771001',
    address: data.address || data.ward || 'Ward 72 - RS Puram, Coimbatore',
    profilePicture: data.profilePicture || data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    avatar: data.avatar || data.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    joinedAt: data.joinedAt || data.createdAt || new Date(Date.now() - 60 * 86400000).toISOString(),
    createdAt: data.createdAt || data.joinedAt || new Date().toISOString(),
    reputationPoints: data.reputationPoints ?? 280,
    badge: data.badge || 'Civic Guardian',
    isAnonymousAllowed: data.isAnonymousAllowed ?? true,
    department: data.department,
    ward: data.ward || 'Ward 72 - RS Puram',
    city: data.city || 'Coimbatore',
    reportedIssues: data.reportedIssues || [],
    supportedIssues: data.supportedIssues || [],
    activityHistory: data.activityHistory || [],
  };
};

export const authService = {
  async login(credentials: LoginCredentials, options?: AuthStrategyOptions): Promise<AuthResponse> {
    const payload = {
      ...credentials,
      strategy: options?.strategy || 'citizen',
    };

    const res = await api.post<any>('/auth/login', payload);
    const data = res.data || res;
    const token = data.token;
    const userData = buildUserObject(data, credentials.email);

    if (token) {
      authStorage.setToken(token);
      authStorage.setUser(userData);
    }

    return { token, user: userData };
  },

  async register(credentials: RegisterCredentials, options?: AuthStrategyOptions): Promise<AuthResponse> {
    const payload = {
      ...credentials,
      strategy: options?.strategy || 'citizen',
    };

    const res = await api.post<any>('/auth/signup', payload);
    const data = res.data || res;
    const token = data.token;
    const userData = buildUserObject(data, credentials.email);

    if (token) {
      authStorage.setToken(token);
      authStorage.setUser(userData);
    }

    return { token, user: userData };
  },

  async getCurrentUser(): Promise<User> {
    const res = await api.get<any>('/auth/me');
    const data = res.data || res;
    const userData = buildUserObject(data, data.email || 'citizen@civicswarm.gov.in');

    authStorage.setUser(userData);
    return userData;
  },

  async logout(): Promise<void> {
    authStorage.clearSession();
  },
};

export default authService;
