export type SectionId = "overview" | "tenant" | "properties" | "guestTypes" | "filters" | "rooms" | "prices" | "promotions";

export type PropertyForm = {
  propertyName: string;
  guestAllowed: number;
  roomCount: number;
  lengthOfStay: number;
  guestFlag: boolean;
  roomFlag: boolean;
  accessibleFlag: boolean;
};

export type GuestForm = {
  guestTypeId: string;
  guestTypeName: string;
  minAge: number;
  maxAge: number;
};

export type RoomForm = {
  roomTypeId: string;
  roomSpecId: string;
  roomTypeName: string;
  description: string;
  occupancy: number;
  baseRate: number;
  amenities: string;
  image: string;
  bedType: string;
  area: number;
  minOcc: number;
  maxOcc: number;
};

export type PromoForm = {
  promotionId: string;
  promotionName: string;
  description: string;
  promotionKind: string;
  active: boolean;
  startDate: string;
  endDate: string;
  conditionType: string;
  conditionOperator: string;
  conditionValueNumber: number;
  conditionValueJson: string;
  rewardType: string;
  applyTo: string;
  rewardAmount: number;
  rewardPercentage: number;
  promoCodeId: string;
  promoCode: string;
  maxUsage: number;
  perUserLimit: number;
  roomTypeIds: string[];
};

export type FilterForm = {
  filterId: string;
  filterName: string;
  sourceField: string;
  filterType: string;
  sortOrder: number;
  active: boolean;
};

export type TenantAdminForm = {
  tenantAdminId: string;
  adminName: string;
  adminPassword: string;
  active: boolean;
};
