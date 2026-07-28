import { STORAGE_KEYS } from '../../../app/config/constants';
import { User } from '../../../shared/types';

/**
 * Authentication Storage Manager
 * Encapsulates secure storage of JWT tokens and cached user sessions.
 */
export const authStorage = {
  getToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch {
      return null;
    }
  },

  setToken(token: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (err) {
      console.warn('[authStorage] Failed to store token:', err);
    }
  },

  removeToken(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (err) {
      console.warn('[authStorage] Failed to remove token:', err);
    }
  },

  getUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setUser(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (err) {
      console.warn('[authStorage] Failed to store user data:', err);
    }
  },

  removeUser(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (err) {
      console.warn('[authStorage] Failed to remove user data:', err);
    }
  },

  clearSession(): void {
    this.removeToken();
    this.removeUser();
  },

  isTokenExpired(token?: string | null): boolean {
    if (!token) return true;
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return true;
      const decodedJson = atob(payloadBase64);
      const decoded = JSON.parse(decodedJson);
      if (!decoded.exp) return false;
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return false;
    }
  },
};

export default authStorage;
