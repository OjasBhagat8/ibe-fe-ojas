import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  SearchRoomItem,
  SearchRoomFilter,
  SearchRoomsInput,
  SearchRoomsResponse,
} from "./RoomType";
import { SEARCH_ROOMS_QUERY } from "./Query";

interface RoomState {
  data: SearchRoomItem[];
  filters: SearchRoomFilter[];
  loading: boolean;
  error: string | null;
  StepperActiveState:number;
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

const initialState: RoomState = {
  data: [],
  filters:[],
  loading: false,
  error: null,
  StepperActiveState: 0,
  page: 0,
  size: 0,
  totalItems: 0,
  totalPages: 0,
  hasNext: false,
  hasPrevious: false,
};



const isGraphqlEndpoint = (url: string) => {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.pathname.toLowerCase().includes("graphql");
  } catch {
    return url.toLowerCase().includes("graphql");
  }
};

export const fetchSearchRooms = createAsyncThunk(
  "rooms/fetchSearchRooms",
  async (input: SearchRoomsInput) => {
    const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();
    const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL?.trim() || configuredUrl;

    if (!graphqlUrl) {
      throw new Error("Rooms endpoint is not configured");
    }

    if (!isGraphqlEndpoint(graphqlUrl)) {
      throw new Error("Configured rooms endpoint is not a GraphQL endpoint");
    }

    const response = await fetch(graphqlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: SEARCH_ROOMS_QUERY,
        variables: {
          input,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch room results");
    }

    const payload = (await response.json()) as SearchRoomsResponse;

    if (payload.errors?.length) {
      throw new Error(payload.errors[0]?.message ?? "Failed to fetch room results");
    }

    const searchRooms = payload.data?.searchRooms;
    if (!searchRooms) {
      throw new Error("Invalid backend response: missing searchRooms");
    }

    return searchRooms;
  }
);

const roomSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
    clearRooms: (state) => {
      state.data = [];
      state.loading = false;
      state.error = null;
    },
    setActiveStep:(state,action) =>{
      state.StepperActiveState = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSearchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.items;
        state.filters = action.payload.filters;
        state.page = action.payload.page;
        state.size = action.payload.size;
        state.totalItems = action.payload.totalItems;
        state.totalPages = action.payload.totalPages;
        state.hasNext = action.payload.hasNext;
        state.hasPrevious = action.payload.hasPrevious;
      })
      .addCase(fetchSearchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Unknown error";
      });
  },
});

export const { clearRooms,setActiveStep } = roomSlice.actions;
export default roomSlice.reducer;
