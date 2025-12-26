import { API_BASE_URL, getAuthHeaders } from '../utils/constants';
import { handleHttpError } from '../utils/httpErrors';

export const getTransactions = async (token, userId, page = 1, perPage = 4) => {
  const params = new URLSearchParams({
    user_id: userId.toString(),
    page: page.toString(),
    per_page: perPage.toString()
  });

  const response = await fetch(`${API_BASE_URL}/api/v1/transactions?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  await handleHttpError(response);

  const data = await response.json();
  if (data.error === 'Unauthorized') {
    throw new Error('Unauthorized');
  }

  // Return both transactions and pagination info
  return {
    transactions: Array.isArray(data.transactions) ? data.transactions : [],
    pagination: {
      current_page: data.pagination?.current_page || data.transactions?.current_page || page,
      total_pages: data.pagination?.total_pages || data.transactions?.total_pages || 1,
      total_count: data.pagination?.total_count || data.transactions?.total_count || 0,
      per_page: data.pagination?.per_page || data.transactions?.limit_value || perPage
    },
    totals: {
      total_income: parseFloat(data.pagination?.total_income || data.total_income) || 0,
      total_expense: parseFloat(data.pagination?.total_expense || data.total_expense) || 0
    }
  };
};

export const createTransaction = async (token, userId, transactionData) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/transactions`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transaction: {
        user_id: userId,
        category_id: transactionData.categoryId,
        amount: transactionData.amount,
        transaction_date: transactionData.transactionDate,
        note: transactionData.note
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

export const updateTransaction = async (token, id, userId, transactionData) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/transactions/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transaction: {
        user_id: userId,
        category_id: transactionData.categoryId,
        amount: transactionData.amount,
        transaction_date: transactionData.transactionDate,
        note: transactionData.note
      }
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error('Failed to update transaction');
  }

  const data = await response.json();
  if (data.error === 'Unauthorized') {
    throw new Error('Unauthorized');
  }
  return data;
};

export const deleteTransaction = async (token, id) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/transactions/${id}`, {
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