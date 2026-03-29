import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { fetchCalendarPriceMap } from "../../features/calendar/calendarApi";
import {
  buildBookingSearchParams,
  buildDefaultGuestCounts,
  clampNumber,
  getGuestTypes,
  normalizeGuestCounts,
  parseBooleanParam,
  parseDateParam,
  parseGuestCountsFromSearchParams,
} from "../../features/search/searchQueryParams";
import type { TenantConfig } from "../../features/tenant/tenantTypes";

export const useBookingSearchState = (tenant: TenantConfig) => {
  const navigate = useNavigate();
  const { tenantName } = useParams<{ tenantName: string }>();
  const [searchParams] = useSearchParams();
  const [dateError, setDateError] = useState<string | null>(null);
  const [calendarPriceByDate, setCalendarPriceByDate] = useState<Record<string, number>>({});

  const requestedPropertyId = searchParams.get("propertyId");
  const initialSelectedPropertyId = tenant.properties.some(
    (property) => property.propertyId === requestedPropertyId,
  )
    ? requestedPropertyId ?? ""
    : "";
  const initialSelectedProperty = tenant.properties.find(
    (property) => property.propertyId === initialSelectedPropertyId,
  );
  const initialRooms = clampNumber(
    searchParams.get("rooms"),
    1,
    Math.max(initialSelectedProperty?.roomCount ?? 1, 1),
  );
  const initialStartDate = parseDateParam(searchParams.get("checkIn"));
  const initialParsedCheckOut = parseDateParam(searchParams.get("checkOut"));
  const initialEndDate = initialStartDate
    && initialParsedCheckOut
    && initialParsedCheckOut.getTime() >= initialStartDate.getTime()
    ? initialParsedCheckOut
    : null;

  const [selectedPropertyId, setSelectedPropertyId] = useState(initialSelectedPropertyId);
  const selectedProperty = tenant.properties.find(
    (property) => property.propertyId === selectedPropertyId,
  );
  const [rooms, setRooms] = useState(initialRooms);
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate);
  const [accessibleRoom, setAccessibleRoom] = useState(parseBooleanParam(searchParams.get("accessible")));
  const [guestCounts, setGuestCounts] = useState<Record<string, number>>(
    normalizeGuestCounts(
      parseGuestCountsFromSearchParams(searchParams, initialSelectedProperty),
      initialSelectedProperty,
      initialRooms,
    ),
  );
  const guestTypes = getGuestTypes(selectedProperty);
  const maxGuestsPerRoom = selectedProperty?.guestAllowed ?? 4;
  const maxRooms = Math.max(selectedProperty?.roomCount ?? 1, 1);
  const totalAllowedGuests = maxGuestsPerRoom * rooms;
  const totalSelectedGuests = Object.values(guestCounts).reduce((sum, count) => sum + count, 0);

  useEffect(() => {
    setRooms((currentRooms) => Math.min(Math.max(currentRooms, 1), maxRooms));
  }, [maxRooms]);
  useEffect(() => {
    setGuestCounts((currentGuestCounts) =>
      normalizeGuestCounts(currentGuestCounts, selectedProperty, rooms),
    );
  }, [selectedProperty, rooms]);

  useEffect(() => {
    if (!tenant.tenantId || !selectedPropertyId) {
      setCalendarPriceByDate({});
      return;
    }

    const controller = new AbortController();

    fetchCalendarPriceMap(tenant.tenantId, selectedPropertyId, controller.signal)
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
  }, [selectedPropertyId, tenant.tenantId]);


  const clampToCapacity = (counts: Record<string, number>, capacity: number) => {
    const next = { ...counts };
    let total = Object.values(next).reduce((sum, count) => sum + count, 0);
    if (total <= capacity) return next;

    const reverseGuestTypeIds = [...guestTypes].reverse().map((guestType) => guestType.guestTypeId);

    for (const guestTypeId of reverseGuestTypeIds) {
      while (next[guestTypeId] > 0 && total > capacity) {
        next[guestTypeId] -= 1;
        total -= 1;
      }
      if (total <= capacity) break;
    }

    return next;
  };

  const onPropertyChange = (value: string) => {
    const nextProperty = tenant.properties.find((property) => property.propertyId === value);
    setSelectedPropertyId(nextProperty?.propertyId ?? "");
    setRooms(1);
    setAccessibleRoom(false);
    setGuestCounts(buildDefaultGuestCounts(nextProperty));
    setDateError(null);
  };

  const onRoomsChange = (value: string) => {
    const nextRooms = Number(value);
    setRooms(nextRooms);
    setGuestCounts((currentGuestCounts) =>
      clampToCapacity(currentGuestCounts, maxGuestsPerRoom * nextRooms),
    );
  };

  const updateGuestCount = (guestTypeId: string, delta: number) => {
    const current = guestCounts[guestTypeId] ?? 0;
    const proposed = current + delta;
    if (proposed < 0) return;

    const nextCounts = {
      ...guestCounts,
      [guestTypeId]: proposed,
    };

    const total = Object.values(nextCounts).reduce((sum, count) => sum + count, 0);
    if (total > totalAllowedGuests) return;

    setGuestCounts(nextCounts);
  };

  const onDatesChange = (nextStart: Date | null, nextEnd: Date | null) => {
    setDateError(null);
    setStartDate(nextStart);
    setEndDate(nextEnd);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantName || !selectedPropertyId) return;

    const nextParams = buildBookingSearchParams({
      property: selectedProperty,
      propertyId: selectedPropertyId,
      checkIn: startDate,
      checkOut: endDate,
      rooms,
      accessible: accessibleRoom,
      guestCounts,
    });

    navigate({
      pathname: `/${tenantName}/room-results`,
      search: `?${nextParams.toString()}`,
    });
  };

  return {
    accessibleRoom,
    calendarPriceByDate,
    dateError,
    endDate,
    guestCounts,
    guestTypes,
    maxRooms,
    onDatesChange,
    onPropertyChange,
    onRoomsChange,
    onSubmit,
    rooms,
    selectedProperty,
    selectedPropertyId,
    onAccessibleChange: (checked: boolean) => setAccessibleRoom(checked),
    setDateError,
    startDate,
    totalAllowedGuests,
    totalSelectedGuests,
    updateGuestCount,
  };
};
