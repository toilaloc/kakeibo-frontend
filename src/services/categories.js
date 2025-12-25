import { API_BASE_URL, getAuthHeaders } from '../utils/constants';
import { handleHttpError } from '../utils/httpErrors';

export const getCategories = async (token, page = 1, perPage = 10) => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString()
  });

  const response = await fetch(`${API_BASE_URL}/api/v1/categories?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  await handleHttpError(response);

  const data = await response.json();
  if (data.error === 'Unauthorized') {
    throw new Error('Unauthorized');
  }

  // Return both categories and pagination info
  return {
    categories: Array.isArray(data.categories) ? data.categories : [],
    pagination: data.pagination || {
      current_page: 1,
      total_pages: 1,
      total_count: 0,
      per_page: perPage
    }
  };
};

export const createCategory = async (token, categoryData) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/categories`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      category: { 
        name: categoryData.name, 
        category_type: categoryData.type, 
        icon: null 
      } 
    }),
  });

  await handleHttpError(response);

  const data = await response.json();
  if (data.error === 'Unauthorized') {
    throw new Error('Unauthorized');
  }
  return data;
};

export const updateCategory = async (token, id, categoryData) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/categories/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      category: { 
        name: categoryData.name, 
        category_type: categoryData.type, 
        icon: null 
      } 
    }),
  });

  await handleHttpError(response);

  const data = await response.json();
  if (data.error === 'Unauthorized') {
    throw new Error('Unauthorized');
  }
  return data;
};

export const deleteCategory = async (token, id) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });

  await handleHttpError(response);

  const data = await response.json();
  if (data.error === 'Unauthorized') {
    throw new Error('Unauthorized');
  }
  return data;
};