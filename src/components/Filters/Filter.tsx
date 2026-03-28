import { useEffect, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";
import styles from "./Filter.module.scss";

export interface RoomFilterOption {
  optionId: string;
  value: string;
  label?: string;
}

export interface RoomFilterGroup {
  filterId: string;
  filterType: "checkbox" | "range";
  filterName: string;
  options?: RoomFilterOption[];
  rangeMin?: number;
  rangeMax?: number;
  minValue?: number;
  maxValue?: number;
}

export type SelectedFilters = Record<
  string,
  {
    selectedValues?: string[];
    minValue?: number;
    maxValue?: number;
  }
>;

type Props = {
  filters: RoomFilterGroup[];
  value: SelectedFilters;
  onApply: (next: SelectedFilters) => void;
};

const RoomFiltersAccordion = ({ filters, value, onApply }: Props) => {
  const [expanded, setExpanded] = useState<string | false>(filters[0]?.filterId || false);
  const [localFilters, setLocalFilters] = useState<SelectedFilters>(value);

  useEffect(() => {
    setLocalFilters(value);
  }, [value]);

  useEffect(() => {
    setExpanded((currentExpanded) => {
      if (!filters.length) return false;
      if (currentExpanded && filters.some((filter) => filter.filterId === currentExpanded)) {
        return currentExpanded;
      }
      return filters[0]?.filterId || false;
    });
  }, [filters]);

  const handleAccordionChange =
    (panelId: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panelId : false);
    };

  const handleToggle = (filterId: string, optionValue: string) => {
    const current = localFilters[filterId]?.selectedValues ?? [];
    const exists = current.includes(optionValue);

    const next = exists
      ? current.filter((item) => item !== optionValue)
      : [...current, optionValue];

    setLocalFilters((prev) => ({
      ...prev,
      [filterId]: {
        ...prev[filterId],
        selectedValues: next,
      },
    }));
  };

  const handleRangeChange = (filterId: string, nextValue: number[]) => {
    setLocalFilters((prev) => ({
      ...prev,
      [filterId]: {
        ...prev[filterId],
        minValue: nextValue[0],
        maxValue: nextValue[1],
      },
    }));
  };

  return (
    <Box className={styles.container}>
      <Typography className={styles.heading}>
        Narrow your results
      </Typography>

      {filters.map((filter) => {
        const currentMin = localFilters[filter.filterId]?.minValue ?? filter.rangeMin ?? filter.minValue ?? 0;
        const currentMax = localFilters[filter.filterId]?.maxValue ?? filter.rangeMax ?? filter.maxValue ?? 100;

        return (
          <Accordion
            key={filter.filterId}
            className={styles.accordion}
            expanded={expanded === filter.filterId}
            onChange={handleAccordionChange(filter.filterId)}
            disableGutters
            elevation={0}
            square
          >
            <AccordionSummary
              className={styles.summary}
              expandIcon={<ExpandMoreIcon className={styles.expandIcon} />}
            >
              <Typography className={styles.summaryTitle}>
                {filter.filterName}
              </Typography>
            </AccordionSummary>

            <AccordionDetails className={styles.details}>
              {filter.filterType === "checkbox" && (
                <Box className={styles.checkboxList}>
                  {(filter.options ?? []).map((option) => {
                    const checked = (
                      localFilters[filter.filterId]?.selectedValues ?? []
                    ).includes(option.value);

                    return (
                      <FormControlLabel
                        key={option.optionId}
                        className={styles.checkboxLabel}
                        control={
                          <Checkbox
                            checked={checked}
                            onChange={() => handleToggle(filter.filterId, option.value)}
                            className={styles.checkbox}
                          />
                        }
                        label={option.label ?? option.value}
                      />
                    );
                  })}
                </Box>
              )}

              {filter.filterType === "range" && (
                <Box className={styles.rangeWrap}>
                  <Box className={styles.sliderWrap}>
                    <Slider
                      className={styles.slider}
                      value={[currentMin, currentMax]}
                      onChange={(_e, newValue) =>
                        handleRangeChange(filter.filterId, newValue as number[])
                      }
                      disableSwap
                      valueLabelDisplay="auto"
                      min={filter.rangeMin ?? filter.minValue ?? 0}
                      max={filter.rangeMax ?? filter.maxValue ?? 100}
                    />
                  </Box>

                  <Box className={styles.rangeValues}>
                    <Typography variant="body2" className={styles.rangeValue}>
                      {currentMin}
                    </Typography>
                    <Typography variant="body2" className={styles.rangeValueEnd}>
                      {currentMax}
                    </Typography>
                  </Box>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}

      <Button
        variant="contained"
        fullWidth
        className={styles.applyButton}
        onClick={() => onApply(localFilters)}
      >
        Apply Filters
      </Button>
    </Box>
  );
};

export default RoomFiltersAccordion;
