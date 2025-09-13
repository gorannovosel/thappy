import { useAuth as useAuthContext } from '../context/AuthContext';

// Re-export the auth context hook for cleaner imports
export const useAuth = useAuthContext;

// Additional custom hooks for specific auth needs
export const useUser = () => {
  const { user } = useAuthContext();
  return user;
};

export const useIsAuthenticated = () => {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated;
};

export const useUserRole = () => {
  const { user } = useAuthContext();
  return user?.role;
};

export const useIsClient = () => {
  const { user } = useAuthContext();
  return user?.role === 'client';
};

export const useIsTherapist = () => {
  const { user } = useAuthContext();
  return user?.role === 'therapist';
};
