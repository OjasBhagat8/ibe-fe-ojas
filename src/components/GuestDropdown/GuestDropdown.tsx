import { useMemo, useState } from "react";
import {
  Box,
  Button,
  ClickAwayListener,
  Divider,
  IconButton,
  Paper,
  Popper,
  Stack,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import styles from "./GuestDropdown.module.scss";

interface GuestType {
  type: string;
  min: number;
  max?: number | null;
  count: number;
}

type Props = {
  disabled?: boolean;
  guestTypes?: GuestType[];
  maxGuests?: number;
  onGuestsChange?: (type: string, nextCount: number) => void;
};

const MuiGuestsDropdown = ({
  disabled,
  guestTypes = [],
  maxGuests,
  onGuestsChange,
}: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const totalGuests = guestTypes.reduce((sum, guest) => sum + guest.count, 0);
  const atLimit = maxGuests !== undefined && totalGuests >= maxGuests;

  const summary = useMemo(() => {
    const activeGuests = guestTypes.filter((guest) => guest.count > 0);

    if (!activeGuests.length) return "Select guests";

    return activeGuests
      .map((guest) => {
        const name = guest.type.toLowerCase();
        if (name.includes("child")) {
          return `${guest.count} ${guest.count === 1 ? "child" : "children"}`;
        }

        const singularName = name.endsWith("s") ? name.slice(0, -1) : name;
        const pluralName = name.endsWith("s") ? name : `${name}s`;
        return `${guest.count} ${guest.count === 1 ? singularName : pluralName}`;
      })
      .join(", ");
  }, [guestTypes]);

  const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    setAnchorEl((prev) => (prev ? null : event.currentTarget));
  };

  const handleClose = () => setAnchorEl(null);

  const increment = (guest: GuestType) => {
    if (atLimit) return;
    onGuestsChange?.(guest.type, guest.count + 1);
  };

  const decrement = (guest: GuestType, minCount: number) => {
    const nextCount = Math.max(guest.count - 1, minCount);
    onGuestsChange?.(guest.type, nextCount);
  };

  const open = Boolean(anchorEl);

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Box className={styles.wrapper}>
        <Button
          fullWidth
          onClick={handleToggle}
          disabled={disabled}
          endIcon={<KeyboardArrowDownIcon />}
          className={styles.trigger}
        >
          <Box className={styles.triggerContent}>
            <Typography  fontSize="12px" className={styles.triggerLabel}>Guests</Typography>
            <Typography className={styles.triggerValue}>{summary}</Typography>
          </Box>
        </Button>

        <Popper
          open={open}
          anchorEl={anchorEl}
          placement="bottom-start"
          className={styles.popper}
          style={{ width: anchorEl?.clientWidth }}
        >
          <Paper elevation={6} className={styles.paper}>
            <Box className={styles.menuBody}>
              <Stack spacing={2}>
                {guestTypes.map((guest, index) => {
                  const minCount = guest.type === "Adults" ? 1 : 0;

                  return (
                    <Box key={guest.type}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}
                      >
                        <Box>
                          <Typography className={styles.rowTitle}>
                            {guest.type}
                          </Typography>
                          <Typography className={styles.rowSubtitle}>
                            Ages {guest.min}
                            {guest.max ? ` - ${guest.max}` : "+"}
                          </Typography>
                        </Box>

                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() => decrement(guest, minCount)}
                            className={styles.counterButton}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>

                          <Typography className={styles.count}>
                            {guest.count}
                          </Typography>

                          <IconButton
                            size="small"
                            onClick={() => increment(guest)}
                            disabled={atLimit}
                            className={styles.counterButton}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>

                      {index !== guestTypes.length - 1 && (
                        <Divider className={styles.divider} />
                      )}
                    </Box>
                  );
                })}
              </Stack>
              {atLimit && maxGuests !== undefined ? (
                <Typography className={styles.limitMessage}>
                  Max {maxGuests} guests allowed for selected rooms.
                </Typography>
              ) : null}
            </Box>
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default MuiGuestsDropdown;
