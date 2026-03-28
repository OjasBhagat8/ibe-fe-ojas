import type { PaymentInfo } from "../../features/booking/bookingSlice";
import type { PaymentErrors } from "./checkoutValidation";
import { formatCardNumber, formatCurrency, getErrorMessage, onlyDigits } from "./checkoutUtils";
import styles from "../Checkout.module.scss";

type Props = {
  bookingError: string | null;
  canToggle: boolean;
  dueNow: number | null;
  errors: PaymentErrors;
  expanded: boolean;
  loading: boolean;
  payment: PaymentInfo;
  onPaymentChange: (field: keyof PaymentInfo, value: string | boolean) => void;
  onToggle: () => void;
  onEditBilling: () => void;
  onOpenTerms: () => void;
  onSubmit: () => void;
};

const PaymentSection = ({
  bookingError,
  canToggle,
  dueNow,
  errors,
  expanded,
  loading,
  payment,
  onPaymentChange,
  onToggle,
  onEditBilling,
  onOpenTerms,
  onSubmit,
}: Props) => (
  <div className={styles.section}>
    <button
      type="button"
      className={styles.sectionHeaderButton}
      onClick={onToggle}
      aria-expanded={expanded}
      disabled={!canToggle}
    >
      3. Payment Info
    </button>
    <div className={styles.sectionBody} hidden={!expanded}>
      <div className={styles.fieldGridPayment}>
        <label className={styles.field}>
          <span>Card Number</span>
          <input
            type="text"
            name="payment.cardNumber"
            value={payment.cardNumber}
            onChange={(event) => onPaymentChange("cardNumber", formatCardNumber(event.target.value))}
          />
          {errors.cardNumber ? <small>{getErrorMessage(errors.cardNumber)}</small> : null}
        </label>

        <label className={styles.field}>
          <span>Exp MM</span>
          <input
            type="text"
            name="payment.expiryMonth"
            inputMode="numeric"
            placeholder="03"
            value={payment.expiryMonth}
            onChange={(event) => onPaymentChange("expiryMonth", onlyDigits(event.target.value).slice(0, 2))}
          />
          {errors.expiryMonth ? <small>{getErrorMessage(errors.expiryMonth)}</small> : null}
        </label>

        <label className={styles.field}>
          <span>Exp YY</span>
          <input
            type="text"
            name="payment.expiryYear"
            inputMode="numeric"
            placeholder="26"
            value={payment.expiryYear}
            onChange={(event) => onPaymentChange("expiryYear", onlyDigits(event.target.value).slice(0, 2))}
          />
          {errors.expiryYear ? <small>{getErrorMessage(errors.expiryYear)}</small> : null}
        </label>
      </div>

      <label className={`${styles.field} ${styles.cvvField}`}>
        <span>CVV Code</span>
        <input
          type="password"
          name="payment.cvv"
          inputMode="numeric"
          value={payment.cvv}
          onChange={(event) => onPaymentChange("cvv", onlyDigits(event.target.value).slice(0, 4))}
        />
        {errors.cvv ? <small>{getErrorMessage(errors.cvv)}</small> : null}
      </label>

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          name="payment.agreedToTerms"
          checked={payment.agreedToTerms}
          onChange={(event) => onPaymentChange("agreedToTerms", event.target.checked)}
        />
        <span>
          I agree to the{" "}
          <button type="button" className={styles.inlineButton} onClick={onOpenTerms}>
            Terms and Policies
          </button>{" "}
          of travel
        </span>
      </label>
      {errors.agreedToTerms ? (
        <small className={styles.termsError}>{getErrorMessage(errors.agreedToTerms)}</small>
      ) : null}

      <div className={styles.totalDue}>
        <span>Total Due</span>
        <strong>{dueNow !== null ? formatCurrency(dueNow) : "--"}</strong>
      </div>

      {bookingError ? <div className={styles.submitError}>{bookingError}</div> : null}

      <div className={styles.actionsRowSplit}>
        <button type="button" className={styles.linkButton} onClick={onEditBilling}>
          Edit Billing Info.
        </button>
        <button type="button" className={styles.primaryButton} onClick={onSubmit} disabled={loading}>
          {loading ? "PROCESSING..." : "BOOK NOW"}
        </button>
      </div>
    </div>
  </div>
);

export default PaymentSection;
