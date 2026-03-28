import { createSlice } from '@reduxjs/toolkit';
import type { HousekeepingAuthState } from '../../types/housekeeping';
import { TOKEN_STORAGE_KEY } from '../../api/housekeepingClient';
import { loginStaff } from './housekeepingAuthThunks';

const initialState: HousekeepingAuthState = {
  token: localStorage.getItem(TOKEN_STORAGE_KEY),
  staffId: null,
  staffName: null,
  employmentType: null,
  propertyId: null,
  availabilityStatus: null,
  loading: false,
  error: null,
};

const housekeepingAuthSlice = createSlice({
  name: 'housekeepingAuth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.staffId = null;
      state.staffName = null;
      state.employmentType = null;
      state.propertyId = null;
      state.availabilityStatus = null;
      state.error = null;
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.staffId = action.payload.staffId;
        state.staffName = action.payload.staffName;
        state.employmentType = action.payload.employmentType;
        state.propertyId = action.payload.propertyId;
        state.availabilityStatus = action.payload.availabilityStatus;
      })
      .addCase(loginStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = housekeepingAuthSlice.actions;
export default housekeepingAuthSlice.reducer;
