import type { TenantConfig } from "../../features/tenant/tenantTypes";

export type AdminCredentials = {
  adminName: string;
  password: string;
};

export type AdminRequestAuth = {
  adminName?: string;
  password?: string;
  bearerToken?: string | null;
};

export type AdminAuthSession = {
  authenticated: boolean;
  message: string;
  adminId: string;
  tenantId: string;
  tenantName: string;
  adminName: string;
  role: string;
  authProvider?: "basic" | "cognito";
};

export type AdminTenantSummary = {
  tenantId: string;
  tenantName: string;
};

export type AdminTenantAdmin = {
  tenantAdminId: string;
  tenantId: string;
  tenantName: string;
  adminName: string;
  active: boolean;
};

export type AdminPriceItem = {
  priceId: string;
  roomTypeId: string;
  roomTypeName: string;
  propertyId: string;
  date: string;
  roomPrice: number;
  quantity: number;
};

export type AdminPromotionCode = {
  promoCodeId?: string;
  code: string;
  maxUsage?: number | null;
  perUserLimit?: number | null;
  expiryDate?: string | null;
  active?: boolean | null;
};

export type AdminPromotion = {
  promotionId?: string;
  propertyId: string;
  promotionName: string;
  description?: string;
  promotionKind: string;
  active: boolean;
  startDate?: string;
  endDate?: string;
  roomTypeIds?: string[];
  conditionType?: string;
  conditionOperator?: string;
  conditionValueNumber?: number | null;
  conditionValueJson?: string | null;
  rewardType?: string;
  applyTo?: string;
  rewardAmount?: number | null;
  rewardPercentage?: number | null;
  promoCodes?: AdminPromotionCode[];
};

export type AdminRoomType = {
  roomTypeId: string;
  propertyId: string;
  roomTypeName: string;
  description: string;
  occupancy: number;
  amenities: string[];
  images: string[];
  baseRate: number | null;
  roomSpec: {
    roomSpecId: string | null;
    bedType: string | null;
    area: number | null;
    minOcc: number | null;
    maxOcc: number | null;
  } | null;
};

export type AdminFilter = {
  filterId: string;
  propertyId: string;
  filterName: string;
  sourceField: string;
  filterType: string;
  sortOrder: number | null;
  active: boolean | null;
};

export type AdminTenantConfig = TenantConfig;
