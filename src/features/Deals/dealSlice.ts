import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  AppliedPromoCode,
  ApplyPromoCodeResponse,
  PromoCodeApplyInput,
  RoomDealsInput,
  RoomDeals,
  RoomDealsResponse,
} from "./DealType";
import { APPLY_PROMO_CODE_QUERY, ROOM_DEALS_QUERY } from "./Query";

interface DealsState {
  pricing: RoomDeals | null;
  appliedPromo: AppliedPromoCode | null;
  dealsCache: Record<string, RoomDeals>;
  loading: boolean;
  promoLoading: boolean;
  error: string | null;
  promoError: string | null;
}

const initialState: DealsState = {
  pricing: null,
  appliedPromo: null,
  dealsCache: {},
  loading: false,
  promoLoading: false,
  error: null,
  promoError: null,
};

const isGraphqlEndpoint = (url: string) => {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.pathname.toLowerCase().includes("graphql");
  } catch {
    return url.toLowerCase().includes("graphql");
  }
};

const getGraphqlUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL?.trim() || configuredUrl;

  if (!graphqlUrl) {
    throw new Error("Deals endpoint is not configured");
  }

  if (!isGraphqlEndpoint(graphqlUrl)) {
    throw new Error("Configured deals endpoint is not a GraphQL endpoint");
  }

  return graphqlUrl;
};

const buildGuestSelectionKey = (guestSelections: RoomDealsInput["guestSelections"]) =>
  [...guestSelections]
    .sort((a, b) => a.guestTypeName.localeCompare(b.guestTypeName))
    .map((guest) => `${guest.guestTypeName}:${guest.count}`)
    .join(",");

export const buildRoomDealsCacheKey = (input: RoomDealsInput) =>
  [
    input.roomTypeId,
    input.propertyId,
    input.checkIn,
    input.checkOut,
    input.rooms,
    buildGuestSelectionKey(input.guestSelections),
  ].join("|");

export const fetchRoomDeals = createAsyncThunk(
  "deals/fetchRoomDeals",
  async (input: RoomDealsInput) => {
    const cacheKey = buildRoomDealsCacheKey(input);
    const response = await fetch(getGraphqlUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: ROOM_DEALS_QUERY,
        variables: {
          input,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch room deals");
    }

    const payload = (await response.json()) as RoomDealsResponse;

    if (payload.errors?.length) {
      throw new Error(payload.errors[0]?.message ?? "Failed to fetch room deals");
    }

    const pricing = payload.data?.roomDeals;
    if (!pricing) {
      throw new Error("Invalid backend response: missing roomDeals");
    }

    return { pricing, cacheKey };
  }
);

export const applyPromoCode = createAsyncThunk(
  "deals/applyPromoCode",
  async (input: PromoCodeApplyInput) => {
    const response = await fetch(getGraphqlUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: APPLY_PROMO_CODE_QUERY,
        variables: {
          input,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to apply promo code");
    }

    const payload = (await response.json()) as ApplyPromoCodeResponse;

    if (payload.errors?.length) {
      throw new Error(payload.errors[0]?.message ?? "Failed to apply promo code");
    }

    const promo = payload.data?.applyPromoCode;
    if (!promo) {
      throw new Error("Invalid backend response: missing applyPromoCode");
    }

    return promo;
  }
);

const dealsSlice = createSlice({
  name: "deals",
  initialState,
  reducers: {
    clearPricing: (state) => {
      state.pricing = null;
      state.loading = false;
      state.error = null;
    },
    setPricingFromCache: (state, action) => {
      state.pricing = action.payload;
      state.loading = false;
      state.error = null;
    },
    clearAppliedPromo: (state) => {
      state.appliedPromo = null;
      state.promoLoading = false;
      state.promoError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoomDeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoomDeals.fulfilled, (state, action) => {
        state.loading = false;
        state.pricing = action.payload.pricing;
        state.dealsCache[action.payload.cacheKey] = action.payload.pricing;
      })
      .addCase(fetchRoomDeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Unknown error";
      })
      .addCase(applyPromoCode.pending, (state) => {
        state.promoLoading = true;
        state.promoError = null;
      })
      .addCase(applyPromoCode.fulfilled, (state, action) => {
        state.promoLoading = false;
        state.appliedPromo = action.payload;
      })
      .addCase(applyPromoCode.rejected, (state, action) => {
        state.promoLoading = false;
        state.promoError = action.error.message ?? "Unknown error";
      });
  },
});

export const { clearPricing, clearAppliedPromo, setPricingFromCache } = dealsSlice.actions;
export default dealsSlice.reducer;
