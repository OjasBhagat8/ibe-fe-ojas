import {
  Box,
  FormControl,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Typography,
} from "@mui/material";
import styles from "./RoomMuiDropdown.module.scss";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

type Props = {
  label: string;
  options: string[];
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
};

const MuiRoomDropdown = ({
  label,
  options,
  value,
  onChange,
  disabled,
}: Props) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange?.(event.target.value);
  };

  return (
    <Box className={styles.wrapper}>
      <FormControl fullWidth size="small">
        <Select
          IconComponent={KeyboardArrowDownIcon}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          displayEmpty
          MenuProps={{
            disableScrollLock: true,
            PaperProps: { className: styles.menuPaper },
          }}
          renderValue={(selected) => (
            <Box className={styles.valueBox}>
              <Typography fontSize="12px" className={styles.label}>{label}</Typography>
              <Typography className={styles.value}>{selected}</Typography>
            </Box>
          )}
          className={styles.select}
        >
          {options.map((option) => (
            <MenuItem className={styles.menuItem} key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default MuiRoomDropdown;
