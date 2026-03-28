import type { TenantConfig } from "../../features/tenant/tenantTypes";

import styles from "./BookingSearchForm.module.scss";

type PropertyFieldProps = {
  selectedPropertyId: string;
  tenant: TenantConfig;
  onPropertyChange: (value: string) => void;
};

const PropertyField = ({ selectedPropertyId, tenant, onPropertyChange }: PropertyFieldProps) => (
  <div className={styles.formGroup}>
    <label className={styles.label}>Property name*</label>
    <select
      className={`${styles.select} ${!selectedPropertyId ? styles.selectPlaceholder : ""}`}
      value={selectedPropertyId}
      onChange={(event) => onPropertyChange(event.target.value)}
    >
      <option value="">Search all properties</option>
      {tenant.properties.map((property) => (
        <option key={property.propertyId} value={property.propertyId}>
          {property.propertyName}
        </option>
      ))}
    </select>
  </div>
);

export default PropertyField;
