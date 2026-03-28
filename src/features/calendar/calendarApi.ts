type CalendarPriceItem = {
  date: string;
  propertyId: string;
  roomTypeId: string;
  price: number;
};

type CalendarPriceResponse = {
  data?: {
    calendarPrices?: CalendarPriceItem[];
    calenderPrices?: CalendarPriceItem[];
  };
  errors?: Array<{
    message?: string;
  }>;
};

const CALENDAR_PRICES_QUERY = `
  query CalendarPrices($tenantId: ID!, $propertyId: ID!, $startDate: String) {
    calendarPrices(tenantId: $tenantId, propertyId: $propertyId, startDate: $startDate) {
      date
      propertyId
      roomTypeId
      price
    }
  }
`;

export const fetchCalendarPriceMap = async (
  tenantId: string,
  propertyId: string,
  signal?: AbortSignal,
): Promise<Record<string, number>> => {
  const endpoint = import.meta.env.VITE_CALENDAR_API_URL?.trim()
    || import.meta.env.VITE_GRAPHQL_URL?.trim()
    || import.meta.env.VITE_API_BASE_URL?.trim();

  if (!endpoint) {
    return {};
  }

  const response = await fetch(endpoint, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: CALENDAR_PRICES_QUERY,
      variables: {
        tenantId,
        propertyId,
        startDate: new Date().toISOString().split("T")[0],
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch calendar prices");
  }

  const payload = (await response.json()) as CalendarPriceResponse;
  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message ?? "Failed to fetch calendar prices");
  }

  const items = payload.data?.calendarPrices ?? payload.data?.calenderPrices ?? [];

  return items.reduce<Record<string, number>>((acc, item) => {
    const key = item.date.split("T")[0];
    if (!Number.isFinite(item.price)) return acc;
    acc[key] = item.price;
    return acc;
  }, {});
};
