import { createAsyncThunk } from '@reduxjs/toolkit';
import { housekeepingClient } from '../../api/housekeepingClient';
import type { AttendanceLog } from '../../types/housekeeping';

export const fetchTodayAttendance = createAsyncThunk<AttendanceLog, string>(
  'attendance/fetchTodayAttendance',
  async (staffId, { rejectWithValue }) => {
    try {
      const { data } = await housekeepingClient.get<AttendanceLog>('/api/attendance/today', {
        params: { staffId },
      });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  },
);

export const clockIn = createAsyncThunk<AttendanceLog, string>(
  'attendance/clockIn',
  async (staffId, { rejectWithValue }) => {
    try {
      const { data } = await housekeepingClient.post<AttendanceLog>(
        '/api/attendance/clock-in',
        null,
        { params: { staffId } },
      );
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  },
);

export const clockOut = createAsyncThunk<AttendanceLog, string>(
  'attendance/clockOut',
  async (staffId, { rejectWithValue }) => {
    try {
      const { data } = await housekeepingClient.post<AttendanceLog>(
        '/api/attendance/clock-out',
        null,
        { params: { staffId } },
      );
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  },
);
