export const ROOM_DEALS_QUERY = `
  query RoomDeals($input: RoomDealsInput!) {
    roomDeals(input: $input) {
      standardRate {
        title
        description
        totalPrice
      }
      deals {
        title
        totalPrice
        discountAmount
      }
    }
  }
`;

export const APPLY_PROMO_CODE_QUERY = `
  query ApplyPromoCode($input: PromoCodeApplyInput!) {
    applyPromoCode(input: $input) {
      promotionId
      promoCodeId
      title
      description
      totalPrice
      originalPrice
      discountAmount
      promotionType
    }
  }
`;
