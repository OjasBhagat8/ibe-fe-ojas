import { createAsyncThunk } from '@reduxjs/toolkit';
import type { StaffAttendanceMonitoringResponse } from '../../types/housekeeping';
import { getAttendanceMonitoring } from './attendanceMonitoringApi';

interface FetchAttendanceMonitoringParams {
  propertyId: string;
  date?: string;
}

export const fetchAttendanceMonitoring = createAsyncThunk<
  StaffAttendanceMonitoringResponse,
  FetchAttendanceMonitoringParams
>('attendanceMonitoring/fetch', async ({ propertyId, date }, { rejectWithValue }) => {
  try {
    return await getAttendanceMonitoring({ propertyId, date });
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message ?? err.message);
  }
});
