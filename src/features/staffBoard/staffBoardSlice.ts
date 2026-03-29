import { createSlice } from '@reduxjs/toolkit';
import type { StaffBoardResponse } from '../../types/housekeeping';
import { fetchStaffBoard } from './staffBoardThunks';

interface StaffBoardState {
  data: StaffBoardResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: StaffBoardState = {
  data: null,
  loading: false,
  error: null,
};

const staffBoardSlice = createSlice({
  name: 'staffBoard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaffBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaffBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchStaffBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default staffBoardSlice.reducer;
