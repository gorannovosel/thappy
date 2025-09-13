import { LOCAL_STORAGE_KEYS } from './constants';
import type { User } from '../types/api';

export const TokenManager = {
  getToken(): string | null {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
  },

  setToken(token: string): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
  },

  removeToken(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
  },

  isValidToken(token: string): boolean {
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  },

  getTokenExpiry(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch {
      return null;
    }
  },
};

export const UserManager = {
  getUser(): User | null {
    const userStr = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  setUser(user: User): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
  },

  removeUser(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
  },

  updateUser(updates: Partial<User>): User | null {
    const currentUser = this.getUser();
    if (!currentUser) return null;

    const updatedUser = { ...currentUser, ...updates };
    this.setUser(updatedUser);
    return updatedUser;
  },
};

export const AuthUtils = {
  clearAuthData(): void {
    TokenManager.removeToken();
    UserManager.removeUser();
  },

  isAuthenticated(): boolean {
    const token = TokenManager.getToken();
    const user = UserManager.getUser();

    return !!(token && user && TokenManager.isValidToken(token));
  },

  hasRole(requiredRole: string): boolean {
    const user = UserManager.getUser();
    return user?.role === requiredRole;
  },

  setupTokenExpiryCheck(onExpiry: () => void): () => void {
    const token = TokenManager.getToken();
    if (!token) return () => {};

    const expiry = TokenManager.getTokenExpiry(token);
    if (!expiry) return () => {};

    const timeUntilExpiry = expiry - Date.now();

    // Set timer to trigger 1 minute before expiry
    const warningTime = Math.max(timeUntilExpiry - 60000, 1000);

    const timeoutId = setTimeout(() => {
      onExpiry();
    }, warningTime);

    return () => clearTimeout(timeoutId);
  },
};
