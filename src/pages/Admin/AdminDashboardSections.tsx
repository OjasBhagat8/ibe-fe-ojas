import type { Dispatch, FormEvent, ReactElement, SetStateAction } from "react";
import type {
  AdminFilter,
  AdminPriceItem,
  AdminPromotion,
  AdminRoomType,
  AdminTenantConfig,
} from "./adminTypes";
import AdminField from "./AdminField";
import {
  applyToOptions,
  conditionOperatorOptions,
  conditionTypeOptions,
  filterTypeOptions,
  money,
  promotionKindOptions,
  rewardTypeOptions,
  sourceFieldOptions,
} from "./adminDashboardConfig";
import { emptyFilterForm, emptyGuestForm, emptyPromoForm, emptyRoomForm, toFilterForm, toGuestForm, toPromoForm, toRoomForm } from "./adminDashboardFormUtils";
import type { FilterForm, GuestForm, PromoForm, PropertyForm, RoomForm } from "./adminDashboardTypes";
import styles from "./AdminDashboard.module.scss";

type AdminOverviewSectionProps = {
  priceCount: number;
  propertyCount: number;
  renderPropertyCards: () => ReactElement;
  roomCount: number;
};

export const AdminOverviewSection = ({
  priceCount,
  propertyCount,
  renderPropertyCards,
  roomCount,
}: AdminOverviewSectionProps) => (
  <>
    <section className={styles.heroGrid}>
      <article className={styles.metricCard}>
        <span>Properties</span>
        <strong>{propertyCount}</strong>
      </article>
      <article className={styles.metricCard}>
        <span>Loaded room types</span>
        <strong>{roomCount}</strong>
      </article>
      <article className={styles.metricCard}>
        <span>Price rows in range</span>
        <strong>{priceCount}</strong>
      </article>
    </section>

    <section className={styles.sectionPanel}>
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Tenant structure</p>
          <h2>All properties under this tenant</h2>
        </div>
        <span className={styles.panelBadge}>{propertyCount} total</span>
      </div>
      {renderPropertyCards()}
    </section>
  </>
);

type AdminTenantSectionProps = {
  busy: string | null;
  onSubmit: (event: FormEvent) => void;
  setTenantForm: Dispatch<SetStateAction<{
    tenantName: string;
    tenantLogo: string;
    tenantBanner: string;
    tenantCopyright: string;
  }>>;
  tenantForm: {
    tenantName: string;
    tenantLogo: string;
    tenantBanner: string;
    tenantCopyright: string;
  };
};

export const AdminTenantSection = ({
  busy,
  onSubmit,
  setTenantForm,
  tenantForm,
}: AdminTenantSectionProps) => (
  <section className={styles.sectionPanel}>
    <div className={styles.panelHeader}>
      <div>
        <p className={styles.sectionEyebrow}>Brand details</p>
        <h2>Tenant profile and storefront assets</h2>
      </div>
      <span className={styles.panelBadge}>Tenant level</span>
    </div>
    <div className={styles.workspaceGrid}>
      <div className={styles.previewPanel}>
        <div
          className={styles.bannerPreview}
          style={{
            backgroundImage: tenantForm.tenantBanner ? `linear-gradient(rgba(21, 29, 61, 0.42), rgba(21, 29, 61, 0.64)), url(${tenantForm.tenantBanner})` : undefined,
          }}
        >
          <p className={styles.cardEyebrow}>Preview</p>
          <h3>{tenantForm.tenantName || "Tenant name"}</h3>
          <p>{tenantForm.tenantCopyright || "Tenant footer copy"}</p>
        </div>
        <div className={styles.summaryList}>
          <div className={styles.summaryItem}>
            <span>Logo URL</span>
            <strong>{tenantForm.tenantLogo || "Not set"}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Banner URL</span>
            <strong>{tenantForm.tenantBanner || "Not set"}</strong>
          </div>
        </div>
      </div>
      <form className={styles.formPanel} onSubmit={onSubmit}>
        <div className={styles.formGrid}>
          <AdminField label="Tenant name" hint="The brand name shown across the booking experience.">
            <input
              value={tenantForm.tenantName}
              onChange={(event) => setTenantForm((current) => ({ ...current, tenantName: event.target.value }))}
              placeholder="Tenant name"
            />
          </AdminField>
          <AdminField label="Logo URL" hint="Use a direct image URL for the tenant logo.">
            <input
              value={tenantForm.tenantLogo}
              onChange={(event) => setTenantForm((current) => ({ ...current, tenantLogo: event.target.value }))}
              placeholder="https://example.com/logo.png"
            />
          </AdminField>
          <AdminField label="Banner URL" hint="Large image used in the storefront hero area.">
            <input
              value={tenantForm.tenantBanner}
              onChange={(event) => setTenantForm((current) => ({ ...current, tenantBanner: event.target.value }))}
              placeholder="https://example.com/banner.png"
            />
          </AdminField>
          <AdminField label="Footer text" hint="Shown as copyright or footer content.">
            <input
              value={tenantForm.tenantCopyright}
              onChange={(event) => setTenantForm((current) => ({ ...current, tenantCopyright: event.target.value }))}
              placeholder="Copyright text"
            />
          </AdminField>
        </div>
        <button type="submit" className={styles.primaryButton}>
          {busy === "tenant-save" ? "Saving..." : "Save tenant profile"}
        </button>
      </form>
    </div>
  </section>
);

type AdminPropertiesSectionProps = {
  activeProperty: AdminTenantConfig["properties"][number] | null;
  busy: string | null;
  newPropertyName: string;
  onCreateProperty: (event: FormEvent) => void;
  onDeleteProperty: (propertyId: string, propertyName: string) => void;
  onSaveProperty: (event: FormEvent) => void;
  propertyCount: number;
  propertyForm: PropertyForm;
  renderPropertyCards: () => ReactElement;
  renderPropertyScope: (title: string, hint: string) => ReactElement;
  setNewPropertyName: Dispatch<SetStateAction<string>>;
  setPropertyForm: Dispatch<SetStateAction<PropertyForm>>;
};

export const AdminPropertiesSection = ({
  activeProperty,
  busy,
  newPropertyName,
  onCreateProperty,
  onDeleteProperty,
  onSaveProperty,
  propertyCount,
  propertyForm,
  renderPropertyCards,
  renderPropertyScope,
  setNewPropertyName,
  setPropertyForm,
}: AdminPropertiesSectionProps) => (
  <>
    {renderPropertyScope("Property selection", "Pick the property to review on the right. The current values are shown first, and the form updates that same property.")}
    <section className={styles.sectionPanel}>
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Property list</p>
          <h2>All properties for this tenant</h2>
        </div>
        <span className={styles.panelBadge}>{propertyCount} properties</span>
      </div>
      {renderPropertyCards()}
    </section>
    <section className={styles.sectionPanel}>
      <div className={styles.workspaceGrid}>
        <div className={styles.summaryPanel}>
          <h3>Current property details</h3>
          {activeProperty ? (
            <div className={styles.summaryList}>
              <div className={styles.summaryItem}>
                <span>Property name</span>
                <strong>{activeProperty.propertyName}</strong>
              </div>
              <div className={styles.summaryItem}>
                <span>Guests allowed</span>
                <strong>{propertyForm.guestAllowed}</strong>
              </div>
              <div className={styles.summaryItem}>
                <span>Total rooms</span>
                <strong>{propertyForm.roomCount}</strong>
              </div>
              <div className={styles.summaryItem}>
                <span>Stay limit</span>
                <strong>{propertyForm.lengthOfStay} nights</strong>
              </div>
              <div className={styles.summaryItem}>
                <span>Accessibility</span>
                <strong>{propertyForm.accessibleFlag ? "Enabled" : "Disabled"}</strong>
              </div>
            </div>
          ) : (
            <p className={styles.emptyState}>Create a property first to start configuring room inventory and guest rules.</p>
          )}
          <form className={styles.inlineStack} onSubmit={onCreateProperty}>
            <AdminField label="Create new property" hint="Add another property under the current tenant.">
              <input
                value={newPropertyName}
                onChange={(event) => setNewPropertyName(event.target.value)}
                placeholder="New property name"
              />
            </AdminField>
            <button type="submit" className={styles.secondaryButton}>
              {busy === "property-create" ? "Creating..." : "Add property"}
            </button>
          </form>
        </div>
        <form className={styles.formPanel} onSubmit={onSaveProperty}>
          <h3>Edit selected property</h3>
          <div className={styles.formGrid}>
            <AdminField label="Property name" hint="Shown here so the admin can confirm the property being edited.">
              <input
                value={propertyForm.propertyName}
                onChange={(event) => setPropertyForm((current) => ({ ...current, propertyName: event.target.value }))}
              />
            </AdminField>
            <AdminField label="Maximum guests" hint="Highest guest count allowed for the property.">
              <input
                type="number"
                value={propertyForm.guestAllowed}
                onChange={(event) => setPropertyForm((current) => ({ ...current, guestAllowed: Number(event.target.value) }))}
              />
            </AdminField>
            <AdminField label="Room inventory" hint="Total rooms configured at this property.">
              <input
                type="number"
                value={propertyForm.roomCount}
                onChange={(event) => setPropertyForm((current) => ({ ...current, roomCount: Number(event.target.value) }))}
              />
            </AdminField>
            <AdminField label="Maximum stay length" hint="Limit the number of nights per booking.">
              <input
                type="number"
                value={propertyForm.lengthOfStay}
                onChange={(event) => setPropertyForm((current) => ({ ...current, lengthOfStay: Number(event.target.value) }))}
              />
            </AdminField>
          </div>
          <div className={styles.checkGrid}>
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={propertyForm.guestFlag}
                onChange={(event) => setPropertyForm((current) => ({ ...current, guestFlag: event.target.checked }))}
              />
              <div>
                <strong>Guest rules enabled</strong>
                <span>Keep guest-type logic active for this property.</span>
              </div>
            </label>
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={propertyForm.roomFlag}
                onChange={(event) => setPropertyForm((current) => ({ ...current, roomFlag: event.target.checked }))}
              />
              <div>
                <strong>Room controls enabled</strong>
                <span>Use property room-level inventory and availability controls.</span>
              </div>
            </label>
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={propertyForm.accessibleFlag}
                onChange={(event) => setPropertyForm((current) => ({ ...current, accessibleFlag: event.target.checked }))}
              />
              <div>
                <strong>Accessibility enabled</strong>
                <span>Allow accessible inventory logic for this property.</span>
              </div>
            </label>
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryButton}>
              {busy === "property-save" ? "Saving..." : "Save property settings"}
            </button>
            {activeProperty ? (
              <button
                type="button"
                className={styles.dangerButton}
                onClick={() => onDeleteProperty(activeProperty.propertyId, activeProperty.propertyName)}
              >
                {busy === "property-delete" ? "Deleting..." : "Delete selected property"}
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  </>
);

type AdminGuestTypesSectionProps = {
  activeGuestTypeCount: number;
  busy: string | null;
  guestForm: GuestForm;
  guestTypes: NonNullable<AdminTenantConfig["properties"][number]["guestTypes"]>;
  onDeleteGuestType: (guestTypeId: string, guestTypeName: string) => void;
  onSubmit: (event: FormEvent) => void;
  renderPropertyScope: (title: string, hint: string) => ReactElement;
  setGuestForm: Dispatch<SetStateAction<GuestForm>>;
};

export const AdminGuestTypesSection = ({
  activeGuestTypeCount,
  busy,
  guestForm,
  guestTypes,
  onDeleteGuestType,
  onSubmit,
  renderPropertyScope,
  setGuestForm,
}: AdminGuestTypesSectionProps) => {
  return (
    <>
      {renderPropertyScope("Guest type selection", "Choose the property first. The cards show the guest types already configured, and the form edits the selected one.")}
      <section className={styles.sectionPanel}>
        <div className={styles.workspaceGrid}>
          <div className={styles.listPanel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Current guest types</p>
                <h2>Guest categories</h2>
              </div>
              <span className={styles.panelBadge}>{activeGuestTypeCount} total</span>
            </div>
            {activeGuestTypeCount > 0 ? (
              <div className={styles.stackList}>
                {guestTypes.map((guestType) => {
                  const isSelected = guestForm.guestTypeId === guestType.guestTypeId;
                  return (
                    <article key={guestType.guestTypeId} className={isSelected ? styles.listCardActive : styles.listCard}>
                      <div>
                        <h3>{guestType.guestTypeName}</h3>
                        <p>{guestType.minAge} to {guestType.maxAge} years</p>
                      </div>
                      <div className={styles.cardActions}>
                        <button type="button" className={styles.secondaryButton} onClick={() => setGuestForm(toGuestForm(guestType))}>
                          {isSelected ? "Editing" : "Edit"}
                        </button>
                        <button
                          type="button"
                          className={styles.dangerButton}
                          onClick={() => onDeleteGuestType(guestType.guestTypeId, guestType.guestTypeName)}
                        >
                          {busy === "guest-type-delete" ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className={styles.emptyState}>No guest types are configured for this property yet.</p>
            )}
          </div>
          <form className={styles.formPanel} onSubmit={onSubmit}>
            <h3>{guestForm.guestTypeId ? "Edit guest type" : "Create guest type"}</h3>
            <div className={styles.formGrid}>
              <AdminField label="Guest type name" hint="Examples: Adult, Child, Infant.">
                <input
                  value={guestForm.guestTypeName}
                  onChange={(event) => setGuestForm((current) => ({ ...current, guestTypeName: event.target.value }))}
                  placeholder="Guest type name"
                />
              </AdminField>
              <AdminField label="Minimum age" hint="Lowest age included in this category.">
                <input
                  type="number"
                  value={guestForm.minAge}
                  onChange={(event) => setGuestForm((current) => ({ ...current, minAge: Number(event.target.value) }))}
                />
              </AdminField>
              <AdminField label="Maximum age" hint="Highest age included in this category.">
                <input
                  type="number"
                  value={guestForm.maxAge}
                  onChange={(event) => setGuestForm((current) => ({ ...current, maxAge: Number(event.target.value) }))}
                />
              </AdminField>
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={styles.primaryButton}>
                {busy === "guest-type-save" ? "Saving..." : guestForm.guestTypeId ? "Update guest type" : "Create guest type"}
              </button>
              <button type="button" className={styles.secondaryButton} onClick={() => setGuestForm(emptyGuestForm())}>
                Reset form
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

type AdminFiltersSectionProps = {
  busy: string | null;
  filters: AdminFilter[];
  filterForm: FilterForm;
  onDeleteFilter: (filterId: string, filterName: string) => void;
  onSubmit: (event: FormEvent) => void;
  renderPropertyScope: (title: string, hint: string) => ReactElement;
  setFilterForm: Dispatch<SetStateAction<FilterForm>>;
};

export const AdminFiltersSection = ({
  busy,
  filters,
  filterForm,
  onDeleteFilter,
  onSubmit,
  renderPropertyScope,
  setFilterForm,
}: AdminFiltersSectionProps) => (
  <>
    {renderPropertyScope("Filter selection", "Filters control which room-search facets are shown for the selected property. Choose a filter to edit it or create a new one.")}
    <section className={styles.sectionPanel}>
      <div className={styles.workspaceGrid}>
        <div className={styles.listPanel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Current filters</p>
              <h2>Search filters for this property</h2>
            </div>
            <span className={styles.panelBadge}>{filters.length} total</span>
          </div>
          {filters.length > 0 ? (
            <div className={styles.stackList}>
              {filters.map((filter) => {
                const isSelected = filterForm.filterId === filter.filterId;
                return (
                  <article key={filter.filterId} className={isSelected ? styles.listCardActive : styles.listCard}>
                    <div>
                      <h3>{filter.filterName}</h3>
                      <p>{filter.sourceField} | {filter.filterType} | order {filter.sortOrder ?? 0}</p>
                      <span>{filter.active ? "Active" : "Inactive"}</span>
                    </div>
                    <div className={styles.cardActions}>
                      <button type="button" className={styles.secondaryButton} onClick={() => setFilterForm(toFilterForm(filter))}>
                        {isSelected ? "Editing" : "Edit"}
                      </button>
                      <button type="button" className={styles.dangerButton} onClick={() => onDeleteFilter(filter.filterId, filter.filterName)}>
                        {busy === "filter-delete" ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className={styles.emptyState}>No filters configured for the selected property.</p>
          )}
        </div>
        <form className={styles.formPanel} onSubmit={onSubmit}>
          <h3>{filterForm.filterId ? "Edit filter" : "Create filter"}</h3>
          <div className={styles.formGrid}>
            <AdminField label="Filter name" hint="Label shown in room search.">
              <input
                value={filterForm.filterName}
                onChange={(event) => setFilterForm((current) => ({ ...current, filterName: event.target.value }))}
                placeholder="Amenities"
              />
            </AdminField>
            <AdminField label="Source field" hint="Backend field used to generate options or range.">
              <select
                value={filterForm.sourceField}
                onChange={(event) => setFilterForm((current) => ({ ...current, sourceField: event.target.value }))}
              >
                {sourceFieldOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Filter type" hint="Checkbox for discrete values, range for numeric values.">
              <select
                value={filterForm.filterType}
                onChange={(event) => setFilterForm((current) => ({ ...current, filterType: event.target.value }))}
              >
                {filterTypeOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Sort order" hint="Lower numbers appear first.">
              <input
                type="number"
                value={filterForm.sortOrder}
                onChange={(event) => setFilterForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))}
              />
            </AdminField>
          </div>
          <label className={styles.checkRow}>
            <input
              type="checkbox"
              checked={filterForm.active}
              onChange={(event) => setFilterForm((current) => ({ ...current, active: event.target.checked }))}
            />
            <div>
              <strong>Filter is active</strong>
              <span>Inactive filters stay stored but do not appear in guest search.</span>
            </div>
          </label>
          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryButton}>
              {busy === "filter-save" ? "Saving..." : filterForm.filterId ? "Update filter" : "Create filter"}
            </button>
            <button type="button" className={styles.secondaryButton} onClick={() => setFilterForm(emptyFilterForm())}>
              Reset form
            </button>
          </div>
        </form>
      </div>
    </section>
  </>
);

type AdminRoomsSectionProps = {
  busy: string | null;
  onDeleteRoomType: (roomTypeId: string, roomTypeName: string) => void;
  onSubmit: (event: FormEvent) => void;
  renderPropertyScope: (title: string, hint: string) => ReactElement;
  roomCatalog: AdminRoomType[];
  roomForm: RoomForm;
  setRoomForm: Dispatch<SetStateAction<RoomForm>>;
};

export const AdminRoomsSection = ({
  busy,
  onDeleteRoomType,
  onSubmit,
  renderPropertyScope,
  roomCatalog,
  roomForm,
  setRoomForm,
}: AdminRoomsSectionProps) => (
  <>
    {renderPropertyScope("Room type selection", "The selected property controls which room types appear below. Choose a room card to edit it, or create a new one from the form.")}
    <section className={styles.sectionPanel}>
      <div className={styles.workspaceGrid}>
        <div className={styles.listPanel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Current room catalog</p>
              <h2>Room types for this property</h2>
            </div>
            <span className={styles.panelBadge}>{roomCatalog.length} loaded</span>
          </div>
          {roomCatalog.length > 0 ? (
            <div className={styles.stackList}>
              {roomCatalog.map((room) => {
                const isSelected = roomForm.roomTypeId === room.roomTypeId;
                return (
                  <article key={room.roomTypeId} className={isSelected ? styles.listCardActive : styles.listCard}>
                    <div>
                      <h3>{room.roomTypeName}</h3>
                      <p>{room.description || "No description set."}</p>
                      <span>{room.occupancy} guests • {room.roomSpec?.bedType ?? "Bed type not set"} • {money.format(room.baseRate ?? 0)}</span>
                    </div>
                    <div className={styles.cardActions}>
                      <button type="button" className={styles.secondaryButton} onClick={() => setRoomForm(toRoomForm(room))}>
                        {isSelected ? "Editing" : "Edit"}
                      </button>
                      <button
                        type="button"
                        className={styles.dangerButton}
                        onClick={() => onDeleteRoomType(room.roomTypeId, room.roomTypeName)}
                      >
                        {busy === "room-delete" ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className={styles.emptyState}>No room types are available for the selected property.</p>
          )}
        </div>
        <form className={styles.formPanel} onSubmit={onSubmit}>
          <h3>{roomForm.roomTypeId ? "Edit room type" : "Create room type"}</h3>
          <div className={styles.formGrid}>
            <AdminField label="Room type name" hint="Example: Deluxe King, Executive Twin.">
              <input
                value={roomForm.roomTypeName}
                onChange={(event) => setRoomForm((current) => ({ ...current, roomTypeName: event.target.value }))}
                placeholder="Room type name"
              />
            </AdminField>
            <AdminField label="Description" hint="Short description shown in guest-facing room cards.">
              <textarea
                value={roomForm.description}
                onChange={(event) => setRoomForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Room description"
              />
            </AdminField>
            <AdminField label="Occupancy" hint="Maximum guest capacity for this room type.">
              <input
                type="number"
                value={roomForm.occupancy}
                onChange={(event) => setRoomForm((current) => ({ ...current, occupancy: Number(event.target.value) }))}
              />
            </AdminField>
            <AdminField label="Base nightly rate" hint="Starting price before any promotion logic.">
              <input
                type="number"
                value={roomForm.baseRate}
                onChange={(event) => setRoomForm((current) => ({ ...current, baseRate: Number(event.target.value) }))}
              />
            </AdminField>
            <AdminField label="Amenities" hint="Separate values with commas. Example: Wifi, Breakfast, Desk.">
              <input
                value={roomForm.amenities}
                onChange={(event) => setRoomForm((current) => ({ ...current, amenities: event.target.value }))}
                placeholder="Wifi, Breakfast, Desk"
              />
            </AdminField>
            <AdminField label="Primary image URL" hint="First image used for this room type.">
              <input
                value={roomForm.image}
                onChange={(event) => setRoomForm((current) => ({ ...current, image: event.target.value }))}
                placeholder="https://example.com/room.jpg"
              />
            </AdminField>
            <AdminField label="Bed type" hint="Examples: King Bed, Twin Bed.">
              <input
                value={roomForm.bedType}
                onChange={(event) => setRoomForm((current) => ({ ...current, bedType: event.target.value }))}
                placeholder="King Bed"
              />
            </AdminField>
            <AdminField label="Area" hint="Area of the room, usually in sq ft.">
              <input
                type="number"
                value={roomForm.area}
                onChange={(event) => setRoomForm((current) => ({ ...current, area: Number(event.target.value) }))}
              />
            </AdminField>
            <AdminField label="Minimum occupancy" hint="Minimum guests expected for this room type.">
              <input
                type="number"
                value={roomForm.minOcc}
                onChange={(event) => setRoomForm((current) => ({ ...current, minOcc: Number(event.target.value) }))}
              />
            </AdminField>
            <AdminField label="Maximum occupancy" hint="Highest guest count supported by the room spec.">
              <input
                type="number"
                value={roomForm.maxOcc}
                onChange={(event) => setRoomForm((current) => ({ ...current, maxOcc: Number(event.target.value) }))}
              />
            </AdminField>
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryButton}>
              {busy === "room-save" ? "Saving..." : roomForm.roomTypeId ? "Update room type" : "Create room type"}
            </button>
            <button type="button" className={styles.secondaryButton} onClick={() => setRoomForm(emptyRoomForm())}>
              Reset form
            </button>
          </div>
        </form>
      </div>
    </section>
  </>
);

type AdminPricesSectionProps = {
  busy: string | null;
  loadedPriceValue: number;
  onDeleteRoomPrice: (priceId: string, roomTypeName: string, date: string) => void;
  onSubmit: (event: FormEvent) => void;
  priceForm: {
    roomTypeId: string;
    date: string;
    roomPrice: number;
    quantity: number;
  };
  priceRange: {
    fromDate: string;
    toDate: string;
  };
  prices: AdminPriceItem[];
  renderPropertyScope: (title: string, hint: string) => ReactElement;
  roomCatalog: AdminRoomType[];
  setPriceForm: Dispatch<SetStateAction<{
    roomTypeId: string;
    date: string;
    roomPrice: number;
    quantity: number;
  }>>;
  setPriceRange: Dispatch<SetStateAction<{
    fromDate: string;
    toDate: string;
  }>>;
};

export const AdminPricesSection = ({
  busy,
  loadedPriceValue,
  onDeleteRoomPrice,
  onSubmit,
  priceForm,
  priceRange,
  prices,
  renderPropertyScope,
  roomCatalog,
  setPriceForm,
  setPriceRange,
}: AdminPricesSectionProps) => (
  <>
    {renderPropertyScope("Price selection", "Choose a property, load the date range, then click any row if you want to edit that exact price entry.")}
    <section className={styles.sectionPanel}>
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Loaded price rows</p>
          <h2>Daily room pricing</h2>
        </div>
        <span className={styles.panelBadge}>{prices.length} rows</span>
      </div>
      <div className={styles.rangeBar}>
        <AdminField label="From date">
          <input
            type="date"
            value={priceRange.fromDate}
            onChange={(event) => setPriceRange((current) => ({ ...current, fromDate: event.target.value }))}
          />
        </AdminField>
        <AdminField label="To date">
          <input
            type="date"
            value={priceRange.toDate}
            onChange={(event) => setPriceRange((current) => ({ ...current, toDate: event.target.value }))}
          />
        </AdminField>
        <div className={styles.rangeSummary}>
          <span>Value in range</span>
          <strong>{money.format(loadedPriceValue)}</strong>
        </div>
      </div>
      {prices.length > 0 ? (
        <div className={styles.table}>
          {prices.map((item) => {
            const isSelected = item.roomTypeId === priceForm.roomTypeId && item.date === priceForm.date;
            return (
              <button
                key={item.priceId}
                type="button"
                className={isSelected ? styles.tableRowActive : styles.tableRow}
                onClick={() => setPriceForm({ roomTypeId: item.roomTypeId, date: item.date, roomPrice: item.roomPrice, quantity: item.quantity })}
              >
                <span>{item.date}</span>
                <span>{item.roomTypeName}</span>
                <span>{money.format(item.roomPrice)}</span>
                <span>{item.quantity} rooms</span>
                <strong>Edit row</strong>
              </button>
            );
          })}
        </div>
      ) : (
        <p className={styles.emptyState}>No prices found for the selected date range.</p>
      )}
    </section>
    <section className={styles.sectionPanel}>
      <form className={styles.formPanel} onSubmit={onSubmit}>
        <div className={styles.panelHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Price editor</p>
            <h2>Update one date and room type</h2>
          </div>
        </div>
        <div className={styles.formGrid}>
          <AdminField label="Room type" hint="Choose which room type gets the rate change.">
            <select
              value={priceForm.roomTypeId}
              onChange={(event) => setPriceForm((current) => ({ ...current, roomTypeId: event.target.value }))}
            >
              <option value="">Select room type</option>
              {roomCatalog.map((room) => (
                <option key={room.roomTypeId} value={room.roomTypeId}>
                  {room.roomTypeName}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField label="Date" hint="Only this date is updated.">
            <input
              type="date"
              value={priceForm.date}
              onChange={(event) => setPriceForm((current) => ({ ...current, date: event.target.value }))}
            />
          </AdminField>
          <AdminField label="Room price" hint="Nightly selling price for the selected date.">
            <input
              type="number"
              value={priceForm.roomPrice}
              onChange={(event) => setPriceForm((current) => ({ ...current, roomPrice: Number(event.target.value) }))}
            />
          </AdminField>
          <AdminField label="Available quantity" hint="How many rooms are available to sell on that date.">
            <input
              type="number"
              value={priceForm.quantity}
              onChange={(event) => setPriceForm((current) => ({ ...current, quantity: Number(event.target.value) }))}
            />
          </AdminField>
        </div>
        <div className={styles.formActions}>
          <button type="submit" className={styles.primaryButton}>
            {busy === "price-save" ? "Saving..." : "Save price row"}
          </button>
          {prices.find((item) => item.roomTypeId === priceForm.roomTypeId && item.date === priceForm.date) ? (
            <button
              type="button"
              className={styles.dangerButton}
              onClick={() => {
                const current = prices.find((item) => item.roomTypeId === priceForm.roomTypeId && item.date === priceForm.date);
                if (current) {
                  onDeleteRoomPrice(current.priceId, current.roomTypeName, current.date);
                }
              }}
            >
              {busy === "price-delete" ? "Deleting..." : "Delete selected row"}
            </button>
          ) : null}
        </div>
      </form>
    </section>
  </>
);

type AdminPromotionsSectionProps = {
  busy: string | null;
  onDeletePromoCode: (promoCodeId: string, code: string) => void;
  onDeletePromotion: (promotionId: string, promotionName: string) => void;
  onSubmit: (event: FormEvent) => void;
  promoForm: PromoForm;
  promotions: AdminPromotion[];
  renderPropertyScope: (title: string, hint: string) => ReactElement;
  roomCatalog: AdminRoomType[];
  setPromoForm: Dispatch<SetStateAction<PromoForm>>;
  togglePromotionRoomType: (roomTypeId: string) => void;
};

export const AdminPromotionsSection = ({
  busy,
  onDeletePromoCode,
  onDeletePromotion,
  onSubmit,
  promoForm,
  promotions,
  renderPropertyScope,
  roomCatalog,
  setPromoForm,
  togglePromotionRoomType,
}: AdminPromotionsSectionProps) => (
  <>
    {renderPropertyScope("Promotion selection", "Promotions are created for the selected property. Choose an existing promotion to edit it or create a new one below.")}
    <section className={styles.sectionPanel}>
      <div className={styles.workspaceGrid}>
        <div className={styles.listPanel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Current promotions</p>
              <h2>Offers for this property</h2>
            </div>
            <span className={styles.panelBadge}>{promotions.length} total</span>
          </div>
          {promotions.length > 0 ? (
            <div className={styles.stackList}>
              {promotions.map((promotion) => {
                const isSelected = promoForm.promotionId === promotion.promotionId;
                return (
                  <article key={promotion.promotionId} className={isSelected ? styles.listCardActive : styles.listCard}>
                    <div>
                      <h3>{promotion.promotionName}</h3>
                      <p>{promotion.promotionKind} | {promotion.active ? "Active" : "Inactive"} | {promotion.roomTypeIds?.length ?? 0} room types</p>
                      <span>{promotion.rewardType === "FLAT_DISCOUNT" ? money.format(Number(promotion.rewardAmount ?? 0)) : `${Number(promotion.rewardPercentage ?? 0)}%`} off</span>
                      {promotion.promoCodes?.map((code) => (
                        <span key={code.promoCodeId ?? code.code}>
                          {code.code}
                          {code.promoCodeId ? (
                            <button type="button" className={styles.secondaryButton} onClick={() => onDeletePromoCode(code.promoCodeId!, code.code)}>
                              Delete code
                            </button>
                          ) : null}
                        </span>
                      ))}
                    </div>
                    <div className={styles.cardActions}>
                      <button type="button" className={styles.secondaryButton} onClick={() => setPromoForm(toPromoForm(promotion))}>
                        {isSelected ? "Editing" : "Edit"}
                      </button>
                      <button type="button" className={styles.dangerButton} onClick={() => onDeletePromotion(promotion.promotionId!, promotion.promotionName)}>
                        {busy === "promo-delete" ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className={styles.emptyState}>No promotions configured for the selected property.</p>
          )}
        </div>
        <form className={styles.formPanel} onSubmit={onSubmit}>
          <h3>{promoForm.promotionId ? "Edit promotion" : "Create promotion"}</h3>
          <div className={styles.formGrid}>
            <AdminField label="Promotion name" hint="Internal/admin label for this offer.">
              <input
                value={promoForm.promotionName}
                onChange={(event) => setPromoForm((current) => ({ ...current, promotionName: event.target.value }))}
                placeholder="Summer Saver"
              />
            </AdminField>
            <AdminField label="Description" hint="Short explanation of the offer.">
              <textarea
                value={promoForm.description}
                onChange={(event) => setPromoForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="10 percent off selected rooms"
              />
            </AdminField>
            <AdminField label="Promotion kind" hint="Promo code offers require a code; automatic offers do not.">
              <select value={promoForm.promotionKind} onChange={(event) => setPromoForm((current) => ({ ...current, promotionKind: event.target.value }))}>
                {promotionKindOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Promo code" hint="Code the guest enters at checkout.">
              <input
                value={promoForm.promoCode}
                onChange={(event) => setPromoForm((current) => ({ ...current, promoCode: event.target.value }))}
                placeholder="SUMMER10"
              />
            </AdminField>
            <AdminField label="Reward type" hint="Choose between a flat amount or percentage discount.">
              <select value={promoForm.rewardType} onChange={(event) => setPromoForm((current) => ({ ...current, rewardType: event.target.value }))}>
                {rewardTypeOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Discount percentage" hint="Example: 10 means 10 percent off.">
              <input
                type="number"
                value={promoForm.rewardPercentage}
                onChange={(event) => setPromoForm((current) => ({ ...current, rewardPercentage: Number(event.target.value) }))}
              />
            </AdminField>
            <AdminField label="Flat discount amount" hint="Used when reward type is flat discount.">
              <input
                type="number"
                value={promoForm.rewardAmount}
                onChange={(event) => setPromoForm((current) => ({ ...current, rewardAmount: Number(event.target.value) }))}
              />
            </AdminField>
            <AdminField label="Apply to" hint="Choose whether the discount affects the stay total or each night.">
              <select value={promoForm.applyTo} onChange={(event) => setPromoForm((current) => ({ ...current, applyTo: event.target.value }))}>
                {applyToOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Condition type" hint="Defines when the promotion becomes eligible.">
              <select value={promoForm.conditionType} onChange={(event) => setPromoForm((current) => ({ ...current, conditionType: event.target.value }))}>
                {conditionTypeOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Condition operator" hint="How the condition value is evaluated.">
              <select value={promoForm.conditionOperator} onChange={(event) => setPromoForm((current) => ({ ...current, conditionOperator: event.target.value }))}>
                {conditionOperatorOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Condition value" hint="Minimum nights or value used for the selected condition.">
              <input
                type="number"
                value={promoForm.conditionValueNumber}
                onChange={(event) => setPromoForm((current) => ({ ...current, conditionValueNumber: Number(event.target.value) }))}
              />
            </AdminField>
            <AdminField label="Condition JSON" hint="Optional JSON for more advanced conditions.">
              <input
                value={promoForm.conditionValueJson}
                onChange={(event) => setPromoForm((current) => ({ ...current, conditionValueJson: event.target.value }))}
              />
            </AdminField>
            <AdminField label="Start date" hint="Offer starts at the beginning of this day.">
              <input
                type="date"
                value={promoForm.startDate}
                onChange={(event) => setPromoForm((current) => ({ ...current, startDate: event.target.value }))}
              />
            </AdminField>
            <AdminField label="End date" hint="Offer expires at the end of this day.">
              <input
                type="date"
                value={promoForm.endDate}
                onChange={(event) => setPromoForm((current) => ({ ...current, endDate: event.target.value }))}
              />
            </AdminField>
            <AdminField label="Max usage" hint="Maximum total uses across all guests.">
              <input
                type="number"
                value={promoForm.maxUsage}
                onChange={(event) => setPromoForm((current) => ({ ...current, maxUsage: Number(event.target.value) }))}
              />
            </AdminField>
            <AdminField label="Per-user limit" hint="Maximum uses for each guest.">
              <input
                type="number"
                value={promoForm.perUserLimit}
                onChange={(event) => setPromoForm((current) => ({ ...current, perUserLimit: Number(event.target.value) }))}
              />
            </AdminField>
          </div>
          <label className={styles.checkRow}>
            <input
              type="checkbox"
              checked={promoForm.active}
              onChange={(event) => setPromoForm((current) => ({ ...current, active: event.target.checked }))}
            />
            <div>
              <strong>Promotion is active</strong>
              <span>Inactive promotions stay stored but do not apply in booking.</span>
            </div>
          </label>
          <div className={styles.checkGrid}>
            {roomCatalog.map((room) => (
              <label key={room.roomTypeId} className={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={promoForm.roomTypeIds.includes(room.roomTypeId)}
                  onChange={() => togglePromotionRoomType(room.roomTypeId)}
                />
                <div>
                  <strong>{room.roomTypeName}</strong>
                  <span>{money.format(room.baseRate ?? 0)}</span>
                </div>
              </label>
            ))}
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryButton}>
              {busy === "promo-save" ? "Saving..." : promoForm.promotionId ? "Update promotion" : "Create promotion"}
            </button>
            <button type="button" className={styles.secondaryButton} onClick={() => setPromoForm({ ...emptyPromoForm(), roomTypeIds: roomCatalog.map((room) => room.roomTypeId) })}>
              Reset form
            </button>
          </div>
        </form>
      </div>
    </section>
  </>
);
