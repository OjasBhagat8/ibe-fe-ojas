import reducer, { clearRooms, fetchSearchRooms, setActiveStep } from "./roomResultSlice";

describe("roomResultSlice", () => {
  it("returns the initial state", () => {
    expect(reducer(undefined, { type: "unknown" })).toEqual({
      data: [],
      filters: [],
      loading: false,
      error: null,
      StepperActiveState: 0,
      page: 0,
      size: 0,
      totalItems: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    });
  });

  it("handles clearRooms and setActiveStep", () => {
    const steppedState = reducer(undefined, setActiveStep(2));
    expect(steppedState.StepperActiveState).toBe(2);

    const clearedState = reducer(
      {
        ...steppedState,
        data: [
          {
            roomTypeId: "room-1",
            roomTypeName: "Deluxe",
            description: "Nice room",
            occupancy: 2,
            amenities: [],
            images: [],
            baseRate: 100,
            totalPrice: 150,
            availableCount: 3,
            roomSpec: null,
          },
        ],
      },
      clearRooms(),
    );

    expect(clearedState).toMatchObject({
      data: [],
      loading: false,
      error: null,
    });
  });

  it("handles fetchSearchRooms lifecycle", () => {
    const pendingState = reducer(undefined, fetchSearchRooms.pending("request-1", {} as never));
    expect(pendingState.loading).toBe(true);
    expect(pendingState.error).toBeNull();

    const fulfilledState = reducer(
      pendingState,
      fetchSearchRooms.fulfilled(
        {
          items: [
            {
              roomTypeId: "room-1",
              roomTypeName: "Deluxe",
              description: "Nice room",
              occupancy: 2,
              amenities: [],
              images: [],
              baseRate: 100,
              totalPrice: 150,
              availableCount: 3,
              roomSpec: null,
            },
          ],
          filters: [
            {
              filterKey: "bedType",
              filterType: "CHECKBOX",
              options: [],
              minValue: null,
              maxValue: null,
            },
          ],
          page: 1,
          size: 3,
          totalItems: 10,
          totalPages: 4,
          hasNext: true,
          hasPrevious: false,
        },
        "request-1",
        {} as never,
      ),
    );

    expect(fulfilledState).toMatchObject({
      loading: false,
      page: 1,
      size: 3,
      totalItems: 10,
      totalPages: 4,
      hasNext: true,
      hasPrevious: false,
    });
    expect(fulfilledState.data).toHaveLength(1);

    const rejectedState = reducer(
      pendingState,
      fetchSearchRooms.rejected(new Error("rooms failed"), "request-1", {} as never),
    );
    expect(rejectedState.loading).toBe(false);
    expect(rejectedState.error).toBe("rooms failed");
  });
});
