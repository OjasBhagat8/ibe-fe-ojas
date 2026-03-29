import {
  buildBookingSearchParams,
  buildDefaultGuestCounts,
  clampNumber,
  getGuestTypeParamKey,
  getGuestTypes,
  normalizeGuestCounts,
  parseBooleanParam,
  parseDateParam,
  parseGuestCountsFromSearchParams,
  parseGuestCountsParam,
  serializeDateParam,
} from "./searchQueryParams";
import type { Property } from "../tenant/tenantTypes";

const property: Property = {
  propertyId: "property-1",
  propertyName: "Demo Property",
  guestAllowed: 2,
  roomCount: 10,
  guestTypes: [
    { guestTypeId: "adult", guestTypeName: "Adult", minAge: 18, maxAge: 120 },
    { guestTypeId: "child", guestTypeName: "Child", minAge: 2, maxAge: 17 },
  ],
};

describe("searchQueryParams", () => {
  it("returns fallback guest types and defaults when property is missing", () => {
    expect(getGuestTypes(undefined)).toEqual([
      expect.objectContaining({ guestTypeId: "adults", guestTypeName: "Adults" }),
    ]);
    expect(buildDefaultGuestCounts(undefined)).toEqual({ adults: 1 });
  });

  it("builds property-aware default guest counts", () => {
    expect(buildDefaultGuestCounts(property)).toEqual({ adult: 1, child: 0 });
  });

  it("parses and serializes dates safely", () => {
    const parsed = parseDateParam("2026-03-15");

    expect(parsed).toBeInstanceOf(Date);
    expect(serializeDateParam(parsed)).toBe("2026-03-15");
    expect(parseDateParam("bad-date")).toBeNull();
    expect(serializeDateParam(null)).toBeNull();
  });

  it("parses booleans and clamps numbers", () => {
    expect(parseBooleanParam("true")).toBe(true);
    expect(parseBooleanParam("false")).toBe(false);
    expect(clampNumber("4.8", 1, 3)).toBe(3);
    expect(clampNumber("-5", 1, 3)).toBe(1);
    expect(clampNumber("oops", 1, 3)).toBe(1);
  });

  it("generates stable guest-type param keys", () => {
    expect(
      getGuestTypeParamKey({
        guestTypeId: "youngAdult",
        guestTypeName: "Young Adults 18+",
        minAge: 18,
        maxAge: 25,
      }),
    ).toBe("young-adults-18");
  });

  it("parses aggregate guest counts and ignores invalid entries", () => {
    expect(parseGuestCountsParam("adult:2,child:1,broken:text,negative:-1")).toEqual({
      adult: 2,
      child: 1,
    });
    expect(parseGuestCountsParam(null)).toEqual({});
  });

  it("prefers dedicated guest params over aggregate guest params", () => {
    const params = new URLSearchParams("adult=2&child=1&guests=adult:4,child:4");

    expect(parseGuestCountsFromSearchParams(params, property)).toEqual({
      adult: 2,
      child: 1,
    });
  });

  it("falls back to aggregate guest params when dedicated params are absent", () => {
    const params = new URLSearchParams("guests=adult:2,child:1");

    expect(parseGuestCountsFromSearchParams(params, property)).toEqual({
      adult: 2,
      child: 1,
    });
  });

  it("normalizes guest counts to fit room capacity and restores defaults when empty", () => {
    expect(normalizeGuestCounts({ adult: 2, child: 2 }, property, 1)).toEqual({
      adult: 2,
      child: 0,
    });

    expect(normalizeGuestCounts({ adult: 0, child: 0 }, property, 1)).toEqual({
      adult: 1,
      child: 0,
    });
  });

  it("builds booking search params from state", () => {
    const params = buildBookingSearchParams({
      property,
      propertyId: "property-1",
      checkIn: new Date("2026-04-01T00:00:00.000Z"),
      checkOut: new Date("2026-04-05T00:00:00.000Z"),
      rooms: 2,
      accessible: true,
      guestCounts: { adult: 2, child: 1 },
    });

    expect(params.get("propertyId")).toBe("property-1");
    expect(params.get("rooms")).toBe("2");
    expect(params.get("checkIn")).toBe("2026-04-01");
    expect(params.get("checkOut")).toBe("2026-04-05");
    expect(params.get("adult")).toBe("2");
    expect(params.get("child")).toBe("1");
    expect(params.get("accessible")).toBe("true");
  });
});
