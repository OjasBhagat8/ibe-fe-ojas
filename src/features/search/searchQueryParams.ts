import { format, isValid, parseISO } from "date-fns";

import type { GuestType, Property } from "../tenant/tenantTypes";

const DEFAULT_GUEST_TYPES: GuestType[] = [
  {
    guestTypeId: "adults",
    guestTypeName: "Adults",
    minAge: 18,
    maxAge: 120,
  },
];

const DATE_PARAM_FORMAT = "yyyy-MM-dd";

export const getGuestTypes = (property?: Property | null) => {
  if (property?.guestTypes?.length) {
    return property.guestTypes;
  }

  return DEFAULT_GUEST_TYPES;
};

export const buildDefaultGuestCounts = (property?: Property | null) => {
  const guestTypes = getGuestTypes(property);
  const initialCounts = guestTypes.reduce<Record<string, number>>((acc, guestType) => {
    acc[guestType.guestTypeId] = 0;
    return acc;
  }, {});

  const defaultGuestType = guestTypes.find((guestType) =>
    guestType.guestTypeName.toLowerCase().includes("adult"),
  ) ?? guestTypes[0];

  if (defaultGuestType) {
    initialCounts[defaultGuestType.guestTypeId] = 1;
  }

  return initialCounts;
};

export const parseDateParam = (value: string | null) => {
  if (!value) return null;

  const parsedDate = parseISO(value);
  return isValid(parsedDate) ? parsedDate : null;
};

export const serializeDateParam = (value: Date | null) => {
  if (!value) return null;
  return format(value, DATE_PARAM_FORMAT);
};

export const parseBooleanParam = (value: string | null) => value === "true";

export const clampNumber = (value: string | null, minimum: number, maximum: number) => {
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) return minimum;

  return Math.min(Math.max(Math.trunc(parsedValue), minimum), maximum);
};

export const getGuestTypeParamKey = (guestType: GuestType) =>
  guestType.guestTypeName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const parseGuestCountsParam = (value: string | null) => {
  if (!value) return {};

  return value.split(",").reduce<Record<string, number>>((acc, entry) => {
    const [guestTypeId, rawCount] = entry.split(":");
    const count = Number(rawCount);

    if (!guestTypeId || !Number.isFinite(count) || count < 0) {
      return acc;
    }

    acc[guestTypeId] = Math.trunc(count);
    return acc;
  }, {});
};

export const parseGuestCountsFromSearchParams = (
  searchParams: URLSearchParams,
  property: Property | null | undefined,
) => {
  const guestTypes = getGuestTypes(property);
  const countsFromDedicatedParams = guestTypes.reduce<Record<string, number>>((acc, guestType) => {
    const rawValue = searchParams.get(getGuestTypeParamKey(guestType));
    if (rawValue === null) {
      return acc;
    }
    const count = Number(rawValue);

    if (!Number.isFinite(count) || count < 0) {
      return acc;
    }

    acc[guestType.guestTypeId] = Math.trunc(count);
    return acc;
  }, {});

  if (Object.keys(countsFromDedicatedParams).length > 0) {
    return countsFromDedicatedParams;
  }

  return parseGuestCountsParam(searchParams.get("guests"));
};

export const normalizeGuestCounts = (
  rawGuestCounts: Record<string, number>,
  property: Property | null | undefined,
  rooms: number,
) => {
  const guestTypes = getGuestTypes(property);
  const normalizedCounts = buildDefaultGuestCounts(property);
  let hasExplicitGuestCount = false;

  guestTypes.forEach((guestType) => {
    const nextCount = rawGuestCounts[guestType.guestTypeId]
      ?? rawGuestCounts[getGuestTypeParamKey(guestType)];
    if (!Number.isFinite(nextCount)) return;

    normalizedCounts[guestType.guestTypeId] = Math.max(0, Math.trunc(nextCount));
    hasExplicitGuestCount = true;
  });

  if (!hasExplicitGuestCount) {
    return normalizedCounts;
  }

  const maxGuestsPerRoom = property?.guestAllowed ?? 4;
  const capacity = maxGuestsPerRoom * rooms;
  let totalGuests = Object.values(normalizedCounts).reduce((sum, count) => sum + count, 0);

  if (totalGuests === 0) {
    return buildDefaultGuestCounts(property);
  }

  if (totalGuests <= capacity) {
    return normalizedCounts;
  }

  const guestTypeIds = [...guestTypes].reverse().map((guestType) => guestType.guestTypeId);

  for (const guestTypeId of guestTypeIds) {
    while (normalizedCounts[guestTypeId] > 0 && totalGuests > capacity) {
      normalizedCounts[guestTypeId] -= 1;
      totalGuests -= 1;
    }

    if (totalGuests <= capacity) {
      break;
    }
  }

  return normalizedCounts;
};

export type BookingSearchState = {
  property: Property | null | undefined;
  propertyId: string;
  checkIn: Date | null;
  checkOut: Date | null;
  rooms: number;
  accessible: boolean;
  guestCounts: Record<string, number>;
};

export const buildBookingSearchParams = (state: BookingSearchState) => {
  const params = new URLSearchParams();
  const guestTypes = getGuestTypes(state.property);

  if (state.propertyId) {
    params.set("propertyId", state.propertyId);
  }
  params.set("rooms", String(state.rooms));

  const checkIn = serializeDateParam(state.checkIn);
  const checkOut = serializeDateParam(state.checkOut);

  if (checkIn) {
    params.set("checkIn", checkIn);
  }

  if (checkOut) {
    params.set("checkOut", checkOut);
  }

  guestTypes.forEach((guestType) => {
    const count = state.guestCounts[guestType.guestTypeId] ?? 0;
    if (count <= 0) return;

    params.set(getGuestTypeParamKey(guestType), String(count));
  });

  if (state.accessible) {
    params.set("accessible", "true");
  }

  return params;
};
