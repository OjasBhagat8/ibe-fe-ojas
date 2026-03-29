import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchStaffBoard } from '../features/staffBoard/staffBoardThunks';
import { getLocalIsoDate } from '../pages/housekeeping/dateUtils';

export function useStaffBoard(defaultDate = getLocalIsoDate()) {
  const dispatch = useAppDispatch();
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const { data, loading, error } = useAppSelector((state) => state.staffBoard);

  useEffect(() => {
    dispatch(fetchStaffBoard({ date: selectedDate }));
  }, [dispatch, selectedDate]);

  const refetch = useCallback(() => {
    dispatch(fetchStaffBoard({ date: selectedDate }));
  }, [dispatch, selectedDate]);

  const shiftGroups = useMemo(() => data?.shifts ?? [], [data]);
  const boardDate = data?.date ?? selectedDate;

  return {
    selectedDate,
    setSelectedDate,
    boardDate,
    shiftGroups,
    loading,
    error,
    refetch,
  };
}
