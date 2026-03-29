import { createSlice } from '@reduxjs/toolkit';
import type { RoomStatusItem } from '../../types/housekeeping';
import { fetchRoomStatus, checkInRoom, checkOutRoom } from './roomStatusThunks';

interface RoomStatusState {
  rooms: RoomStatusItem[];
  loading: boolean;
  error: string | null;
  checkInLoading: boolean;
  checkOutLoading: boolean;
}

const initialState: RoomStatusState = {
  rooms: [],
  loading: false,
  error: null,
  checkInLoading: false,
  checkOutLoading: false,
};

const roomStatusSlice = createSlice({
  name: 'roomStatus',
  initialState,
  reducers: {
    clearRoomStatus(state) {
      state.rooms = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoomStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoomStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchRoomStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(checkInRoom.pending, (state) => {
        state.checkInLoading = true;
      })
      .addCase(checkInRoom.fulfilled, (state, action) => {
        state.checkInLoading = false;
        const idx = state.rooms.findIndex(
          (r) => r.roomNightInventoryId === action.payload.roomNightInventoryId,
        );
        if (idx !== -1) state.rooms[idx] = action.payload;
      })
      .addCase(checkInRoom.rejected, (state) => {
        state.checkInLoading = false;
      })
      .addCase(checkOutRoom.pending, (state) => {
        state.checkOutLoading = true;
      })
      .addCase(checkOutRoom.fulfilled, (state, action) => {
        state.checkOutLoading = false;
        const idx = state.rooms.findIndex(
          (r) => r.roomNightInventoryId === action.payload.roomNightInventoryId,
        );
        if (idx !== -1) state.rooms[idx] = action.payload;
      })
      .addCase(checkOutRoom.rejected, (state) => {
        state.checkOutLoading = false;
      });
  },
});

export const { clearRoomStatus } = roomStatusSlice.actions;
export default roomStatusSlice.reducer;
