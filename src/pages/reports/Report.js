import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboard } from '../../hooks/useDashboard';
import { handleApiError } from '../../utils/errorHandler';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import styles from '../../styles/Report.module.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

function Report() {
  const navigate = useNavigate();
  const { logout, token } = useAuth();
  const { dashboardData, loading, error, fetchDashboard } = useDashboard(token);

  // Filter states
  const [dashboardType, setDashboardType] = useState('all');
  const [analysisType, setAnalysisType] = useState('1_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchDashboard(dashboardType, analysisType, startDate || null, endDate || null);
  }, [fetchDashboard, dashboardType, analysisType, startDate, endDate]);

  useEffect(() => {
    if (error?.status === 401) {
      logout();
    } else {
      handleApiError(error, navigate);
    }
  }, [error, navigate, logout]);

  // Process data for charts
  const chartData = useMemo(() => {
    if (!dashboardData || dashboardData.length === 0) {
      return { monthly: [], incomeCategories: [], expenseCategories: [] };
    }

    // Check if dashboardData is an object with direct properties (not wrapped in array)
    if (typeof dashboardData === 'object' && !Array.isArray(dashboardData)) {
      const monthly = dashboardData.monthly || [];
      const incomeCategories = (dashboardData.income_categories || []).map(cat => ({
        name: cat.name || cat.category_name || 'Unknown',
        value: parseFloat(cat.amount || cat.value || cat.total || 0)
      })).filter(cat => cat.value > 0).sort((a, b) => b.value - a.value);
      const expenseCategories = (dashboardData.expense_categories || []).map(cat => ({
        name: cat.name || cat.category_name || 'Unknown',
        value: parseFloat(cat.amount || cat.value || cat.total || 0)
      })).filter(cat => cat.value > 0).sort((a, b) => b.value - a.value);

      return {
        monthly: Array.isArray(monthly) ? monthly.sort((a, b) => {
          const [aYear, aMonth] = (a.month || '').split('-').map(Number);
          const [bYear, bMonth] = (b.month || '').split('-').map(Number);
          if (aYear !== bYear) return aYear - bYear;
          return aMonth - bMonth;
        }) : [],
        incomeCategories,
        expenseCategories
      };
    }

    const firstItem = dashboardData[0];

    // Check if data is already aggregated (has month, income, expense fields)
    if (firstItem && typeof firstItem === 'object' && 'month' in firstItem) {

      // For pre-aggregated data, categories should be separate arrays in the response
      let incomeCategories = [];
      let expenseCategories = [];

      // Check if the response has separate category arrays
      if (dashboardData.length > 1) {
        const categoryData = dashboardData.find(item => item.income_categories || item.expense_categories);
        if (categoryData) {
          incomeCategories = categoryData.income_categories || [];
          expenseCategories = categoryData.expense_categories || [];
        }
      }

      // If no separate category data found, try to extract from monthly items (fallback)
      if (incomeCategories.length === 0 && expenseCategories.length === 0) {
        incomeCategories = firstItem.income_categories || firstItem.categories?.filter(c => c.type === 0 || c.type === '0' || c.type === 'income') || [];
        expenseCategories = firstItem.expense_categories || firstItem.categories?.filter(c => c.type === 1 || c.type === '1' || c.type === 'expense') || [];
      }

      return {
        monthly: dashboardData.filter(item => item.month).sort((a, b) => {
          const [aYear, aMonth] = (a.month || '').split('-').map(Number);
          const [bYear, bMonth] = (b.month || '').split('-').map(Number);
          if (aYear !== bYear) return aYear - bYear;
          return aMonth - bMonth;
        }),
        incomeCategories: incomeCategories.map(cat => ({
          name: cat.name || cat.category_name || 'Unknown',
          value: parseFloat(cat.amount || cat.value || cat.total || 0)
        })).filter(cat => cat.value > 0).sort((a, b) => b.value - a.value),
        expenseCategories: expenseCategories.map(cat => ({
          name: cat.name || cat.category_name || 'Unknown',
          value: parseFloat(cat.amount || cat.value || cat.total || 0)
        })).filter(cat => cat.value > 0).sort((a, b) => b.value - a.value)
      };
    }

    // If data is raw transactions, process them
    console.log('Processing as raw transaction data');

    // Group transactions by month
    const monthlyData = {};
    const categoryTotals = { income: {}, expense: {} };
    let incomeCount = 0;
    let expenseCount = 0;

    dashboardData.forEach((transaction, index) => {
      // Skip invalid transactions
      if (!transaction.transaction_date || !transaction.amount || transaction.category_type === undefined || transaction.category_type === null) {
        return;
      }

      const date = new Date(transaction.transaction_date);
      // Skip invalid dates
      if (isNaN(date.getTime())) {
        console.log(`Skipping invalid date for transaction ${index}`);
        return;
      }

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, income: 0, expense: 0 };
      }

      const amount = parseFloat(transaction.amount);
      // Skip invalid amounts
      if (isNaN(amount) || amount <= 0) {
        return;
      }

      const isIncome = transaction.category_type === 0 || transaction.category_type === '0' || transaction.category_type === 'income';

      if (isIncome) {
        monthlyData[monthKey].income += amount;
        if (transaction.category_name) {
          categoryTotals.income[transaction.category_name] = (categoryTotals.income[transaction.category_name] || 0) + amount;
        }
        incomeCount++;
      } else {
        monthlyData[monthKey].expense += amount;
        if (transaction.category_name) {
          categoryTotals.expense[transaction.category_name] = (categoryTotals.expense[transaction.category_name] || 0) + amount;
        }
        expenseCount++;
      }
    });

    console.log('Processing summary:', { incomeCount, expenseCount, monthlyData, categoryTotals });

    // Convert to arrays for charts
    const monthlyChartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

    const incomePieData = Object.entries(categoryTotals.income).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100
    }));

    const expensePieData = Object.entries(categoryTotals.expense).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100
    }));

    return {
      monthly: monthlyChartData,
      incomeCategories: incomePieData,
      expenseCategories: expensePieData
    };
  }, [dashboardData]);

  // Calculate totals based on available data
  const totalIncome = chartData.incomeCategories?.length > 0
    ? chartData.incomeCategories.reduce((sum, item) => sum + (item.value || 0), 0)
    : chartData.monthly?.reduce((sum, item) => sum + (item.income || 0), 0) || 0;

  const totalExpense = chartData.expenseCategories?.length > 0
    ? chartData.expenseCategories.reduce((sum, item) => sum + (item.value || 0), 0)
    : chartData.monthly?.reduce((sum, item) => sum + (item.expense || 0), 0) || 0;

  const netBalance = totalIncome - totalExpense;

  // Calculate total transactions count
  const totalTransactions = chartData.monthly?.reduce((sum, item) => sum + (item.transaction_count || item.count || 0), 0) || (Array.isArray(dashboardData) ? dashboardData.length : 0);

  console.log('Calculated totals:', { totalIncome, totalExpense, netBalance, totalTransactions });

  return (
    <div className={styles.reportContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <img src="/nya-emoji/naruhodo-nya.gif" alt="Reports" className={styles.titleIcon} />
          Financial Reports
        </h1>
        <p className={styles.subtitle}>Analyze your financial data with detailed insights</p>
      </div>

      {/* Filter Controls */}
      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Dashboard Type:</label>
          <select
            value={dashboardType}
            onChange={(e) => setDashboardType(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Transactions</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Analysis Period:</label>
          <select
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="1_month">Last Month</option>
            <option value="6_month">Last 6 Months</option>
            <option value="12_month">Last 12 Months</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {analysisType === 'custom' && (
          <>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={styles.filterInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={styles.filterInput}
              />
            </div>
          </>
        )}
      </div>

      {loading && <div className={styles.loading}>Loading dashboard data...</div>}

      {error && <div className={styles.error}>Error loading dashboard data: {error}</div>}

      {!loading && !error && dashboardData.length === 0 && (
        <div className={styles.noData}>
          <img src="/nya-emoji/shocked-nya.png" alt="No data" className={styles.noDataIcon} />
          <h3>No financial data available</h3>
          <p>Add some transactions to see your financial reports and insights.</p>
        </div>
      )}

      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <img src="/nya-emoji/memo-nya.png" alt="Income" className={styles.cardIcon} />
          </div>
          <div className={styles.summaryValue}>{totalIncome.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
          <div className={styles.summaryLabel}>Total Income</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <img src="/nya-emoji/donmai-nya.gif" alt="Expenses" className={styles.cardIcon} />
          </div>
          <div className={styles.summaryValue}>{totalExpense.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
          <div className={styles.summaryLabel}>Total Expenses</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <img src="/nya-emoji/think-nya.png" alt="Balance" className={styles.cardIcon} />
          </div>
          <div className={styles.summaryValue}>{(totalIncome - totalExpense).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
          <div className={styles.summaryLabel}>Net Balance</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <img src="/nya-emoji/ok-nya.png" alt="Transactions" className={styles.cardIcon} />
          </div>
          <div className={styles.summaryValue}>{dashboardData.length.toLocaleString()}</div>
          <div className={styles.summaryLabel}>Total Transactions</div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        {/* Monthly Income vs Expense Trend */}
        {(dashboardType === 'all' || dashboardType === 'income' || dashboardType === 'expense') && (
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>
              {dashboardType === 'income' ? 'Income Over Time' :
               dashboardType === 'expense' ? 'Expenses Over Time' :
               'Income vs Expenses Over Time'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }), '']} />
                <Legend />
                {dashboardType !== 'expense' && (
                  <Line type="monotone" dataKey="income" stroke="#00C49F" strokeWidth={2} name="Income" />
                )}
                {dashboardType !== 'income' && (
                  <Line type="monotone" dataKey="expense" stroke="#FF8042" strokeWidth={2} name="Expenses" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Expense Categories Pie Chart */}
        {(dashboardType === 'all' || dashboardType === 'expense') && chartData.expenseCategories?.length > 0 && (
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Expense Categories</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.expenseCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.expenseCategories?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }), 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Income Categories Pie Chart */}
        {(dashboardType === 'all' || dashboardType === 'income') && chartData.incomeCategories?.length > 0 && (
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Income Sources</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.incomeCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.incomeCategories?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }), 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Monthly Comparison Bar Chart */}
        {(dashboardType === 'all' || dashboardType === 'income' || dashboardType === 'expense') && (
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>
              {dashboardType === 'income' ? 'Monthly Income' :
               dashboardType === 'expense' ? 'Monthly Expenses' :
               'Monthly Comparison'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }), '']} />
                <Legend />
                {dashboardType !== 'expense' && (
                  <Bar dataKey="income" fill="#00C49F" name="Income" />
                )}
                {dashboardType !== 'income' && (
                  <Bar dataKey="expense" fill="#FF8042" name="Expenses" />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default Report;