import { gql } from "@apollo/client";

export const GET_BOOKING_CONFIRMATION = gql`
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
      subtotal
      taxesAndSurcharges
      dueNow
      dueAtResort
      totalForStay
      guestTypes {
        guestType
        count
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
      guests {
        firstName
        lastName
        guestType
        email
        phone
        maskedEmail
        maskedPhone
        isPrimary
      }
    }
  }
`;
