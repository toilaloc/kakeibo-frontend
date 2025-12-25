import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCategories } from '../../hooks/useCategories';
import { CATEGORY_TYPES, UI_MESSAGES } from '../../utils/constants';
import { handleApiError } from '../../utils/errorHandler';
import useFormValidation from '../../hooks/useFormValidation';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import styles from '../../styles/Categories.module.css';

const CategoryCard = memo(({ category, onEdit, onDelete, loading }) => (
  <div className={styles.categoryCard}>
    <div className={styles.categoryContent}>
      <div className={`${styles.categoryIcon} ${category.type === CATEGORY_TYPES.EXPENSE ? styles.expense : ''}`}>
        {category.type === CATEGORY_TYPES.INCOME ? 
          <img src="/nya-emoji/ok-nya.png" alt="Income" className={styles.categoryIconImage} /> : 
          <img src="/nya-emoji/yabai-nya.png" alt="Expense" className={styles.categoryIconImage} />
        }
      </div>
      <div className={styles.categoryInfo}>
        <h4>{category.name}</h4>
        <span className={`${styles.categoryType} ${category.type === CATEGORY_TYPES.EXPENSE ? styles.expense : ''}`}>
          {category.type}
        </span>
      </div>
    </div>
    <div className={styles.categoryActions}>
      <Button
        variant="secondary"
        size="small"
        onClick={() => onEdit(category)}
        disabled={loading}
        className={styles.editButton}
      >
        <img src="/nya-emoji/memo-nya.png" alt="Edit" className={styles.buttonIcon} />
        Edit
      </Button>
      <Button
        variant="danger"
        size="small"
        onClick={() => onDelete(category.id)}
        disabled={loading}
        className={styles.deleteButton}
      >
        <img src="/nya-emoji/donmai-nya.gif" alt="Delete" className={styles.buttonIcon} />
        Delete
      </Button>
    </div>
  </div>
));

const RadioOption = memo(({ value, checked, onChange, disabled, children, className }) => (
  <label className={`${styles.radioOption} ${checked ? styles.selected : ''} ${checked && value === CATEGORY_TYPES.EXPENSE ? styles.expense : ''} ${className || ''}`}>
    <input
      type="radio"
      value={value}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={styles.radioInput}
    />
    <span className={styles.radioLabel}>{children}</span>
  </label>
));

function Categories() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const {
    categories,
    pagination,
    loading,
    error,
    fetchCategories,
    addCategory,
    editCategory,
    removeCategory,
    clearError
  } = useCategories(token);

  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    handleApiError(error, navigate);
  }, [error, navigate]);

  const { values, errors, handleChange, handleBlur, validateForm, resetForm, setFieldValue } = useFormValidation({
    name: '',
    type: CATEGORY_TYPES.INCOME
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (editingId) {
        await editCategory(editingId, values);
      } else {
        await addCategory(values);
      }
      resetForm();
      setEditingId(null);
    } catch (err) {
      // Error is handled in the hook
    } finally {
      setSubmitting(false);
    }
  }, [editingId, values, validateForm, editCategory, addCategory, resetForm]);

  const handleEdit = useCallback((category) => {
    setFieldValue('name', category.name);
    setFieldValue('type', category.type);
    setEditingId(category.id);
    clearError();
  }, [setFieldValue, clearError]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm(UI_MESSAGES.CONFIRM_DELETE)) return;

    try {
      await removeCategory(id);
    } catch (err) {
      // Error handled in hook
    }
  }, [removeCategory]);

  const handleCancel = useCallback(() => {
    resetForm();
    setEditingId(null);
    clearError();
  }, [resetForm, clearError]);

  const handleTypeChange = useCallback((e) => {
    setFieldValue('type', e.target.value);
  }, [setFieldValue]);

  if (loading && categories.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>{UI_MESSAGES.LOADING}</p>
      </div>
    );
  }

  return (
    <div className={styles.categoriesContainer}>
      <div className={styles.categoriesGrid}>
        {/* Header */}
        <Card className={styles.headerCard} shadow="medium" rounded="large">
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <img src="/nya-emoji/memo-nya.png" alt="Categories" className={styles.headerIconImage} />
            </div>
            <div>
              <h1 className={styles.headerTitle}>Categories Management</h1>
              <p className={styles.headerSubtitle}>
                Organize your income and expense categories
              </p>
            </div>
          </div>
        </Card>

        <div className={styles.mainGrid}>
          {/* Form Section */}
          <Card className={styles.formCard} shadow="medium" rounded="large">
            <h3 className={styles.formTitle}>
              {editingId ? '✏️ Edit Category' : 
                <>
                  <img src="/nya-emoji/yossha-nya.gif" alt="Add" className={styles.buttonIcon} />
                  Add New Category
                </>
              }
            </h3>

            {error && (
              <div className={styles.errorMessage}>
                <span>⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <Input
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., Salary, Groceries, Rent"
                label="Category Name"
                error={errors.name}
                required
                disabled={submitting}
              />

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category Type</label>
                <div className={styles.radioGroup}>
                  <RadioOption
                    value={CATEGORY_TYPES.INCOME}
                    checked={values.type === CATEGORY_TYPES.INCOME}
                    onChange={handleTypeChange}
                    disabled={submitting}
                  >
                    <img src="/nya-emoji/ok-nya.png" alt="Income" className={styles.radioIcon} />
                    Income
                  </RadioOption>
                  <RadioOption
                    value={CATEGORY_TYPES.EXPENSE}
                    checked={values.type === CATEGORY_TYPES.EXPENSE}
                    onChange={handleTypeChange}
                    disabled={submitting}
                  >
                    <img src="/nya-emoji/yabai-nya.png" alt="Expense" className={styles.radioIcon} />
                    Expense
                  </RadioOption>
                </div>
              </div>

              <div className={styles.buttonGroup}>
                <Button
                  type="submit"
                  variant="primary"
                  size="medium"
                  disabled={submitting || loading}
                  loading={submitting}
                >
                  {editingId ? '✏️ Update' : 
                    <>
                      <img src="/nya-emoji/yossha-nya.gif" alt="Create" className={styles.buttonIcon} />
                      Create
                    </>
                  } Category
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="medium"
                    onClick={handleCancel}
                    disabled={submitting}
                  >
                    ❌ Cancel
                  </Button>
                )}
              </div>
            </form>
          </Card>

          {/* Categories List Section */}
          <Card className={styles.listCard} shadow="medium" rounded="large">
            <div className={styles.listHeader}>
              <h3 className={styles.listTitle}>📋 Categories List</h3>
              <span className={styles.categoryCount}>
                {pagination.total_count} {pagination.total_count === 1 ? 'category' : 'categories'}
              </span>
            </div>

            {categories.length === 0 && !loading && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📭</div>
                <p className={styles.emptyTitle}>No categories yet</p>
                <p className={styles.emptyText}>
                  Create your first category using the form on the left
                </p>
              </div>
            )}

            <div className={styles.categoryGrid}>
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  loading={loading}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.total_pages > 1 && (
              <div className={styles.pagination}>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => fetchCategories(pagination.current_page - 1)}
                  disabled={pagination.current_page <= 1 || loading}
                  className={styles.paginationButton}
                >
                  ← Previous
                </Button>

                <span className={styles.paginationInfo}>
                  Page {pagination.current_page} of {pagination.total_pages}
                  ({pagination.total_count} total categories)
                </span>

                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => fetchCategories(pagination.current_page + 1)}
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
  );
}

export default memo(Categories);