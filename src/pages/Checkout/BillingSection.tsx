import type { BillingInfo } from "../../features/booking/bookingSlice";
import type { BillingErrors } from "./checkoutValidation";
import CountryCodeDropdown from "./CountryCodeDropdown";
import SearchableDropdown from "./SearchableDropdown";
import { countryOptions, getErrorMessage, phoneCountryOptions } from "./checkoutUtils";
import styles from "../Checkout.module.scss";

type Option = {
  value: string;
  label: string;
};

type Props = {
  billing: BillingInfo;
  canToggle: boolean;
  cityOptions: Option[];
  emailOtp: string;
  emailVerified: boolean;
  errors: BillingErrors;
  expanded: boolean;
  guestMessage: string;
  isGuestCheckout: boolean;
  otpRequested: boolean;
  otpRequestLoading: boolean;
  otpVerifyLoading: boolean;
  nextDisabled: boolean;
  phoneOtp: string;
  phoneVerified: boolean;
  stateOptions: Option[];
  verificationError: string | null;
  onBillingChange: (field: keyof BillingInfo, value: string) => void;
  onChangeEmailOtp: (value: string) => void;
  onChangePhoneOtp: (value: string) => void;
  onCountryChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onToggle: () => void;
  onEditTraveler: () => void;
  onNext: () => void;
  onResendOtps: () => void;
  onVerifyEmailOtp: () => void;
  onVerifyPhoneOtp: () => void;
};

const BillingSection = ({
  billing,
  canToggle,
  cityOptions,
  emailOtp,
  emailVerified,
  errors,
  expanded,
  guestMessage,
  isGuestCheckout,
  otpRequested,
  otpRequestLoading,
  otpVerifyLoading,
  nextDisabled,
  phoneOtp,
  phoneVerified,
  stateOptions,
  verificationError,
  onBillingChange,
  onChangeEmailOtp,
  onChangePhoneOtp,
  onCountryChange,
  onStateChange,
  onToggle,
  onEditTraveler,
  onNext,
  onResendOtps,
  onVerifyEmailOtp,
  onVerifyPhoneOtp,
}: Props) => (
  <div className={styles.section}>
    <button
      type="button"
      className={styles.sectionHeaderButton}
      onClick={onToggle}
      aria-expanded={expanded}
      disabled={!canToggle}
    >
      2. Billing Info
    </button>
    <div className={styles.sectionBody} hidden={!expanded}>
      <div className={styles.fieldGridTwo}>
        <label className={styles.field}>
          <span>First Name</span>
          <input type="text" name="billing.firstName" value={billing.firstName} onChange={(event) => onBillingChange("firstName", event.target.value)} />
          {errors.firstName ? <small>{getErrorMessage(errors.firstName)}</small> : null}
        </label>

        <label className={styles.field}>
          <span>Last Name</span>
          <input type="text" name="billing.lastName" value={billing.lastName} onChange={(event) => onBillingChange("lastName", event.target.value)} />
        </label>
      </div>

      <div className={styles.fieldGridTwo}>
        <label className={styles.field}>
          <span>Mailing Address 1</span>
          <input type="text" name="billing.address1" value={billing.address1} onChange={(event) => onBillingChange("address1", event.target.value)} />
          {errors.address1 ? <small>{getErrorMessage(errors.address1)}</small> : null}
        </label>

        <label className={styles.field}>
          <span>Mailing Address 2</span>
          <input type="text" name="billing.address2" value={billing.address2} onChange={(event) => onBillingChange("address2", event.target.value)} />
        </label>
      </div>

      <div className={styles.fieldGridThree}>
        <label className={styles.field}>
          <span>Country</span>
          <SearchableDropdown
            name="billing.country"
            options={countryOptions}
            value={billing.country}
            placeholder="Choose"
            noOptionsText="No country found"
            onChange={onCountryChange}
          />
          {errors.country ? <small>{getErrorMessage(errors.country)}</small> : null}
        </label>

        <label className={styles.field}>
          <span>State</span>
          <SearchableDropdown
            name="billing.state"
            options={stateOptions}
            value={billing.state}
            placeholder="Choose"
            noOptionsText="No state found"
            disabled={!billing.country}
            onChange={onStateChange}
          />
          {errors.state ? <small>{getErrorMessage(errors.state)}</small> : null}
        </label>

        <label className={styles.field}>
          <span>City</span>
          <SearchableDropdown
            name="billing.city"
            options={cityOptions}
            value={billing.city}
            placeholder={billing.country && billing.state ? "Choose" : "Select country and state first"}
            noOptionsText="No city found"
            disabled={!billing.country || !billing.state}
            onChange={(value) => onBillingChange("city", value)}
          />
          {errors.city ? <small>{getErrorMessage(errors.city)}</small> : null}
        </label>
      </div>

      <div className={styles.fieldGridThree}>
        <label className={styles.field}>
          <span>Zip</span>
          <input type="text" name="billing.zipCode" value={billing.zipCode} onChange={(event) => onBillingChange("zipCode", event.target.value)} />
          {errors.zipCode ? <small>{getErrorMessage(errors.zipCode)}</small> : null}
        </label>

        <label className={styles.field}>
          <span>Country Code</span>
          <CountryCodeDropdown
            name="billing.phoneCountryCode"
            options={phoneCountryOptions}
            value={billing.phoneCountryCode}
            onChange={(value) => onBillingChange("phoneCountryCode", value)}
          />
          {errors.phoneCountryCode ? <small>{getErrorMessage(errors.phoneCountryCode)}</small> : null}
        </label>

        <label className={styles.field}>
          <span>Phone</span>
          <input type="tel" name="billing.phone" value={billing.phone} onChange={(event) => onBillingChange("phone", event.target.value)} />
          {errors.phone ? <small>{getErrorMessage(errors.phone)}</small> : null}
        </label>
      </div>

      <label className={styles.field}>
        <span>Email</span>
        <input type="email" name="billing.email" value={billing.email} onChange={(event) => onBillingChange("email", event.target.value)} />
        {errors.email ? <small>{getErrorMessage(errors.email)}</small> : null}
      </label>

      {isGuestCheckout ? (
        <div className={styles.verificationPanel}>
          <div className={styles.verificationHeader}>
            <strong>Guest verification</strong>
            {otpRequested ? (
              <button type="button" className={styles.inlineButton} onClick={onResendOtps} disabled={otpRequestLoading}>
                {otpRequestLoading ? "Sending..." : "Resend OTPs"}
              </button>
            ) : null}
          </div>

          <p className={styles.verificationCopy}>
            Guests must verify both email and phone before payment.
          </p>

          {otpRequested ? (
            <>
              <div className={styles.fieldGridTwo}>
                <label className={styles.field}>
                  <span>Email OTP</span>
                  <div className={styles.otpInputRow}>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={emailOtp}
                      onChange={(event) => onChangeEmailOtp(event.target.value)}
                      placeholder="Enter email OTP"
                    />
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={onVerifyEmailOtp}
                      disabled={otpVerifyLoading || emailVerified}
                    >
                      {emailVerified ? "VERIFIED" : "VERIFY"}
                    </button>
                  </div>
                </label>

                <label className={styles.field}>
                  <span>Phone OTP</span>
                  <div className={styles.otpInputRow}>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={phoneOtp}
                      onChange={(event) => onChangePhoneOtp(event.target.value)}
                      placeholder="Enter phone OTP"
                    />
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={onVerifyPhoneOtp}
                      disabled={otpVerifyLoading || phoneVerified}
                    >
                      {phoneVerified ? "VERIFIED" : "VERIFY"}
                    </button>
                  </div>
                </label>
              </div>

              <div className={styles.verificationStatusRow}>
                <span className={emailVerified ? styles.verifiedBadge : styles.pendingBadge}>
                  Email {emailVerified ? "verified" : "pending"}
                </span>
                <span className={phoneVerified ? styles.verifiedBadge : styles.pendingBadge}>
                  Phone {phoneVerified ? "verified" : "pending"}
                </span>
              </div>
            </>
          ) : null}

          {guestMessage ? <p className={styles.verificationInfo}>{guestMessage}</p> : null}
          {verificationError ? <p className={styles.submitError}>{verificationError}</p> : null}
          {otpVerifyLoading ? <p className={styles.verificationInfo}>Verifying OTP...</p> : null}
        </div>
      ) : null}

      <div className={styles.actionsRowSplit}>
        <button type="button" className={styles.linkButton} onClick={onEditTraveler}>
          Edit Traveler Info.
        </button>
        <button type="button" className={styles.primaryButton} onClick={onNext} disabled={nextDisabled}>
          NEXT: PAYMENT INFO
        </button>
      </div>
    </div>
  </div>
);

export default BillingSection;
