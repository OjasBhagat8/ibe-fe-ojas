import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import chevronDownIcon from "../../assets/icons/chevron-down.svg";

import styles from "./BookingSearchForm.module.scss";

type RoomsFieldProps = {
  maxRooms: number;
  rooms: number;
  onRoomsChange: (value: string) => void;
};

const RoomsField = ({ maxRooms, rooms, onRoomsChange }: RoomsFieldProps) => {
  const handleChange = (event: SelectChangeEvent<number>) => {
    onRoomsChange(String(event.target.value));
  };

  return (
    <div className={`${styles.formGroup} ${styles.roomGroup}`}>
      <label className={styles.label}>Rooms</label>
      <FormControl fullWidth>
        <Select
          className={styles.muiRoomsSelect}
          value={rooms}
          onChange={handleChange}
          inputProps={{ "aria-label": "Rooms" }}
          variant="outlined"
          IconComponent={(iconProps) => (
            <span {...iconProps}>
              <img src={chevronDownIcon} alt="" className={styles.selectCaret} aria-hidden="true" />
            </span>
          )}
          MenuProps={{
            PaperProps: {
              className: styles.roomsMenuPaper,
            },
          }}
        >
          {Array.from({ length: maxRooms }, (_, index) => (
            <MenuItem key={index + 1} value={index + 1} className={styles.roomsMenuItem}>
              {index + 1}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default RoomsField;
