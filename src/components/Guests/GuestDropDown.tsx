import {useState } from "react";
import styles from "./GuestDropDown.module.scss";
import  icon from "../../assets/Icon.png"


interface GuestType {
  type: string;
  min: number;
  max?:number;
  count:number;
}

type Props = {
  disabled?: boolean;
  guestTypes?: GuestType[];
  maxGuests?: number;
  onGuestsChange?: (type:string, nextCount:number) => void;
};

const GuestsDropdown = ({
  disabled,
  guestTypes = [],
  maxGuests,
  onGuestsChange,
}: Props) => {
  const [open, setOpen] = useState(false);

  const totalGuests = guestTypes.reduce((sum, guest) => sum + guest.count, 0);
  const atLimit = maxGuests !== undefined && totalGuests >= maxGuests;

  const increment = (type: GuestType) => {
    if (atLimit) return;
    onGuestsChange?.(type.type, type.count + 1);
  };

  const decrement = (type: GuestType, minCount: number) => {
    const nextCount = Math.max(type.count - 1, minCount);
    onGuestsChange?.(type.type, nextCount);
  };

  const summary = guestTypes.filter((guest) => guest.count > 0).map((guest) => `${guest.count} ${guest.type}`)
                  .join(", ")

  return (
    <div
      className={`${styles.container} ${disabled ? styles.disabled : ""}`}

    >
      <label className={styles.label}>Guests</label>

      <div className={styles.input} onClick={() => !disabled && setOpen(!open)}>
        <span className={styles.value}>{summary}</span>
        <img src={icon} alt="calender"></img>
      </div>

      {open && (
        <div className={styles.dropdown}>
          {guestTypes.map((guestType, i) => {
            const min = i === 0 ? 1 : 0;

            return (
              <div key={guestType.type} className={styles.row}>
                <div>
                  <p>{guestType.type}</p>
                  <span>Ages {guestType.min} {guestType.max ? `-${guestType.max}` : "+"}</span>
                </div>

                <div className={styles.counter}>
                  <button
                    type="button"
                    onClick={() => decrement(guestType, min)}
                  >
                    -
                  </button>

                  <span>{guestType.count}</span>

                  <button
                    type="button"
                    onClick={() => increment(guestType)}
                    disabled={atLimit}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
          {atLimit && maxGuests !== undefined ? (
            <p className={styles.limitMessage}>
              Max {maxGuests} guests allowed for selected rooms.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default GuestsDropdown;
