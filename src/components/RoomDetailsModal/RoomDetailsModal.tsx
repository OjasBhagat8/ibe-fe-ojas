import { useEffect, useState } from "react";
import type { AppliedPromoCode, DealItem, StandardRate } from "../../features/Deals/DealType";
import styles from "./RoomDetailsModal.module.scss";
import closeIcon from "../../assets/cross.png";
import listIcon from "../../assets/list.png";
import guestIcon from "../../assets/u_user.png";
import bedIcon from "../../assets/u_bed-double.png";

type RoomDetails = {
  title: string;
  description: string;
  occupancy: string;
  beds: string;
  area: string;
  amenities: string[];
  images: string[];
};

type Props = {
  isOpen: boolean;
  room: RoomDetails;
  standardRate: StandardRate | null;
  deals: DealItem[];
  appliedPromo?: AppliedPromoCode | null;
  onClose: () => void;
  onSelectPackage?: (rate: StandardRate | DealItem | AppliedPromoCode) => void;
  onApplyPromo?: (promoCode: string) => void;
  promoError?: string | null;
  promoLoading?: boolean;
};

type PackageCardProps = {
  title: string;
  description?: string;
  price: number;
  subLabel: string;
  onSelect?: () => void;
};

const PackageCard = ({
  title,
  description,
  price,
  subLabel,
  onSelect,
}: PackageCardProps) => {
  return (
    <div className={styles.packageCard}>
      <div className={styles.packageInfo}>
        <h4>{title}</h4>
        {description ? <p>{description}</p> : null}
      </div>

      <div className={styles.packagePrice}>
        <div className={styles.priceValue}>${price}</div>
        <span>{subLabel}</span>
        <button type="button" onClick={onSelect}>
          Select Package
        </button>
      </div>
    </div>
  );
};

const RoomDetailsModal = ({
  isOpen,
  room,
  standardRate,
  deals,
  appliedPromo,
  onClose,
  onSelectPackage,
  onApplyPromo,
  promoError,
  promoLoading = false,
}: Props) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [promoCode, setPromoCode] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    setCurrentImage(0);
    setPromoCode("");
  }, [room]);

  if (!isOpen) {
    return null;
  }

  const images = room.images?.length ? room.images : [""];
  const amenities = room.amenities ?? [];
  const safeDeals = deals ?? [];
  const promoErrorMessage = promoError
    && (promoError.toLowerCase().includes("apply promo") || promoError.toLowerCase().includes("promo code"))
    ? "Invalid promo code."
    : promoError;
  const appliedPromoDescription = appliedPromo
    ? `${appliedPromo.description} (Discount: $${appliedPromo.discountAmount})`
    : "";

  const showPrev = () => {
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const showNext = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  return (
    <div
      className={styles.overlay}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div className={styles.modal}>
        <button className={styles.closeButton} type="button" onClick={onClose} aria-label="Close room details">
          <img src={closeIcon} alt="" />
        </button>

        <div className={styles.carousel}>
          <img src={images[currentImage]} alt={room.title} />

          {images.length > 1 ? (
            <>
              <button className={`${styles.arrow} ${styles.leftArrow}`} type="button" onClick={showPrev}>
                {"<"}
              </button>
              <button className={`${styles.arrow} ${styles.rightArrow}`} type="button" onClick={showNext}>
                {">"}
              </button>
            </>
          ) : null}
        </div>

        <div className={styles.content}>
          <div className={styles.metaRow}>
            <span className={styles.metaItem}>
              <img src={guestIcon} alt="" />
              {room.occupancy}
            </span>
            <span className={styles.metaItem}>
              <img src={bedIcon} alt="" />
              {room.beds}
            </span>
            <span>{room.area}</span>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.roomInfo}>
              <h2>{room.title}</h2>
              <p>{room.description}</p>
            </div>

            <div className={styles.amenitiesBlock}>
              <h3>Amenities</h3>
              <ul>
                {amenities.map((amenity) => (
                  <li key={amenity}>
                    <img src={listIcon} alt="" />
                    <span>{amenity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <section className={styles.section}>
            <h3>Standard Rate</h3>
            {standardRate ? (
              <PackageCard
                title={standardRate.title}
                description={standardRate.description}
                price={standardRate.totalPrice}
                subLabel="for the stay"
                onSelect={() => onSelectPackage?.(standardRate)}
              />
            ) : null}
          </section>

          <section className={styles.section}>
            <h3>Deals & Packages</h3>
            <div className={styles.dealsList}>
              {appliedPromo ? (
                <PackageCard
                  title={appliedPromo.title}
                  description={appliedPromoDescription}
                  price={appliedPromo.totalPrice}
                  subLabel="promo price"
                  onSelect={() => onSelectPackage?.(appliedPromo)}
                />
              ) : null}
              {safeDeals.map((deal) => (
                <PackageCard
                  key={`${deal.title}-${deal.totalPrice}`}
                  title={deal.title}
                  description={`Save $${deal.discountAmount} on this stay.`}
                  price={deal.totalPrice}
                  subLabel="for the stay"
                  onSelect={() => onSelectPackage?.(deal)}
                />
              ))}
            </div>
          </section>

          <div className={styles.promoCode}>
            <label htmlFor="promo-code">Enter a promo code</label>
            <div className={styles.promoRow}>
              <input
                id="promo-code"
                type="text"
                value={promoCode}
                onChange={(event) => setPromoCode(event.target.value)}
              />
              <button
                type="button"
                onClick={() => onApplyPromo?.(promoCode.trim())}
                disabled={!promoCode.trim() || promoLoading}
              >
                {promoLoading ? "Applying..." : "Apply"}
              </button>
            </div>
            {promoErrorMessage ? <div className={styles.promoError}>{promoErrorMessage}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export type { RoomDetails };
export default RoomDetailsModal;
