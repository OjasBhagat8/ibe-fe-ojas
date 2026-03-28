import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../app/store';
import { clockIn, clockOut, fetchTodayAttendance } from './attendanceThunks';

export function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

export function useAttendance(staffId: string | null) {
  const dispatch = useDispatch<AppDispatch>();
  const { todayLog, isClockedIn, loading, error } = useSelector(
    (state: RootState) => state.attendance,
  );

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (staffId) {
      dispatch(fetchTodayAttendance(staffId));
    }
  }, [dispatch, staffId]);

  // Start timer when clocked in, clear when clocked out
  useEffect(() => {
    if (isClockedIn && todayLog?.clockInTime) {
      const startMs = new Date(todayLog.clockInTime).getTime();
      const tick = () => {
        setElapsedSeconds(Math.floor((Date.now() - startMs) / 1000));
      };
      tick();
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (!isClockedIn) {
        setElapsedSeconds(0);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isClockedIn, todayLog?.clockInTime]);

  const handleClockIn = useCallback(() => {
    if (staffId) dispatch(clockIn(staffId));
  }, [dispatch, staffId]);

  const handleClockOut = useCallback(() => {
    if (staffId) dispatch(clockOut(staffId));
  }, [dispatch, staffId]);

  return {
    isClockedIn,
    todayLog,
    elapsedSeconds,
    elapsedFormatted: formatElapsed(elapsedSeconds),
    loading,
    error,
    handleClockIn,
    handleClockOut,
  };
}
