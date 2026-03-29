import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RoomStatusItem } from '../../types/housekeeping';
import { housekeepingClient } from '../../api/housekeepingClient';

export const fetchRoomStatus = createAsyncThunk<RoomStatusItem[], { date: string }>(
  'roomStatus/fetchRoomStatus',
  async ({ date }, { rejectWithValue }) => {
    try {
      const { data } = await housekeepingClient.get<RoomStatusItem[]>(
        '/api/supervisor/rooms/status',
        { params: { date } },
      );
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  },
);

export const checkInRoom = createAsyncThunk<RoomStatusItem, { roomNightInventoryId: string }>(
  'roomStatus/checkIn',
  async ({ roomNightInventoryId }, { rejectWithValue }) => {
    try {
      const { data } = await housekeepingClient.post<RoomStatusItem>(
        '/api/supervisor/rooms/check-in',
        null,
        { params: { roomNightInventoryId } },
      );
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  },
);

export const checkOutRoom = createAsyncThunk<RoomStatusItem, { roomNightInventoryId: string }>(
  'roomStatus/checkOut',
  async ({ roomNightInventoryId }, { rejectWithValue }) => {
    try {
      const { data } = await housekeepingClient.post<RoomStatusItem>(
        '/api/supervisor/rooms/check-out',
        null,
        { params: { roomNightInventoryId } },
      );
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  },
);
