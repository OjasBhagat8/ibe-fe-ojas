import { createAsyncThunk } from '@reduxjs/toolkit';
import type { PerformancePreset, SupervisorPerformanceResponse } from '../../types/housekeeping';
import { getSupervisorPerformance } from './performanceApi';

export interface FetchSupervisorPerformanceParams {
  preset?: PerformancePreset;
  from?: string;
  to?: string;
}

export const fetchSupervisorPerformance = createAsyncThunk<
  SupervisorPerformanceResponse,
  FetchSupervisorPerformanceParams
>('performance/fetchSupervisorPerformance', async (params, { rejectWithValue }) => {
  try {
    return await getSupervisorPerformance(params);
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message ?? err.message);
  }
});
