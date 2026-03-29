import { type RefObject } from "react";
import { format } from "date-fns";

import BookingCalendar from "../Calendar/BookingCalendar";

import styles from "./BookingSearchForm.module.scss";

type DateRangeFieldProps = {
  calendarPopoverRef: RefObject<HTMLDivElement | null>;
  dateError: string | null;
  disabled?: boolean;
  endDate: Date | null;
  maxStayDays: number;
  priceByDate: Record<string, number>;
  setDateError: (value: string | null) => void;
  setShowCalendar: React.Dispatch<React.SetStateAction<boolean>>;
  showCalendar: boolean;
  startDate: Date | null;
  onDatesChange: (start: Date | null, end: Date | null) => void;
};

const DateRangeField = ({
  calendarPopoverRef,
  dateError,
  disabled = false,
  endDate,
  maxStayDays,
  priceByDate,
  setDateError,
  setShowCalendar,
  showCalendar,
  startDate,
  onDatesChange,
}: DateRangeFieldProps) => (
  <div className={styles.formGroup} ref={calendarPopoverRef}>
    <label className={styles.label}>Select dates</label>
    <div
      className={`${styles.dateRange} ${disabled ? styles.disabledDateRange : ""}`}
      onClick={() => {
        if (disabled) return;
        setShowCalendar((prev) => !prev);
      }}
    >
      <>
        <span className={styles.dateText}>{startDate ? format(startDate, "MMM d") : "Check-in"}</span>
        <span className={styles.arrow} aria-hidden="true">arrow_forward</span>
        <span className={styles.dateText}>{endDate ? format(endDate, "MMM d") : "Check out"}</span>
        <span className={styles.calendarIcon} aria-hidden="true">calendar_month</span>
      </>
    </div>
    {showCalendar && !disabled && (
      <div className={styles.calendarWrapper}>
        <BookingCalendar
          startDate={startDate}
          endDate={endDate}
          priceByDate={priceByDate}
          maxStayDays={maxStayDays}
          onValidationError={setDateError}
          onApply={() => setShowCalendar(false)}
          onChange={onDatesChange}
        />
      </div>
    )}
    {dateError && <p className={styles.dateError}>{dateError}</p>}
  </div>
);

export default DateRangeField;
