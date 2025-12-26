import React, { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDiaries } from '../../hooks/useDiaries';
import { UI_MESSAGES } from '../../utils/constants';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import ErrorBoundary from '../../components/ErrorBoundary';
import DiaryEditor from '../../components/DiaryEditor';
import DiaryContent from '../../components/DiaryContent';
import styles from '../../styles/Diaries.module.css';

const DiaryForm = memo(({ onSubmit, onCancel, editingDiary }) => {
  const [formData, setFormData] = useState({
    date: (() => {
      try {
        const dateStr = editingDiary?.date || editingDiary?.created_at;
        if (typeof dateStr === 'string' && dateStr) {
          return dateStr.split('T')[0];
        }
        return new Date().toISOString().split('T')[0];
      } catch (e) {
        return new Date().toISOString().split('T')[0];
      }
    })(),
    shortDescription: typeof (editingDiary?.short_description || editingDiary?.name) === 'string'
      ? (editingDiary?.short_description || editingDiary?.name)
      : '',
    content: editingDiary?.content || editingDiary?.body || ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'date':
        if (!value) return 'Date is required';
        return '';
      case 'shortDescription':
        if (!value.trim()) return 'Short description is required';
        if (value.length > 100) return 'Short description must be less than 100 characters';
        return '';
      case 'content':
        if (!value || !value.trim()) return 'Content is required';
        return '';
      default:
        return '';
    }
  };

  const handleContentChange = (editorData) => {
    setFormData(prev => ({ ...prev, content: editorData }));

    if (touched.content) {
      setErrors(prev => ({ ...prev, content: validateField('content', editorData) }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach(key => {
      newErrors[key] = validateField(key, formData[key]);
    });

    setErrors(newErrors);
    setTouched({ date: true, shortDescription: true, content: true });

    if (Object.values(newErrors).every(error => !error)) {
      setIsSubmitting(true);
      try {
        await onSubmit({
          date: formData.date,
          short_description: formData.shortDescription,
          content: formData.content
        });
      } catch (error) {
        console.error('Form submission error:', error);
        setErrors({ submit: 'Failed to save diary entry. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className={`${styles.formContainer} ${isSubmitting ? styles.submitting : ''}`}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formHeader}>
          <h3>{editingDiary ? '✏️ Edit Entry' : '📝 New Entry'}</h3>
        </div>

        <div className={styles.formField}>
          <Input
            label={
              <div className={styles.labelWithCounter}>
                <span>Title</span>
                <span className={`${styles.counter} ${formData.shortDescription.length > 80 ? styles.counterWarning : ''}`}>
                  {formData.shortDescription.length}/100
                </span>
              </div>
            }
            type="text"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.shortDescription}
            placeholder="What's on your mind today?"
            required
            maxLength={100}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.contentLabel}>
            <div className={styles.labelWithCounter}>
              <span>Content</span>
              <span className={styles.wordCount}>
                {(() => {
                  const words = formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0);
                  return `${words.length} words`;
                })()}
              </span>
            </div>
          </label>
          <DiaryEditor
            value={formData.content}
            onChange={handleContentChange}
            placeholder="Share your story, feelings, or reflections..."
            disabled={isSubmitting}
          />
          {errors.content && <span className={styles.errorMessage}>{errors.content}</span>}
        </div>

        {errors.submit && (
          <div className={styles.submitError}>
            <span className={styles.errorIcon}>⚠️</span>
            {errors.submit}
          </div>
        )}

        <div className={styles.formActions}>
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="small"
            disabled={isSubmitting}
            className={isSubmitting ? styles.submittingButton : ''}
          >
            {isSubmitting ? (
              <>
                <span className={styles.spinner}></span>
                Saving...
              </>
            ) : (
              <>
                💾 {editingDiary ? 'Update' : 'Save'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
});

const Diaries = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { diaries, loading, error, createDiary, updateDiary, deleteDiary } = useDiaries(token);

  const [showForm, setShowForm] = useState(false);
  const [editingDiary, setEditingDiary] = useState(null);
  const [viewingDiary, setViewingDiary] = useState(null);
  const [message, setMessage] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleCreateDiary = async (diaryData) => {
    await createDiary(diaryData);
    setMessage(UI_MESSAGES.DIARY_CREATED);
    setShowForm(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUpdateDiary = async (diaryData) => {
    await updateDiary(editingDiary.id || editingDiary.record_id, diaryData);
    setMessage(UI_MESSAGES.DIARY_UPDATED);
    setEditingDiary(null);
    setShowForm(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteDiary = async (id) => {
    if (window.confirm('Are you sure you want to delete this diary entry?')) {
      await deleteDiary(id);
      setMessage(UI_MESSAGES.DIARY_DELETED);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEdit = (diary) => {
    setEditingDiary(diary);
    setShowForm(true);
  };

  const handleView = (diary) => {
    // debug: ensure handler is invoked in browser console
    try {
      // eslint-disable-next-line no-console
      console.log('handleView called for diary', diary && (diary.id || diary.record_id || diary.short_description));
    } catch (e) {}
    setViewingDiary(diary);
  };

  if (loading && diaries.length === 0) {
    return (
      <ErrorBoundary>
        <div className={styles.diariesContainer}>
          <div className={styles.headerCard}>
            <div className={styles.headerContent}>
              <div className={styles.headerIcon}>
                <img src="/nya-emoji/nyaan-nya.png" alt="Diary" className={styles.headerIconImage} />
              </div>
              <div>
                <h1 className={styles.headerTitle}>My Diary</h1>
                <p className={styles.headerSubtitle}>Record your daily thoughts and experiences</p>
              </div>
            </div>
            <div className={`${styles.addButton} ${styles.skeletonButton}`}></div>
          </div>

          <div className={styles.controlsBar}>
            <div className={styles.searchContainer}>
              <div className={styles.skeletonSearch}></div>
            </div>
            <div className={styles.viewControls}>
              <div className={styles.skeletonViewButton}></div>
              <div className={styles.skeletonViewButton}></div>
            </div>
          </div>

          <div className={styles.diariesGrid}>
            {[...Array(6)].map((_, index) => (
              <div key={index} className={styles.skeletonCard}>
                <div className={styles.skeletonHeader}>
                  <div className={styles.skeletonTitle}></div>
                  <div className={styles.skeletonDate}></div>
                </div>
                <div className={styles.skeletonContent}>
                  <div className={styles.skeletonLine}></div>
                  <div className={styles.skeletonLine}></div>
                  <div className={styles.skeletonLineShort}></div>
                </div>
                <div className={styles.skeletonActions}>
                  <div className={styles.skeletonButtonSmall}></div>
                  <div className={styles.skeletonButtonSmall}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className={styles.diariesContainer}>
        <div className={styles.headerCard}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <img src="/nya-emoji/nyaan-nya.png" alt="Diary" className={styles.headerIconImage} />
            </div>
            <div>
              <h1 className={styles.headerTitle}>My Diary</h1>
              <p className={styles.headerSubtitle}>Record your daily thoughts and experiences</p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              setEditingDiary(null);
              setShowForm(true);
            }}
            className={styles.addButton}
          >
            ✏️ Add New Entry
          </Button>
        </div>

        {message && (
          <div className={`${styles.message} ${styles.successMessage}`}>
            <span className={styles.messageIcon}>✅</span>
            <span>{message}</span>
            <button
              className={styles.messageClose}
              onClick={() => setMessage('')}
              aria-label="Close message"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className={`${styles.message} ${styles.errorMessage}`}>
            <span className={styles.messageIcon}>❌</span>
            <span>{error}</span>
            <button
              className={styles.messageClose}
              onClick={() => setMessage('')}
              aria-label="Close message"
            >
              ×
            </button>
          </div>
        )}

        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingDiary(null);
          }}
          title={editingDiary ? 'Edit Diary Entry' : 'Add New Diary Entry'}
        >
          <DiaryForm
            onSubmit={editingDiary ? handleUpdateDiary : handleCreateDiary}
            onCancel={() => {
              setShowForm(false);
              setEditingDiary(null);
            }}
            editingDiary={editingDiary}
          />
        </Modal>

        <Modal
          isOpen={!!viewingDiary}
          onClose={() => setViewingDiary(null)}
          title={viewingDiary ? (viewingDiary.short_description || viewingDiary.name || 'Diary Entry') : ''}
        >
          {viewingDiary && (
            <div className={styles.diaryViewModal}>
              <div className={styles.diaryViewHeader}>
                <div className={styles.diaryViewMeta}>
                  <div className={styles.diaryViewDate}>
                    <span className={styles.dateIcon}>📅</span>
                    {(() => {
                      try {
                        const dateStr = viewingDiary.date || viewingDiary.created_at;
                        if (typeof dateStr === 'string' && dateStr) {
                          return new Date(dateStr).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          });
                        }
                        return 'No date';
                      } catch (e) {
                        return 'Invalid date';
                      }
                    })()}
                  </div>
                  <div className={styles.diaryViewStats}>
                    <span className={styles.readingTime}>
                      {(() => {
                        const content = viewingDiary.content || viewingDiary.body || '';
                        const words = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0);
                        const readingTime = Math.max(1, Math.ceil(words.length / 200));
                        return `📖 ${readingTime} min read`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.diaryViewContent}>
                <DiaryContent content={viewingDiary.content || viewingDiary.body} />
              </div>
            </div>
          )}
        </Modal>

        <div className={`${styles.diariesGrid} ${viewMode === 'list' ? styles.listView : ''}`}>
          {diaries.length === 0 ? (
            <Card className={styles.emptyStateCard}>
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📓</div>
                <h3>Your diary awaits your first story</h3>
                <p>Every great journey begins with a single page. Start capturing your thoughts, memories, and experiences today.</p>
                <div className={styles.emptyActions}>
                  <Button
                    variant="primary"
                    size="large"
                    onClick={() => {
                      setEditingDiary(null);
                      setShowForm(true);
                    }}
                    className={styles.primaryCta}
                  >
                    📝 Begin Your Journey
                  </Button>
                      <div className={styles.emptyFeatures}>
                        <div className={styles.emptyFeature}>
                          <span>✏️</span>
                          <span>Rich Text Editor</span>
                        </div>
                        <div className={styles.emptyFeature}>
                          <span>🔍</span>
                          <span>Easy Search</span>
                        </div>
                        <div className={styles.emptyFeature}>
                          <span>📱</span>
                          <span>Mobile Friendly</span>
                        </div>
                        <div className={styles.emptyFeature}>
                          <span>🔒</span>
                          <span>Private & Secure</span>
                        </div>
                      </div>
                    </div>
              </div>
            </Card>
          ) : (
            diaries.map((diary) => (
              <Card
                key={diary.id || diary.record_id || Math.random()}
                className={`${styles.diaryCard} ${viewMode === 'list' ? styles.listCard : ''}`}
                onClick={() => handleView(diary)}
              >
                <div className={styles.diaryHeader}>
                  <div className={styles.diaryMeta}>
                    <h3
                      className={`${styles.diaryTitle} ${styles.clickableTitle}`}
                      onClick={() => handleView(diary)}
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleView(diary); } }}
                      role="button"
                    >
                      {typeof (diary.short_description || diary.name) === 'string'
                        ? (diary.short_description || diary.name)
                        : 'Untitled Entry'}
                    </h3>
                    <div className={styles.diaryDate}>
                      <span className={styles.dateIcon}>📅</span>
                      {(() => {
                        try {
                          const dateStr = diary.date || diary.created_at;
                          if (typeof dateStr === 'string' && dateStr) {
                            return new Date(dateStr).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            });
                          }
                          return 'No date';
                        } catch (e) {
                          return 'Invalid date';
                        }
                      })()}
                    </div>
                  </div>
                  <div className={styles.diaryActions}>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={(e) => { e.stopPropagation(); handleEdit(diary); }}
                      className={styles.actionButton}
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={(e) => { e.stopPropagation(); handleDeleteDiary(diary.id || diary.record_id); }}
                      className={styles.actionButton}
                    >
                      🗑️ Delete
                    </Button>
                  </div>
                </div>
                <div className={styles.diaryContent}>
                  {typeof (diary.content || diary.body) === 'string'
                    ? <DiaryContent content={diary.content || diary.body} />
                    : <p className={styles.noContent}>Content not available (invalid format)</p>
                  }
                </div>
                <div className={styles.diaryFooter}>
                  <div className={styles.diaryStats}>
                    <span className={styles.readingTime}>
                      {(() => {
                        const content = diary.content || diary.body || '';
                        const words = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0);
                        const readingTime = Math.max(1, Math.ceil(words.length / 200)); // Average reading speed
                        return `📖 ${readingTime} min read`;
                      })()}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Diaries;