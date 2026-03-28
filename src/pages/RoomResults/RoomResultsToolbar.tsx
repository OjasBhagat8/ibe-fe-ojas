import type { ChangeEvent } from "react";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { FormControl, IconButton, MenuItem } from "@mui/material";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import styles from "./RoomResults.module.scss";
import { itemsPerPage } from "./roomResultsUtils";

type RoomResultsToolbarProps = {
  isLoading: boolean;
  onPageChange: (_event: ChangeEvent<unknown>, value: number) => void;
  onSortChange: (event: SelectChangeEvent) => void;
  onSortDirectionToggle: () => void;
  page: number;
  pageCount: number;
  roomsSize: number;
  sortDirection: "ASC" | "DESC";
  sortField: string;
  totalItems: number;
};

const RoomResultsToolbar = ({
  isLoading,
  onPageChange,
  onSortChange,
  onSortDirectionToggle,
  page,
  pageCount,
  roomsSize,
  sortDirection,
  sortField,
  totalItems,
}: RoomResultsToolbarProps) => {
  const itemRangeText = isLoading
    ? "Loading rooms..."
    : `Showing ${totalItems === 0 ? 0 : (page - 1) * itemsPerPage + 1}-${Math.min(
        page * (roomsSize || itemsPerPage),
        totalItems,
      )} items out of ${totalItems} items`;
  const sortMenuProps = {
    PaperProps: {
      sx: {
        boxShadow: "none",
        "& .MuiMenuItem-root": {
          fontFamily: '"Lato", sans-serif',
        },
      },
    },
    MenuListProps: {
      sx: {
        fontFamily: '"Lato", sans-serif',
      },
    },
  };

  return (
    <div className={styles.sortPanel}>
      <div className={styles.RoomResult}>Room Results</div>

      <div className={styles.sortSection}>
        <div className={styles.pagination}>
          {pageCount > 0 && (
            <IconButton
              aria-label="Previous page"
              size="small"
              disabled={page <= 1}
              onClick={(event) => onPageChange(event as unknown as ChangeEvent<unknown>, page - 1)}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          )}

          <div className={styles.items}>{itemRangeText}</div>

          {pageCount > 0 && (
            <IconButton
              aria-label="Next page"
              size="small"
              disabled={page >= pageCount}
              onClick={(event) => onPageChange(event as unknown as ChangeEvent<unknown>, page + 1)}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          )}
        </div>

        <span className={styles.sectionDivider} aria-hidden="true" />

        <div className={styles.sortItem}>
          <FormControl size="small" className={styles.sortControl}>
            <Select value={sortField} onChange={onSortChange} MenuProps={sortMenuProps}>
              <MenuItem className={styles.sortMenuItem} value="price">Price</MenuItem>
              <MenuItem className={styles.sortMenuItem} value="occupancy">Occupancy</MenuItem>
              <MenuItem className={styles.sortMenuItem} value="availableCount">Avail Count</MenuItem>
              <MenuItem className={styles.sortMenuItem} value="area">Area</MenuItem>
            </Select>
          </FormControl>

          <IconButton
            className={styles.sortToggle}
            aria-label={`Sort ${sortDirection === "ASC" ? "ascending" : "descending"}`}
            onClick={onSortDirectionToggle}
            size="small"
          >
            {sortDirection === "ASC" ? (
              <ArrowUpwardIcon fontSize="small" />
            ) : (
              <ArrowDownwardIcon fontSize="small" />
            )}
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default RoomResultsToolbar;
