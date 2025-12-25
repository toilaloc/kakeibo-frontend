import { useState, useCallback } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/categories';

export const useCategories = (token) => {
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    per_page: 6
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async (page = 1, perPage = 6) => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getCategories(token, page, perPage);
      setCategories(data.categories);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const addCategory = useCallback(async (categoryData) => {
    try {
      setError(null);
      await createCategory(token, categoryData);
      await fetchCategories(pagination.current_page); // Refresh current page
    } catch (err) {
      setError(err.message);
      throw err; // Re-throw for component handling
    }
  }, [token, fetchCategories, pagination.current_page]);

  const editCategory = useCallback(async (id, categoryData) => {
    try {
      setError(null);
      await updateCategory(token, id, categoryData);
      await fetchCategories(pagination.current_page); // Refresh current page
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [token, fetchCategories, pagination.current_page]);

  const removeCategory = useCallback(async (id) => {
    try {
      setError(null);
      await deleteCategory(token, id);
      // After deletion, check if we need to go to previous page
      const newTotalCount = pagination.total_count - 1;
      const newTotalPages = Math.ceil(newTotalCount / pagination.per_page);
      const currentPage = pagination.current_page > newTotalPages ? newTotalPages : pagination.current_page;
      await fetchCategories(currentPage || 1); // Refresh current page or go to last page
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [token, fetchCategories, pagination]);

  return {
    categories,
    pagination,
    loading,
    error,
    fetchCategories,
    addCategory,
    editCategory,
    removeCategory,
    clearError: () => setError(null),
  };
};