// Development testing utilities
// These helpers are only for development/testing purposes

export const TestUsers = {
  CLIENT: {
    email: 'client@test.com',
    password: 'TestPass123!',
    role: 'client' as const,
  },
  THERAPIST: {
    email: 'therapist@test.com',
    password: 'TestPass123!',
    role: 'therapist' as const,
  },
  ADMIN: {
    email: 'admin@test.com',
    password: 'TestPass123!',
    role: 'therapist' as const,
  },
} as const;

export const TestScenarios = {
  INVALID_EMAIL: {
    email: 'invalid-email',
    password: 'TestPass123!',
    role: 'client' as const,
  },
  WEAK_PASSWORD: {
    email: 'weak@test.com',
    password: '123',
    role: 'client' as const,
  },
  WRONG_PASSWORD: {
    email: 'client@test.com',
    password: 'WrongPassword!',
    role: 'client' as const,
  },
} as const;

export const developmentLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🧪 [TEST]: ${message}`, data || '');
  }
};

export const logAuthState = (state: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔐 Auth State');
    console.log('User:', state.user);
    console.log('Is Authenticated:', state.isAuthenticated);
    console.log('Token exists:', !!state.token);
    console.log('Loading:', state.isLoading);
    if (state.error) console.log('Error:', state.error);
    console.groupEnd();
  }
};

export const testApiEndpoint = async (endpoint: string, options?: RequestInit) => {
  if (process.env.NODE_ENV === 'development') {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    const url = `${baseUrl}${endpoint}`;

    console.log(`🌐 Testing API: ${options?.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      console.log(`✅ Response (${response.status}):`, data);
      return { response, data };
    } catch (error) {
      console.error(`❌ API Error:`, error);
      throw error;
    }
  }
};

// Expose testing utilities globally in development
if (process.env.NODE_ENV === 'development') {
  (window as any).ThappyTest = {
    TestUsers,
    TestScenarios,
    developmentLog,
    logAuthState,
    testApiEndpoint,
  };

  console.log('🧪 Thappy Test Utilities loaded. Access via window.ThappyTest');
}