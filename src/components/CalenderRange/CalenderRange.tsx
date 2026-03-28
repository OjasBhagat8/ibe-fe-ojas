import { useMemo, useState, useEffect, useRef } from "react";
import styles from "./CalenderRange.module.scss";
import calendarIcon from "../../assets/calendar.jpg";
import BookingCalendar from "../Calendar/BookingCalendar";

type Props = {
  disabled?: boolean;
  maxStay?: number;
  variant?: "default" | "results";
  popupAlign?: "left" | "right";
  calendar?: {
    date: string;
    minNightlyRate: number | null;
  }[];
  startDate?:Date | null;
  endDate?: Date | null;
  onDatesChange?: (start: Date | null, end: Date | null) => void;
};

const CalendarRange = ({
  disabled,
  maxStay,
  variant = "default",
  popupAlign = "left",
  calendar,
  startDate:initialStartDate,
  endDate: initialEndDate,
  onDatesChange,
}: Props) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate ?? null);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate??null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const formatDate = (date: Date | null) => {
    if (!date) return "Any Date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const priceByDate = useMemo(() => {
    if (!calendar) return {};
    return calendar.reduce<Record<string, number>>((acc, item) => {
      if (typeof item.minNightlyRate === "number") {
        acc[item.date] = item.minNightlyRate;
      }
      return acc;
    }, {});
  }, [calendar]);

  useEffect(() => {
    setStartDate(initialStartDate ?? null);
  }, [initialStartDate]);

  useEffect(() => {
    setEndDate(initialEndDate ?? null);
  }, [initialEndDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCalendarChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleApply = () => {
    if (!startDate || !endDate) return;
    setOpen(false);
    onDatesChange?.(startDate, endDate);
  };

  return (
    <div
      ref={wrapperRef}
      className={`${styles.wrapper} ${disabled ? styles.disabled : ""} ${variant === "results" ? styles.resultsWrapper : ""}`}
    >
      <label className={`${styles.label} ${variant === "results" ? styles.resultsLabel : ""}`}> </label>

      <div
        className={`${styles.dateBox} ${disabled ? styles.disabledBox : ""} ${open ? styles.dateBoxOpen : ""} ${variant === "results" ? styles.resultsDateBox : ""}`}
        onClick={() => !disabled && setOpen((prev) => !prev)}
      >
        <div className={`${styles.dateBlock} ${startDate ? styles.dateBlockActive : ""} ${variant === "results" ? styles.resultsDateBlock : ""}`}>
          <span className={styles.subLabel}>{variant === "results" ? "Check in between" : "Check-in"}</span>
          <span className={styles.date}>{formatDate(startDate)}</span>
        </div>

        {variant === "results" ? (
          <span className={styles.resultsDivider} aria-hidden="true" />
        ) : (
          <span className={styles.arrow} aria-hidden="true">
            &rarr;
          </span>
        )}

        <div className={`${styles.dateBlock} ${endDate ? styles.dateBlockActive : ""} ${variant === "results" ? styles.resultsDateBlock : ""}`}>
          <span className={styles.subLabel}>{variant === "results" ? "Check out between" : "Check out"}</span>
          <span className={styles.date}>{formatDate(endDate)}</span>
        </div>

        <img
          src={calendarIcon}
          alt="calendar"
          className={styles.calendarIcon}
        />
      </div>

      {validationError && (
        <p className={styles.errorMessage}>{validationError}</p>
      )}

      {!disabled && open && (
        <div className={`${styles.calendarPopup} ${popupAlign === "right" ? styles.calendarPopupRight : ""}`}>
          <BookingCalendar
            startDate={startDate}
            endDate={endDate}
            priceByDate={priceByDate}
            onChange={handleCalendarChange}
            onValidationError={setValidationError}
            onApply={handleApply}
            maxStayDays={maxStay ?? 8}
          />
        </div>
      )}
    </div>
  );
};

export default CalendarRange;
