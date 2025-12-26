import React from 'react';
import styles from '../styles/Diaries.module.css';

const DiaryContent = ({ content }) => {
  if (!content) {
    return <div className={styles.diaryContentRendered}><p>No content available</p></div>;
  }

  // If content contains HTML tags, render as HTML
  if (typeof content === 'string' && content.includes('<') && content.includes('>')) {
    return (
      <div
        className={styles.diaryContentRendered}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Otherwise, render as plain text with line breaks
  if (typeof content === 'string') {
    const paragraphs = content.split('\n').filter(p => p.trim());

    if (paragraphs.length === 0) {
      return <div className={styles.diaryContentRendered}><p>No content available</p></div>;
    }

    return (
      <div className={styles.diaryContentRendered}>
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    );
  }

  return <div className={styles.diaryContentRendered}><p>No content available</p></div>;
};

export default DiaryContent;