import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SelectedFilters } from "../../components/Filters/Filter";

export type RoomResultsStoredState = {
  query: string;
  page: number;
  sortField: string;
  sortDirection: "ASC" | "DESC";
  selectedFilters: SelectedFilters;
};

type RoomResultsPersistedState = {
  byTenantName: Record<string, RoomResultsStoredState>;
};

const initialState: RoomResultsPersistedState = {
  byTenantName: {},
};

const roomResultsPersistedSlice = createSlice({
  name: "roomResultsPersisted",
  initialState,
  reducers: {
    setPersistedRoomResultsState: (
      state,
      action: PayloadAction<{ tenantName: string; value: RoomResultsStoredState }>,
    ) => {
      const { tenantName, value } = action.payload;

      if (!tenantName) {
        return;
      }

      state.byTenantName[tenantName] = value;
    },
  },
});

export const { setPersistedRoomResultsState } = roomResultsPersistedSlice.actions;

export const selectPersistedRoomResultsState = (
  state: { roomResultsPersisted: RoomResultsPersistedState },
  tenantName: string,
) => state.roomResultsPersisted.byTenantName[tenantName] ?? null;

export default roomResultsPersistedSlice.reducer;
