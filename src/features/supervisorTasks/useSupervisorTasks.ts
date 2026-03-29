import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../app/store';
import { fetchTaskOverview, runAllocation, reallocateStaff } from './supervisorTasksThunks';

export function useSupervisorTasks(date: string) {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading, error, runAllocationLoading, runAllocationError } = useSelector(
    (state: RootState) => state.supervisorTasks,
  );
  const propertyId = useSelector((state: RootState) => state.housekeepingAuth.propertyId);

  useEffect(() => {
    dispatch(fetchTaskOverview({ date }));
  }, [dispatch, date]);

  const triggerRunAllocation = useCallback(() => {
    if (!propertyId) return;
    dispatch(runAllocation({ propertyId, date }));
  }, [dispatch, propertyId, date]);

  const triggerReallocate = useCallback(
    (absentStaffId: string) => {
      if (!propertyId) return;
      dispatch(reallocateStaff({ propertyId, date, absentStaffId }));
    },
    [dispatch, propertyId, date],
  );

  return {
    tasks,
    loading,
    error,
    runAllocationLoading,
    runAllocationError,
    runAllocation: triggerRunAllocation,
    reallocateStaff: triggerReallocate,
  };
}
