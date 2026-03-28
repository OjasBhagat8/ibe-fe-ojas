import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../app/store';
import { fetchMyTasks, updateTaskStatus } from './tasksThunks';
import { clearTasks } from './tasksSlice';

export function useTasks(staffId: string | null, date?: string) {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading, error } = useSelector((state: RootState) => state.tasks);

  useEffect(() => {
    if (staffId) {
      dispatch(fetchMyTasks({ staffId, date }));
    }
  }, [dispatch, staffId, date]);

  const refreshTasks = useCallback(() => {
    if (staffId) {
      dispatch(fetchMyTasks({ staffId, date }));
    }
  }, [dispatch, staffId, date]);

  const startTask = useCallback(
    (taskId: string) => dispatch(updateTaskStatus({ taskId, status: 'IN_PROGRESS' })),
    [dispatch],
  );

  const completeTask = useCallback(
    (taskId: string) => dispatch(updateTaskStatus({ taskId, status: 'COMPLETED' })),
    [dispatch],
  );

  const clear = useCallback(() => dispatch(clearTasks()), [dispatch]);

  const completedCount = tasks.filter((t) => t.taskStatus === 'COMPLETED').length;
  const inProgressCount = tasks.filter((t) => t.taskStatus === 'IN_PROGRESS').length;
  const pendingCount = tasks.filter((t) => t.taskStatus === 'PENDING').length;

  return {
    tasks,
    loading,
    error,
    completedCount,
    inProgressCount,
    pendingCount,
    startTask,
    completeTask,
    refreshTasks,
    clear,
  };
}
