import { API_BASE_URL, LOCAL_STORAGE_KEYS } from './constants';
import type {
  ApiResponse,
  AuthResponse,
  UserResponse,
  ClientProfileResponse,
  TherapistProfileResponse,
  TherapistsResponse,
  HealthResponse,
  RegisterRequest,
  LoginRequest,
  UpdateProfileRequest,
  CreateClientProfileRequest,
  UpdateClientPersonalInfoRequest,
  UpdateClientContactInfoRequest,
  UpdateClientDateOfBirthRequest,
  CreateTherapistProfileRequest,
  UpdateTherapistPersonalInfoRequest,
  UpdateTherapistContactInfoRequest,
  UpdateTherapistBioRequest,
  UpdateTherapistLicenseRequest,
  UpdateTherapistSpecializationsRequest,
  AddSpecializationRequest,
  RemoveSpecializationRequest,
  UpdateAcceptingClientsRequest,
} from '../types/api';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Network error');
    }
  }

  // Health check
  async health(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  // Authentication endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const endpoint = data.role ? '/api/register-with-role' : '/api/register';
    return this.request<AuthResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<UserResponse> {
    return this.request<UserResponse>('/api/profile');
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UserResponse> {
    return this.request<UserResponse>('/api/profile/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Client profile endpoints
  async createClientProfile(
    data: CreateClientProfileRequest
  ): Promise<ClientProfileResponse> {
    return this.request<ClientProfileResponse>('/api/client/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getClientProfile(): Promise<ClientProfileResponse> {
    return this.request<ClientProfileResponse>('/api/client/profile/get');
  }

  async updateClientPersonalInfo(
    data: UpdateClientPersonalInfoRequest
  ): Promise<ClientProfileResponse> {
    return this.request<ClientProfileResponse>(
      '/api/client/profile/personal-info',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  async updateClientContactInfo(
    data: UpdateClientContactInfoRequest
  ): Promise<ClientProfileResponse> {
    return this.request<ClientProfileResponse>(
      '/api/client/profile/contact-info',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  async updateClientDateOfBirth(
    data: UpdateClientDateOfBirthRequest
  ): Promise<ClientProfileResponse> {
    return this.request<ClientProfileResponse>(
      '/api/client/profile/date-of-birth',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  async deleteClientProfile(): Promise<ApiResponse> {
    return this.request<ApiResponse>('/api/client/profile/delete', {
      method: 'DELETE',
    });
  }

  // Therapist profile endpoints
  async createTherapistProfile(
    data: CreateTherapistProfileRequest
  ): Promise<TherapistProfileResponse> {
    return this.request<TherapistProfileResponse>('/api/therapist/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTherapistProfile(): Promise<TherapistProfileResponse> {
    return this.request<TherapistProfileResponse>('/api/therapist/profile/get');
  }

  async updateTherapistPersonalInfo(
    data: UpdateTherapistPersonalInfoRequest
  ): Promise<TherapistProfileResponse> {
    return this.request<TherapistProfileResponse>(
      '/api/therapist/profile/personal-info',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  async updateTherapistContactInfo(
    data: UpdateTherapistContactInfoRequest
  ): Promise<TherapistProfileResponse> {
    return this.request<TherapistProfileResponse>(
      '/api/therapist/profile/contact-info',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  async updateTherapistBio(
    data: UpdateTherapistBioRequest
  ): Promise<TherapistProfileResponse> {
    return this.request<TherapistProfileResponse>(
      '/api/therapist/profile/bio',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  async updateTherapistLicense(
    data: UpdateTherapistLicenseRequest
  ): Promise<TherapistProfileResponse> {
    return this.request<TherapistProfileResponse>(
      '/api/therapist/profile/license',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  async updateTherapistSpecializations(
    data: UpdateTherapistSpecializationsRequest
  ): Promise<TherapistProfileResponse> {
    return this.request<TherapistProfileResponse>(
      '/api/therapist/profile/specializations',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  async addTherapistSpecialization(
    data: AddSpecializationRequest
  ): Promise<TherapistProfileResponse> {
    return this.request<TherapistProfileResponse>(
      '/api/therapist/profile/specialization/add',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async removeTherapistSpecialization(
    data: RemoveSpecializationRequest
  ): Promise<TherapistProfileResponse> {
    return this.request<TherapistProfileResponse>(
      '/api/therapist/profile/specialization/remove',
      {
        method: 'DELETE',
        body: JSON.stringify(data),
      }
    );
  }

  async updateTherapistAcceptingClients(
    data: UpdateAcceptingClientsRequest
  ): Promise<TherapistProfileResponse> {
    return this.request<TherapistProfileResponse>(
      '/api/therapist/profile/accepting-clients',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  async deleteTherapistProfile(): Promise<ApiResponse> {
    return this.request<ApiResponse>('/api/therapist/profile/delete', {
      method: 'DELETE',
    });
  }

  // Public endpoints
  async getAcceptingTherapists(): Promise<TherapistsResponse> {
    return this.request<TherapistsResponse>('/api/therapists/accepting');
  }
}

export const apiClient = new ApiClient();
export { ApiError };
