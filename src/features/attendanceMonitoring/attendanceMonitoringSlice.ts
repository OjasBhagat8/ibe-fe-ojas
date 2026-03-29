import { createSlice } from '@reduxjs/toolkit';
import type { StaffAttendanceMonitoringResponse } from '../../types/housekeeping';
import { fetchAttendanceMonitoring } from './attendanceMonitoringThunks';

interface AttendanceMonitoringState {
  data: StaffAttendanceMonitoringResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: AttendanceMonitoringState = {
  data: null,
  loading: false,
  error: null,
};

const attendanceMonitoringSlice = createSlice({
  name: 'attendanceMonitoring',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendanceMonitoring.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceMonitoring.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAttendanceMonitoring.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default attendanceMonitoringSlice.reducer;
