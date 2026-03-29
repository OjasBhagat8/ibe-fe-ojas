import {
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  isAfter,
  isBefore,
  isSameDay,
  startOfMonth,
  startOfToday,
} from "date-fns";
import { useEffect, useMemo, useState } from "react";
import {
  type DayButtonProps,
  DayPicker,
  type MonthCaptionProps,
  useDayPicker,
} from "react-day-picker";

import chevronLeftIcon from "../../assets/icons/chevron-left.svg";
import chevronRightIcon from "../../assets/icons/chevron-right.svg";
import styles from "./BookingCalendar.module.scss";

type BookingCalendarProps = { 
  startDate: Date | null;
  endDate: Date | null;
  priceByDate?: Record<string, number>;
  onChange: (start: Date | null, end: Date | null) => void;
  onValidationError?: (message: string | null) => void;
  onApply?: () => void;
  maxStayDays?: number;
};

const WEEK_LABELS = ["SU", "M", "T", "W", "TH", "F", "S"];

const monthClassNames = {
  root: styles.dayPickerRoot,
  months: styles.monthsRow,
  month: styles.monthPanel,
  month_caption: styles.monthHeader,
  caption_label: styles.monthName,
  weekdays: styles.weekdaysRow,
  weekday: styles.weekday,
  month_grid: styles.monthGrid,
  weeks: styles.weeks,
  week: styles.week,
  day: styles.dayCellWrapper,
  day_button: styles.dayCell,
};

const BookingCalendar = ({
  startDate,
  endDate,
  priceByDate,
  onChange,
  onValidationError,
  onApply,
  maxStayDays = 8,
}: BookingCalendarProps) => {
  const today = startOfToday();
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 900 : false,
  );
  const [visibleMonth, setVisibleMonth] = useState<Date>(
    startDate ? startOfMonth(startDate) : startOfMonth(today),
  );
  const months = isMobile
    ? [visibleMonth]
    : [visibleMonth, addMonths(visibleMonth, 1)];

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const getPrice = (date: Date) => {
    const key = format(date, "yyyy-MM-dd");
    const fromApi = priceByDate?.[key];
    return typeof fromApi === "number" ? fromApi : undefined;
  };

  const minimumSelectedPrice = useMemo(() => {
    if (!startDate) return null;

    const datesInRange = endDate
      ? eachDayOfInterval({ start: startDate, end: endDate })
      : [startDate];
    const prices = datesInRange
      .map((date) => getPrice(date))
      .filter((price): price is number => typeof price === "number");

    if (!prices.length) return null;
    return Math.min(...prices);
  }, [endDate, priceByDate, startDate]);

  const DayCellButton = ({ day, className, modifiers, ...props }: DayButtonProps) => {
    const price = modifiers.outside ? undefined : getPrice(day.date);

    return (
      <button
        type="button"
        className={className}
        {...props}
      >
        <span className={styles.dayNumber}>{format(day.date, "d")}</span>
        {typeof price === "number" && <span className={styles.dayPrice}>${price}</span>}
      </button>
    );
  };

  const MonthHeader = ({ calendarMonth, className }: MonthCaptionProps) => {
    const { goToMonth, months } = useDayPicker();
    const firstVisibleMonth = months[0]?.date ?? calendarMonth.date;

    return (
      <div className={className}>
        <span className={styles.monthName}>{format(calendarMonth.date, "MMMM")}</span>
        <div className={styles.monthChevrons}>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => goToMonth(addMonths(firstVisibleMonth, -1))}
            aria-label="Previous month"
          >
            <img src={chevronLeftIcon} alt="" className={styles.navIcon} />
          </button>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => goToMonth(addMonths(firstVisibleMonth, 1))}
            aria-label="Next month"
          >
            <img src={chevronRightIcon} alt="" className={styles.navIcon} />
          </button>
        </div>
      </div>
    );
  };

  const onPickDay = (date: Date) => {
    if (isBefore(date, today)) {
      return;
    }

    onValidationError?.(null);

    if (!startDate || endDate) {
      onChange(date, null);
      return;
    }

    if (isBefore(date, startDate)) {
      onChange(date, null);
      return;
    }

    if (isSameDay(date, startDate)) {
      onChange(startDate, null);
      return;
    }

    const nextStart = startDate;
    const nextEnd = date;
    const rangeDays = differenceInCalendarDays(nextEnd, nextStart) + 1;

    if (rangeDays > maxStayDays) {
      onValidationError?.(`Maximum stay is ${maxStayDays} days.`);
      return;
    }

    onChange(nextStart, nextEnd);
  };

  return (
    <div className={styles.calendarWrapper}>
      <DayPicker
        month={visibleMonth}
        onMonthChange={setVisibleMonth}
        numberOfMonths={months.length}
        weekStartsOn={0}
        showOutsideDays
        hideNavigation
        disabled={{ before: today }}
        modifiers={{
          rangeStart: startDate ?? undefined,
          rangeEnd: endDate ?? undefined,
          inRange:
            startDate && endDate
              ? (date) => isAfter(date, startDate) && isBefore(date, endDate)
              : undefined,
        }}
        onDayClick={(date, modifiers) => {
          if (modifiers.disabled) return;
          onPickDay(date);
        }}
        classNames={monthClassNames}
        modifiersClassNames={{
          outside: styles.mutedDay,
          disabled: styles.disabledDay,
          inRange: styles.inRangeDay,
          rangeStart: styles.rangeStartDay,
          rangeEnd: styles.rangeEndDay,
        }}
        formatters={{
          formatWeekdayName: (weekdayDate) => WEEK_LABELS[weekdayDate.getDay()],
        }}
        components={{
          DayButton: DayCellButton,
          MonthCaption: MonthHeader,
        }}
      />

      <div className={styles.footerBar}>
        <div className={styles.footerSummary}>
          {minimumSelectedPrice === null ? "\u00A0" : `from $${minimumSelectedPrice}/night`}
        </div>
        <button
          type="button"
          className={styles.applyDatesButton}
          disabled={!startDate || !endDate}
          onClick={() => {
            if (!startDate || !endDate) return;
            onApply?.();
          }}
        >
          APPLY DATES
        </button>
      </div>
    </div>
  );
};

export default BookingCalendar;
