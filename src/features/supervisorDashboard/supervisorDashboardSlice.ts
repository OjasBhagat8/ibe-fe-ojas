import { createSlice } from '@reduxjs/toolkit';
import type { SupervisorDashboardOverview } from '../../types/housekeeping';
import { fetchSupervisorDashboardOverview } from './supervisorDashboardThunks';

interface SupervisorDashboardState {
  overview: SupervisorDashboardOverview | null;
  loading: boolean;
  error: string | null;
}

const initialState: SupervisorDashboardState = {
  overview: null,
  loading: false,
  error: null,
};

const supervisorDashboardSlice = createSlice({
  name: 'supervisorDashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSupervisorDashboardOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupervisorDashboardOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload;
      })
      .addCase(fetchSupervisorDashboardOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default supervisorDashboardSlice.reducer;
