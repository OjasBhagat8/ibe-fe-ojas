import Button from "../../components/Button/Button";
import CalendarRange from "../../components/CalenderRange/CalenderRange";
import MuiGuestsDropdown from "../../components/GuestDropdown/GuestDropdown";
import MuiRoomDropdown from "../../components/RoomMuiDropdown/RoomMuiDropdown";
import styles from "./RoomResults.module.scss";

type GuestTypeOption = {
  id: string;
  type: string;
  min: number;
  max: number | null;
  count: number;
};

type CalendarEntry = {
  date: string;
  minNightlyRate: number;
};

type RoomResultsSearchBarProps = {
  calendarEntries: CalendarEntry[];
  checkInDate: Date | null;
  checkOutDate: Date | null;
  guestTypes: GuestTypeOption[];
  isSearchDisabled: boolean;
  isSearching: boolean;
  maxGuests: number;
  maxStay: number;
  onDatesChange: (start: Date | null, end: Date | null) => void;
  onGuestChange: (type: string, nextCount: number) => void;
  onRoomChange: (value: string) => void;
  onSearch: () => void;
  roomOptions: string[];
  rooms: number;
};

const RoomResultsSearchBar = ({
  calendarEntries,
  checkInDate,
  checkOutDate,
  guestTypes,
  isSearchDisabled,
  isSearching,
  maxGuests,
  maxStay,
  onDatesChange,
  onGuestChange,
  onRoomChange,
  onSearch,
  roomOptions,
  rooms,
}: RoomResultsSearchBarProps) => (
  <section className={styles.searchSection}>
    <div className={styles.searchBar}>
      <MuiGuestsDropdown
        guestTypes={guestTypes}
        maxGuests={maxGuests}
        onGuestsChange={onGuestChange}
      />

      <MuiRoomDropdown
        label="Rooms"
        value={String(rooms)}
        options={roomOptions}
        onChange={onRoomChange}
      />

      <CalendarRange
        variant="results"
        popupAlign="right"
        maxStay={maxStay}
        startDate={checkInDate}
        endDate={checkOutDate}
        calendar={calendarEntries}
        onDatesChange={onDatesChange}
      />

      <div className={styles.searchButtonWrap}>
        <Button
          text="SEARCH DATES"
          disabled={isSearchDisabled || isSearching}
          onClick={onSearch}
        />
      </div>
    </div>
  </section>
);

export default RoomResultsSearchBar;
