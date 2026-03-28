import { createSlice } from '@reduxjs/toolkit';
import type { AttendanceLog } from '../../types/housekeeping';
import { clockIn, clockOut, fetchTodayAttendance } from './attendanceThunks';

interface AttendanceState {
  todayLog: AttendanceLog | null;
  isClockedIn: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AttendanceState = {
  todayLog: null,
  isClockedIn: false,
  loading: false,
  error: null,
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearAttendance(state) {
      state.todayLog = null;
      state.isClockedIn = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodayAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodayAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.todayLog = action.payload;
        state.isClockedIn = Boolean(action.payload.clockInTime && !action.payload.clockOutTime);
      })
      .addCase(fetchTodayAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(clockIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clockIn.fulfilled, (state, action) => {
        state.loading = false;
        state.todayLog = action.payload;
        state.isClockedIn = true;
      })
      .addCase(clockIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(clockOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clockOut.fulfilled, (state, action) => {
        state.loading = false;
        state.todayLog = action.payload;
        state.isClockedIn = false;
      })
      .addCase(clockOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAttendance } = attendanceSlice.actions;
export default attendanceSlice.reducer;
