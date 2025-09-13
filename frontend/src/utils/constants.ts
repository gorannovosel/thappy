export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  // Health
  HEALTH: '/health',

  // Authentication
  REGISTER: '/api/register',
  REGISTER_WITH_ROLE: '/api/register-with-role',
  LOGIN: '/api/login',
  PROFILE: '/api/profile',
  UPDATE_PROFILE: '/api/profile/update',

  // Client profile endpoints
  CLIENT_PROFILE: '/api/client/profile',
  CLIENT_PROFILE_GET: '/api/client/profile/get',
  CLIENT_PERSONAL_INFO: '/api/client/profile/personal-info',
  CLIENT_CONTACT_INFO: '/api/client/profile/contact-info',
  CLIENT_DATE_OF_BIRTH: '/api/client/profile/date-of-birth',
  CLIENT_DELETE: '/api/client/profile/delete',

  // Therapist profile endpoints
  THERAPIST_PROFILE: '/api/therapist/profile',
  THERAPIST_PROFILE_GET: '/api/therapist/profile/get',
  THERAPIST_PERSONAL_INFO: '/api/therapist/profile/personal-info',
  THERAPIST_CONTACT_INFO: '/api/therapist/profile/contact-info',
  THERAPIST_BIO: '/api/therapist/profile/bio',
  THERAPIST_LICENSE: '/api/therapist/profile/license',
  THERAPIST_SPECIALIZATIONS: '/api/therapist/profile/specializations',
  THERAPIST_ADD_SPECIALIZATION: '/api/therapist/profile/specialization/add',
  THERAPIST_REMOVE_SPECIALIZATION: '/api/therapist/profile/specialization/remove',
  THERAPIST_ACCEPTING_CLIENTS: '/api/therapist/profile/accepting-clients',
  THERAPIST_DELETE: '/api/therapist/profile/delete',

  // Public endpoints
  THERAPISTS_ACCEPTING: '/api/therapists/accepting',
} as const;

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'thappy_token',
  USER: 'thappy_user',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',

  // Client routes
  CLIENT_DASHBOARD: '/client/dashboard',
  CLIENT_PROFILE: '/client/profile',
  CLIENT_PROFILE_EDIT: '/client/profile/edit',

  // Therapist routes
  THERAPIST_DASHBOARD: '/therapist/dashboard',
  THERAPIST_PROFILE: '/therapist/profile',
  THERAPIST_PROFILE_EDIT: '/therapist/profile/edit',

  // Public routes
  THERAPISTS: '/therapists',
  THERAPIST_DETAIL: '/therapist/:id',
} as const;