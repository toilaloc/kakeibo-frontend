import { API_BASE_URL, getAuthHeaders } from '../utils/constants';
import { handleHttpError } from '../utils/httpErrors';

export const diaryService = {
  // Get all diaries
  async getDiaries(token) {
    const response = await fetch(`${API_BASE_URL}/api/v1/diaries`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    await handleHttpError(response);
    const data = await response.json();

    // Handle different API response formats
    if (Array.isArray(data)) {
      return data;
    } else if (data.diaries && Array.isArray(data.diaries)) {
      return data.diaries;
    } else if (data.data && Array.isArray(data.data)) {
      return data.data;
    } else {
      // If it's not an array, return empty array to prevent React errors
      console.warn('Unexpected API response format for diaries:', data);
      return [];
    }
  },

  // Create a new diary entry
  async createDiary(token, diaryData) {
    const response = await fetch(`${API_BASE_URL}/api/v1/diaries`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ diary: diaryData }),
    });

    await handleHttpError(response);
    const data = await response.json();

    // Handle different response formats
    return data.diary || data.data || data;
  },

  // Update a diary entry
  async updateDiary(token, id, diaryData) {
    const response = await fetch(`${API_BASE_URL}/api/v1/diaries/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ diary: diaryData }),
    });

    await handleHttpError(response);
    const data = await response.json();

    // Handle different response formats
    return data.diary || data.data || data;
  },

  // Delete a diary entry
  async deleteDiary(token, id) {
    const response = await fetch(`${API_BASE_URL}/api/v1/diaries/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });

    await handleHttpError(response);
    return response.ok;
  },
};