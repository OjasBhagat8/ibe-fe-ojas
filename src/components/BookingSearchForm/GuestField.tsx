import { useEffect, useRef, useState } from "react";
import Popover from "@mui/material/Popover";

import chevronDownIcon from "../../assets/icons/chevron-down.svg";
import type { GuestType } from "../../features/tenant/tenantTypes";

import styles from "./BookingSearchForm.module.scss";

type GuestFieldProps = {
  guestCounts: Record<string, number>;
  guestTypes: GuestType[];
  showGuestPopover: boolean;
  totalAllowedGuests: number;
  totalSelectedGuests: number;
  setShowGuestPopover: React.Dispatch<React.SetStateAction<boolean>>;
  updateGuestCount: (guestTypeId: string, delta: number) => void;
};
const formatAgeRange = (guestType: GuestType) => `Ages ${guestType.minAge}-${guestType.maxAge}`;

const summarizeGuests = (guestCounts: Record<string, number>, guestTypes: GuestType[]) => {
  const parts: string[] = [];

  guestTypes.forEach((guestType) => {
    const count = guestCounts[guestType.guestTypeId] ?? 0;
    if (count <= 0) return;

    const name = guestType.guestTypeName.toLowerCase();
    if (name.includes("child")) {
      parts.push(`${count} ${count === 1 ? "child" : "children"}`);
      return;
    }
    const singularName = name.endsWith("s") ? name.slice(0, -1) : name;
    const pluralName = name.endsWith("s") ? name : `${name}s`;

    parts.push(`${count} ${count === 1 ? singularName : pluralName}`);
  });

  if (parts.length > 0) {
    return parts.join(", ");
  }

  const totalGuests = Object.values(guestCounts).reduce((sum, count) => sum + count, 0);
  return `${totalGuests} Guest${totalGuests === 1 ? "" : "s"}`;
};

const GuestField = ({
  guestCounts,
  guestTypes,
  showGuestPopover,
  totalAllowedGuests,
  totalSelectedGuests,
  setShowGuestPopover,
  updateGuestCount,
}:GuestFieldProps) => {
  const guestSummary = summarizeGuests(guestCounts, guestTypes);
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [popoverWidth, setPopoverWidth] = useState<number>();

  useEffect(() => {
    if (!showGuestPopover) return;

    const updatePopoverWidth = () => {
      const rowWidth = fieldRef.current?.parentElement?.getBoundingClientRect().width;
      const triggerWidth = triggerRef.current?.getBoundingClientRect().width;
      setPopoverWidth(rowWidth ?? triggerWidth);
    };

    updatePopoverWidth();
    window.addEventListener("resize", updatePopoverWidth);
    return () => window.removeEventListener("resize", updatePopoverWidth);
  }, [showGuestPopover]);

  return (
   <div className={`${styles.formGroup} ${styles.guestGroup}`} ref={fieldRef}>
      <label className={styles.label}>Guests</label>
      <button
        type="button"
        ref={triggerRef}
        className={styles.selectButton}
        aria-label="Guests"
        onClick={() => setShowGuestPopover((prev) => !prev)}
      >
        <span>{guestSummary || "Guests"}</span>
        <img src={chevronDownIcon} alt="" className={styles.selectCaret} aria-hidden="true" />
      </button>

      <Popover
        open={showGuestPopover}
        anchorEl={triggerRef.current}
        onClose={() => setShowGuestPopover(false)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        slotProps={{
          paper: {
            className: `${styles.guestPopover} ${styles.guestPopoverWide} ${styles.guestPopoverPaper}`,
            elevation: 0,
            style: popoverWidth ? { width: `${popoverWidth}px` } : undefined,
          },
        }}
      >
        <div className={styles.guestPopoverContent}>
          {guestTypes.map((guestType) => {
            const count = guestCounts[guestType.guestTypeId] ?? 0;

            return (
              <div key={guestType.guestTypeId} className={styles.guestTypeRow}>
                <div className={styles.guestTypeInfo}>
                  <p className={styles.guestTypeName}>{guestType.guestTypeName}</p>
                  <p className={styles.guestTypeAge}>{formatAgeRange(guestType)}</p>
                </div>
                <div className={styles.guestStepper}>
                  <button
                    type="button"
                    className={styles.stepperBtn}
                    onClick={() => updateGuestCount(guestType.guestTypeId, -1)}
                    disabled={count <= 0}
                  >
                    -
                  </button>
                  <span className={styles.stepperValue}>{count}</span>
                  <button
                    type="button"
                    className={styles.stepperBtn}
                    onClick={() => updateGuestCount(guestType.guestTypeId, 1)}
                    disabled={totalSelectedGuests >= totalAllowedGuests}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
          {totalSelectedGuests >= totalAllowedGuests ? (
            <p className={styles.guestLimitMessage}>
              Max {totalAllowedGuests} guests allowed for selected rooms.
            </p>
          ) : null}
        </div>
      </Popover>
    </div>
  );
};

export default GuestField;
