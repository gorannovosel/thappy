import { TherapistsResponse } from '../types/api';
import { API_BASE_URL } from '../utils/constants';

export interface TherapistSearchParams {
  search?: string;
  specializations?: string[];
  accepting_clients?: boolean;
  limit?: number;
  offset?: number;
}

export const therapistDiscoveryApi = {
  async getAcceptingTherapists(): Promise<TherapistsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/therapists/accepting`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch therapists' }));
      throw new Error(error.message || 'Failed to fetch therapists');
    }

    return response.json();
  },

  async searchTherapists(
    params: TherapistSearchParams = {}
  ): Promise<TherapistsResponse> {
    const searchParams = new URLSearchParams();

    if (params.search) {
      searchParams.append('search', params.search);
    }

    if (params.specializations && params.specializations.length > 0) {
      searchParams.append('specializations', params.specializations.join(','));
    }

    if (params.accepting_clients !== undefined) {
      searchParams.append(
        'accepting_clients',
        params.accepting_clients.toString()
      );
    }

    if (params.limit) {
      searchParams.append('limit', params.limit.toString());
    }

    if (params.offset) {
      searchParams.append('offset', params.offset.toString());
    }

    const url = `${API_BASE_URL}/api/therapists/search${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Failed to search therapists' }));
      throw new Error(error.message || 'Failed to search therapists');
    }

    return response.json();
  },

  async getAllTherapists(): Promise<TherapistsResponse> {
    return this.searchTherapists();
  },

  async getTherapistById(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/therapists/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch therapist details' }));
      throw new Error(error.message || 'Failed to fetch therapist details');
    }

    const data = await response.json();
    return data.profile;
  },

  async getTherapistByLicenseNumber(licenseNumber: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/api/therapists/profile/${licenseNumber}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch therapist details' }));
      throw new Error(error.message || 'Failed to fetch therapist details');
    }

    const data = await response.json();
    return data.profile;
  },
};
