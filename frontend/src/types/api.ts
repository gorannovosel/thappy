// Base API response types
export interface ApiResponse {
  message: string;
  error?: string;
}

export interface AuthResponse extends ApiResponse {
  token: string;
  user: User;
}

export interface UserResponse extends ApiResponse {
  user: User;
}

export interface ClientProfileResponse extends ApiResponse {
  profile: ClientProfile;
}

export interface TherapistProfileResponse extends ApiResponse {
  profile: TherapistProfile;
}

export interface TherapistsResponse extends ApiResponse {
  therapists: TherapistProfile[];
}

export interface TherapyResponse {
  id: string;
  title: string;
  short_description: string;
  icon: string;
  detailed_info: string;
  when_needed: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// User types
export type UserRole = 'client' | 'therapist';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Profile types
export interface ClientProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  emergency_contact: string;
  date_of_birth: string | null;
  therapist_id: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface TherapistProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  license_number: string;
  phone: string;
  bio: string;
  specializations: string[];
  accepting_clients: boolean;
  created_at: string;
  updated_at: string;
}

// Request types
export interface RegisterRequest {
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  email?: string;
}

export interface CreateClientProfileRequest {
  first_name: string;
  last_name: string;
  phone: string;
  emergency_contact: string;
}

export interface UpdateClientPersonalInfoRequest {
  first_name?: string;
  last_name?: string;
}

export interface UpdateClientContactInfoRequest {
  phone?: string;
  emergency_contact?: string;
}

export interface UpdateClientDateOfBirthRequest {
  date_of_birth: string;
}

export interface CreateTherapistProfileRequest {
  first_name: string;
  last_name: string;
  license_number: string;
  phone: string;
  bio: string;
}

export interface UpdateTherapistPersonalInfoRequest {
  first_name?: string;
  last_name?: string;
}

export interface UpdateTherapistContactInfoRequest {
  phone?: string;
}

export interface UpdateTherapistBioRequest {
  bio: string;
}

export interface UpdateTherapistLicenseRequest {
  license_number: string;
}

export interface UpdateTherapistSpecializationsRequest {
  specializations: string[];
}

export interface AddSpecializationRequest {
  specialization: string;
}

export interface RemoveSpecializationRequest {
  specialization: string;
}

export interface UpdateAcceptingClientsRequest {
  accepting_clients: boolean;
}

// Health check response
export interface HealthResponse {
  status: string;
  service: string;
}
