import type { TenantConfig } from "../../features/tenant/tenantTypes";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";

import styles from "./PropertyDropdown.module.scss";

type PropertyFieldProps = {
  selectedPropertyId: string;
  tenant: TenantConfig;
  onPropertyChange: (value: string) => void;
};

const PropertyDropdown = ({
  selectedPropertyId,
  tenant,
  onPropertyChange,
}: PropertyFieldProps) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onPropertyChange(event.target.value);
  };

  return (
    <div className={styles.formGroup}>
      <label htmlFor="property-select" className={styles.label}>
        Property name*
      </label>

      <FormControl fullWidth className={styles.propertyField}>
        <Select
          id="property-select"
          value={selectedPropertyId}
          onChange={handleChange}
          displayEmpty
          IconComponent={KeyboardArrowDownRoundedIcon}
          renderValue={(selected) => {
            if (!selected) {
              return <span className={styles.placeholder}>Search all properties</span>;
            }

            const selectedProperty = tenant.properties.find(
              (property) => property.propertyId === selected
            );

            return selectedProperty?.propertyName ?? "";
          }}
        >

          {tenant.properties.map((property) => (
            <MenuItem
              key={property.propertyId}
              value={property.propertyId}
              className={styles.propertyMenuItem}
            >
              {property.propertyName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default PropertyDropdown;