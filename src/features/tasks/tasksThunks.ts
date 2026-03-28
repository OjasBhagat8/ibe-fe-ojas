import { createAsyncThunk } from '@reduxjs/toolkit';
import { housekeepingClient } from '../../api/housekeepingClient';
import type {
  TaskListResponse,
  HousekeepingTask,
  UpdateTaskStatusRequest,
} from '../../types/housekeeping';

export const fetchMyTasks = createAsyncThunk<
  HousekeepingTask[],
  { staffId: string; date?: string }
>('tasks/fetchMyTasks', async ({ staffId, date }, { rejectWithValue }) => {
  try {
    const params: Record<string, string> = { staffId };
    if (date) params.date = date;
    const { data } = await housekeepingClient.get<TaskListResponse>(
      '/api/tasks/my-tasks',
      { params },
    );
    return data.tasks;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message ?? err.message);
  }
});

export const updateTaskStatus = createAsyncThunk<
  HousekeepingTask,
  { taskId: string; status: UpdateTaskStatusRequest['status'] }
>('tasks/updateStatus', async ({ taskId, status }, { rejectWithValue }) => {
  try {
    const { data } = await housekeepingClient.patch<HousekeepingTask>(
      `/api/tasks/${taskId}/status`,
      { status },
    );
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message ?? err.message);
  }
});
