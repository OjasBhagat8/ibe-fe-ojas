import { createAsyncThunk } from '@reduxjs/toolkit';
import type { StaffBoardResponse } from '../../types/housekeeping';
import { getStaffBoard } from './staffBoardApi';

export const fetchStaffBoard = createAsyncThunk<StaffBoardResponse, { date?: string }>(
  'staffBoard/fetchStaffBoard',
  async ({ date }, { rejectWithValue }) => {
    try {
      return await getStaffBoard(date);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  },
);
