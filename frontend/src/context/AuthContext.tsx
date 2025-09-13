import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { apiClient, ApiError } from '../utils/api';
import { TokenManager, UserManager, AuthUtils } from '../utils/auth';
import type { User, LoginRequest, RegisterRequest } from '../types/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean };

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (user: User) => void;
  checkAuthStatus: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback(async (data: LoginRequest) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await apiClient.login(data);

      // Store token and user in localStorage
      TokenManager.setToken(response.token);
      UserManager.setUser(response.user);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
        },
      });

      // Set up token expiry check
      AuthUtils.setupTokenExpiryCheck(() => {
        AuthUtils.clearAuthData();
        dispatch({ type: 'LOGOUT' });
      });

    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await apiClient.register(data);

      // Store token and user in localStorage
      TokenManager.setToken(response.token);
      UserManager.setUser(response.user);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
        },
      });

      // Set up token expiry check
      AuthUtils.setupTokenExpiryCheck(() => {
        AuthUtils.clearAuthData();
        dispatch({ type: 'LOGOUT' });
      });

    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    AuthUtils.clearAuthData();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const updateUser = useCallback((user: User) => {
    UserManager.setUser(user);
    dispatch({ type: 'UPDATE_USER', payload: user });
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      if (!AuthUtils.isAuthenticated()) {
        dispatch({ type: 'LOGOUT' });
        return;
      }

      // Verify token is still valid with the server
      const response = await apiClient.getProfile();
      const token = TokenManager.getToken()!;

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          token,
        },
      });

      // Set up token expiry check
      AuthUtils.setupTokenExpiryCheck(() => {
        AuthUtils.clearAuthData();
        dispatch({ type: 'LOGOUT' });
      });

    } catch (error) {
      // Token is invalid or expired
      AuthUtils.clearAuthData();
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // Check auth status on app load
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Set up periodic token validation
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const interval = setInterval(() => {
      if (!AuthUtils.isAuthenticated()) {
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [state.isAuthenticated, logout]);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    updateUser,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};