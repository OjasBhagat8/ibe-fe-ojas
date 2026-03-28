import { createSlice } from '@reduxjs/toolkit';
import type { LeaveBalance, LeaveRecord } from '../../types/housekeeping';
import { fetchLeaveBalance, fetchActiveLeaves, submitLeaveRequest } from './leaveThunks';

interface LeaveState {
  balance: LeaveBalance | null;
  activeLeaves: LeaveRecord[];
  loading: boolean;
  error: string | null;
  submitSuccess: boolean;
}

const initialState: LeaveState = {
  balance: null,
  activeLeaves: [],
  loading: false,
  error: null,
  submitSuccess: false,
};

const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    clearLeaveState(state) {
      state.balance = null;
      state.activeLeaves = [];
      state.error = null;
      state.submitSuccess = false;
    },
    resetSubmitSuccess(state) {
      state.submitSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaveBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
      })
      .addCase(fetchLeaveBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchActiveLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.activeLeaves = action.payload;
      })
      .addCase(fetchActiveLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(submitLeaveRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.submitSuccess = false;
      })
      .addCase(submitLeaveRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.submitSuccess = true;
        state.activeLeaves.push(action.payload);
      })
      .addCase(submitLeaveRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearLeaveState, resetSubmitSuccess } = leaveSlice.actions;
export default leaveSlice.reducer;
