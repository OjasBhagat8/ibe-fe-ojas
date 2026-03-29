import { createAsyncThunk } from '@reduxjs/toolkit';
import type { TaskOverviewRow } from '../../types/housekeeping';
import { housekeepingClient } from '../../api/housekeepingClient';
import { allocationClient } from '../../api/allocationClient';

export const fetchTaskOverview = createAsyncThunk<TaskOverviewRow[], { date: string }>(
  'supervisorTasks/fetchTaskOverview',
  async ({ date }, { rejectWithValue }) => {
    try {
      const { data } = await housekeepingClient.get<TaskOverviewRow[]>(
        '/api/supervisor/tasks/overview',
        { params: { date } },
      );
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  },
);

export const runAllocation = createAsyncThunk<
  void,
  { propertyId: string; date: string },
  { dispatch: any }
>(
  'supervisorTasks/runAllocation',
  async ({ propertyId, date }, { dispatch, rejectWithValue }) => {
    try {
      await allocationClient.post('/api/allocation/run', null, {
        params: { propertyId, date },
      });
      dispatch(fetchTaskOverview({ date }));
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  },
);

export const reallocateStaff = createAsyncThunk<
  void,
  { propertyId: string; date: string; absentStaffId: string },
  { dispatch: any }
>(
  'supervisorTasks/reallocateStaff',
  async ({ propertyId, date, absentStaffId }, { dispatch, rejectWithValue }) => {
    try {
      await allocationClient.post('/api/allocation/relocate', { propertyId, date, absentStaffId });
      dispatch(fetchTaskOverview({ date }));
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  },
);
