import { createAsyncThunk } from '@reduxjs/toolkit';
import { housekeepingClient } from '../../api/housekeepingClient';
import type {
  LeaveBalance,
  LeaveRecord,
  ActiveLeavesResponse,
  ApplyLeaveRequest,
} from '../../types/housekeeping';

export const fetchLeaveBalance = createAsyncThunk<LeaveBalance, string>(
  'leave/fetchBalance',
  async (staffId, { rejectWithValue }) => {
    try {
      const { data } = await housekeepingClient.get<LeaveBalance>(
        '/api/leave/available',
        { params: { staffId } },
      );
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  },
);

export const fetchActiveLeaves = createAsyncThunk<LeaveRecord[], string>(
  'leave/fetchActive',
  async (staffId, { rejectWithValue }) => {
    try {
      const { data } = await housekeepingClient.get<ActiveLeavesResponse>(
        '/api/leave/active',
        { params: { staffId } },
      );
      return data.leaves;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  },
);

export const submitLeaveRequest = createAsyncThunk<LeaveRecord, ApplyLeaveRequest>(
  'leave/submit',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await housekeepingClient.post<LeaveRecord>(
        '/api/leave/apply',
        payload,
      );
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  },
);
