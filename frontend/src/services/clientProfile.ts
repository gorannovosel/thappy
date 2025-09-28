import { ClientProfileResponse } from '../types/api';
import { API_BASE_URL, LOCAL_STORAGE_KEYS } from '../utils/constants';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

interface CreateClientProfileRequest {
  first_name: string;
  last_name: string;
  phone?: string;
  emergency_contact?: string;
}

interface UpdatePersonalInfoRequest {
  first_name: string;
  last_name: string;
}

interface UpdateContactInfoRequest {
  phone?: string;
  emergency_contact?: string;
}

interface SetDateOfBirthRequest {
  date_of_birth?: string;
}

export const clientProfileApi = {
  async createProfile(
    data: CreateClientProfileRequest
  ): Promise<ClientProfileResponse> {
    const response = await fetch(`${API_BASE_URL}/api/client/profile`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Failed to create profile' }));
      throw new Error(error.message || 'Failed to create profile');
    }

    return response.json();
  },

  async getProfile(): Promise<ClientProfileResponse> {
    const response = await fetch(`${API_BASE_URL}/api/client/profile/get`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch profile' }));
      throw new Error(error.message || 'Failed to fetch profile');
    }

    return response.json();
  },

  async updatePersonalInfo(
    data: UpdatePersonalInfoRequest
  ): Promise<ClientProfileResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/client/profile/personal-info`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Failed to update personal info' }));
      throw new Error(error.message || 'Failed to update personal info');
    }

    return response.json();
  },

  async updateContactInfo(
    data: UpdateContactInfoRequest
  ): Promise<ClientProfileResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/client/profile/contact-info`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Failed to update contact info' }));
      throw new Error(error.message || 'Failed to update contact info');
    }

    return response.json();
  },

  async setDateOfBirth(
    data: SetDateOfBirthRequest
  ): Promise<ClientProfileResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/client/profile/date-of-birth`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Failed to set date of birth' }));
      throw new Error(error.message || 'Failed to set date of birth');
    }

    return response.json();
  },

  async deleteProfile(): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/client/profile/delete`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Failed to delete profile' }));
      throw new Error(error.message || 'Failed to delete profile');
    }

    return response.json();
  },
};
