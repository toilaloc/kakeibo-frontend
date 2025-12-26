import { useState, useCallback } from 'react';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../services/transactions';

export const useTransactions = (token, userId) => {
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({
    total_income: 0,
    total_expense: 0
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    per_page: 4
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async (page = 1, perPage = 4) => {
    if (!token || !userId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getTransactions(token, userId, page, perPage);
      setTransactions(data.transactions);
      setPagination(data.pagination);
      setTotals(data.totals);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  const addTransaction = useCallback(async (transactionData) => {
    try {
      setError(null);
      await createTransaction(token, userId, transactionData);
      await fetchTransactions(pagination.current_page); // Refresh current page
    } catch (err) {
      setError(err.message);
      throw err; // Re-throw for component handling
    }
  }, [token, userId, fetchTransactions]);

  const editTransaction = useCallback(async (id, transactionData) => {
    try {
      setError(null);
      await updateTransaction(token, id, userId, transactionData);
      await fetchTransactions(pagination.current_page); // Refresh current page
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [token, userId, fetchTransactions]);

  const removeTransaction = useCallback(async (id) => {
    try {
      setError(null);
      await deleteTransaction(token, id);
      // After deletion, check if we need to go to previous page
      const newTotalCount = pagination.total_count - 1;
      const newTotalPages = Math.ceil(newTotalCount / pagination.per_page);
      const currentPage = pagination.current_page > newTotalPages ? newTotalPages : pagination.current_page;
      await fetchTransactions(currentPage || 1); // Refresh current page or go to last page
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [token, fetchTransactions, pagination]);

  return {
    transactions,
    totals,
    pagination,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    editTransaction,
    removeTransaction,
    clearError: () => setError(null),
  };
};