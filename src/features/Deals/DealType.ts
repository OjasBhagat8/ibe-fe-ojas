export interface GuestSelection {
  guestTypeName: string;
  count: number;
}

export interface RoomDealsInput {
  roomTypeId: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guestSelections: GuestSelection[];
}

export interface StandardRate {
  title: string;
  description: string;
  totalPrice: number;
}

export interface DealItem {
  title: string;
  totalPrice: number;
  discountAmount: number;
}

export interface RoomDeals {
  standardRate: StandardRate;
  deals: DealItem[];
}

export interface RoomDealsResponse {
  data?: {
    roomDeals?: RoomDeals;
  };
  errors?: {
    message?: string;
  }[];
}

export interface PromoCodeApplyInput extends RoomDealsInput {
  promoCode: string;
}

export interface AppliedPromoCode {
  promotionId: string;
  promoCodeId: string;
  title: string;
  description: string;
  totalPrice: number;
  originalPrice: number;
  discountAmount: number;
  promotionType: string;
}

export interface ApplyPromoCodeResponse {
  data?: {
    applyPromoCode?: AppliedPromoCode;
  };
  errors?: {
    message?: string;
  }[];
}
