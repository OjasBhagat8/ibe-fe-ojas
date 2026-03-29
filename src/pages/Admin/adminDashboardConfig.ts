import type { SectionId } from "./adminDashboardTypes";

export const sections: { id: SectionId; label: string; eyebrow: string; description: string }[] = [
  {
    id: "overview",
    label: "Overview",
    eyebrow: "Workspace",
    description: "See the tenant at a glance and jump into the right admin workflow.",
  },
  {
    id: "tenant",
    label: "Tenant Profile",
    eyebrow: "Brand Setup",
    description: "Manage tenant name, logo, banner, and storefront identity.",
  },
  {
    id: "properties",
    label: "Properties",
    eyebrow: "Property Setup",
    description: "Pick one property, review its current rules, and update booking controls.",
  },
  {
    id: "guestTypes",
    label: "Guest Types",
    eyebrow: "Guest Rules",
    description: "Create or adjust guest categories such as Adult, Child, or Infant.",
  },
  {
    id: "filters",
    label: "Filters",
    eyebrow: "Search Config",
    description: "Manage which search filters appear for the selected property.",
  },
  {
    id: "rooms",
    label: "Room Types",
    eyebrow: "Inventory",
    description: "Manage the room catalog shown for the selected property.",
  },
  {
    id: "prices",
    label: "Prices",
    eyebrow: "Rate Control",
    description: "Load a date range, inspect price rows, and change availability or rate.",
  },
  {
    id: "promotions",
    label: "Promotions",
    eyebrow: "Offers",
    description: "Create promotional campaigns for the selected property's room inventory.",
  },
];

export const sourceFieldOptions = [
  { value: "amenities", label: "Amenities" },
  { value: "roomSpec.bedType", label: "Bed type" },
  { value: "roomSpec.area", label: "Area" },
  { value: "occupancy", label: "Occupancy" },
  { value: "baseRate", label: "Base rate" },
];

export const filterTypeOptions = ["CHECKBOX", "RANGE"];
export const promotionKindOptions = ["AUTOMATIC", "PROMO_CODE"];
export const rewardTypeOptions = ["PERCENTAGE_DISCOUNT", "FLAT_DISCOUNT"];
export const conditionTypeOptions = ["TRIP_INCLUDES_DAY", "TRIP_INCLUDES_ALL_DAYS", "MIN_STAY_NIGHTS", "MIN_GUEST_COUNT", "GUEST_TYPE_SELECTED"];
export const conditionOperatorOptions = ["IN", "ALL", "GREATER_THAN_OR_EQUAL"];
export const applyToOptions = ["STAY_TOTAL", "PER_NIGHT"];

export const today = new Date().toISOString().slice(0, 10);

export const plusDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
