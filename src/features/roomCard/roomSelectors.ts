import type { RootState } from "../../app/store";

export const selectActiveStep = (state: RootState) => state.rooms.StepperActiveState;
export const selectRoomResults = (state: RootState) => state.rooms.data;
export const selectRoomFilters = (state: RootState) => state.rooms.filters;
export const selectRoomsLoading = (state: RootState) => state.rooms.loading;
export const selectRoomsError = (state: RootState) => state.rooms.error;
export const selectRoomsSize = (state: RootState) => state.rooms.size;
export const selectRoomsTotalItems = (state: RootState) => state.rooms.totalItems;
export const selectRoomsTotalPages = (state: RootState) => state.rooms.totalPages;
