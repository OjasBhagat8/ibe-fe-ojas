import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { AdminCredentials, AdminRoomType, AdminTenantConfig, AdminTenantSummary } from "./adminTypes";
import AdminField from "./AdminField";
import styles from "./AdminDashboard.module.scss";

type AdminAuthScreenProps = {
  busy: string | null;
  credentials: AdminCredentials;
  error: string;
  onLogin: (event: FormEvent) => void;
  setCredentials: Dispatch<SetStateAction<AdminCredentials>>;
  tenantLabel?: string;
};

export const AdminAuthScreen = ({
  busy,
  credentials,
  error,
  onLogin,
  setCredentials,
  tenantLabel,
}: AdminAuthScreenProps) => (
  <div className={styles.authShell}>
    <div className={styles.authCard}>
      <div className={styles.authIntro}>
        <p className={styles.kicker}>IBE Blitz Admin</p>
        <h1>{tenantLabel ? `${tenantLabel} admin workspace` : "Tenant management workspace"}</h1>
        <p className={styles.lead}>
          Sign in with platform-admin or tenant-admin credentials. Platform admin can create tenants and assign tenant admins. Tenant admins land directly in their own workspace.
        </p>
      </div>
      <div className={styles.authGrid}>
        <form className={styles.formPanel} onSubmit={onLogin}>
          <AdminField label="Admin name">
            <input
              value={credentials.adminName}
              onChange={(event) => setCredentials((current) => ({ ...current, adminName: event.target.value }))}
              placeholder="Admin name"
            />
          </AdminField>
          <AdminField label="Admin password">
            <input
              type="password"
              value={credentials.password}
              onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
              placeholder="Password"
            />
          </AdminField>
          <button type="submit" className={styles.primaryButton}>
            {busy === "login" ? "Signing in..." : "Open admin workspace"}
          </button>
          {error ? <p className={styles.error}>{error}</p> : null}
        </form>
      </div>
    </div>
  </div>
);

type AdminTenantPickerProps = {
  error: string;
  message: string;
  onLoadTenant: (tenantId: string) => void;
  onSignOut: () => void;
  tenants: AdminTenantSummary[];
};

export const AdminTenantPicker = ({
  error,
  message,
  onLoadTenant,
  onSignOut,
  tenants,
}: AdminTenantPickerProps) => (
  <div className={styles.pickerShell}>
    <div className={styles.pickerHeader}>
      <div>
        <p className={styles.kicker}>Platform Admin</p>
        <h1>Choose the tenant to manage</h1>
      </div>
      <div className={styles.headerActions}>
        <button type="button" className={styles.secondaryButton} onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </div>
    {message ? <p className={styles.message}>{message}</p> : null}
    {error ? <p className={styles.error}>{error}</p> : null}
    <div className={styles.tenantGrid}>
      {tenants.map((tenant) => (
        <button
          key={tenant.tenantId}
          type="button"
          className={styles.tenantCard}
          onClick={() => onLoadTenant(tenant.tenantId)}
        >
          <p className={styles.cardEyebrow}>Tenant</p>
          <h3>{tenant.tenantName}</h3>
          <span>Open workspace</span>
        </button>
      ))}
    </div>
  </div>
);

type AdminPropertyScopeProps = {
  activePropertyId: string;
  guestTypeCount: number;
  onPropertyChange: (propertyId: string) => void;
  roomCatalog: AdminRoomType[];
  tenantConfig: AdminTenantConfig | null;
  title: string;
  hint: string;
};

export const AdminPropertyScope = ({
  activePropertyId,
  guestTypeCount,
  onPropertyChange,
  roomCatalog,
  tenantConfig,
  title,
  hint,
}: AdminPropertyScopeProps) => {
  const activeProperty = tenantConfig?.properties.find((property) => property.propertyId === activePropertyId) ?? null;

  return (
    <section className={styles.scopeBar}>
      <div>
        <p className={styles.scopeEyebrow}>{title}</p>
        <h3>{activeProperty?.propertyName ?? "Select a property"}</h3>
        <p className={styles.scopeHint}>{hint}</p>
      </div>
      <div className={styles.scopeControls}>
        <AdminField label="Property">
          <select value={activePropertyId} onChange={(event) => onPropertyChange(event.target.value)}>
            {tenantConfig?.properties.length ? null : <option value="">No properties</option>}
            {tenantConfig?.properties.map((property) => (
              <option key={property.propertyId} value={property.propertyId}>
                {property.propertyName}
              </option>
            ))}
          </select>
        </AdminField>
      </div>
      <div className={styles.scopeStats}>
        <div className={styles.scopeStat}>
          <span>Properties</span>
          <strong>{tenantConfig?.properties.length ?? 0}</strong>
        </div>
        <div className={styles.scopeStat}>
          <span>Room types</span>
          <strong>{roomCatalog.length}</strong>
        </div>
        <div className={styles.scopeStat}>
          <span>Guest types</span>
          <strong>{guestTypeCount}</strong>
        </div>
      </div>
    </section>
  );
};

type AdminPropertyCardsProps = {
  activePropertyId: string;
  busy: string | null;
  onDeleteProperty: (propertyId: string, propertyName: string) => void;
  onSelectProperty: (propertyId: string) => void;
  tenantConfig: AdminTenantConfig | null;
};

export const AdminPropertyCards = ({
  activePropertyId,
  busy,
  onDeleteProperty,
  onSelectProperty,
  tenantConfig,
}: AdminPropertyCardsProps) => (
  <div className={styles.cardGrid}>
    {tenantConfig?.properties.map((property) => {
      const guestTypeCount = property.guestTypes?.length ?? 0;
      const isActive = property.propertyId === activePropertyId;
      return (
        <article key={property.propertyId} className={isActive ? styles.cardActive : styles.card}>
          <div className={styles.cardHead}>
            <div>
              <p className={styles.cardEyebrow}>Property</p>
              <h4>{property.propertyName}</h4>
            </div>
            <span className={styles.cardBadge}>{property.roomCount ?? 0} rooms</span>
          </div>
          <div className={styles.cardFacts}>
            <span>{property.guestAllowed ?? 0} guests allowed</span>
            <span>{property.lengthOfStay ?? 0} night stay limit</span>
            <span>{guestTypeCount} guest types</span>
          </div>
          <div className={styles.cardActions}>
            <button type="button" className={styles.secondaryButton} onClick={() => onSelectProperty(property.propertyId)}>
              {isActive ? "Selected" : "Manage property"}
            </button>
            <button
              type="button"
              className={styles.dangerButton}
              onClick={() => onDeleteProperty(property.propertyId, property.propertyName)}
            >
              {busy === "property-delete" ? "Deleting..." : "Delete"}
            </button>
          </div>
        </article>
      );
    })}
  </div>
);
