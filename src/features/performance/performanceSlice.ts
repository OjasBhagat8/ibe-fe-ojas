import { createSlice } from '@reduxjs/toolkit';
import type { SupervisorPerformanceResponse } from '../../types/housekeeping';
import { fetchSupervisorPerformance } from './performanceThunks';

interface PerformanceState {
  data: SupervisorPerformanceResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: PerformanceState = {
  data: null,
  loading: false,
  error: null,
};

const performanceSlice = createSlice({
  name: 'performance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSupervisorPerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupervisorPerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSupervisorPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default performanceSlice.reducer;
