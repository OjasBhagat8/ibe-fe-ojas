import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getLocalIsoDate } from '../../pages/housekeeping/dateUtils';
import { fetchAttendanceMonitoring } from './attendanceMonitoringThunks';

export function useAttendanceMonitoring(defaultDate = getLocalIsoDate()) {
  const dispatch = useAppDispatch();
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const propertyId = useAppSelector((state) => state.housekeepingAuth.propertyId);
  const { data, loading, error } = useAppSelector((state) => state.attendanceMonitoring);

  useEffect(() => {
    if (!propertyId) {
      return;
    }
    dispatch(fetchAttendanceMonitoring({ propertyId, date: selectedDate }));
  }, [dispatch, propertyId, selectedDate]);

  const refresh = useCallback(() => {
    if (!propertyId) {
      return;
    }
    dispatch(fetchAttendanceMonitoring({ propertyId, date: selectedDate }));
  }, [dispatch, propertyId, selectedDate]);

  const today = getLocalIsoDate();
  const useToday = useCallback(() => {
    setSelectedDate(today);
  }, [today]);

  const dashboard = useMemo(() => data, [data]);

  return {
    selectedDate,
    setSelectedDate,
    useToday,
    propertyId,
    dashboard,
    loading,
    error,
    refresh,
  };
}
