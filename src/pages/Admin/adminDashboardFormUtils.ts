import type { GuestType, Property } from "../../features/tenant/tenantTypes";
import type { AdminFilter, AdminPromotion, AdminRoomType } from "./adminTypes";
import { plusDays, today } from "./adminDashboardConfig";
import type { FilterForm, GuestForm, PromoForm, PropertyForm, RoomForm, TenantAdminForm } from "./adminDashboardTypes";

export const emptyTenantForm = {
  tenantName: "",
  tenantLogo: "",
  tenantBanner: "",
  tenantCopyright: "",
};

export const emptyTenantAdminForm = (): TenantAdminForm => ({
  tenantAdminId: "",
  adminName: "",
  adminPassword: "",
  active: true,
});

export const emptyGuestForm = (): GuestForm => ({
  guestTypeId: "",
  guestTypeName: "",
  minAge: 0,
  maxAge: 12,
});

export const emptyRoomForm = (): RoomForm => ({
  roomTypeId: "",
  roomSpecId: "",
  roomTypeName: "",
  description: "",
  occupancy: 2,
  baseRate: 0,
  amenities: "",
  image: "",
  bedType: "",
  area: 300,
  minOcc: 1,
  maxOcc: 2,
});

export const emptyFilterForm = (): FilterForm => ({
  filterId: "",
  filterName: "",
  sourceField: "amenities",
  filterType: "CHECKBOX",
  sortOrder: 1,
  active: true,
});

export const emptyPromoForm = (): PromoForm => ({
  promotionId: "",
  promotionName: "",
  description: "",
  promotionKind: "PROMO_CODE",
  active: true,
  startDate: today,
  endDate: plusDays(30),
  conditionType: "MIN_STAY_NIGHTS",
  conditionOperator: "GREATER_THAN_OR_EQUAL",
  conditionValueNumber: 2,
  conditionValueJson: "",
  rewardType: "PERCENTAGE_DISCOUNT",
  applyTo: "STAY_TOTAL",
  rewardAmount: 0,
  rewardPercentage: 10,
  promoCodeId: "",
  promoCode: "",
  maxUsage: 100,
  perUserLimit: 1,
  roomTypeIds: [],
});

export const toPropertyForm = (property: Property | null): PropertyForm => ({
  propertyName: property?.propertyName ?? "",
  guestAllowed: property?.guestAllowed ?? 0,
  roomCount: property?.roomCount ?? 0,
  lengthOfStay: property?.lengthOfStay ?? 0,
  guestFlag: Boolean(property?.guestFlag),
  roomFlag: Boolean(property?.roomFlag),
  accessibleFlag: Boolean(property?.accessibleFlag),
});

export const toGuestForm = (guestType: GuestType): GuestForm => ({
  guestTypeId: guestType.guestTypeId,
  guestTypeName: guestType.guestTypeName,
  minAge: guestType.minAge,
  maxAge: guestType.maxAge,
});

export const toRoomForm = (room: AdminRoomType): RoomForm => ({
  roomTypeId: room.roomTypeId,
  roomSpecId: room.roomSpec?.roomSpecId ?? "",
  roomTypeName: room.roomTypeName,
  description: room.description ?? "",
  occupancy: room.occupancy ?? 2,
  baseRate: room.baseRate ?? 0,
  amenities: room.amenities?.join(", ") ?? "",
  image: room.images?.[0] ?? "",
  bedType: room.roomSpec?.bedType ?? "",
  area: room.roomSpec?.area ?? 300,
  minOcc: room.roomSpec?.minOcc ?? 1,
  maxOcc: room.roomSpec?.maxOcc ?? room.occupancy ?? 2,
});

export const toPromoForm = (promotion: AdminPromotion): PromoForm => ({
  promotionId: promotion.promotionId ?? "",
  promotionName: promotion.promotionName ?? "",
  description: promotion.description ?? "",
  promotionKind: promotion.promotionKind ?? "PROMO_CODE",
  active: Boolean(promotion.active),
  startDate: promotion.startDate?.slice(0, 10) ?? today,
  endDate: promotion.endDate?.slice(0, 10) ?? plusDays(30),
  conditionType: promotion.conditionType ?? "MIN_STAY_NIGHTS",
  conditionOperator: promotion.conditionOperator ?? "GREATER_THAN_OR_EQUAL",
  conditionValueNumber: Number(promotion.conditionValueNumber ?? 2),
  conditionValueJson: promotion.conditionValueJson ?? "",
  rewardType: promotion.rewardType ?? "PERCENTAGE_DISCOUNT",
  applyTo: promotion.applyTo ?? "STAY_TOTAL",
  rewardAmount: Number(promotion.rewardAmount ?? 0),
  rewardPercentage: Number(promotion.rewardPercentage ?? 10),
  promoCodeId: promotion.promoCodes?.[0]?.promoCodeId ?? "",
  promoCode: promotion.promoCodes?.[0]?.code ?? "",
  maxUsage: Number(promotion.promoCodes?.[0]?.maxUsage ?? 100),
  perUserLimit: Number(promotion.promoCodes?.[0]?.perUserLimit ?? 1),
  roomTypeIds: promotion.roomTypeIds ?? [],
});

export const toFilterForm = (filter: AdminFilter): FilterForm => ({
  filterId: filter.filterId,
  filterName: filter.filterName,
  sourceField: filter.sourceField,
  filterType: filter.filterType,
  sortOrder: filter.sortOrder ?? 1,
  active: Boolean(filter.active),
});
