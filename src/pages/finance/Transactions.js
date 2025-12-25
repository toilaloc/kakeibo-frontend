import React, { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import { UI_MESSAGES } from '../../utils/constants';
import { handleApiError } from '../../utils/errorHandler';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import ErrorBoundary from '../../components/ErrorBoundary';
import styles from '../../styles/Transactions.module.css';

const TransactionForm = memo(({ onSubmit, onCancel, editingTransaction, categories }) => {
  const [formData, setFormData] = useState({
    categoryId: editingTransaction?.category_id || '',
    amount: editingTransaction?.amount || '',
    transactionDate: editingTransaction?.transaction_date || new Date().toISOString().split('T')[0],
    note: editingTransaction?.note || ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'amount':
        if (!value) return 'Amount is required';
        if (isNaN(value) || parseFloat(value) <= 0) return 'Amount must be a positive number';
        return '';
      case 'transactionDate':
        if (!value) return 'Transaction date is required';
        return '';
      case 'categoryId':
        if (!value) return 'Category is required';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    setTouched({ categoryId: true, amount: true, transactionDate: true, note: true });

    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId)
      });
    }
  };

  const isFormValid = formData.categoryId && formData.amount && formData.transactionDate &&
                     !Object.values(errors).some(error => error);

  return (
    <Card className={styles.formCard}>
      <h3 className={styles.formTitle}>
        {editingTransaction ? '✏️ Edit Transaction' : 
          <>
            <img src="/nya-emoji/yossha-nya.gif" alt="Add" className={styles.buttonIcon} />
            Add Transaction
          </>
        }
      </h3>

      <form onSubmit={handleSubmit} className={styles.transactionForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Category *</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${styles.formSelect} ${errors.categoryId ? styles.error : ''}`}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name} ({category.type})
                </option>
              ))}
            </select>
            {errors.categoryId && <span className={styles.errorText}>{errors.categoryId}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Amount *</label>
            <Input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="0.00"
              error={errors.amount}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Date *</label>
            <Input
              type="date"
              name="transactionDate"
              value={formData.transactionDate}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.transactionDate}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Note</label>
            <Input
              type="text"
              name="note"
              value={formData.note}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Optional note"
            />
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isFormValid}>
            {editingTransaction ? 'Update' : 'Add'} Transaction
          </Button>
        </div>
      </form>
    </Card>
  );
});

const TransactionCard = memo(({ transaction, categories, onEdit, onDelete, formatCurrency }) => {
  const categoryName = transaction.category_name;
  const categoryType = transaction.category_type;
  // Determine if income based on category name (can be expanded)
  const isIncome = categoryType === 'income';
  const categoryIcon = isIncome ? '/nya-emoji/ok-nya.png' : '/nya-emoji/yabai-nya.png';

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className={styles.transactionCard}>
      <div className={styles.transactionContent}>
        <div className={styles.transactionHeader}>
          <div className={styles.categoryInfo}>
            <span className={styles.categoryIcon}>
              <img src={categoryIcon} alt={isIncome ? 'Income' : 'Expense'} className={styles.categoryIconImage} />
            </span>
            <span className={styles.categoryName}>{categoryName}</span>
            <span className={`${styles.categoryType} ${isIncome ? styles.income : styles.expense}`}>
              {isIncome ? 'INCOME' : 'EXPENSE'}
            </span>
          </div>
          <div className={styles.transactionActions}>
            <Button
              variant="secondary"
              size="small"
              onClick={() => onEdit(transaction)}
              className={styles.editButton}
            >
              <img src="/nya-emoji/memo-nya.png" alt="Edit" className={styles.buttonIcon} />
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={() => onDelete(transaction.id)}
              className={styles.deleteButton}
            >
              <img src="/nya-emoji/donmai-nya.gif" alt="Delete" className={styles.buttonIcon} />
            </Button>
          </div>
        </div>

        <div className={styles.transactionDetails}>
          <div className={styles.amount}>
            <span className={isIncome ? styles.incomeAmount : styles.expenseAmount}>
              {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
            </span>
          </div>
          <div className={styles.date}>
            {formatDate(transaction.transaction_date)}
          </div>
        </div>

        <div className={styles.note}>
          <strong>Note:</strong> {transaction.note || 'No note'}
        </div>
      </div>
    </Card>
  );
});

function Transactions() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { transactions, pagination, loading, error, fetchTransactions, addTransaction, editTransaction, removeTransaction, clearError } = useTransactions(token, user?.id);
  const { categories, fetchCategories } = useCategories(token);

  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [message, setMessage] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [fetchTransactions, fetchCategories]);

  useEffect(() => {
    handleApiError(error, navigate);
  }, [error, navigate]);

  const handleAddTransaction = async (transactionData) => {
    try {
      await addTransaction(transactionData);
      setShowForm(false);
      setMessage(UI_MESSAGES.TRANSACTION_CREATED);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleEditTransaction = async (transactionData) => {
    try {
      await editTransaction(editingTransaction.id, transactionData);
      setShowForm(false);
      setEditingTransaction(null);
      setMessage(UI_MESSAGES.TRANSACTION_UPDATED);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await removeTransaction(id);
        setMessage(UI_MESSAGES.TRANSACTION_DELETED);
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setMessage(`Error: ${err.message}`);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const totalIncome = transactions
    .filter(t => t.category_type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.category_type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const positiveBalance = totalIncome > totalExpenses;

  if (loading && transactions.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>Loading transactions...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={styles.transactionsContainer}>
        <div className={styles.headerCard}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <img src="/nya-emoji/medetai-nya.gif" alt="Transactions" className={styles.headerIconImage} />
            </div>
            <div>
              <h1 className={styles.headerTitle}>Transactions</h1>
              <p className={styles.headerSubtitle}>Track your income and expenses</p>
            </div>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <div className={styles.statValue}>{formatCurrency(totalIncome)}</div>
            <div className={styles.statLabel}>Total Income</div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statValue}>{(totalExpenses > 0 ? '-' : '') + formatCurrency(totalExpenses)}</div>
            <div className={styles.statLabel}>Total Expenses</div>
          </Card>
          <Card className={styles.statCard}>
            <div className={`${styles.statValue} ${positiveBalance ? styles.positive : styles.negative}`}>
              {positiveBalance ? '+' : '-'}{formatCurrency(Math.abs(totalIncome - totalExpenses))}
            </div>
            <div className={styles.statLabel}>Balance</div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statValue}>{pagination.total_count || transactions.length}</div>
            <div className={styles.statLabel}>Transactions</div>
          </Card>
        </div>

        <div className={styles.mainGrid}>
          <div className={styles.formSection}>
            {error && (
              <Card className={styles.errorCard}>
                <div className={styles.errorMessage}>
                  ⚠️ {error}
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={clearError}
                    className={styles.clearErrorButton}
                  >
                    ✕
                  </Button>
                </div>
              </Card>
            )}

            {message && (
              <Card className={styles.messageCard}>
                <div className={styles.successMessage}>
                  ✅ {message}
                </div>
              </Card>
            )}

            {!showForm && (
              <Card className={styles.actionCard}>
                <Button onClick={() => setShowForm(true)} className={styles.addButton}>
                  <img src="/nya-emoji/yossha-nya.gif" alt="Add" className={styles.buttonIcon} />
                  Add Transaction
                </Button>
              </Card>
            )}

            {showForm && (
              <TransactionForm
                onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
                onCancel={handleCancel}
                editingTransaction={editingTransaction}
                categories={categories}
              />
            )}
          </div>

          <div className={styles.listSection}>
            <Card className={styles.listCard}>
              <div className={styles.listHeader}>
                <h3 className={styles.listTitle}>Recent Transactions</h3>
                <div className={styles.transactionCount}>
                  {pagination.total_count || transactions.length} transaction{pagination.total_count === 1 || transactions.length === 1 ? '' : 's'}
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <img src="/nya-emoji/yabai-nya.png" alt="No transactions" className={styles.emptyIconImage} />
                  </div>
                  <div className={styles.emptyTitle}>No transactions yet</div>
                  <div className={styles.emptyText}>
                    Start tracking your finances by adding your first transaction.
                  </div>
                </div>
              ) : (
                <div className={styles.transactionGrid}>
                  {transactions
                    .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
                    .map(transaction => (
                      <TransactionCard
                        key={transaction.id}
                        transaction={transaction}
                        categories={categories}
                        onEdit={handleEdit}
                        onDelete={handleDeleteTransaction}
                        formatCurrency={formatCurrency}
                      />
                    ))}
                </div>
              )}

              {/* Pagination Controls */}
              {pagination.total_pages > 1 && (
                <div className={styles.pagination}>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => fetchTransactions(pagination.current_page - 1)}
                    disabled={pagination.current_page <= 1 || loading}
                    className={styles.paginationButton}
                  >
                    ← Previous
                  </Button>

                  <span className={styles.paginationInfo}>
                    Page {pagination.current_page} of {pagination.total_pages}
                    ({pagination.total_count} total transactions)
                  </span>

                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => fetchTransactions(pagination.current_page + 1)}
                    disabled={pagination.current_page >= pagination.total_pages || loading}
                    className={styles.paginationButton}
                  >
                    Next →
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default Transactions;