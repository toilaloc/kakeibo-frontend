import { API_BASE_URL, getAuthHeaders } from '../utils/constants';
import { handleHttpError } from '../utils/httpErrors';

export const getKakeiboDashboard = async (token, dashboardType = 'all', analysisType = '1_month', startDate = null, endDate = null) => {
  const params = new URLSearchParams({
    dashboard_type: dashboardType,
    analysis_type: analysisType
  });

  // Only add dates for custom analysis type
  if (analysisType === 'custom' && startDate && endDate) {
    params.append('start_date', startDate);
    params.append('end_date', endDate);
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/kakeibo_dashboard?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  await handleHttpError(response);

  const data = await response.json();
  console.log('Dashboard API raw response:', data);
  console.log('Dashboard result:', data.kakeibo_dashboard?.dashboard_result);
  if (data.error === 'Unauthorized') {
    throw new Error('Unauthorized');
  }

  const result = data.kakeibo_dashboard?.dashboard_result;
  console.log('Final dashboard result:', result);

  // If result is already an object with monthly, income_categories, expense_categories properties
  if (result && typeof result === 'object' && !Array.isArray(result) && (result.monthly || result.income_categories || result.expense_categories)) {
    console.log('API returned structured object, returning as-is');
    return result;
  }

  // If result is an object with monthly, income_categories, expense_categories properties
  if (result && typeof result === 'object' && !Array.isArray(result)) {
    console.log('API returned object structure, converting to expected format');
    const processedResult = [];

    // Add monthly data if it exists
    if (result.monthly && Array.isArray(result.monthly)) {
      processedResult.push(...result.monthly);
    }

    // Add category data as separate objects if they exist
    if (result.income_categories || result.expense_categories) {
      processedResult.push({
        income_categories: result.income_categories || [],
        expense_categories: result.expense_categories || []
      });
    }

    console.log('Processed result:', processedResult);
    return processedResult;
  }

  // Return as array (original behavior)
  return result || [];
};