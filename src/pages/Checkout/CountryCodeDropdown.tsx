import ReactCountryFlag from "react-country-flag";
import SearchableDropdown from "./SearchableDropdown";
import styles from "../Checkout.module.scss";

type PhoneCountryOption = {
  value: string;
  label: string;
  dialCode: string;
};

type Props = {
  name: string;
  options: PhoneCountryOption[];
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

const CountryCodeDropdown = ({ name, options, value, placeholder = "Choose", onChange }: Props) => (
  <SearchableDropdown
    name={name}
    options={options}
    value={value}
    placeholder={placeholder}
    noOptionsText="No country found"
    onChange={onChange}
    getOptionSearchLabel={(option) => `${option.dialCode} ${option.label}`}
    renderSelectedStartAdornment={(option) => (
      <ReactCountryFlag
        countryCode={option.value}
        svg
        className={styles.countryFlag}
      />
    )}
    renderOptionContent={(option) => (
      <span className={styles.countryOptionLabel}>
        <ReactCountryFlag
          countryCode={option.value}
          svg
          className={styles.countryFlag}
        />
        <span>{option.dialCode}</span>
        <span>{option.label}</span>
      </span>
    )}
  />
);

export default CountryCodeDropdown;
