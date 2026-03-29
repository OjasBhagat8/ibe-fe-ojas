import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import type { SelectChangeEvent } from "@mui/material/Select";
import type { SelectedFilters } from "../../components/Filters/Filter";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchCalendarPriceMap } from "../../features/calendar/calendarApi";
import { fetchSearchRooms } from "../../features/roomCard/roomResultSlice";
import { selectRoomFilters, selectRoomsLoading } from "../../features/roomCard/roomSelectors";
import {
  setAccessibility,
  setDates,
  setGuests,
  setPropertyId,
  setRooms,
  setTenantId,
} from "../../features/search/searchSlice";
import {
  buildBookingSearchParams,
  clampNumber,
  getGuestTypes,
  normalizeGuestCounts,
  parseBooleanParam,
  parseDateParam,
  serializeDateParam,
  parseGuestCountsFromSearchParams,
} from "../../features/search/searchQueryParams";
import { selectTenantData } from "../../features/tenant/tenantSelectors";
import {
  buildAppliedRoomFilters,
  buildRangeFilterBounds,
  buildRoomFilterGroups,
  defaultSortDirection,
  defaultSortField,
  getSortConfig,
  itemsPerPage,
  parsePageParam,
  type RangeFilterBounds,
  parseSelectedFiltersParam,
  parseSortDirectionParam,
  parseSortFieldParam,
  serializeSelectedFiltersParam,
} from "./roomResultsUtils";
import {
  selectPersistedRoomResultsState,
  setPersistedRoomResultsState,
} from "../../features/roomResultsPersisted/roomResultsPersistedSlice";

export const useRoomResultsPageState = () => {
  const dispatch = useAppDispatch();
  const tenantData = useAppSelector(selectTenantData);
  const roomFilters = useAppSelector(selectRoomFilters);
  const roomsLoading = useAppSelector(selectRoomsLoading);
  const { tenantName = "" } = useParams<{ tenantName: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const persistedState = useAppSelector((state) =>
    selectPersistedRoomResultsState(state, tenantName),
  );
  const shouldAutoFetchInitiallyRef = useRef(
    searchParams.toString().length > 0 || Boolean(persistedState?.query),
  );
  const hasRunInitialSearchRef = useRef(false);
  const hasUrlQueryParams = searchParams.toString().length > 0;
  const shouldHydrateFromCache = !hasUrlQueryParams;
  const mergedSearchParams = useMemo(() => {
    const nextParams = new URLSearchParams(searchParams);

    if (!shouldHydrateFromCache || !persistedState?.query) {
      return nextParams;
    }

    const persistedParams = new URLSearchParams(persistedState.query);
    persistedParams.forEach((value, key) => {
      if (!nextParams.has(key) || !nextParams.get(key)) {
        nextParams.set(key, value);
      }
    });

    return nextParams;
  }, [persistedState?.query, searchParams, shouldHydrateFromCache]);
  const parsedSelectedFilters = useMemo(
    () => parseSelectedFiltersParam(mergedSearchParams.get("filters")),
    [mergedSearchParams],
  );
  const parsedPage = parsePageParam(mergedSearchParams.get("page"));
  const parsedSortField = parseSortFieldParam(mergedSearchParams.get("sortField"));
  const parsedSortDirection = parseSortDirectionParam(mergedSearchParams.get("sortDirection"));
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(
    () => (Object.keys(parsedSelectedFilters).length ? parsedSelectedFilters : (shouldHydrateFromCache ? (persistedState?.selectedFilters ?? {}) : {})),
  );
  const [page, setPage] = useState(() => (mergedSearchParams.get("page") ? parsedPage : (shouldHydrateFromCache ? (persistedState?.page ?? 1) : 1)));
  const [sortField, setSortField] = useState(() => (
    mergedSearchParams.get("sortField")
      ? parsedSortField
      : (shouldHydrateFromCache ? (persistedState?.sortField ?? defaultSortField) : defaultSortField)
  ));
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">(
    () => (
      mergedSearchParams.get("sortDirection")
        ? parsedSortDirection
        : (shouldHydrateFromCache ? (persistedState?.sortDirection ?? defaultSortDirection) : defaultSortDirection)
    ),
  );
  const [calendarPriceByDate, setCalendarPriceByDate] = useState<Record<string, number>>({});
  const [stableRangeBounds, setStableRangeBounds] = useState<RangeFilterBounds>({});

  const tenantId = tenantData?.tenantId ?? "";
  const requestedPropertyId = mergedSearchParams.get("propertyId");
  const propertyId = tenantData?.properties.some((property) => property.propertyId === requestedPropertyId)
    ? requestedPropertyId ?? ""
    : "";
  const selectedProperty = tenantData?.properties.find((property) => property.propertyId === propertyId) ?? null;
  const roomCount = selectedProperty?.roomCount ?? 1;
  const parsedCheckIn = parseDateParam(mergedSearchParams.get("checkIn"));
  const parsedCheckOut = parseDateParam(mergedSearchParams.get("checkOut"));
  const checkIn = serializeDateParam(parsedCheckIn) ?? "";
  const checkOut = serializeDateParam(parsedCheckOut) ?? "";
  const rooms = clampNumber(mergedSearchParams.get("rooms"), 1, Math.max(roomCount, 1));
  const accessible = parseBooleanParam(mergedSearchParams.get("accessible"));
  const guestCounts = normalizeGuestCounts(
    parseGuestCountsFromSearchParams(mergedSearchParams, selectedProperty),
    selectedProperty,
    rooms,
  );
  const guestTypes = getGuestTypes(selectedProperty).map((guestType) => ({
    id: guestType.guestTypeId,
    type: guestType.guestTypeName,
    min: guestType.minAge,
    max: guestType.maxAge,
    count: guestCounts[guestType.guestTypeId] ?? 0,
  }));
  const roomOptions = Array.from({ length: roomCount }, (_, index) => `${index + 1}`);
  const maxGuestsPerRoom = selectedProperty?.guestAllowed ?? 1;
  const maxGuests = maxGuestsPerRoom * rooms;
  const calendarEntries = (!tenantId || !propertyId)
    ? []
    : Object.entries(calendarPriceByDate).map(([date, price]) => ({
        date,
        minNightlyRate: price,
      }));
  const filterGroups = buildRoomFilterGroups(roomFilters, selectedFilters, stableRangeBounds);
  const searchParamsSnapshot = mergedSearchParams.toString();
  const serializedSelectedFilters = useMemo(
    () => serializeSelectedFiltersParam(selectedFilters),
    [selectedFilters],
  );
  const persistedQuery = useMemo(() => {
    const nextParams = buildBookingSearchParams({
      property: selectedProperty,
      propertyId,
      checkIn: parsedCheckIn,
      checkOut: parsedCheckOut,
      rooms,
      accessible,
      guestCounts,
    });

    if (page > 1) {
      nextParams.set("page", String(page));
    }

    if (sortField !== defaultSortField) {
      nextParams.set("sortField", sortField);
    }

    if (sortDirection !== defaultSortDirection) {
      nextParams.set("sortDirection", sortDirection);
    }

    if (serializedSelectedFilters) {
      nextParams.set("filters", serializedSelectedFilters);
    }

    return nextParams.toString();
  }, [
    accessible,
    guestCounts,
    page,
    parsedCheckIn,
    parsedCheckOut,
    propertyId,
    rooms,
    selectedProperty,
    serializedSelectedFilters,
    sortDirection,
    sortField,
  ]);

  const updateBookingParams = (overrides: {
    accessible?: boolean;
    checkIn?: Date | null;
    checkOut?: Date | null;
    page?: number;
    selectedFilters?: SelectedFilters;
    sortDirection?: "ASC" | "DESC";
    sortField?: string;
    guestCounts?: Record<string, number>;
    rooms?: number;
  }) => {
    const nextParams = buildBookingSearchParams({
      property: selectedProperty,
      propertyId,
      checkIn: overrides.checkIn === undefined ? parsedCheckIn : overrides.checkIn,
      checkOut: overrides.checkOut === undefined ? parsedCheckOut : overrides.checkOut,
      rooms: overrides.rooms ?? rooms,
      accessible: overrides.accessible ?? accessible,
      guestCounts: overrides.guestCounts ?? guestCounts,
    });
    const nextPage = overrides.page ?? page;
    const nextSortField = overrides.sortField ?? sortField;
    const nextSortDirection = overrides.sortDirection ?? sortDirection;
    const nextSelectedFilters = overrides.selectedFilters ?? selectedFilters;
    const serializedFilters = serializeSelectedFiltersParam(nextSelectedFilters);

    if (nextPage > 1) {
      nextParams.set("page", String(nextPage));
    }

    if (nextSortField !== defaultSortField) {
      nextParams.set("sortField", nextSortField);
    }

    if (nextSortDirection !== defaultSortDirection) {
      nextParams.set("sortDirection", nextSortDirection);
    }

    if (serializedFilters) {
      nextParams.set("filters", serializedFilters);
    }

    setSearchParams(nextParams, { replace: true });
  };

  const runRoomSearch = (overrides?: {
    page?: number;
    sortDirection?: "ASC" | "DESC";
    sortField?: string;
    selectedFilters?: SelectedFilters;
  }) => {
    if (!tenantId || !propertyId || !checkIn || !checkOut) {
      return;
    }

    const nextPage = overrides?.page ?? page;
    const nextSortField = overrides?.sortField ?? sortField;
    const nextSortDirectionState = overrides?.sortDirection ?? sortDirection;
    const { sortBy, sortDirection: nextSortDirection } = getSortConfig(
      nextSortField,
      nextSortDirectionState,
    );
    const appliedFilters = buildAppliedRoomFilters(overrides?.selectedFilters ?? selectedFilters);

    dispatch(
      fetchSearchRooms({
        tenantId,
        propertyId,
        checkIn,
        checkOut,
        rooms,
        accessible,
        sortBy,
        sortDirection: nextSortDirection,
        filters: appliedFilters,
        page: nextPage - 1,
        size: itemsPerPage,
      }),
    );
  };

  useEffect(() => {
    const nextBounds = buildRangeFilterBounds(roomFilters, {});

    setStableRangeBounds((previousBounds) => {
      if (!Object.keys(nextBounds).length) {
        return previousBounds;
      }

      const mergedBounds = { ...previousBounds };

      Object.entries(nextBounds).forEach(([filterKey, bounds]) => {
        const currentBounds = previousBounds[filterKey];

        mergedBounds[filterKey] = currentBounds
          ? {
              minValue: Math.min(currentBounds.minValue, bounds.minValue),
              maxValue: Math.max(currentBounds.maxValue, bounds.maxValue),
            }
          : bounds;
      });

      return mergedBounds;
    });
  }, [roomFilters]);

  useEffect(() => {
    if (
      persistedState?.query === persistedQuery
      && persistedState.page === page
      && persistedState.sortField === sortField
      && persistedState.sortDirection === sortDirection
      && serializeSelectedFiltersParam(persistedState.selectedFilters) === serializedSelectedFilters
    ) {
      return;
    }

    dispatch(setPersistedRoomResultsState({
      tenantName,
      value: {
        query: persistedQuery,
        page,
        sortField,
        sortDirection,
        selectedFilters,
      },
    }));
  }, [
    accessible,
    dispatch,
    guestCounts,
    page,
    parsedCheckIn,
    parsedCheckOut,
    persistedQuery,
    persistedState,
    propertyId,
    rooms,
    serializedSelectedFilters,
    sortDirection,
    sortField,
    tenantName,
  ]);

  useEffect(() => {
    dispatch(setTenantId(tenantId));
    dispatch(setPropertyId(propertyId));
    dispatch(setRooms(rooms));
    dispatch(setAccessibility(accessible));
    dispatch(setDates({ checkIn, checkOut }));
    dispatch(
      setGuests(
        getGuestTypes(selectedProperty).map((guestType) => ({
          GuestTypeName: guestType.guestTypeName,
          minAge: guestType.minAge,
          maxAge: guestType.maxAge ?? guestType.minAge,
          count: guestCounts[guestType.guestTypeId] ?? 0,
        })),
      ),
    );
  }, [
    accessible,
    checkIn,
    checkOut,
    dispatch,
    guestCounts,
    propertyId,
    rooms,
    searchParamsSnapshot,
    selectedProperty,
    tenantId,
  ]);

  useEffect(() => {
    if (
      hasRunInitialSearchRef.current
      || !shouldAutoFetchInitiallyRef.current
      || !tenantId
      || !propertyId
      || !checkIn
      || !checkOut
    ) {
      return;
    }

    hasRunInitialSearchRef.current = true;
    runRoomSearch();
  }, [checkIn, checkOut, propertyId, tenantId, runRoomSearch]);

  useEffect(() => {
    if (!tenantId || !propertyId) {
      return;
    }

    const controller = new AbortController();

    fetchCalendarPriceMap(tenantId, propertyId, controller.signal)
      .then((prices) => {
        setCalendarPriceByDate(prices);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setCalendarPriceByDate({});
      });

    return () => controller.abort();
  }, [propertyId, tenantId]);

  const handleApplyFilters = (nextFilters: SelectedFilters) => {
    setPage(1);
    setSelectedFilters(nextFilters);
    updateBookingParams({ page: 1, selectedFilters: nextFilters });
    runRoomSearch({ page: 1, selectedFilters: nextFilters });
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    const nextSortField = event.target.value;
    setPage(1);
    setSortField(nextSortField);
    updateBookingParams({ page: 1, sortField: nextSortField });
    runRoomSearch({ page: 1, sortField: nextSortField });
  };

  const handleSortDirectionToggle = () => {
    const nextSortDirection = sortDirection === "ASC" ? "DESC" : "ASC";
    setPage(1);
    setSortDirection(nextSortDirection);
    updateBookingParams({ page: 1, sortDirection: nextSortDirection });
    runRoomSearch({ page: 1, sortDirection: nextSortDirection });
  };

  const handleRoomChange = (value: string) => {
    setPage(1);
    updateBookingParams({ rooms: Number(value), page: 1 });
  };

  const handleGuestChange = (type: string, nextCount: number) => {
    const targetGuestType = guestTypes.find((guestType) => guestType.type === type);
    if (!targetGuestType) {
      return;
    }

    updateBookingParams({
      page: 1,
      guestCounts: {
        ...guestCounts,
        [targetGuestType.id]: nextCount,
      },
    });
  };

  const handleDatesChange = (start: Date | null, end: Date | null) => {
    setPage(1);
    updateBookingParams({ checkIn: start, checkOut: end, page: 1 });
  };

  const handlePageChange = (_event: ChangeEvent<unknown>, value: number) => {
    setPage(value);
    updateBookingParams({ page: value });
    runRoomSearch({ page: value });
  };

  return {
    calendarEntries,
    checkIn,
    checkOut,
    filterGroups,
    guestTypes,
    handleApplyFilters,
    handleDatesChange,
    handleGuestChange,
    handlePageChange,
    handleRoomChange,
    handleSortChange,
    handleSortDirectionToggle,
    maxGuests,
    page,
    parsedCheckIn,
    parsedCheckOut,
    propertyId,
    roomOptions,
    rooms,
    roomsLoading,
    runRoomSearch,
    selectedFilters,
    selectedProperty,
    sortDirection,
    sortField,
    tenantId,
  };
};
