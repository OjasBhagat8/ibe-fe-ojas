import type {
  OptionalTravelerDetail,
  TravelerInfo,
} from "../../features/booking/bookingSlice";
import type { TravelerErrors } from "./checkoutValidation";
import CountryCodeDropdown from "./CountryCodeDropdown";
import { getErrorMessage, phoneCountryOptions } from "./checkoutUtils";
import styles from "../Checkout.module.scss";

type Props = {
  errors: TravelerErrors;
  expanded: boolean;
  optionalTravelerCapacity: number;
  optionalTravelers: OptionalTravelerDetail[];
  optionalTravelersMessage: string;
  traveler: TravelerInfo;
  onTravelerChange: (field: keyof TravelerInfo, value: string) => void;
  onOptionalTravelerChange: (
    id: string,
    field: "firstName" | "lastName",
    value: string
  ) => void;
  onRemoveTraveler: (id: string) => void;
  onToggle: () => void;
  onAddTraveler: () => void;
  onNext: () => void;
};

const TravelerSection = ({
  errors,
  expanded,
  optionalTravelerCapacity,
  optionalTravelers,
  optionalTravelersMessage,
  traveler,
  onTravelerChange,
  onOptionalTravelerChange,
  onRemoveTraveler,
  onToggle,
  onAddTraveler,
  onNext,
}: Props) => (
  <div className={styles.section}>
    <button type="button" className={styles.sectionHeaderButton} onClick={onToggle} aria-expanded={expanded}>
      <span>1. Traveler Info</span>
    </button>
    <div className={styles.sectionBody} hidden={!expanded}>
      <div className={styles.fieldGridTwo}>
        <label className={styles.field}>
          <span>First Name</span>
          <input type="text" name="traveler.firstName" value={traveler.firstName} onChange={(event) => onTravelerChange("firstName", event.target.value)} />
          {errors.firstName ? <small>{getErrorMessage(errors.firstName)}</small> : null}
        </label>

        <label className={styles.field}>
          <span>Last Name</span>
          <input type="text" name="traveler.lastName" value={traveler.lastName} onChange={(event) => onTravelerChange("lastName", event.target.value)} />
        </label>
      </div>

      <div className={styles.fieldGridTwo}>
        <label className={styles.field}>
          <span>Country Code</span>
          <CountryCodeDropdown
            name="traveler.phoneCountryCode"
            options={phoneCountryOptions}
            value={traveler.phoneCountryCode}
            onChange={(value) => onTravelerChange("phoneCountryCode", value)}
          />
          {errors.phoneCountryCode ? <small>{getErrorMessage(errors.phoneCountryCode)}</small> : null}
        </label>

        <label className={styles.field}>
          <span>Phone</span>
          <input
            type="tel"
            name="traveler.phone"
            value={traveler.phone}
            onChange={(event) => onTravelerChange("phone", event.target.value)}
          />
          {errors.phone ? <small>{getErrorMessage(errors.phone)}</small> : null}
        </label>
      </div>

      <label className={styles.field}>
        <span>Email</span>
        <input type="email" name="traveler.email" value={traveler.email} onChange={(event) => onTravelerChange("email", event.target.value)} />
        {errors.email ? <small>{getErrorMessage(errors.email)}</small> : null}
      </label>

      {optionalTravelers.length ? (
        <div className={styles.optionalTravelersBlock}>
          <div className={styles.optionalTravelersTitle}>Additional Traveler Details</div>
          <div className={styles.optionalTravelersHint}>Optional. Add names for the guests included in this reservation.</div>

          {optionalTravelers.map((optionalTraveler) => (
            <div key={optionalTraveler.id} className={styles.optionalTravelerCard}>
              <div className={styles.optionalTravelerHeader}>
                <div className={styles.optionalTravelerLabel}>{optionalTraveler.label}</div>
                <button
                  type="button"
                  className={styles.removeTravelerButton}
                  onClick={() => onRemoveTraveler(optionalTraveler.id)}
                  aria-label={`Remove ${optionalTraveler.label}`}
                  title="Remove traveler"
                >
                  -
                </button>
              </div>
              <div className={styles.fieldGridTwo}>
                <label className={styles.field}>
                  <span>First Name</span>
                  <input
                    type="text"
                    value={optionalTraveler.firstName}
                    onChange={(event) => onOptionalTravelerChange(optionalTraveler.id, "firstName", event.target.value)}
                  />
                </label>

                <label className={styles.field}>
                  <span>Last Name</span>
                  <input
                    type="text"
                    value={optionalTraveler.lastName}
                    onChange={(event) => onOptionalTravelerChange(optionalTraveler.id, "lastName", event.target.value)}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {optionalTravelersMessage ? <div className={styles.optionalTravelersMessage}>{optionalTravelersMessage}</div> : null}

      {optionalTravelerCapacity > 0 ? (
        <div className={styles.addTravelerRow}>
          <button
            type="button"
            className={styles.addTravelerButton}
            onClick={onAddTraveler}
            aria-label="Add optional traveler"
            title="Add traveler"
          >
            +
          </button>
        </div>
      ) : null}

      <div className={styles.actionsRow}>
        <button type="button" className={styles.primaryButton} onClick={onNext}>
          NEXT: BILLING INFO
        </button>
      </div>
    </div>
  </div>
);

export default TravelerSection;
