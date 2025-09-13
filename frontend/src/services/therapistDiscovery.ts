import { TherapistsResponse } from '../types/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

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
};
