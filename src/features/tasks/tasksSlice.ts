import { createSlice } from '@reduxjs/toolkit';
import type { HousekeepingTask } from '../../types/housekeeping';
import { fetchMyTasks, updateTaskStatus } from './tasksThunks';

interface TasksState {
  tasks: HousekeepingTask[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTasks(state) {
      state.tasks = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchMyTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Optimistic-style update: replace the matching task immediately
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.tasks.findIndex((t) => t.taskId === updated.taskId);
        if (idx !== -1) {
          state.tasks[idx] = updated;
        }
      });
  },
});

export const { clearTasks } = tasksSlice.actions;
export default tasksSlice.reducer;
