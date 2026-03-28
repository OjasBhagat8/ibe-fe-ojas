import styles from "./RoomDrodown.module.scss";

type Props = {
  label: string;
  options: string[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
};

const RoomDropdown = ({
  label,
  options,
  placeholder,
  value,
  onChange,
  disabled,
}: Props) => {
  return (
    <div className={`${styles.field} ${disabled ? styles.disabled : ""}`}>
      <label className={styles.label}>{label}</label>

      <select
        className={styles.select}
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}

        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RoomDropdown;
