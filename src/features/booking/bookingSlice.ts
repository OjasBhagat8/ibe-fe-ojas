import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AppliedPromoCode, DealItem, StandardRate } from "../Deals/DealType";
import type { SearchRoomItem } from "../roomCard/RoomType";
import { formatPhoneForSubmission } from "../../pages/Checkout/checkoutUtils";

export type SelectedPackage = {
  kind: "STANDARD" | "DEAL" | "PROMO";
  title: string;
  description?: string;
  totalPrice: number;
  discountAmount?: number;
  originalPrice?: number;
  promotionId?: string;
  promoCodeId?: string;
  promotionType?: string;
};

export type BookingSearchContext = {
  tenantId: string;
  tenantName: string;
  propertyId: string;
  propertyName?: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guestSelections: {
    guestTypeName: string;
    count: number;
  }[];
};

export type TravelerInfo = {
  firstName: string;
  lastName: string;
  phoneCountryCode: string;
  phone: string;
  email: string;
};

export type OptionalTravelerDetail = {
  id: string;
  guestTypeName: string;
  label: string;
  firstName: string;
  lastName: string;
};

export type BillingInfo = {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  country: string;
  city: string;
  state: string;
  zipCode: string;
  phoneCountryCode: string;
  phone: string;
  email: string;
};

export type PaymentInfo = {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  agreedToTerms: boolean;
};

export type BookingFormData = {
  traveler: TravelerInfo;
  optionalTravelers: OptionalTravelerDetail[];
  billing: BillingInfo;
  payment: PaymentInfo;
};

export type BookingSummary = {
  subtotal: number;
  taxesAndSurcharges: number;
  dueNow: number;
  dueAtResort: number;
  total: number;
  promoTitle?: string;
};

export type TripItineraryPreview = {
  propertyId: string;
  roomTypeId: string;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  promotionId?: string | null;
  promotionName?: string | null;
  roomTotal: number;
  discount: number;
  subtotal: number;
  taxesAndSurcharges: number;
  dueNow: number;
  dueAtResort: number;
  needHelpContent?: {
    title?: string | null;
    description?: string | null;
    ctaLabel?: string | null;
    ctaUrl?: string | null;
    contactOptions?: {
      type?: string | null;
      label?: string | null;
      value?: string | null;
    }[] | null;
  } | null;
  termsAndConditions?: {
    title?: string | null;
    sections?: string[] | null;
    version?: number | null;
    effectiveAt?: string | null;
    contentFormat?: string | null;
  } | null;
  chargeBreakdown: {
    label: string;
    amount: number;
  }[];
  nightlyBreakdown: {
    date: string;
    rate: number;
  }[];
};

export type ReservationSelection = {
  room: SearchRoomItem;
  selectedPackage: SelectedPackage;
  search: BookingSearchContext;
  summary: BookingSummary;
  image?: string;
};

type CompleteBookingResponse = {
  bookingId: string;
  confirmationToken: string;
  status: string;
  propertyId: string;
  roomTypeId: string;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  dueNow: number;
  dueAtResort: number;
  totalForStay: number;
};

type GuestConfirmResponse = {
  bookingId: string;
  confirmationToken: string;
  confirmationUrl: string;
  createdAt: string;
};

export type BookingConfirmation = GuestConfirmResponse & {
  completeBooking?: CompleteBookingResponse;
};

export type BookingConfirmationDetails = {
  bookingId: string;
  reservationNumber: string;
  status: string;
  createdAt: string;
  propertyId: string;
  propertyName: string;
  roomTypeId: string;
  roomTypeName: string;
  roomImage?: string | null;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guestCount: number;
  guestTypes: {
    guestType: string;
    count: number;
  }[];
  guests: {
    firstName: string;
    lastName: string;
    guestType: string;
    maskedEmail?: string | null;
    maskedPhone?: string | null;
  }[];
  billing: {
    nameOnBill: string;
    address1: string;
    address2?: string | null;
    city: string;
    state: string;
    zip: string;
    country: string;
    maskedEmail?: string | null;
    maskedPhone?: string | null;
  };
  payment: {
    paymentMethod: string;
    maskedCard?: string | null;
  };
  subtotal: number;
  taxesAndSurcharges: number;
  dueNow: number;
  dueAtResort: number;
  totalForStay: number;
};

export type GuestVerification = {
  verificationId: string | null;
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  otpRequested: boolean;
  requestLoading: boolean;
  verifyLoading: boolean;
  error: string | null;
};

type OtpRequestResponse = {
  verificationId: string;
  expiresAt: string;
  emailSent: boolean;
  phoneSent: boolean;
};

type OtpVerifyResponse = {
  verificationId: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  fullyVerified: boolean;
  expiresAt: string;
};

type CompleteBookingPayload = {
  roomTypeId: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guestSelections: BookingSearchContext["guestSelections"];
  guests: {
    firstName: string;
    lastName: string;
    guestType: string;
    phone?: string;
    email?: string;
  }[];
  billing: {
    firstName: string;
    lastName: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    email: string;
  };
  agreeToTerms: boolean;
  promotionId: string | null;
  cardLast4: string;
  idempotencyKey: string;
};

type GuestBookingConfirmPayload = {
  verificationId?: string | null;
  roomTypeId: string;
  propertyId: string;
  tenantId: string;
  tenantName: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guestSelections: BookingSearchContext["guestSelections"];
  bookingPackage: {
    kind: string;
    title: string;
    description?: string;
    totalPrice: number;
    discountAmount?: number;
    originalPrice?: number;
    promotionId?: string;
    promoCodeId?: string;
    promotionType?: string;
  };
  traveler: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  optionalTravelers: {
    id: string;
    guestTypeName: string;
    label: string;
    firstName: string;
    lastName: string;
  }[];
  billing: {
    firstName: string;
    lastName: string;
    address1: string;
    address2: string;
    country: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    email: string;
  };
  payment: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
  };
  pricing: BookingSummary;
};

type TripItineraryPreviewGraphqlResponse = {
  data?: {
    tripItineraryPreview?: TripItineraryPreview;
  };
  errors?: {
    message?: string;
  }[];
};

type CompleteBookingGraphqlResponse = {
  data?: {
    completeBooking?: CompleteBookingResponse;
  };
  errors?: {
    message?: string;
  }[];
};

type BookingConfirmationGraphqlResponse = {
  data?: {
    getBookingConfirmation?: BookingConfirmationDetails;
  };
  errors?: {
    message?: string;
  }[];
};

type BookingState = {
  selection: ReservationSelection | null;
  itineraryPreview: TripItineraryPreview | null;
  itineraryLoading: boolean;
  itineraryError: string | null;
  form: BookingFormData;
  checkoutReturnEnabled: boolean;
  loading: boolean;
  error: string | null;
  confirmation: BookingConfirmation | null;
  guestVerification: GuestVerification;
  confirmationDetails: BookingConfirmationDetails | null;
  confirmationLoading: boolean;
  confirmationError: string | null;
};

type BookingStoredState = Pick<
  BookingState,
  "selection" | "itineraryPreview" | "form" | "checkoutReturnEnabled" | "confirmation" | "confirmationDetails"
>;

const BOOKING_STORAGE_KEY = "booking-state";

const TRIP_ITINERARY_PREVIEW_QUERY = `
  query TripItineraryPreview($input: TripItineraryPreviewInput!) {
    tripItineraryPreview(input: $input) {
      propertyId
      roomTypeId
      roomTypeName
      checkIn
      checkOut
      rooms
      promotionId
      promotionName
      roomTotal
      discount
      subtotal
      taxesAndSurcharges
      dueNow
      dueAtResort
      needHelpContent {
        title
        description
        ctaLabel
        ctaUrl
        contactOptions {
          type
          label
          value
        }
      }
      termsAndConditions {
        title
        sections
        version
        effectiveAt
        contentFormat
      }
      chargeBreakdown {
        label
        amount
      }
      nightlyBreakdown {
        date
        rate
      }
    }
  }
`;

const COMPLETE_BOOKING_MUTATION = `
  mutation CompleteBooking($input: CompleteBookingInput!) {
    completeBooking(input: $input) {
      bookingId
      confirmationToken
      status
      propertyId
      roomTypeId
      roomTypeName
      checkIn
      checkOut
      rooms
      dueNow
      dueAtResort
      totalForStay
    }
  }
`;

const GET_BOOKING_CONFIRMATION_QUERY = `
  query GetBookingConfirmation($confirmationToken: String!) {
    getBookingConfirmation(confirmationToken: $confirmationToken) {
      bookingId
      reservationNumber
      status
      createdAt
      propertyId
      propertyName
      roomTypeId
      roomTypeName
      roomImage
      checkIn
      checkOut
      rooms
      guestCount
      guestTypes {
        guestType
        count
      }
      guests {
        firstName
        lastName
        guestType
        maskedEmail
        maskedPhone
      }
      billing {
        nameOnBill
        address1
        address2
        city
        state
        zip
        country
        maskedEmail
        maskedPhone
      }
      payment {
        paymentMethod
        maskedCard
      }
      subtotal
      taxesAndSurcharges
      dueNow
      dueAtResort
      totalForStay
    }
  }
`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const emptyTraveler: TravelerInfo = {
  firstName: "",
  lastName: "",
  phoneCountryCode: "US",
  phone: "",
  email: "",
};

const emptyBilling: BillingInfo = {
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  country: "US",
  city: "",
  state: "",
  zipCode: "",
  phoneCountryCode: "US",
  phone: "",
  email: "",
};

const emptyPayment: PaymentInfo = {
  cardNumber: "",
  expiryMonth: "",
  expiryYear: "",
  cvv: "",
  agreedToTerms: false,
};

const createEmptyGuestVerification = (): GuestVerification => ({
  verificationId: null,
  email: "",
  phone: "",
  emailVerified: false,
  phoneVerified: false,
  otpRequested: false,
  requestLoading: false,
  verifyLoading: false,
  error: null,
});

const defaultInitialState: BookingState = {
  selection: null,
  itineraryPreview: null,
  itineraryLoading: false,
  itineraryError: null,
  form: {
    traveler: emptyTraveler,
    optionalTravelers: [],
    billing: emptyBilling,
    payment: emptyPayment,
  },
  checkoutReturnEnabled: false,
  loading: false,
  error: null,
  confirmation: null,
  guestVerification: createEmptyGuestVerification(),
  confirmationDetails: null,
  confirmationLoading: false,
  confirmationError: null,
};

const readPersistedBookingState = (): BookingStoredState | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(BOOKING_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsedValue: unknown = JSON.parse(rawValue);
    return isRecord(parsedValue) ? (parsedValue as BookingStoredState) : null;
  } catch {
    return null;
  }
};

const persistedState = readPersistedBookingState();

const initialState: BookingState = {
  ...defaultInitialState,
  selection: persistedState?.selection ?? null,
  itineraryPreview: persistedState?.itineraryPreview ?? null,
  form: {
    traveler: {
      ...emptyTraveler,
      ...(persistedState?.form?.traveler ?? {}),
    },
    optionalTravelers: Array.isArray(persistedState?.form?.optionalTravelers)
      ? persistedState.form.optionalTravelers
      : [],
    billing: {
      ...emptyBilling,
      ...(persistedState?.form?.billing ?? {}),
    },
    payment: {
      ...emptyPayment,
      ...(persistedState?.form?.payment ?? {}),
    },
  },
  checkoutReturnEnabled: persistedState?.checkoutReturnEnabled ?? false,
  confirmation: persistedState?.confirmation ?? null,
  confirmationDetails: persistedState?.confirmationDetails ?? null,
};

const resolveGraphqlUrl = () =>
  import.meta.env.VITE_GRAPHQL_URL?.trim()
  || import.meta.env.VITE_API_BASE_URL?.trim()
  || "";

const isGraphqlEndpoint = (url: string) => {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.pathname.toLowerCase().includes("graphql");
  } catch {
    return url.toLowerCase().includes("graphql");
  }
};

const buildSelectedPackage = (item: StandardRate | DealItem | AppliedPromoCode): SelectedPackage => {
  if ("promotionId" in item) {
    return {
      kind: "PROMO",
      title: item.title,
      description: item.description,
      totalPrice: item.totalPrice,
      discountAmount: item.discountAmount,
      originalPrice: item.originalPrice,
      promotionId: item.promotionId,
      promoCodeId: item.promoCodeId,
      promotionType: item.promotionType,
    };
  }

  if ("discountAmount" in item) {
    return {
      kind: "DEAL",
      title: item.title,
      totalPrice: item.totalPrice,
      discountAmount: item.discountAmount,
    };
  }

  return {
    kind: "STANDARD",
    title: item.title,
    description: item.description,
    totalPrice: item.totalPrice,
  };
};

const normalizeExpiryYear = (year: string) => {
  const digits = year.replace(/\D/g, "");
  return digits.length === 2 ? `20${digits}` : digits;
};

const buildIdempotencyKey = (selection: ReservationSelection) =>
  [
    "booking",
    selection.search.checkIn,
    selection.room.roomTypeId.slice(0, 8),
    crypto.randomUUID(),
  ].join("-");

const resolveGuestBookingApiUrl = (path: string) => {
  const configuredUrl = import.meta.env.VITE_BOOKING_API_URL?.trim()
    || resolveGraphqlUrl();

  if (!configuredUrl) {
    return "";
  }

  const trimmedPath = path.startsWith("/") ? path : `/${path}`;

  try {
    const parsed = new URL(configuredUrl, window.location.origin);
    const normalizedPath = parsed.pathname.replace(/\/api\/graphql$/i, "").replace(/\/$/, "");
    parsed.pathname = `${normalizedPath}/api/guest-bookings${trimmedPath}`;
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return configuredUrl.replace(/\/api\/graphql$/i, "").replace(/\/$/, "") + `/api/guest-bookings${trimmedPath}`;
  }
};

const normalizeGuestTypeForBooking = (guestTypeName: string) =>
  guestTypeName.trim().toUpperCase().replace(/\s+/g, "_");

const buildGuestsPayload = (
  selection: ReservationSelection,
  form: BookingFormData,
): CompleteBookingPayload["guests"] => {
  const adultGuestType = selection.search.guestSelections.find(
    (guestSelection) => guestSelection.count > 0 && guestSelection.guestTypeName.toLowerCase().includes("adult")
  );

  const guests: CompleteBookingPayload["guests"] = [
    {
      firstName: form.traveler.firstName,
      lastName: form.traveler.lastName,
      guestType: normalizeGuestTypeForBooking(adultGuestType?.guestTypeName ?? "ADULT"),
      phone: formatPhoneForSubmission(form.traveler.phoneCountryCode, form.traveler.phone),
      email: form.traveler.email.trim(),
    },
  ];

  form.optionalTravelers.forEach((optionalTraveler) => {
    if (!optionalTraveler.firstName.trim() && !optionalTraveler.lastName.trim()) {
      return;
    }

    guests.push({
      firstName: optionalTraveler.firstName,
      lastName: optionalTraveler.lastName,
      guestType: normalizeGuestTypeForBooking(optionalTraveler.guestTypeName),
    });
  });

  return guests;
};

const buildBookingSummaryFromPreview = (
  preview: TripItineraryPreview,
  selectedPackage: SelectedPackage,
): BookingSummary => ({
  subtotal: preview.subtotal,
  taxesAndSurcharges: preview.taxesAndSurcharges,
  dueNow: preview.dueNow,
  dueAtResort: preview.dueAtResort,
  total: Number((preview.subtotal + preview.taxesAndSurcharges).toFixed(2)),
  promoTitle: preview.promotionName || (
    selectedPackage.kind === "PROMO" || selectedPackage.kind === "DEAL"
      ? selectedPackage.title
      : undefined
  ),
});

const buildPricingPayload = (
  selection: ReservationSelection,
  itineraryPreview: TripItineraryPreview | null,
): BookingSummary =>
  itineraryPreview
    ? buildBookingSummaryFromPreview(itineraryPreview, selection.selectedPackage)
    : selection.summary;

const buildConfirmPayload = (
  selection: ReservationSelection,
  form: BookingFormData,
  itineraryPreview: TripItineraryPreview | null,
  guestVerification: GuestVerification,
): GuestBookingConfirmPayload => ({
  verificationId: guestVerification.verificationId,
  roomTypeId: selection.room.roomTypeId,
  propertyId: selection.search.propertyId,
  tenantId: selection.search.tenantId,
  tenantName: selection.search.tenantName,
  checkIn: selection.search.checkIn,
  checkOut: selection.search.checkOut,
  rooms: selection.search.rooms,
  guestSelections: selection.search.guestSelections,
  bookingPackage: {
    kind: selection.selectedPackage.kind,
    title: selection.selectedPackage.title,
    description: selection.selectedPackage.description,
    totalPrice: selection.selectedPackage.totalPrice,
    discountAmount: selection.selectedPackage.discountAmount,
    originalPrice: selection.selectedPackage.originalPrice,
    promotionId: selection.selectedPackage.promotionId,
    promoCodeId: selection.selectedPackage.promoCodeId,
    promotionType: selection.selectedPackage.promotionType,
  },
  traveler: {
    firstName: form.traveler.firstName,
    lastName: form.traveler.lastName,
    phone: formatPhoneForSubmission(form.traveler.phoneCountryCode, form.traveler.phone),
    email: form.traveler.email.trim(),
  },
  optionalTravelers: form.optionalTravelers.map((optionalTraveler) => ({
    id: optionalTraveler.id,
    guestTypeName: optionalTraveler.guestTypeName,
    label: optionalTraveler.label,
    firstName: optionalTraveler.firstName,
    lastName: optionalTraveler.lastName,
  })),
  billing: {
    firstName: form.billing.firstName,
    lastName: form.billing.lastName,
    address1: form.billing.address1,
    address2: form.billing.address2,
    country: form.billing.country,
    city: form.billing.city,
    state: form.billing.state,
    zipCode: form.billing.zipCode,
    phone: formatPhoneForSubmission(form.billing.phoneCountryCode, form.billing.phone),
    email: form.billing.email.trim().toLowerCase(),
  },
  payment: {
    cardNumber: form.payment.cardNumber.replace(/\s+/g, ""),
    expiryMonth: form.payment.expiryMonth,
    expiryYear: normalizeExpiryYear(form.payment.expiryYear),
  },
  pricing: buildPricingPayload(selection, itineraryPreview),
});

const buildCompleteBookingPayload = (
  selection: ReservationSelection,
  form: BookingFormData,
): CompleteBookingPayload => ({
  roomTypeId: selection.room.roomTypeId,
  propertyId: selection.search.propertyId,
  checkIn: selection.search.checkIn,
  checkOut: selection.search.checkOut,
  rooms: selection.search.rooms,
  guestSelections: selection.search.guestSelections,
  guests: buildGuestsPayload(selection, form),
  billing: {
    firstName: form.billing.firstName,
    lastName: form.billing.lastName,
    address1: form.billing.address1,
    address2: form.billing.address2,
    city: form.billing.city,
    state: form.billing.state,
    zip: form.billing.zipCode,
    country: form.billing.country,
    phone: formatPhoneForSubmission(form.billing.phoneCountryCode, form.billing.phone),
    email: form.billing.email.trim().toLowerCase(),
  },
  agreeToTerms: form.payment.agreedToTerms,
  promotionId: selection.selectedPackage.promotionId ?? null,
  cardLast4: form.payment.cardNumber.replace(/\D/g, "").slice(-4),
  idempotencyKey: buildIdempotencyKey(selection),
});

export const buildBookingSummary = (selectedPackage: SelectedPackage): BookingSummary => {
  const subtotal = selectedPackage.totalPrice;
  const taxesAndSurcharges = Number((subtotal * 0.12).toFixed(2));
  const total = Number((subtotal + taxesAndSurcharges).toFixed(2));
  const dueAtResort = Number((total * 0.18).toFixed(2));
  const dueNow = Number((total - dueAtResort).toFixed(2));

  return {
    subtotal,
    taxesAndSurcharges,
    dueNow,
    dueAtResort,
    total,
    promoTitle: selectedPackage.kind === "PROMO" || selectedPackage.kind === "DEAL"
      ? selectedPackage.title
      : undefined,
  };
};

export const createBookingSelection = ({
  room,
  packageItem,
  search,
}: {
  room: SearchRoomItem;
  packageItem: StandardRate | DealItem | AppliedPromoCode;
  search: BookingSearchContext;
}): ReservationSelection => {
  const selectedPackage = buildSelectedPackage(packageItem);

  return {
    room,
    selectedPackage,
    search,
    summary: buildBookingSummary(selectedPackage),
    image: room.images?.[0],
  };
};

export const fetchTripItineraryPreview = createAsyncThunk<
  TripItineraryPreview | null,
  void,
  { state: { booking: BookingState } }
>("booking/fetchTripItineraryPreview", async (_, thunkApi) => {
  const state = thunkApi.getState().booking;
  const selection = state.selection;
  const configuredUrl = resolveGraphqlUrl();

  if (!selection) {
    return null;
  }

  if (!configuredUrl || !isGraphqlEndpoint(configuredUrl)) {
    return null;
  }

  const response = await fetch(configuredUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operationName: "TripItineraryPreview",
      query: TRIP_ITINERARY_PREVIEW_QUERY,
      variables: {
        input: {
          roomTypeId: selection.room.roomTypeId,
          propertyId: selection.search.propertyId,
          checkIn: selection.search.checkIn,
          checkOut: selection.search.checkOut,
          rooms: selection.search.rooms,
          guestSelections: selection.search.guestSelections,
          promotionId: selection.selectedPackage.promotionId ?? null,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to load trip itinerary preview");
  }

  const result = (await response.json()) as TripItineraryPreviewGraphqlResponse;
  if (result.errors?.length) {
    throw new Error(result.errors[0]?.message ?? "Failed to load trip itinerary preview");
  }

  return result.data?.tripItineraryPreview ?? null;
});

export const requestGuestBookingOtp = createAsyncThunk<
  OtpRequestResponse,
  { email: string; phone: string }
>("booking/requestGuestBookingOtp", async ({ email, phone }) => {
  const endpoint = resolveGuestBookingApiUrl("/otp/request");
  if (!endpoint) {
    throw new Error("Guest verification API is not configured");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, phone }),
  });

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(result?.message ?? "Failed to send verification codes");
  }

  return result as OtpRequestResponse;
});

export const verifyGuestBookingOtp = createAsyncThunk<
  OtpVerifyResponse,
  { verificationId: string; channel: "EMAIL" | "PHONE"; otp: string }
>("booking/verifyGuestBookingOtp", async ({ verificationId, channel, otp }) => {
  const endpoint = resolveGuestBookingApiUrl("/otp/verify");
  if (!endpoint) {
    throw new Error("Guest verification API is not configured");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ verificationId, channel, otp }),
  });

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(result?.message ?? "Failed to verify OTP");
  }

  return result as OtpVerifyResponse;
});

export const submitBooking = createAsyncThunk<
  BookingConfirmation,
  void,
  { state: { booking: BookingState } }
>("booking/submitBooking", async (_, thunkApi) => {
  const state = thunkApi.getState().booking;
  const selection = state.selection;
  const graphqlUrl = resolveGraphqlUrl();
  const confirmEndpoint = resolveGuestBookingApiUrl("/confirm");
  const isGuestCheckout = !!state.guestVerification.verificationId || state.guestVerification.otpRequested;

  if (!selection) {
    throw new Error("No package selected for checkout");
  }

  if (isGuestCheckout) {
    if (!confirmEndpoint) {
      throw new Error("Guest booking API is not configured");
    }

    const confirmResponse = await fetch(confirmEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        buildConfirmPayload(
          selection,
          state.form,
          state.itineraryPreview,
          state.guestVerification,
        )
      ),
    });

    const confirmResult = await confirmResponse.json().catch(() => null);
    if (!confirmResponse.ok) {
      throw new Error(confirmResult?.message ?? "Failed to confirm guest booking");
    }

    const guestConfirmation = confirmResult as GuestConfirmResponse;
    if (!guestConfirmation.bookingId || !guestConfirmation.confirmationToken || !guestConfirmation.confirmationUrl) {
      throw new Error("Invalid backend response: missing guest confirmation data");
    }

    return guestConfirmation;
  }

  if (!graphqlUrl || !isGraphqlEndpoint(graphqlUrl)) {
    throw new Error("Booking GraphQL endpoint is not configured");
  }

  const completeBookingResponse = await fetch(graphqlUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operationName: "CompleteBooking",
      query: COMPLETE_BOOKING_MUTATION,
      variables: {
        input: buildCompleteBookingPayload(selection, state.form),
      },
    }),
  });

  const completeBookingResult = (await completeBookingResponse.json()) as CompleteBookingGraphqlResponse;
  if (!completeBookingResponse.ok) {
    throw new Error(completeBookingResult.errors?.[0]?.message ?? "Failed to complete booking");
  }

  if (completeBookingResult.errors?.length) {
    throw new Error(completeBookingResult.errors[0]?.message ?? "Failed to complete booking");
  }

  const completedBooking = completeBookingResult.data?.completeBooking;
  if (!completedBooking?.confirmationToken) {
    throw new Error("Invalid backend response: missing confirmation token");
  }

  return {
    bookingId: completedBooking.bookingId,
    confirmationToken: completedBooking.confirmationToken,
    confirmationUrl: `/${selection.search.tenantName}/confirmation?confirmationToken=${encodeURIComponent(completedBooking.confirmationToken)}`,
    createdAt: new Date().toISOString(),
    completeBooking: completedBooking,
  };
});

export const fetchBookingConfirmation = createAsyncThunk<
  BookingConfirmationDetails,
  string | void,
  { state: { booking: BookingState } }
>("booking/fetchBookingConfirmation", async (providedToken, thunkApi) => {
  const state = thunkApi.getState().booking;
  const confirmationToken = providedToken ?? state.confirmation?.confirmationToken;
  const graphqlUrl = resolveGraphqlUrl();

  if (!confirmationToken) {
    throw new Error("Missing confirmation token");
  }

  if (!graphqlUrl || !isGraphqlEndpoint(graphqlUrl)) {
    throw new Error("Confirmation endpoint is not configured");
  }

  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operationName: "GetBookingConfirmation",
      query: GET_BOOKING_CONFIRMATION_QUERY,
      variables: {
        confirmationToken,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to load booking confirmation");
  }

  const result = (await response.json()) as BookingConfirmationGraphqlResponse;
  if (result.errors?.length) {
    throw new Error(result.errors[0]?.message ?? "Failed to load booking confirmation");
  }

  const confirmationDetails = result.data?.getBookingConfirmation;
  if (!confirmationDetails) {
    throw new Error("Invalid backend response: missing booking confirmation");
  }

  return confirmationDetails;
});

export const persistBookingState = (state: BookingState) => {
  if (typeof window === "undefined") {
    return;
  }

  const value: BookingStoredState = {
    selection: state.selection,
    itineraryPreview: state.itineraryPreview,
    form: state.form,
    checkoutReturnEnabled: state.checkoutReturnEnabled,
    confirmation: state.confirmation,
    confirmationDetails: state.confirmationDetails,
  };

  window.localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(value));
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setBookingSelection: (state, action: PayloadAction<ReservationSelection>) => {
      state.selection = action.payload;
      state.itineraryPreview = null;
      state.itineraryLoading = false;
      state.itineraryError = null;
      state.checkoutReturnEnabled = false;
      state.loading = false;
      state.error = null;
      state.confirmation = null;
      state.confirmationDetails = null;
      state.confirmationLoading = false;
      state.confirmationError = null;
      state.guestVerification = createEmptyGuestVerification();
      state.form.traveler = {
        ...emptyTraveler,
        email: state.form.traveler.email,
        phoneCountryCode: state.form.traveler.phoneCountryCode,
        phone: state.form.traveler.phone,
      };
      state.form.optionalTravelers = [];
      state.form.billing = {
        ...emptyBilling,
        email: state.form.billing.email || state.form.traveler.email,
        phoneCountryCode: state.form.billing.phoneCountryCode || state.form.traveler.phoneCountryCode,
        phone: state.form.billing.phone || state.form.traveler.phone,
      };
      state.form.payment = emptyPayment;
    },
    setBookingForm: (state, action: PayloadAction<BookingFormData>) => {
      state.form = action.payload;
    },
    updateTravelerInfo: (state, action: PayloadAction<Partial<TravelerInfo>>) => {
      state.form.traveler = {
        ...state.form.traveler,
        ...action.payload,
      };
    },
    updateOptionalTravelerInfo: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<OptionalTravelerDetail> }>
    ) => {
      state.form.optionalTravelers = state.form.optionalTravelers.map((optionalTraveler) =>
        optionalTraveler.id === action.payload.id
          ? { ...optionalTraveler, ...action.payload.changes }
          : optionalTraveler
      );
    },
    addOptionalTraveler: (state, action: PayloadAction<OptionalTravelerDetail>) => {
      state.form.optionalTravelers.push(action.payload);
    },
    removeOptionalTraveler: (state, action: PayloadAction<string>) => {
      state.form.optionalTravelers = state.form.optionalTravelers.filter(
        (optionalTraveler) => optionalTraveler.id !== action.payload
      );
    },
    updateBillingInfo: (state, action: PayloadAction<Partial<BillingInfo>>) => {
      state.form.billing = {
        ...state.form.billing,
        ...action.payload,
      };
    },
    updatePaymentInfo: (state, action: PayloadAction<Partial<PaymentInfo>>) => {
      state.form.payment = {
        ...state.form.payment,
        ...action.payload,
      };
    },
    enableCheckoutReturn: (state) => {
      state.checkoutReturnEnabled = true;
    },
    disableCheckoutReturn: (state) => {
      state.checkoutReturnEnabled = false;
    },
    clearBooking: (state) => {
      state.selection = null;
      state.itineraryPreview = null;
      state.itineraryLoading = false;
      state.itineraryError = null;
      state.checkoutReturnEnabled = false;
      state.loading = false;
      state.error = null;
      state.confirmation = null;
      state.confirmationDetails = null;
      state.confirmationLoading = false;
      state.confirmationError = null;
      state.guestVerification = createEmptyGuestVerification();
      state.form = {
        traveler: emptyTraveler,
        optionalTravelers: [],
        billing: emptyBilling,
        payment: emptyPayment,
      };
    },
    clearBookingError: (state) => {
      state.error = null;
    },
    resetGuestVerification: (state) => {
      state.guestVerification = createEmptyGuestVerification();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTripItineraryPreview.pending, (state) => {
        state.itineraryLoading = true;
        state.itineraryError = null;
      })
      .addCase(fetchTripItineraryPreview.fulfilled, (state, action) => {
        state.itineraryLoading = false;
        state.itineraryPreview = action.payload;
      })
      .addCase(fetchTripItineraryPreview.rejected, (state, action) => {
        state.itineraryLoading = false;
        state.itineraryError = action.error.message ?? "Failed to load trip itinerary preview";
      })
      .addCase(requestGuestBookingOtp.pending, (state) => {
        state.guestVerification.requestLoading = true;
        state.guestVerification.error = null;
      })
      .addCase(requestGuestBookingOtp.fulfilled, (state, action) => {
        state.guestVerification.requestLoading = false;
        state.guestVerification.verificationId = action.payload.verificationId;
        state.guestVerification.email = action.meta.arg.email.trim().toLowerCase();
        state.guestVerification.phone = action.meta.arg.phone.trim();
        state.guestVerification.emailVerified = false;
        state.guestVerification.phoneVerified = false;
        state.guestVerification.otpRequested = true;
      })
      .addCase(requestGuestBookingOtp.rejected, (state, action) => {
        state.guestVerification.requestLoading = false;
        state.guestVerification.error = action.error.message ?? "Failed to send verification codes";
      })
      .addCase(verifyGuestBookingOtp.pending, (state) => {
        state.guestVerification.verifyLoading = true;
        state.guestVerification.error = null;
      })
      .addCase(verifyGuestBookingOtp.fulfilled, (state, action) => {
        state.guestVerification.verifyLoading = false;
        state.guestVerification.verificationId = action.payload.verificationId;
        state.guestVerification.emailVerified = action.payload.emailVerified;
        state.guestVerification.phoneVerified = action.payload.phoneVerified;
        state.guestVerification.otpRequested = true;
      })
      .addCase(verifyGuestBookingOtp.rejected, (state, action) => {
        state.guestVerification.verifyLoading = false;
        state.guestVerification.error = action.error.message ?? "Failed to verify OTP";
      })
      .addCase(submitBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.confirmation = action.payload;
        state.confirmationDetails = null;
        state.confirmationLoading = false;
        state.confirmationError = null;
        state.checkoutReturnEnabled = false;
        state.guestVerification = createEmptyGuestVerification();
      })
      .addCase(submitBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Booking failed";
      })
      .addCase(fetchBookingConfirmation.pending, (state) => {
        state.confirmationLoading = true;
        state.confirmationError = null;
      })
      .addCase(fetchBookingConfirmation.fulfilled, (state, action) => {
        state.confirmationLoading = false;
        state.confirmationDetails = action.payload;
      })
      .addCase(fetchBookingConfirmation.rejected, (state, action) => {
        state.confirmationLoading = false;
        state.confirmationError = action.error.message ?? "Failed to load booking confirmation";
      });
  },
});

export const {
  addOptionalTraveler,
  clearBooking,
  clearBookingError,
  disableCheckoutReturn,
  enableCheckoutReturn,
  resetGuestVerification,
  removeOptionalTraveler,
  setBookingForm,
  setBookingSelection,
  updateOptionalTravelerInfo,
  updateBillingInfo,
  updatePaymentInfo,
  updateTravelerInfo,
} = bookingSlice.actions;

export default bookingSlice.reducer;
