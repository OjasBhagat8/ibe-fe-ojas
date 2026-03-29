import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { Dispatch, RefObject, SetStateAction } from "react";
import type { ReservationSelection, TripItineraryPreview } from "../../features/booking/bookingSlice";
import type { TaxBreakdown } from "./checkoutUtils";
import { formatCurrency } from "./checkoutUtils";
import styles from "../Checkout.module.scss";

type SummaryData = {
  subtotal: number;
  taxesAndSurcharges: number;
  dueNow: number;
  dueAtResort: number;
  promoTitle?: string;
} | null;

type ItineraryMeta = {
  arrival: string;
  departure: string;
  nights: number;
  guestSummary: string;
} | null;

type Props = {
  itineraryMeta: ItineraryMeta;
  itineraryPreview: TripItineraryPreview | null;
  promotionPopoverRef: RefObject<HTMLDivElement | null>;
  selection: ReservationSelection;
  setShowPromotionPopover: Dispatch<SetStateAction<boolean>>;
  setShowTaxesPopover: Dispatch<SetStateAction<boolean>>;
  showPromotionPopover: boolean;
  showTaxesPopover: boolean;
  summaryData: SummaryData;
  taxBreakdown: TaxBreakdown | null;
  taxesPopoverRef: RefObject<HTMLDivElement | null>;
  onCancel: () => void;
  onContinueShopping: () => void;
};

const renderPrice = (value: number | null | undefined) => {
  if (typeof value !== "number") {
    return <span className={styles.priceFallback}>--</span>;
  }

  const formattedValue = formatCurrency(value);
  const decimalIndex = formattedValue.lastIndexOf(".");

  if (decimalIndex === -1) {
    return <span className={styles.priceValue}>{formattedValue}</span>;
  }

  return (
    <span className={styles.priceValue}>
      <span className={styles.priceMain}>{formattedValue.slice(0, decimalIndex)}</span>
      <span className={styles.priceFraction}>{formattedValue.slice(decimalIndex)}</span>
    </span>
  );
};

const buildHelpLine = (itineraryPreview: TripItineraryPreview | null) => {
  const primaryContact = itineraryPreview?.needHelpContent?.contactOptions?.find((option) => option?.value?.trim());
  if (!primaryContact?.value?.trim()) {
    return "Call 1-800-555-5555";
  }

  return primaryContact.label?.trim()
    ? `${primaryContact.label}: ${primaryContact.value}`
    : primaryContact.value;
};

const TripItinerarySidebar = ({
  itineraryMeta,
  itineraryPreview,
  promotionPopoverRef,
  selection,
  setShowPromotionPopover,
  setShowTaxesPopover,
  showPromotionPopover,
  showTaxesPopover,
  summaryData,
  taxBreakdown,
  taxesPopoverRef,
  onCancel,
  onContinueShopping,
}: Props) => {
  const helpTitle = itineraryPreview?.needHelpContent?.title?.trim() || "Need help?";
  const helpLine = buildHelpLine(itineraryPreview);
  const helpDescription = itineraryPreview?.needHelpContent?.description?.trim() || "Mon-Fri 8a-5p EST";

  return (
    <aside className={styles.sidebar}>
    <section className={styles.itineraryCard}>
      <h2>Your Trip Itinerary</h2>
      <div className={styles.itineraryTitle}>{selection.room.roomTypeName}</div>
      {itineraryMeta ? (
        <>
          <div className={styles.itineraryLine}>
            {itineraryMeta.arrival} - {itineraryMeta.departure} | {itineraryMeta.guestSummary || "Guest details pending"}
          </div>
          <div className={styles.itineraryLine}>{itineraryMeta.nights} night stay</div>
        </>
      ) : null}
      <div className={styles.itineraryLine}>{selection.selectedPackage.title}</div>
      <div className={styles.itineraryLine}>{selection.search.rooms} room</div>
      {summaryData?.promoTitle ? (
        <div className={styles.promotionRow}>
          <span>Promotion Applied</span>
          <div ref={promotionPopoverRef} className={styles.promotionPopoverAnchor}>
            <button
              type="button"
              className={styles.promotionInfoButton}
              aria-label="View promotion details"
              onClick={() => setShowPromotionPopover((currentValue) => !currentValue)}
            >
              <InfoOutlinedIcon fontSize="inherit" />
            </button>

            {showPromotionPopover ? (
              <div
                className={styles.sidebarModalOverlay}
                role="presentation"
                onClick={() => setShowPromotionPopover(false)}
              >
                <div
                  className={styles.promotionPopover}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Promotion details"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    className={styles.promotionPopoverClose}
                    aria-label="Close promotion details"
                    onClick={() => setShowPromotionPopover(false)}
                  >
                    x
                  </button>
                  <div className={styles.promotionPopoverTitle}>{summaryData.promoTitle}</div>
                  <div className={styles.promotionPopoverBody}>
                    {selection.selectedPackage.description ?? "Special savings have been applied to this stay."}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className={styles.priceList}>
        <div>
          <span>Subtotal</span>
          <strong>{renderPrice(summaryData?.subtotal)}</strong>
        </div>
        <div>
          <span className={styles.inlineInfoLabel}>
            <span>Taxes and Surcharges</span>
            {taxBreakdown ? (
              <div ref={taxesPopoverRef} className={styles.promotionPopoverAnchor}>
                <button
                  type="button"
                  className={styles.promotionInfoButton}
                  aria-label="View taxes and surcharges breakdown"
                  onClick={() => setShowTaxesPopover((currentValue) => !currentValue)}
                >
                  <InfoOutlinedIcon fontSize="inherit" />
                </button>

                {showTaxesPopover ? (
                  <div
                    className={styles.sidebarModalOverlay}
                    role="presentation"
                    onClick={() => setShowTaxesPopover(false)}
                  >
                    <div
                      className={styles.taxPopover}
                      role="dialog"
                      aria-modal="true"
                      aria-label="Rate breakdown"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        className={styles.promotionPopoverClose}
                        aria-label="Close rate breakdown"
                        onClick={() => setShowTaxesPopover(false)}
                      >
                        x
                      </button>
                      <div className={styles.promotionPopoverTitle}>Rate Breakdown</div>
                      <div className={styles.taxRoomTitle}>{taxBreakdown.roomTitle}</div>
                      <div className={styles.taxDivider} />

                      <div className={styles.taxList}>
                        {taxBreakdown.nightlyRates.map((nightlyRate) => (
                          <div key={nightlyRate.label} className={styles.taxListRow}>
                            <span>{nightlyRate.label}</span>
                            <strong>{formatCurrency(nightlyRate.amount)}</strong>
                          </div>
                        ))}
                      </div>

                      <div className={styles.taxSummaryRow}>
                        <span>Room Total</span>
                        <strong>{formatCurrency(taxBreakdown.roomTotal)}</strong>
                      </div>

                      <div className={styles.taxDivider} />

                      <div className={styles.taxSectionTitle}>Taxes and Surcharges (per room)</div>
                      <div className={styles.taxList}>
                        {taxBreakdown.taxes.map((taxItem) => (
                          <div key={taxItem.label} className={styles.taxListRow}>
                            <span>{taxItem.label}</span>
                            <strong>{formatCurrency(taxItem.amount)}</strong>
                          </div>
                        ))}
                      </div>

                      <div className={styles.taxDivider} />

                      <div className={styles.taxSummaryRow}>
                        <span>Due now</span>
                        <strong>{formatCurrency(taxBreakdown.dueNow)}</strong>
                      </div>
                      <div className={styles.taxSummaryRow}>
                        <span>Due at resort</span>
                        <strong>{formatCurrency(taxBreakdown.dueAtResort)}</strong>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </span>
          <strong>{renderPrice(summaryData?.taxesAndSurcharges)}</strong>
        </div>
        <div className={styles.separator} />
        <div>
          <span>Due Now</span>
          <strong>{renderPrice(summaryData?.dueNow)}</strong>
        </div>
        <div>
          <span>Due At Resort</span>
          <strong>{renderPrice(summaryData?.dueAtResort)}</strong>
        </div>
      </div>

      <div className={styles.sidebarActions}>
        <button type="button" className={styles.secondaryButton} onClick={onContinueShopping}>
          CONTINUE SHOPPING
        </button>
        <button type="button" className={styles.secondaryButton} onClick={onCancel}>
          CANCEL
        </button>
      </div>
    </section>

    <section className={styles.helpCard}>
      <h3>{helpTitle}</h3>
      <div>{helpLine}</div>
      <small>{helpDescription}</small>
    </section>
  </aside>
  );
};

export default TripItinerarySidebar;
