import reducer, {
  applyPromoCode,
  clearAppliedPromo,
  clearPricing,
  fetchRoomDeals,
} from "./dealSlice";

describe("dealSlice", () => {
  it("returns the initial state", () => {
    expect(reducer(undefined, { type: "unknown" })).toEqual({
      pricing: null,
      appliedPromo: null,
      loading: false,
      promoLoading: false,
      error: null,
      promoError: null,
    });
  });

  it("clears pricing and promo state", () => {
    const stateWithData = {
      pricing: {
        standardRate: {
          title: "Standard",
          description: "Comfortable stay",
          totalPrice: 185,
        },
        deals: [],
      },
      appliedPromo: {
        promotionId: "promo-1",
        promoCodeId: "code-1",
        title: "Save 10",
        description: "Promo",
        totalPrice: 175,
        originalPrice: 185,
        discountAmount: 10,
        promotionType: "PROMO",
      },
      loading: true,
      promoLoading: true,
      error: "fetch failed",
      promoError: "promo failed",
    };

    expect(reducer(stateWithData, clearPricing())).toMatchObject({
      pricing: null,
      loading: false,
      error: null,
    });
    expect(reducer(stateWithData, clearAppliedPromo())).toMatchObject({
      appliedPromo: null,
      promoLoading: false,
      promoError: null,
    });
  });

  it("handles fetchRoomDeals lifecycle", () => {
    const pendingState = reducer(undefined, fetchRoomDeals.pending("request-1", {} as never));
    expect(pendingState.loading).toBe(true);
    expect(pendingState.error).toBeNull();

    const fulfilledState = reducer(
      pendingState,
      fetchRoomDeals.fulfilled(
        {
          standardRate: {
            title: "Standard Rate",
            description: "Stay",
            totalPrice: 185,
          },
          deals: [],
        },
        "request-1",
        {} as never,
      ),
    );
    expect(fulfilledState.loading).toBe(false);
    expect(fulfilledState.pricing).toEqual({
      standardRate: {
        title: "Standard Rate",
        description: "Stay",
        totalPrice: 185,
      },
      deals: [],
    });

    const rejectedState = reducer(
      pendingState,
      fetchRoomDeals.rejected(new Error("fetch failed"), "request-1", {} as never),
    );
    expect(rejectedState.loading).toBe(false);
    expect(rejectedState.error).toBe("fetch failed");
  });

  it("handles applyPromoCode lifecycle", () => {
    const pendingState = reducer(undefined, applyPromoCode.pending("request-2", {} as never));
    expect(pendingState.promoLoading).toBe(true);
    expect(pendingState.promoError).toBeNull();

    const fulfilledState = reducer(
      pendingState,
      applyPromoCode.fulfilled(
        {
          promotionId: "promo-1",
          promoCodeId: "code-1",
          title: "Save 10",
          description: "Promo",
          totalPrice: 175,
          originalPrice: 185,
          discountAmount: 10,
          promotionType: "PROMO",
        },
        "request-2",
        {} as never,
      ),
    );
    expect(fulfilledState.promoLoading).toBe(false);
    expect(fulfilledState.appliedPromo?.title).toBe("Save 10");

    const rejectedState = reducer(
      pendingState,
      applyPromoCode.rejected(new Error("promo failed"), "request-2", {} as never),
    );
    expect(rejectedState.promoLoading).toBe(false);
    expect(rejectedState.promoError).toBe("promo failed");
  });
});
