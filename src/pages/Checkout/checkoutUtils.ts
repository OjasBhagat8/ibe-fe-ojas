import { Country } from "country-state-city";
import { eachDayOfInterval, format, parseISO, subDays } from "date-fns";
import type { ReservationSelection, TripItineraryPreview } from "../../features/booking/bookingSlice";

type PhoneLengthRule = {
  min: number;
  max: number;
};

export type TaxBreakdown = {
  roomTitle: string;
  nightlyRates: { label: string; amount: number }[];
  roomTotal: number;
  taxes: { label: string; amount: number }[];
  dueNow: number;
  dueAtResort: number;
};

export const onlyDigits = (value: string) => value.replace(/\D/g, "");

const phoneLengthRules: Record<string, PhoneLengthRule> = {
  AU: { min: 9, max: 9 },
  AE: { min: 9, max: 9 },
  CA: { min: 10, max: 10 },
  DE: { min: 10, max: 11 },
  ES: { min: 9, max: 9 },
  FR: { min: 9, max: 9 },
  GB: { min: 9, max: 10 },
  IN: { min: 10, max: 10 },
  IT: { min: 9, max: 10 },
  SA: { min: 9, max: 9 },
  US: { min: 10, max: 10 },
};

const normalizeDialCode = (phoneCode: string | undefined) => {
  const digits = onlyDigits(phoneCode ?? "");
  return digits ? `+${digits}` : "";
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

export const hasConfiguredTripItineraryApi = Boolean(
  import.meta.env.VITE_GRAPHQL_URL?.trim() || import.meta.env.VITE_API_BASE_URL?.trim()
);

export const buildFallbackTaxBreakdown = (selection: ReservationSelection): TaxBreakdown => {
  const checkInDate = parseISO(selection.search.checkIn);
  const checkOutDate = parseISO(selection.search.checkOut);
  const stayDates = eachDayOfInterval({
    start: checkInDate,
    end: subDays(checkOutDate, 1),
  });
  const nightlyBaseRate = stayDates.length
    ? Math.floor((selection.summary.subtotal / stayDates.length) * 100) / 100
    : selection.summary.subtotal;
  let remainingSubtotal = selection.summary.subtotal;
  const nightlyRates = stayDates.map((date, index) => {
    const isLastItem = index === stayDates.length - 1;
    const amount = isLastItem
      ? Number(remainingSubtotal.toFixed(2))
      : Number(Math.min(remainingSubtotal, nightlyBaseRate).toFixed(2));
    remainingSubtotal = Number((remainingSubtotal - amount).toFixed(2));

    return {
      label: format(date, "EEEE, MMMM d, yyyy"),
      amount,
    };
  });

  const resortFee = Number((selection.summary.taxesAndSurcharges * 0.55).toFixed(2));
  const occupancyTax = Number((selection.summary.taxesAndSurcharges - resortFee).toFixed(2));

  return {
    roomTitle: selection.room.roomTypeName,
    nightlyRates,
    roomTotal: selection.summary.subtotal,
    taxes: [
      { label: "Resort fee", amount: resortFee },
      { label: "Occupancy tax", amount: occupancyTax },
    ],
    dueNow: selection.summary.dueNow,
    dueAtResort: selection.summary.dueAtResort,
  };
};

export const buildTaxBreakdownFromPreview = (preview: TripItineraryPreview): TaxBreakdown => ({
  roomTitle: preview.roomTypeName,
  nightlyRates: preview.nightlyBreakdown.map((nightlyItem) => ({
    label: format(parseISO(nightlyItem.date), "EEEE, MMMM d, yyyy"),
    amount: nightlyItem.rate,
  })),
  roomTotal: preview.roomTotal,
  taxes: preview.chargeBreakdown,
  dueNow: preview.dueNow,
  dueAtResort: preview.dueAtResort,
});

export const formatCardNumber = (value: string) =>
  onlyDigits(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();

export const countryOptions = Country.getAllCountries().map((country) => ({
  value: country.isoCode,
  label: country.name,
}));

export const phoneCountryOptions = Country.getAllCountries().map((country) => ({
  value: country.isoCode,
  label: country.name,
  dialCode: normalizeDialCode(country.phonecode),
}));

export const getDialCodeByCountry = (countryCode: string) => {
  const country = Country.getCountryByCode(countryCode);
  return normalizeDialCode(country?.phonecode);
};

export const getPhoneValidationRule = (countryCode: string): PhoneLengthRule =>
  phoneLengthRules[countryCode] ?? { min: 6, max: 14 };

export const formatPhoneForSubmission = (countryCode: string, localPhoneNumber: string) => {
  const dialCode = getDialCodeByCountry(countryCode);
  const phoneDigits = onlyDigits(localPhoneNumber);

  return dialCode ? `${dialCode} ${phoneDigits}`.trim() : phoneDigits;
};

export const isAdultGuestType = (guestTypeName: string) => guestTypeName.toLowerCase().includes("adult");

export const getErrorMessage = (message: unknown) => (typeof message === "string" ? message : undefined);

export const hasSectionErrors = (value: unknown) =>
  Boolean(value && typeof value === "object" && Object.keys(value as Record<string, unknown>).length > 0);
