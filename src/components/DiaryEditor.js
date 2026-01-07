import React, { useRef, useEffect, useState, useCallback } from 'react';
import styles from '../styles/Diaries.module.css';

const DiaryEditor = ({ value, onChange, placeholder = "Write about your day...", disabled = false }) => {
  const editorRef = useRef(null);
  const [isActive, setIsActive] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Helper functions defined first
  const getEditorHTML = useCallback(() => {
    return editorRef.current?.innerHTML || '';
  }, []);

  const setEditorContent = useCallback((content) => {
    if (!editorRef.current) return;

    if (!content || content.trim() === '' || content === '<br>' || content === '<div><br></div>') {
      editorRef.current.innerHTML = '';
    } else {
      // If content contains HTML tags, use as is
      if (content.includes('<') && content.includes('>')) {
        editorRef.current.innerHTML = content;
      } else {
        // Convert plain text to HTML paragraphs
        const paragraphs = content.split('\n').filter(p => p.trim());
        editorRef.current.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
      }
    }
  }, []);

  const updateActiveStates = useCallback(() => {
    if (!editorRef.current) return;

    const commands = ['bold', 'italic', 'underline'];
    const newStates = {};
    commands.forEach(cmd => {
      newStates[cmd] = document.queryCommandState(cmd);
    });
    setIsActive(newStates);
  }, []);

  // Initialize editor content when component mounts or value changes
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      setEditorContent(value);
      setIsInitialized(true);
      updateActiveStates();
    }
  }, [value, isInitialized, setEditorContent, updateActiveStates]);

  // Update editor when value prop changes externally
  useEffect(() => {
    if (isInitialized && editorRef.current) {
      const currentHTML = getEditorHTML();
      // Only update if the content is actually different
      if (value !== undefined && currentHTML !== value) {
        setEditorContent(value);
      }
    }
  }, [value, isInitialized, getEditorHTML, setEditorContent]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      let html = editorRef.current.innerHTML;
      // Clean up empty contentEditable artifacts
      if (html === '<br>' || html === '<div><br></div>' || html === '<div><br></div><div><br></div>') {
        html = '';
      }
      // Send HTML content directly to preserve formatting
      onChange(html);
    }
    updateActiveStates();
  }, [onChange, updateActiveStates]);

  const execCommand = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateActiveStates();
  }, [updateActiveStates]);

  const handleKeyDown = useCallback((e) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        default:
          break;
      }
    }
  }, [execCommand]);

  const insertHeading = useCallback((level) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const heading = document.createElement(`h${level}`);
    heading.textContent = 'Heading';

    range.deleteContents();
    range.insertNode(heading);

    // Move cursor to end of heading
    const newRange = document.createRange();
    newRange.setStartAfter(heading);
    newRange.setEndAfter(heading);
    selection.removeAllRanges();
    selection.addRange(newRange);

    handleInput();
    editorRef.current?.focus();
  }, [handleInput]);

  const insertList = useCallback((type) => {
    const command = type === 'ordered' ? 'insertOrderedList' : 'insertUnorderedList';
    execCommand(command);
  }, [execCommand]);

  const insertQuote = useCallback(() => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const blockquote = document.createElement('blockquote');
    blockquote.textContent = 'Quote text';

    range.deleteContents();
    range.insertNode(blockquote);

    // Move cursor to end of quote
    const newRange = document.createRange();
    newRange.setStartAfter(blockquote);
    newRange.setEndAfter(blockquote);
    selection.removeAllRanges();
    selection.addRange(newRange);

    handleInput();
    editorRef.current?.focus();
  }, [handleInput]);

  return (
    <div className={styles.diaryEditor}>
      <div className={styles.editorToolbar}>
        <button
          type="button"
          className={`${styles.toolbarButton} ${isActive.bold ? styles.active : ''}`}
          onClick={() => execCommand('bold')}
          title="Bold (Ctrl+B)"
          aria-label="Bold text"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={`${styles.toolbarButton} ${isActive.italic ? styles.active : ''}`}
          onClick={() => execCommand('italic')}
          title="Italic (Ctrl+I)"
          aria-label="Italic text"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className={`${styles.toolbarButton} ${isActive.underline ? styles.active : ''}`}
          onClick={() => execCommand('underline')}
          title="Underline (Ctrl+U)"
          aria-label="Underline text"
        >
          <u>U</u>
        </button>
        <span className={styles.toolbarDivider}></span>
        <button
          type="button"
          className={styles.toolbarButton}
          onClick={() => insertHeading(2)}
          title="Heading 2"
          aria-label="Insert heading level 2"
        >
          H₂
        </button>
        <button
          type="button"
          className={styles.toolbarButton}
          onClick={() => insertHeading(3)}
          title="Heading 3"
          aria-label="Insert heading level 3"
        >
          H₃
        </button>
        <span className={styles.toolbarDivider}></span>
        <button
          type="button"
          className={styles.toolbarButton}
          onClick={() => insertList('unordered')}
          title="Bullet List"
          aria-label="Insert unordered list"
        >
          •
        </button>
        <button
          type="button"
          className={styles.toolbarButton}
          onClick={() => insertList('ordered')}
          title="Numbered List"
          aria-label="Insert ordered list"
        >
          1.
        </button>
        <span className={styles.toolbarDivider}></span>
        <button
          type="button"
          className={styles.toolbarButton}
          onClick={insertQuote}
          title="Quote"
          aria-label="Insert blockquote"
        >
          "
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable={!disabled}
        className={`${styles.editorContent} ${disabled ? styles.disabled : ''}`}
        onInput={disabled ? undefined : handleInput}
        onKeyDown={disabled ? undefined : handleKeyDown}
        onMouseUp={disabled ? undefined : updateActiveStates}
        onKeyUp={disabled ? undefined : updateActiveStates}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

export default DiaryEditor;