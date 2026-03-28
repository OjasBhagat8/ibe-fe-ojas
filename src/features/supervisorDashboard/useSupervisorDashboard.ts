import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../app/store';
import { fetchSupervisorDashboardOverview } from './supervisorDashboardThunks';

export function useSupervisorDashboard(date: string) {
  const dispatch = useDispatch<AppDispatch>();
  const { overview, loading, error } = useSelector(
    (state: RootState) => state.supervisorDashboard,
  );

  useEffect(() => {
    if (date) {
      dispatch(fetchSupervisorDashboardOverview({ date }));
    }
  }, [dispatch, date]);

  return { overview, loading, error };
}
