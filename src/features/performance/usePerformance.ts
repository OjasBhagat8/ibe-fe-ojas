import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import type { PerformancePreset } from '../../types/housekeeping';
import { getLocalIsoDate } from '../../pages/housekeeping/dateUtils';
import { fetchSupervisorPerformance } from './performanceThunks';

type RangeMode = 'preset' | 'custom';

export function usePerformance(defaultPreset: PerformancePreset = 'LAST_7_DAYS') {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.performance);

  const [rangeMode, setRangeMode] = useState<RangeMode>('preset');
  const [preset, setPreset] = useState<PerformancePreset>(defaultPreset);

  const today = getLocalIsoDate();
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  useEffect(() => {
    if (rangeMode === 'custom') {
      if (!fromDate || !toDate || fromDate > toDate) {
        return;
      }
      dispatch(fetchSupervisorPerformance({ from: fromDate, to: toDate }));
      return;
    }

    dispatch(fetchSupervisorPerformance({ preset }));
  }, [dispatch, rangeMode, preset, fromDate, toDate]);

  const applyPreset = useCallback((nextPreset: PerformancePreset) => {
    setRangeMode('preset');
    setPreset(nextPreset);
  }, []);

  const applyCustomRange = useCallback(() => {
    setRangeMode('custom');
    if (!fromDate || !toDate || fromDate > toDate) {
      return;
    }
    dispatch(fetchSupervisorPerformance({ from: fromDate, to: toDate }));
  }, [dispatch, fromDate, toDate]);

  const refresh = useCallback(() => {
    if (rangeMode === 'custom') {
      if (!fromDate || !toDate || fromDate > toDate) {
        return;
      }
      dispatch(fetchSupervisorPerformance({ from: fromDate, to: toDate }));
      return;
    }
    dispatch(fetchSupervisorPerformance({ preset }));
  }, [dispatch, rangeMode, preset, fromDate, toDate]);

  const invalidCustomRange = useMemo(
    () => rangeMode === 'custom' && (!!fromDate && !!toDate) && fromDate > toDate,
    [rangeMode, fromDate, toDate],
  );

  return {
    data,
    loading,
    error,
    rangeMode,
    preset,
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    applyPreset,
    applyCustomRange,
    refresh,
    invalidCustomRange,
  };
}
