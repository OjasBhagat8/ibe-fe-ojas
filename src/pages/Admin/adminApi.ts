import type { GuestType, Property } from "../../features/tenant/tenantTypes";
import type {
  AdminAuthSession,
  AdminCredentials,
  AdminFilter,
  AdminPriceItem,
  AdminPromotion,
  AdminRoomType,
  AdminTenantAdmin,
  AdminTenantConfig,
  AdminRequestAuth,
  AdminTenantSummary,
} from "./adminTypes";

const graphqlEndpoint = (
  import.meta.env.VITE_GRAPHQL_URL?.trim()
  || import.meta.env.VITE_API_BASE_URL?.trim()
  || "http://localhost:8081/api/graphql"
);

const normalizeAdminCredentials = (auth?: AdminRequestAuth) => {
  if (!auth?.adminName || !auth.password) {
    return undefined;
  }

  return {
    adminName: auth.adminName.trim(),
    password: auth.password,
  };
};

const executeAdminGraphql = async <TData>(
  query: string,
  variables: Record<string, unknown>,
  auth?: AdminRequestAuth,
  includeBasicAuth = true,
): Promise<TData> => {
  const normalizedCredentials = normalizeAdminCredentials(auth);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth?.bearerToken) {
    headers.Authorization = `Bearer ${auth.bearerToken}`;
  } else if (includeBasicAuth && normalizedCredentials?.adminName && normalizedCredentials.password) {
    headers.Authorization = `Basic ${window.btoa(`${normalizedCredentials.adminName}:${normalizedCredentials.password}`)}`;
  }

  const response = await fetch(graphqlEndpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    data?: TData;
    errors?: { message?: string }[];
  };

  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message ?? "GraphQL request failed");
  }

  if (!payload.data) {
    throw new Error("GraphQL response did not return data");
  }

  return payload.data;
};

const TENANTS_QUERY = `
  query Tenants {
    tenants {
      tenantId
      tenantName
    }
  }
`;

const ADMIN_LOGIN_MUTATION = `
  mutation AdminLogin($input: AdminLoginInput!) {
    adminLogin(input: $input) {
      authenticated
      message
      adminId
      tenantId
      tenantName
      adminName
      role
    }
  }
`;

const UPSERT_TENANT_MUTATION = `
  mutation UpsertTenant($input: UpsertTenantInput!) {
    upsertTenant(input: $input) {
      tenantId
      tenantName
      tenantLogo
      tenantBanner
      tenantCopyright
    }
  }
`;

const UPSERT_TENANT_ADMIN_MUTATION = `
  mutation UpsertTenantAdmin($input: UpsertTenantAdminInput!) {
    upsertTenantAdmin(input: $input) {
      tenantAdminId
      tenantId
      tenantName
      adminName
      active
    }
  }
`;

const CONFIG_QUERY = `
  query Config($tenantId: ID!) {
    config(tenantId: $tenantId) {
      tenantId
      tenantName
      tenantLogo
      tenantBanner
      tenantCopyright
      properties {
        propertyId
        propertyName
        guestAllowed
        guestFlag
        roomCount
        lengthOfStay
        roomFlag
        accessibleFlag
        guestTypes {
          guestTypeId
          guestTypeName
          minAge
          maxAge
        }
      }
    }
  }
`;

const PRICES_QUERY = `
  query Prices($propertyId: ID!, $fromDate: String!, $toDate: String!) {
    prices(propertyId: $propertyId, fromDate: $fromDate, toDate: $toDate) {
      priceId
      roomTypeId
      roomTypeName
      propertyId
      date
      roomPrice
      quantity
    }
  }
`;

const ROOM_TYPES_QUERY = `
  query RoomTypes($propertyId: ID!) {
    roomTypes(propertyId: $propertyId) {
      roomTypeId
      propertyId
      roomTypeName
      description
      occupancy
      amenities
      images
      baseRate
      roomSpec {
        roomSpecId
        bedType
        area
        minOcc
        maxOcc
      }
    }
  }
`;

const PROMOTIONS_QUERY = `
  query Promotions($propertyId: ID!) {
    promotions(propertyId: $propertyId) {
      promotionId
      propertyId
      promotionName
      description
      promotionKind
      active
      startDate
      endDate
      roomTypeIds
      conditionType
      conditionOperator
      conditionValueNumber
      conditionValueJson
      rewardType
      applyTo
      rewardAmount
      rewardPercentage
      promoCodes {
        promoCodeId
        code
        maxUsage
        perUserLimit
        expiryDate
        active
      }
    }
  }
`;

const ADMIN_FILTERS_QUERY = `
  query AdminFilters($propertyId: ID!) {
    adminFilters(propertyId: $propertyId) {
      filterId
      propertyId
      filterName
      sourceField
      filterType
      sortOrder
      active
    }
  }
`;

const UPDATE_TENANT_MUTATION = `
  mutation UpdateTenant($input: UpdateTenantInput!) {
    updateTenant(input: $input) {
      tenantId
      tenantName
      tenantLogo
      tenantBanner
      tenantCopyright
    }
  }
`;

const UPSERT_PROPERTY_MUTATION = `
  mutation UpsertProperty($input: UpsertPropertyInput!) {
    upsertProperty(input: $input) {
      propertyId
      propertyName
      guestAllowed
      guestFlag
      roomCount
      lengthOfStay
      roomFlag
      accessibleFlag
      guestTypes {
        guestTypeId
        guestTypeName
        minAge
        maxAge
      }
    }
  }
`;

const UPDATE_PROPERTY_SETTINGS_MUTATION = `
  mutation UpdatePropertySettings($input: UpdatePropertySettingsInput!) {
    updatePropertySettings(input: $input) {
      propertyId
      propertyName
      guestAllowed
      guestFlag
      roomCount
      lengthOfStay
      roomFlag
      accessibleFlag
      guestTypes {
        guestTypeId
        guestTypeName
        minAge
        maxAge
      }
    }
  }
`;

const UPSERT_GUEST_TYPE_MUTATION = `
  mutation UpsertGuestType($input: UpsertGuestTypeInput!) {
    upsertGuestType(input: $input) {
      guestTypeId
      guestTypeName
      minAge
      maxAge
    }
  }
`;

const UPSERT_ROOM_PRICE_MUTATION = `
  mutation UpsertRoomPrice($input: UpsertRoomPriceInput!) {
    upsertRoomPrice(input: $input) {
      priceId
      roomTypeId
      roomTypeName
      propertyId
      date
      roomPrice
      quantity
    }
  }
`;

const UPSERT_ROOM_TYPE_MUTATION = `
  mutation UpsertRoomType($input: UpsertRoomTypeInput!) {
    upsertRoomType(input: $input) {
      roomTypeId
      propertyId
      roomTypeName
      description
      occupancy
      amenities
      images
      baseRate
      roomSpec {
        roomSpecId
        bedType
        area
        minOcc
        maxOcc
      }
    }
  }
`;

const UPSERT_PROMOTION_MUTATION = `
  mutation UpsertPromotion($input: UpsertPromotionInput!) {
    upsertPromotion(input: $input) {
      promotionId
      propertyId
      promotionName
    }
  }
`;

const UPSERT_FILTER_MUTATION = `
  mutation UpsertFilter($input: UpsertFilterInput!) {
    upsertFilter(input: $input) {
      filterId
      propertyId
      filterName
      sourceField
      filterType
      sortOrder
      active
    }
  }
`;

const DELETE_PROPERTY_MUTATION = `
  mutation DeleteProperty($propertyId: ID!) {
    deleteProperty(propertyId: $propertyId)
  }
`;

const DELETE_GUEST_TYPE_MUTATION = `
  mutation DeleteGuestType($guestTypeId: ID!) {
    deleteGuestType(guestTypeId: $guestTypeId)
  }
`;

const DELETE_ROOM_TYPE_MUTATION = `
  mutation DeleteRoomType($roomTypeId: ID!) {
    deleteRoomType(roomTypeId: $roomTypeId)
  }
`;

const DELETE_ROOM_PRICE_MUTATION = `
  mutation DeleteRoomPrice($priceId: ID!) {
    deleteRoomPrice(priceId: $priceId)
  }
`;

const DELETE_PROMOTION_MUTATION = `
  mutation DeletePromotion($promotionId: ID!) {
    deletePromotion(promotionId: $promotionId)
  }
`;

const DELETE_PROMO_CODE_MUTATION = `
  mutation DeletePromoCode($promoCodeId: ID!) {
    deletePromoCode(promoCodeId: $promoCodeId)
  }
`;

const DELETE_FILTER_MUTATION = `
  mutation DeleteFilter($filterId: ID!) {
    deleteFilter(filterId: $filterId)
  }
`;

export const fetchAdminTenants = async (auth: AdminRequestAuth) => {
  const data = await executeAdminGraphql<{ tenants: AdminTenantSummary[] }>(TENANTS_QUERY, {}, auth);
  return data.tenants;
};

export const adminLogin = async (credentials: AdminCredentials) => {
  const data = await executeAdminGraphql<{ adminLogin: AdminAuthSession }>(
    ADMIN_LOGIN_MUTATION,
    {
      input: {
        adminName: credentials.adminName.trim(),
        password: credentials.password,
      },
    },
    undefined,
    false,
  );
  return data.adminLogin;
};

export const upsertAdminTenant = async (
  input: {
    tenantId?: string;
    tenantName?: string;
    tenantLogo?: string;
    tenantBanner?: string;
    tenantCopyright?: string;
  },
  auth: AdminRequestAuth,
) => {
  const data = await executeAdminGraphql<{
    upsertTenant: Pick<AdminTenantConfig, "tenantId" | "tenantName" | "tenantLogo" | "tenantBanner" | "tenantCopyright">;
  }>(UPSERT_TENANT_MUTATION, { input }, auth);
  return data.upsertTenant;
};

export const upsertAdminTenantAdmin = async (
  input: {
    tenantAdminId?: string;
    tenantId: string;
    adminName?: string;
    adminPassword?: string;
    active?: boolean;
  },
  auth: AdminRequestAuth,
) => {
  const data = await executeAdminGraphql<{ upsertTenantAdmin: AdminTenantAdmin }>(
    UPSERT_TENANT_ADMIN_MUTATION,
    { input },
    auth,
  );
  return data.upsertTenantAdmin;
};

export const fetchAdminTenantConfig = async (tenantId: string, _auth?: AdminRequestAuth) => {
  const data = await executeAdminGraphql<{ config: AdminTenantConfig }>(CONFIG_QUERY, { tenantId }, undefined, false);
  return data.config;
};

export const fetchAdminPrices = async (
  propertyId: string,
  fromDate: string,
  toDate: string,
  auth: AdminRequestAuth,
) => {
  const data = await executeAdminGraphql<{ prices: AdminPriceItem[] }>(
    PRICES_QUERY,
    { propertyId, fromDate, toDate },
    auth,
  );
  return data.prices;
};

export const fetchAdminRoomTypes = async (propertyId: string, auth: AdminRequestAuth) => {
  const data = await executeAdminGraphql<{ roomTypes: AdminRoomType[] }>(
    ROOM_TYPES_QUERY,
    { propertyId },
    auth,
  );
  return data.roomTypes;
};

export const fetchAdminPromotions = async (propertyId: string, auth: AdminRequestAuth) => {
  const data = await executeAdminGraphql<{ promotions: AdminPromotion[] }>(
    PROMOTIONS_QUERY,
    { propertyId },
    auth,
  );
  return data.promotions;
};

export const fetchAdminFilters = async (propertyId: string, auth: AdminRequestAuth) => {
  const data = await executeAdminGraphql<{ adminFilters: AdminFilter[] }>(
    ADMIN_FILTERS_QUERY,
    { propertyId },
    auth,
  );
  return data.adminFilters;
};

export const updateAdminTenant = async (
  input: {
    tenantId: string;
    tenantName: string;
    tenantLogo?: string;
    tenantBanner?: string;
    tenantCopyright?: string;
  },
  auth: AdminRequestAuth,
) => {
  const data = await executeAdminGraphql<{ updateTenant: Pick<AdminTenantConfig, "tenantId" | "tenantName" | "tenantLogo" | "tenantBanner" | "tenantCopyright"> }>(
    UPDATE_TENANT_MUTATION,
    { input },
    auth,
  );
  return data.updateTenant;
};

export const upsertAdminProperty = async (
  input: {
    tenantId: string;
    propertyId?: string;
    propertyName: string;
    guestAllowed?: number;
    guestFlag?: boolean;
    roomCount?: number;
    lengthOfStay?: number;
    roomFlag?: boolean;
    accessibleFlag?: boolean;
  },
  auth: AdminRequestAuth,
) => {
  const data = await executeAdminGraphql<{ upsertProperty: Property }>(UPSERT_PROPERTY_MUTATION, { input }, auth);
  return data.upsertProperty;
};

export const createAdminProperty = async (
  input: {
    tenantId: string;
    propertyName: string;
    guestAllowed?: number;
    guestFlag?: boolean;
    roomCount?: number;
    lengthOfStay?: number;
    roomFlag?: boolean;
    accessibleFlag?: boolean;
  },
  auth: AdminRequestAuth,
) => upsertAdminProperty(input, auth);

export const updateAdminPropertySettings = async (
  input: {
    propertyId: string;
    guestAllowed?: number;
    guestFlag?: boolean;
    roomCount?: number;
    lengthOfStay?: number;
    roomFlag?: boolean;
    accessibleFlag?: boolean;
  },
  auth: AdminRequestAuth,
) => {
  const data = await executeAdminGraphql<{ updatePropertySettings: Property }>(
    UPDATE_PROPERTY_SETTINGS_MUTATION,
    { input },
    auth,
  );
  return data.updatePropertySettings;
};

export const upsertAdminGuestType = async (
  input: {
    propertyId: string;
    guestTypeId?: string;
    guestTypeName: string;
    minAge: number;
    maxAge: number;
  },
  auth: AdminRequestAuth,
) => {
  const data = await executeAdminGraphql<{ upsertGuestType: GuestType }>(UPSERT_GUEST_TYPE_MUTATION, { input }, auth);
  return data.upsertGuestType;
};

export const upsertAdminRoomPrice = async (
  input: {
    roomTypeId: string;
    date: string;
    roomPrice: number;
    quantity: number;
  },
  auth: AdminRequestAuth,
) => {
  const data = await executeAdminGraphql<{ upsertRoomPrice: AdminPriceItem }>(UPSERT_ROOM_PRICE_MUTATION, { input }, auth);
  return data.upsertRoomPrice;
};

export const upsertAdminRoomType = async (input: Record<string, unknown>, auth: AdminRequestAuth) => {
  const data = await executeAdminGraphql<{ upsertRoomType: AdminRoomType }>(UPSERT_ROOM_TYPE_MUTATION, { input }, auth);
  return data.upsertRoomType;
};

export const upsertAdminPromotion = async (input: AdminPromotion, auth: AdminRequestAuth) => {
  const data = await executeAdminGraphql<{ upsertPromotion: AdminPromotion }>(UPSERT_PROMOTION_MUTATION, { input }, auth);
  return data.upsertPromotion;
};

export const upsertAdminFilter = async (
  input: {
    filterId?: string;
    propertyId: string;
    filterName: string;
    sourceField: string;
    filterType: string;
    sortOrder?: number | null;
    active?: boolean;
  },
  auth: AdminRequestAuth,
) => {
  const data = await executeAdminGraphql<{ upsertFilter: AdminFilter }>(UPSERT_FILTER_MUTATION, { input }, auth);
  return data.upsertFilter;
};

export const deleteAdminProperty = async (propertyId: string, auth: AdminRequestAuth) => {
  const data = await executeAdminGraphql<{ deleteProperty: boolean }>(DELETE_PROPERTY_MUTATION, { propertyId }, auth);
  return data.deleteProperty;
};

export const deleteAdminGuestType = async (guestTypeId: string, auth: AdminRequestAuth) => {
  const data = await executeAdminGraphql<{ deleteGuestType: boolean }>(DELETE_GUEST_TYPE_MUTATION, { guestTypeId }, auth);
  return data.deleteGuestType;
};

export const deleteAdminRoomType = async (roomTypeId: string, auth: AdminRequestAuth) => {
  const data = await executeAdminGraphql<{ deleteRoomType: boolean }>(DELETE_ROOM_TYPE_MUTATION, { roomTypeId }, auth);
  return data.deleteRoomType;
};

export const deleteAdminRoomPrice = async (priceId: string, auth: AdminRequestAuth) => {
  const data = await executeAdminGraphql<{ deleteRoomPrice: boolean }>(DELETE_ROOM_PRICE_MUTATION, { priceId }, auth);
  return data.deleteRoomPrice;
};

export const deleteAdminPromotion = async (promotionId: string, auth: AdminRequestAuth) => {
  const data = await executeAdminGraphql<{ deletePromotion: boolean }>(DELETE_PROMOTION_MUTATION, { promotionId }, auth);
  return data.deletePromotion;
};

export const deleteAdminPromoCode = async (promoCodeId: string, auth: AdminRequestAuth) => {
  const data = await executeAdminGraphql<{ deletePromoCode: boolean }>(DELETE_PROMO_CODE_MUTATION, { promoCodeId }, auth);
  return data.deletePromoCode;
};

export const deleteAdminFilter = async (filterId: string, auth: AdminRequestAuth) => {
  const data = await executeAdminGraphql<{ deleteFilter: boolean }>(DELETE_FILTER_MUTATION, { filterId }, auth);
  return data.deleteFilter;
};




