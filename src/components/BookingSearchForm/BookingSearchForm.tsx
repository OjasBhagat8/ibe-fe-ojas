import { useEffect, useRef, useState } from "react";

import type { TenantConfig } from "../../features/tenant/tenantTypes";

import DateRangeField from "./DateRangeField";
import GuestField from "./GuestField";
import RoomsField from "./RoomsField";
import { useBookingSearchState } from "./useBookingSearchState";
import styles from "./BookingSearchForm.module.scss";
import accessibleLogo from "../../assets/u_wheelchair.png"
import PropertyDropdown from "../PropertyDropdown/PropertyDropdown";

type BookingSearchFormProps = {
  tenant: TenantConfig;
};

const BookingSearchForm = ({ tenant }: BookingSearchFormProps) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGuestPopover, setShowGuestPopover] = useState(false);
  const calendarPopoverRef = useRef<HTMLDivElement | null>(null);
  const state = useBookingSearchState(tenant);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (calendarPopoverRef.current && !calendarPopoverRef.current.contains(target)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!state.selectedPropertyId) {
      setShowCalendar(false);
    }
  }, [state.selectedPropertyId]);

  const showGuestsSelector = state.selectedProperty?.guestFlag ?? true;
  const showRoomsSelector = state.selectedProperty?.roomFlag ?? true;
  const showAccessibleRoomCheckbox = state.selectedProperty?.accessibleFlag ?? true;

  return (
    <form
      className={styles.searchForm}
      onSubmit={state.onSubmit}
    >
      <PropertyDropdown
        selectedPropertyId={state.selectedPropertyId}
        tenant={tenant}
        onPropertyChange={state.onPropertyChange}
      />

      <DateRangeField
        calendarPopoverRef={calendarPopoverRef}
        dateError={state.dateError}
        disabled={!state.selectedPropertyId}
        endDate={state.endDate}
        maxStayDays={state.selectedProperty?.lengthOfStay ?? 8}
        priceByDate={state.calendarPriceByDate}
        setDateError={state.setDateError}
        setShowCalendar={setShowCalendar}
        showCalendar={showCalendar}
        startDate={state.startDate}
        onDatesChange={state.onDatesChange}
      />

      {(showGuestsSelector || showRoomsSelector) && (
        <div className={styles.formRow}>
          {showGuestsSelector && (
            <GuestField
              guestCounts={state.guestCounts}
              guestTypes={state.guestTypes}
              showGuestPopover={showGuestPopover}
              totalAllowedGuests={state.totalAllowedGuests}
              totalSelectedGuests={state.totalSelectedGuests}
              setShowGuestPopover={setShowGuestPopover}
              updateGuestCount={state.updateGuestCount}
            />
          )}
          {showRoomsSelector && (
            <RoomsField
              maxRooms={state.maxRooms}
              rooms={state.rooms}
              onRoomsChange={state.onRoomsChange}
            />
          )}
        </div>
      )}

      {showAccessibleRoomCheckbox && (
        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            id="accessible"
            checked={state.accessibleRoom}
            onChange={(event) => state.onAccessibleChange(event.target.checked)}
          />
          <label htmlFor="accessible" className={styles.accessibleLabel}>
            <img src={accessibleLogo} alt="Accessible room" />
            I need an Accessible Room</label>
        </div>
      )}

      <button
        type="submit"
        className={styles.submitButton}
        disabled={!state.selectedPropertyId || !state.startDate || !state.endDate}
      >
        SEARCH
      </button>
    </form>
  );
};

export default BookingSearchForm;
