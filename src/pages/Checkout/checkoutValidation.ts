import { City, State } from "country-state-city";
import { isValidPhoneNumber } from "libphonenumber-js";
import { postcodeValidator } from "postcode-validator";
import { find as findIndianPostalCode } from "postalcodes-india";
import { lookup as lookupZipcode } from "zipcodes";
import type {
  BillingInfo,
  BookingFormData,
  PaymentInfo,
  TravelerInfo,
} from "../../features/booking/bookingSlice";
import { formatPhoneForSubmission, getDialCodeByCountry, onlyDigits } from "./checkoutUtils";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeText = (value: string) =>
  value.trim().toLowerCase().replace(/\./g, "").replace(/\s+/g, " ");

const normalizeLocationText = (value: string) =>
  normalizeText(value)
    .replace(/\bbengaluru\b/g, "bangalore")
    .replace(/\bmumbai\b/g, "bombay")
    .replace(/\bkolkata\b/g, "calcutta")
    .replace(/\bchennai\b/g, "madras");

const hasObviousFakeDigits = (value: string) => {
  const digits = onlyDigits(value);

  if (/^(\d)\1+$/.test(digits)) {
    return true;
  }

  if (digits === "1234567890" || digits === "0123456789" || digits === "9876543210") {
    return true;
  }

  return false;
};

const getPhoneNumberError = (countryCode: string, phone: string) => {
  if (!countryCode.trim()) {
    return "Choose a country code";
  }

  if (!getDialCodeByCountry(countryCode)) {
    return "Choose a valid country code";
  }

  if (!phone.trim()) {
    return "Field cannot be empty";
  }

  if (hasObviousFakeDigits(phone)) {
    return "Enter a valid phone number";
  }

  const fullPhoneNumber = formatPhoneForSubmission(countryCode, phone);
  if (!isValidPhoneNumber(fullPhoneNumber)) {
    return "Enter a valid phone number for the selected country";
  }

  return undefined;
};

const getZipCodeError = (billing: BillingInfo) => {
  const zipCode = billing.zipCode.trim();

  if (!zipCode) {
    return "Field cannot be empty";
  }

  if (!postcodeValidator(zipCode, billing.country)) {
    return "Enter a valid postal code for the selected country";
  }

  if (billing.country === "US") {
    const zipDetails = lookupZipcode(zipCode);

    if (!zipDetails) {
      return "Enter a valid postal code";
    }

    if (billing.state && zipDetails.state !== billing.state) {
      return "ZIP code does not match the selected state";
    }

    if (billing.city) {
      const selectedCity = normalizeText(billing.city);
      const zipCity = normalizeText(zipDetails.city);

      if (selectedCity !== zipCity) {
        return "ZIP code does not match the selected city";
      }
    }
  }

  if (billing.country === "IN") {
    const postalInfo = findIndianPostalCode(zipCode);

    if (!postalInfo.isValid) {
      return "Enter a valid postal code";
    }

    const selectedStateName =
      State.getStateByCodeAndCountry(billing.state, billing.country)?.name ?? "";

    if (
      selectedStateName &&
      normalizeLocationText(postalInfo.state) !== normalizeLocationText(selectedStateName)
    ) {
      return "ZIP code does not match the selected state";
    }

    const selectedCity = normalizeLocationText(billing.city);
    const postalLocations = [
      postalInfo.place,
      postalInfo.subDistrict,
      postalInfo.district,
    ]
      .filter(Boolean)
      .map((location) => normalizeLocationText(location));

    if (selectedCity && !postalLocations.includes(selectedCity)) {
      return "ZIP code does not match the selected city";
    }
  }

  return undefined;
};

export type TravelerErrors = Partial<Record<keyof TravelerInfo, string>>;
export type BillingErrors = Partial<Record<keyof BillingInfo, string>>;
export type PaymentErrors = Partial<Record<keyof PaymentInfo, string>>;

export type CheckoutErrors = {
  traveler: TravelerErrors;
  billing: BillingErrors;
  payment: PaymentErrors;
};

export const emptyCheckoutErrors = (): CheckoutErrors => ({
  traveler: {},
  billing: {},
  payment: {},
});

export const hasErrors = (errors: Record<string, string | undefined>) =>
  Object.values(errors).some(Boolean);

export const validateTraveler = (traveler: TravelerInfo): TravelerErrors => {
  const errors: TravelerErrors = {};

  if (!traveler.firstName.trim()) {
    errors.firstName = "Field cannot be empty";
  }

  const travelerPhoneError = getPhoneNumberError(traveler.phoneCountryCode, traveler.phone);
  if (!traveler.phoneCountryCode.trim()) {
    errors.phoneCountryCode = travelerPhoneError;
  } else if (travelerPhoneError) {
    errors.phone = travelerPhoneError;
  }

  if (!traveler.email.trim()) {
    errors.email = "Field cannot be empty";
  } else if (!emailRegex.test(traveler.email.trim())) {
    errors.email = "Enter a valid email address";
  }

  return errors;
};

export const validateBilling = (billing: BillingInfo): BillingErrors => {
  const errors: BillingErrors = {};

  if (!billing.firstName.trim()) {
    errors.firstName = "Field cannot be empty";
  }

  if (!billing.address1.trim()) {
    errors.address1 = "Field cannot be empty";
  }

  if (!billing.country.trim()) {
    errors.country = "Choose a country";
  }

  if (!billing.state.trim()) {
    errors.state = "Choose a state";
  } else if (billing.country) {
    const validStates = State.getStatesOfCountry(billing.country);
    if (!validStates.some((state) => state.isoCode === billing.state)) {
      errors.state = "Choose a valid state";
    }
  }

  if (!billing.city.trim()) {
    errors.city = "Field cannot be empty";
  } else if (billing.country && billing.state) {
    const validCities = City.getCitiesOfState(billing.country, billing.state);
    if (validCities.length > 0 && !validCities.some((city) => city.name === billing.city)) {
      errors.city = "Choose a valid city";
    }
  }

  if (!billing.zipCode.trim()) {
    errors.zipCode = "Field cannot be empty";
  } else {
    const zipCodeError = getZipCodeError(billing);
    if (zipCodeError) {
      errors.zipCode = zipCodeError;
    }
  }

  const billingPhoneError = getPhoneNumberError(billing.phoneCountryCode, billing.phone);
  if (!billing.phoneCountryCode.trim()) {
    errors.phoneCountryCode = billingPhoneError;
  } else if (billingPhoneError) {
    errors.phone = billingPhoneError;
  }

  if (!billing.email.trim()) {
    errors.email = "Field cannot be empty";
  } else if (!emailRegex.test(billing.email.trim())) {
    errors.email = "Enter a valid email address";
  }

  return errors;
};

export const validatePayment = (payment: PaymentInfo): PaymentErrors => {
  const errors: PaymentErrors = {};
  const cardLength = onlyDigits(payment.cardNumber).length;

  if (![15, 16].includes(cardLength)) {
    errors.cardNumber = "Use a valid 15 or 16 digit card number";
  }

  const month = Number(payment.expiryMonth);
  if (!payment.expiryMonth || !Number.isInteger(month) || month < 1 || month > 12) {
    errors.expiryMonth = "Enter a valid month";
  }

  if (!/^\d{2}$/.test(payment.expiryYear)) {
    errors.expiryYear = "Enter a valid 2 digit year";
  } else if (!errors.expiryMonth) {
    const year = Number(payment.expiryYear);
    const now = new Date();
    const currentYearTwoDigits = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (year < currentYearTwoDigits || (year === currentYearTwoDigits && month < currentMonth)) {
      errors.expiryYear = "Card expiry cannot be in the past";
    }
  }

  const cvvLength = onlyDigits(payment.cvv).length;
  if (![3, 4].includes(cvvLength)) {
    errors.cvv = "Use a valid 3 or 4 digit CVV";
  }

  if (!payment.agreedToTerms) {
    errors.agreedToTerms = "You must agree to the terms and policies";
  }

  return errors;
};

export const validateCheckoutForm = (form: BookingFormData): CheckoutErrors => ({
  traveler: validateTraveler(form.traveler),
  billing: validateBilling(form.billing),
  payment: validatePayment(form.payment),
});
