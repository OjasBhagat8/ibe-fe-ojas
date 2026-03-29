import { createSlice } from '@reduxjs/toolkit';
import type { TaskOverviewRow } from '../../types/housekeeping';
import { fetchTaskOverview, runAllocation, reallocateStaff } from './supervisorTasksThunks';

interface SupervisorTasksState {
  tasks: TaskOverviewRow[];
  loading: boolean;
  error: string | null;
  runAllocationLoading: boolean;
  runAllocationError: string | null;
}

const initialState: SupervisorTasksState = {
  tasks: [],
  loading: false,
  error: null,
  runAllocationLoading: false,
  runAllocationError: null,
};

const supervisorTasksSlice = createSlice({
  name: 'supervisorTasks',
  initialState,
  reducers: {
    clearSupervisorTasks(state) {
      state.tasks = [];
      state.error = null;
      state.runAllocationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTaskOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTaskOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(runAllocation.pending, (state) => {
        state.runAllocationLoading = true;
        state.runAllocationError = null;
      })
      .addCase(runAllocation.fulfilled, (state) => {
        state.runAllocationLoading = false;
      })
      .addCase(runAllocation.rejected, (state, action) => {
        state.runAllocationLoading = false;
        state.runAllocationError = action.payload as string;
      })
      .addCase(reallocateStaff.pending, (state) => {
        state.runAllocationLoading = true;
        state.runAllocationError = null;
      })
      .addCase(reallocateStaff.fulfilled, (state) => {
        state.runAllocationLoading = false;
      })
      .addCase(reallocateStaff.rejected, (state, action) => {
        state.runAllocationLoading = false;
        state.runAllocationError = action.payload as string;
      });
  },
});

export const { clearSupervisorTasks } = supervisorTasksSlice.actions;
export default supervisorTasksSlice.reducer;
