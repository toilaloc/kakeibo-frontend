import { useState, useEffect, useCallback } from 'react';
import { diaryService } from '../services/diaries';

export const useDiaries = (token) => {
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all diaries
  const fetchDiaries = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const data = await diaryService.getDiaries(token);
      setDiaries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Create a new diary entry
  const createDiary = useCallback(async (diaryData) => {
    setLoading(true);
    setError(null);
    try {
      const newDiary = await diaryService.createDiary(token, diaryData);
      setDiaries(prev => [...prev, newDiary]);
      return newDiary;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Update a diary entry
  const updateDiary = useCallback(async (id, diaryData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedDiary = await diaryService.updateDiary(token, id, diaryData);
      setDiaries(prev => prev.map(diary =>
        diary.id === id ? updatedDiary : diary
      ));
      return updatedDiary;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Delete a diary entry
  const deleteDiary = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await diaryService.deleteDiary(token, id);
      setDiaries(prev => prev.filter(diary => diary.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDiaries();
  }, [fetchDiaries]);

  return {
    diaries,
    loading,
    error,
    fetchDiaries,
    createDiary,
    updateDiary,
    deleteDiary,
  };
};