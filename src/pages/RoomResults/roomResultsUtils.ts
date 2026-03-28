import type { RoomFilterGroup, SelectedFilters } from "../../components/Filters/Filter";
import type { SearchRoomsAppliedFilter, SearchRoomFilter } from "../../features/roomCard/RoomType";

export const bookingSteps = [
  "1: Choose room",
  "2: Choose add on",
  "3: Checkout",
];

export const itemsPerPage = 3;
export const defaultSortField = "price";
export const defaultSortDirection: "ASC" | "DESC" = "ASC";

export type RangeFilterBounds = Record<string, { minValue: number; maxValue: number }>;

export const formatFilterName = (value: string) =>
  value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());

export const getSortConfig = (sortField: string, sortDirection: "ASC" | "DESC") => {
  switch (sortField) {
    case "occupancy":
      return { sortBy: "OCCUPANCY", sortDirection };
    case "availableCount":
      return { sortBy: "AVAILABLE_COUNT", sortDirection };
    case "area":
      return { sortBy: "AREA", sortDirection };
    case "price":
    default:
      return { sortBy: "TOTAL_PRICE", sortDirection };
  }
};

export const parseSortFieldParam = (value: string | null) =>
  value && ["price", "occupancy", "availableCount", "area"].includes(value)
    ? value
    : defaultSortField;

export const parseSortDirectionParam = (value: string | null): "ASC" | "DESC" =>
  value === "DESC" ? "DESC" : defaultSortDirection;

export const parsePageParam = (value: string | null) => {
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return 1;
  }

  return Math.trunc(parsedValue);
};

export const parseSelectedFiltersParam = (value: string | null): SelectedFilters => {
  if (!value) {
    return {};
  }

  try {
    const parsedValue: unknown = JSON.parse(value);
    if (!parsedValue || typeof parsedValue !== "object" || Array.isArray(parsedValue)) {
      return {};
    }

    return Object.entries(parsedValue).reduce<SelectedFilters>((acc, [filterId, filterValue]) => {
      if (!filterValue || typeof filterValue !== "object" || Array.isArray(filterValue)) {
        return acc;
      }

      const nextFilter = filterValue as {
        selectedValues?: unknown;
        minValue?: unknown;
        maxValue?: unknown;
      };

      const selectedValues = Array.isArray(nextFilter.selectedValues)
        ? nextFilter.selectedValues.filter((item): item is string => typeof item === "string")
        : undefined;
      const minValue = typeof nextFilter.minValue === "number" ? nextFilter.minValue : undefined;
      const maxValue = typeof nextFilter.maxValue === "number" ? nextFilter.maxValue : undefined;

      if (!selectedValues?.length && minValue === undefined && maxValue === undefined) {
        return acc;
      }

      acc[filterId] = {
        ...(selectedValues?.length ? { selectedValues } : {}),
        ...(minValue !== undefined ? { minValue } : {}),
        ...(maxValue !== undefined ? { maxValue } : {}),
      };

      return acc;
    }, {});
  } catch {
    return {};
  }
};

export const serializeSelectedFiltersParam = (selectedFilters: SelectedFilters) => {
  if (!Object.keys(selectedFilters).length) {
    return null;
  }

  return JSON.stringify(selectedFilters);
};

export const formatOccupancy = (minOcc: number | null | undefined, maxOcc: number | null | undefined) => {
  if (typeof minOcc === "number" && typeof maxOcc === "number") {
    return minOcc === maxOcc ? `${maxOcc} guest${maxOcc === 1 ? "" : "s"}` : `${minOcc}-${maxOcc} guests`;
  }

  if (typeof maxOcc === "number") {
    return `Up to ${maxOcc} guests`;
  }

  if (typeof minOcc === "number") {
    return `From ${minOcc} guest${minOcc === 1 ? "" : "s"}`;
  }

  return "Occupancy unavailable";
};

export const buildRangeFilterBounds = (
  filters: SearchRoomFilter[],
  selectedFilters: SelectedFilters,
): RangeFilterBounds => {
  const nextBounds: RangeFilterBounds = {};

  filters.forEach((filter) => {
    if (filter.filterType !== "RANGE") {
      return;
    }

    const apiMinValue = filter.minValue ?? 0;
    const apiMaxValue = filter.maxValue ?? 0;
    const selectedMinValue = selectedFilters[filter.filterKey]?.minValue;
    const selectedMaxValue = selectedFilters[filter.filterKey]?.maxValue;

    nextBounds[filter.filterKey] = {
      minValue: Math.min(apiMinValue, selectedMinValue ?? apiMinValue),
      maxValue: Math.max(apiMaxValue, selectedMaxValue ?? apiMaxValue),
    };
  });

  return nextBounds;
};

export const buildRoomFilterGroups = (
  filters: SearchRoomFilter[],
  selectedFilters: SelectedFilters,
  rangeFilterBounds?: RangeFilterBounds,
): RoomFilterGroup[] => {
  const resolvedRangeBounds = rangeFilterBounds ?? buildRangeFilterBounds(filters, selectedFilters);

  return filters.map((filter) => {
    const bounds = resolvedRangeBounds[filter.filterKey];

    return {
      filterId: filter.filterKey,
      filterName: formatFilterName(filter.filterKey),
      filterType: filter.filterType === "RANGE" ? "range" : "checkbox",
      options: filter.options.map((option) => ({
        optionId: `${filter.filterKey}-${option.value}`,
        value: option.value,
        label: `${option.value} (${option.count})`,
      })),
      rangeMin: bounds?.minValue ?? filter.minValue ?? undefined,
      rangeMax: bounds?.maxValue ?? filter.maxValue ?? undefined,
      minValue: selectedFilters[filter.filterKey]?.minValue,
      maxValue: selectedFilters[filter.filterKey]?.maxValue,
    };
  });
};

export const buildAppliedRoomFilters = (
  selectedFilters: SelectedFilters,
): SearchRoomsAppliedFilter[] =>
  Object.entries(selectedFilters).reduce<SearchRoomsAppliedFilter[]>(
    (appliedFilters, [filterName, filterValue]) => {
      const selectedValues = filterValue.selectedValues?.filter(Boolean);
      const hasRange =
        typeof filterValue.minValue === "number" || typeof filterValue.maxValue === "number";

      if (selectedValues?.length) {
        appliedFilters.push({
          filterName,
          options: selectedValues,
        });
        return appliedFilters;
      }

      if (hasRange) {
        appliedFilters.push({
          filterName,
          minValue: filterValue.minValue,
          maxValue: filterValue.maxValue,
        });
      }

      return appliedFilters;
    },
    [],
  );
