import { TherapyResponse } from '../types/api';
import { API_BASE_URL, buildApiUrl } from '../utils/constants';

export interface TherapiesResponse {
  therapies: TherapyResponse[];
}

export interface TherapyDetailResponse {
  therapy: TherapyResponse;
}

export const therapyApi = {
  async getTherapies(activeOnly = true): Promise<TherapiesResponse> {
    const params = new URLSearchParams();
    if (activeOnly) {
      params.set('active', 'true');
    }

    const url = buildApiUrl('/api/therapies', params);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch therapies' }));
      throw new Error(error.message || 'Failed to fetch therapies');
    }

    return response.json();
  },

  async getTherapy(id: string): Promise<TherapyDetailResponse> {
    const url = buildApiUrl(`/api/therapies/${id}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch therapy' }));
      throw new Error(error.message || 'Failed to fetch therapy');
    }

    return response.json();
  },
};
