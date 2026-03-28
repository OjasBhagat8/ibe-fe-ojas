import {
  buildAppliedRoomFilters,
  buildRangeFilterBounds,
  buildRoomFilterGroups,
  defaultSortDirection,
  defaultSortField,
  formatFilterName,
  formatOccupancy,
  getSortConfig,
  parsePageParam,
  parseSelectedFiltersParam,
  parseSortDirectionParam,
  parseSortFieldParam,
  serializeSelectedFiltersParam,
} from "./roomResultsUtils";
import type { SearchRoomFilter } from "../../features/roomCard/RoomType";

const filters: SearchRoomFilter[] = [
  {
    filterKey: "bedType",
    filterType: "CHECKBOX",
    options: [
      { value: "King", count: 2 },
      { value: "Twin", count: 1 },
    ],
    minValue: null,
    maxValue: null,
  },
  {
    filterKey: "price",
    filterType: "RANGE",
    options: [],
    minValue: 100,
    maxValue: 400,
  },
];

describe("roomResultsUtils", () => {
  it("formats filter names and builds sort config", () => {
    expect(formatFilterName("bedType")).toBe("Bed Type");
    expect(getSortConfig("occupancy", "DESC")).toEqual({
      sortBy: "OCCUPANCY",
      sortDirection: "DESC",
    });
    expect(getSortConfig("unknown", "ASC")).toEqual({
      sortBy: "TOTAL_PRICE",
      sortDirection: "ASC",
    });
  });

  it("parses sort and page params with defaults", () => {
    expect(parseSortFieldParam("area")).toBe("area");
    expect(parseSortFieldParam("bad")).toBe(defaultSortField);
    expect(parseSortDirectionParam("DESC")).toBe("DESC");
    expect(parseSortDirectionParam("bad")).toBe(defaultSortDirection);
    expect(parsePageParam("3.9")).toBe(3);
    expect(parsePageParam("0")).toBe(1);
    expect(parsePageParam("nope")).toBe(1);
  });

  it("parses and serializes selected filters safely", () => {
    const parsed = parseSelectedFiltersParam(
      JSON.stringify({
        bedType: { selectedValues: ["King", "Twin"] },
        price: { minValue: 120, maxValue: 320 },
        ignored: "bad",
      }),
    );

    expect(parsed).toEqual({
      bedType: { selectedValues: ["King", "Twin"] },
      price: { minValue: 120, maxValue: 320 },
    });
    expect(parseSelectedFiltersParam("bad-json")).toEqual({});
    expect(serializeSelectedFiltersParam(parsed)).toBe(JSON.stringify(parsed));
    expect(serializeSelectedFiltersParam({})).toBeNull();
  });

  it("formats occupancy output", () => {
    expect(formatOccupancy(1, 1)).toBe("1 guest");
    expect(formatOccupancy(2, 4)).toBe("2-4 guests");
    expect(formatOccupancy(undefined, 3)).toBe("Up to 3 guests");
    expect(formatOccupancy(2, undefined)).toBe("From 2 guests");
    expect(formatOccupancy(undefined, undefined)).toBe("Occupancy unavailable");
  });

  it("builds range bounds and filter groups", () => {
    const selectedFilters = {
      bedType: { selectedValues: ["King"] },
      price: { minValue: 80, maxValue: 420 },
    };

    expect(buildRangeFilterBounds(filters, selectedFilters)).toEqual({
      price: { minValue: 80, maxValue: 420 },
    });

    expect(buildRoomFilterGroups(filters, selectedFilters)).toEqual([
      {
        filterId: "bedType",
        filterName: "Bed Type",
        filterType: "checkbox",
        options: [
          { optionId: "bedType-King", value: "King", label: "King (2)" },
          { optionId: "bedType-Twin", value: "Twin", label: "Twin (1)" },
        ],
        minValue: undefined,
        maxValue: undefined,
      },
      {
        filterId: "price",
        filterName: "Price",
        filterType: "range",
        options: [],
        minValue: 80,
        maxValue: 420,
      },
    ]);
  });

  it("builds applied backend filters from selected filters", () => {
    expect(
      buildAppliedRoomFilters({
        bedType: { selectedValues: ["King"] },
        price: { minValue: 100, maxValue: 250 },
        empty: {},
      }),
    ).toEqual([
      { filterName: "bedType", options: ["King"] },
      { filterName: "price", minValue: 100, maxValue: 250 },
    ]);
  });
});
