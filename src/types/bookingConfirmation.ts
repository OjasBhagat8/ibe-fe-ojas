export const GuestType = {
  ADULT: "ADULT",
  CHILD: "CHILD",
} as const;

export type GuestType = typeof GuestType[keyof typeof GuestType];

export type GuestTypeItem = {
  guestType: GuestType;
  count: number;
};

export type BillingInfo = {
  nameOnBill: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  maskedEmail: string;
  maskedPhone: string;
};

export type PaymentInfo = {
  paymentMethod: string;
  maskedCard: string | null;
};

export type Guest = {
  firstName: string;
  lastName: string;
  guestType: string;
  email: string | null;
  phone: string | null;
  maskedEmail: string | null;
  maskedPhone: string | null;
  isPrimary: boolean;
};

export type BookingConfirmationData = {
  bookingId: string;
  reservationNumber: string;
  status: string;
  createdAt: string;
  propertyId: string;
  propertyName: string;
  roomTypeId: string;
  roomTypeName: string;
  roomImage: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guestCount: number;
  subtotal: number;
  taxesAndSurcharges: number;
  dueNow: number;
  dueAtResort: number;
  totalForStay: number;
  guestTypes: GuestTypeItem[];
  billing: BillingInfo;
  payment: PaymentInfo;
  guests: Guest[];
};

export type GetBookingConfirmationResponse = {
  getBookingConfirmation: BookingConfirmationData;
};
