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
      setDashboardData(data);
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