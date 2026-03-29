import { createSlice} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface SearchState {
  TenantId: string | null;
  PropertyId: string | null;
  guest: Guests[] | null;
  rooms: number | null;
  isAccessible: boolean;
  checkIn: string | null;
  checkOut: string | null;
}

interface Guests{
  GuestTypeName: string;
  minAge: number;
  maxAge:number;
  count: number;
}

const initialState: SearchState = {
  TenantId: null,
  PropertyId: null,
  guest: null,
  rooms:1,
  isAccessible:false,
  checkIn: null,
  checkOut: null
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setDates: (
      state,
      action: PayloadAction<{ checkIn: string; checkOut: string }>
    ) => {
      state.checkIn = action.payload.checkIn;
      state.checkOut = action.payload.checkOut;
    },
    setTenantId: (state, action: PayloadAction<string>) => {
      state.TenantId = action.payload;
    },

    setPropertyId: (state, action: PayloadAction<string>) => {
      state.PropertyId = action.payload;
    },

    setGuests: (state, action: PayloadAction<Guests[]>) => {
      state.guest = action.payload;
    },

    setRooms: (state, action: PayloadAction<number>) => {
      state.rooms = action.payload;
    },

    setAccessibility: (state, action: PayloadAction<boolean>) => {
      state.isAccessible = action.payload;
    }
  }

});

export const { setDates,
                setTenantId,
                setPropertyId,
                setGuests,
                setRooms,
                setAccessibility
 } = searchSlice.actions;

export default searchSlice.reducer;