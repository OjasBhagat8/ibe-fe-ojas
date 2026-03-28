import { createAsyncThunk } from '@reduxjs/toolkit';
import type { SupervisorDashboardOverview } from '../../types/housekeeping';
import { getSupervisorDashboardOverview } from './supervisorDashboardApi';

export const fetchSupervisorDashboardOverview = createAsyncThunk<
  SupervisorDashboardOverview,
  { date: string }
>('supervisorDashboard/fetchOverview', async ({ date }, { rejectWithValue }) => {
  try {
    return await getSupervisorDashboardOverview(date);
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message ?? err.message);
  }
});
