import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCategories } from '../../hooks/useCategories';
import { useTransactions } from '../../hooks/useTransactions';
import { handleApiError } from '../../utils/errorHandler';
import styles from '../../styles/Home.module.css';

function Home() {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const { categories, pagination: categoriesPagination, error: categoriesError, fetchCategories } = useCategories(token);
  const { transactions, pagination: transactionsPagination, error: transactionsError, fetchTransactions } = useTransactions(token, user?.id);

  useEffect(() => {
    fetchCategories(1, 100); // Fetch more categories for accurate dashboard stats
  }, [fetchCategories]);

  useEffect(() => {
    if (user?.id) {
      fetchTransactions(1, 50); // Fetch recent transactions for dashboard
    }
  }, [fetchTransactions, user?.id]);

  useEffect(() => {
    if (categoriesError?.status === 401 || transactionsError?.status === 401) {
      logout();
    } else {
      handleApiError(categoriesError, navigate);
      handleApiError(transactionsError, navigate);
    }
  }, [categoriesError, transactionsError, navigate, logout]);

  // Calculate some basic stats
  const incomeCategories = categories.filter(cat => cat.type === 'INCOME').length;
  const expenseCategories = categories.filter(cat => cat.type === 'EXPENSE').length;
  const totalCategories = categoriesPagination?.total_count || categories.length;
  const totalTransactions = transactionsPagination?.total_count || transactions.length;

  return (
    <div className={styles.homeContainer}>
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>
          <img src="/nya-emoji/nyaan-nya.png" alt="Nyaan" className={styles.welcomeIcon} />
          <span className={styles.welcomeText}>Welcome back!</span>
          <img src="/nya-emoji/hai-nya.png" alt="Hai" className={styles.welcomeIcon} />
        </h1>
        <p className={styles.welcomeSubtitle}>Manage your finances with ease, {user?.display_name}</p>
      </div>

      <div className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{totalCategories}</div>
            <div className={styles.statLabel}>Total Categories</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{incomeCategories}</div>
            <div className={styles.statLabel}>Income Sources</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{expenseCategories}</div>
            <div className={styles.statLabel}>Expense Categories</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{totalTransactions}</div>
            <div className={styles.statLabel}>Transactions</div>
          </div>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <Link to="/categories" className={styles.dashboardCard}>
          <div className={styles.cardIcon}>
            <img src="/nya-emoji/memo-nya.png" alt="Categories" className={styles.cardIconImage} />
          </div>
          <h3 className={styles.cardTitle}>Manage Categories</h3>
          <p className={styles.cardDescription}>
            Organize your income and expense categories to track your spending habits effectively.
          </p>
        </Link>

        <Link to="/transactions" className={styles.dashboardCard}>
          <div className={styles.cardIcon}>
            <img src="/nya-emoji/medetai-nya.gif" alt="Transactions" className={styles.cardIconImage} />
          </div>
          <h3 className={styles.cardTitle}>Track Transactions</h3>
          <p className={styles.cardDescription}>
            Record and monitor your daily transactions to stay on top of your budget.
          </p>
        </Link>

        <Link to="/report" className={styles.dashboardCard}>
          <div className={styles.cardIcon}>
            <img src="/nya-emoji/naruhodo-nya.gif" alt="Reports" className={styles.cardIconImage} />
          </div>
          <h3 className={styles.cardTitle}>View Reports</h3>
          <p className={styles.cardDescription}>
            Analyze your financial data with detailed reports and insights.
          </p>
        </Link>

        <div className={styles.dashboardCard}>
          <div className={styles.cardIcon}>
            <img src="/nya-emoji/yossha-nya.gif" alt="Goals" className={styles.cardIconImage} />
          </div>
          <h3 className={styles.cardTitle}>Set Goals</h3>
          <p className={styles.cardDescription}>
            Define your financial goals and track your progress towards achieving them.
          </p>
        </div>

        <Link to="/diaries" className={styles.dashboardCard}>
          <div className={styles.cardIcon}>
            <img src="/nya-emoji/memo-nya.png" alt="Diary" className={styles.cardIconImage} />
          </div>
          <h3 className={styles.cardTitle}>Diary</h3>
          <p className={styles.cardDescription}>
            Reflect on your financial journey by maintaining a personal diary of your experiences.
          </p>
        </Link>

        <div className={styles.dashboardCard}>
          <div className={styles.cardIcon}>
            <img src="/nya-emoji/naisho-nya.png" alt="Schedule" className={styles.cardIconImage} />
          </div>
          <h3 className={styles.cardTitle}>Schedule</h3>
          <p className={styles.cardDescription}>
            Plan your financial activities and reminders with the scheduling feature.
          </p>
        </div>
      </div>

      <div className={styles.actionsSection}>
        <button onClick={logout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Home;