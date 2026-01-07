import { useState, useCallback } from 'react';
import { getKakeiboDashboard } from '../services/dashboard';

export const useDashboard = (token) => {
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async (dashboardType = 'all', analysisType = '1_month', startDate = null, endDate = null) => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getKakeiboDashboard(token, dashboardType, analysisType, startDate, endDate);
      
      // If data is an array of transactions, normalize category_type
      let normalizedData = data;
      if (Array.isArray(data) && data.length > 0 && data[0].transaction_date) {
        normalizedData = data.map(transaction => ({
          ...transaction,
          category_type: transaction.category ? transaction.category.category_type : transaction.category_type
        }));
      }
      
      setDashboardData(normalizedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    dashboardData,
    loading,
    error,
    fetchDashboard
  };
};