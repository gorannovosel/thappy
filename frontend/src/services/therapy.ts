import { TherapyResponse } from '../types/api';
import { API_BASE_URL } from '../utils/constants';

export interface TherapiesResponse {
  therapies: TherapyResponse[];
}

export interface TherapyDetailResponse {
  therapy: TherapyResponse;
}

export const therapyApi = {
  async getTherapies(activeOnly = true): Promise<TherapiesResponse> {
    const url = new URL(`${API_BASE_URL}/api/therapies`);
    if (activeOnly) {
      url.searchParams.set('active', 'true');
    }

    const response = await fetch(url.toString(), {
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
    const response = await fetch(`${API_BASE_URL}/api/therapies/${id}`, {
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
