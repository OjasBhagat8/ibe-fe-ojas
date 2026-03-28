import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import Autocomplete from "@mui/material/Autocomplete";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import TextField from "@mui/material/TextField";
import type { ReactNode } from "react";
import styles from "../Checkout.module.scss";

export type SearchableDropdownOption = {
  value: string;
  label: string;
};

type Props<TOption extends SearchableDropdownOption> = {
  name: string;
  options: TOption[];
  value: string;
  placeholder?: string;
  disabled?: boolean;
  noOptionsText?: string;
  onChange: (value: string) => void;
  renderOptionContent?: (option: TOption) => ReactNode;
  renderSelectedStartAdornment?: (option: TOption) => ReactNode;
  getOptionSearchLabel?: (option: TOption) => string;
};

const SearchableDropdown = <TOption extends SearchableDropdownOption>({
  name,
  options,
  value,
  placeholder = "Choose",
  disabled = false,
  noOptionsText = "No options found",
  onChange,
  renderOptionContent,
  renderSelectedStartAdornment,
  getOptionSearchLabel,
}: Props<TOption>) => {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <Autocomplete
      options={options}
      value={selectedOption}
      disableClearable
      autoHighlight
      openOnFocus
      disabled={disabled}
      getOptionLabel={(option) => getOptionSearchLabel?.(option) ?? option.label}
      isOptionEqualToValue={(option, selected) => option.value === selected.value}
      onChange={(_, option) => onChange(option?.value ?? "")}
      noOptionsText={noOptionsText}
      popupIcon={<KeyboardArrowDownRoundedIcon />}
      className={styles.checkoutAutocomplete}
      slots={{
        paper: Paper,
        popper: Popper,
      }}
      slotProps={{
        paper: {
          className: styles.checkoutAutocompletePaper,
        },
        popper: {
          placement: "bottom-start",
          className: styles.checkoutAutocompletePopper,
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          name={name}
          placeholder={placeholder}
          className={styles.checkoutAutocompleteInput}
          InputProps={{
            ...params.InputProps,
            startAdornment:
              selectedOption && renderSelectedStartAdornment ? (
                <InputAdornment position="start" className={styles.countryAdornment}>
                  {renderSelectedStartAdornment(selectedOption)}
                </InputAdornment>
              ) : undefined,
          }}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;

        return (
          <li key={key} {...optionProps} className={styles.checkoutAutocompleteOption}>
            {renderOptionContent ? renderOptionContent(option) : option.label}
          </li>
        );
      }}
    />
  );
};

export default SearchableDropdown;
