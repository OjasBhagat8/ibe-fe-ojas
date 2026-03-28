import { createAsyncThunk } from '@reduxjs/toolkit';
import { housekeepingClient, TOKEN_STORAGE_KEY } from '../../api/housekeepingClient';
import type { LoginRequest, LoginResponse } from '../../types/housekeeping';

export const loginStaff = createAsyncThunk<LoginResponse, LoginRequest>(
  'housekeepingAuth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await housekeepingClient.post<LoginResponse>(
        '/api/auth/login',
        credentials,
      );
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      return data;
    } catch (err: any) {
      const message =
        err.response?.data?.message ?? err.message ?? 'Login failed';
      return rejectWithValue(message);
    }
  },
);
