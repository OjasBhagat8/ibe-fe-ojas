import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import {
  adminLogin,
  createAdminProperty,
  deleteAdminFilter,
  deleteAdminGuestType,
  deleteAdminPromoCode,
  deleteAdminPromotion,
  deleteAdminProperty,
  deleteAdminRoomPrice,
  deleteAdminRoomType,
  fetchAdminFilters,
  fetchAdminPrices,
  fetchAdminPromotions,
  fetchAdminRoomTypes,
  fetchAdminTenantConfig,
  fetchAdminTenants,
  updateAdminTenant,
  upsertAdminFilter,
  upsertAdminGuestType,
  upsertAdminPromotion,
  upsertAdminProperty,
  upsertAdminRoomPrice,
  upsertAdminRoomType,
  upsertAdminTenant,
  upsertAdminTenantAdmin,
} from "./adminApi";
import {
  AdminAuthScreen,
  AdminPropertyCards,
  AdminPropertyScope,
  AdminTenantPicker,
} from "./AdminDashboardCommon";
import {
  AdminFiltersSection,
  AdminGuestTypesSection,
  AdminOverviewSection,
  AdminPricesSection,
  AdminPromotionsSection,
  AdminPropertiesSection,
  AdminRoomsSection,
  AdminTenantSection,
} from "./AdminDashboardSections";
import { plusDays, sections, today } from "./adminDashboardConfig";
import {
  emptyFilterForm,
  emptyGuestForm,
  emptyPromoForm,
  emptyRoomForm,
  emptyTenantAdminForm,
  emptyTenantForm,
  toPropertyForm,
} from "./adminDashboardFormUtils";
import type { FilterForm, GuestForm, PromoForm, PropertyForm, RoomForm, SectionId, TenantAdminForm } from "./adminDashboardTypes";
import type {
  AdminAuthSession,
  AdminCredentials,
  AdminFilter,
  AdminPriceItem,
  AdminPromotion,
  AdminRequestAuth,
  AdminRoomType,
  AdminTenantConfig,
  AdminTenantSummary,
} from "./adminTypes";
import AdminField from "./AdminField";
import styles from "./AdminDashboard.module.scss";
import { getCognitoLogoutUrl, storeLogoutReturnPath } from "../../features/auth/cognitoAuth";

const normalizeTenantName = (value?: string | null) => value?.trim().toLowerCase() ?? "";
const SUPER_ADMIN_GROUP = "SUPER_ADMIN";
const TENANT_ADMIN_GROUP = "TENANT_ADMIN";
const TENANT_ID_CLAIM = "custom:tenant_id";
const TENANT_NAME_CLAIM = "custom:tenant_name";

const readStringClaim = (value: unknown) => (typeof value === "string" ? value : "");
const readGroupsClaim = (value: unknown) => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);

const buildCognitoAdminSession = (profile: Record<string, unknown> | undefined): AdminAuthSession | null => {
  if (!profile) {
    return null;
  }

  const groups = readGroupsClaim(profile["cognito:groups"]);
  const isSuperAdmin = groups.includes(SUPER_ADMIN_GROUP);
  const isTenantAdmin = groups.includes(TENANT_ADMIN_GROUP);
  if (!isSuperAdmin && !isTenantAdmin) {
    return null;
  }

  const tenantId = readStringClaim(profile[TENANT_ID_CLAIM]);
  const tenantName = readStringClaim(profile[TENANT_NAME_CLAIM]);
  if (!isSuperAdmin && (!tenantId || !tenantName)) {
    return null;
  }

  return {
    authenticated: true,
    message: "Signed in with Cognito.",
    adminId: readStringClaim(profile.sub),
    tenantId: isSuperAdmin ? "" : tenantId,
    tenantName: isSuperAdmin ? "" : tenantName,
    adminName: readStringClaim(profile.email)
      || readStringClaim(profile["cognito:username"])
      || readStringClaim(profile.sub),
    role: isSuperAdmin ? SUPER_ADMIN_GROUP : TENANT_ADMIN_GROUP,
    authProvider: "cognito",
  };
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { tenantName: routeTenantName } = useParams();
  const tenantRouteLabel = routeTenantName?.trim() ?? "";
  const normalizedRouteTenantName = normalizeTenantName(routeTenantName);
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const cognitoGroups = readGroupsClaim(auth.user?.profile?.["cognito:groups"]);
  const cognitoAccessToken = auth.user?.id_token ?? auth.user?.access_token ?? null;
  const canUseCognitoAdmin = auth.isAuthenticated
    && (cognitoGroups.includes(SUPER_ADMIN_GROUP) || cognitoGroups.includes(TENANT_ADMIN_GROUP))
    && Boolean(cognitoAccessToken);

  const [credentials, setCredentials] = useState<AdminCredentials>({ adminName: "", password: "" });
  const [authenticatedAdminCredentials, setAuthenticatedAdminCredentials] = useState<AdminCredentials | null>(null);
  const [session, setSession] = useState<AdminAuthSession | null>(null);
  const [tenants, setTenants] = useState<AdminTenantSummary[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [tenantConfig, setTenantConfig] = useState<AdminTenantConfig | null>(null);
  const [activePropertyId, setActivePropertyId] = useState("");
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [roomCatalog, setRoomCatalog] = useState<AdminRoomType[]>([]);
  const [prices, setPrices] = useState<AdminPriceItem[]>([]);
  const [promotions, setPromotions] = useState<AdminPromotion[]>([]);
  const [filters, setFilters] = useState<AdminFilter[]>([]);
  const [tenantForm, setTenantForm] = useState(emptyTenantForm);
  const [tenantCreateForm, setTenantCreateForm] = useState(emptyTenantForm);
  const [tenantAdminForm, setTenantAdminForm] = useState<TenantAdminForm>(emptyTenantAdminForm());
  const [propertyForm, setPropertyForm] = useState<PropertyForm>(toPropertyForm(null));
  const [newPropertyName, setNewPropertyName] = useState("");
  const [guestForm, setGuestForm] = useState<GuestForm>(emptyGuestForm());
  const [roomForm, setRoomForm] = useState<RoomForm>(emptyRoomForm());
  const [priceForm, setPriceForm] = useState({ roomTypeId: "", date: today, roomPrice: 0, quantity: 1 });
  const [promoForm, setPromoForm] = useState<PromoForm>(emptyPromoForm());
  const [filterForm, setFilterForm] = useState<FilterForm>(emptyFilterForm());
  const [priceRange, setPriceRange] = useState({ fromDate: today, toDate: plusDays(6) });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const adminAuth: AdminRequestAuth = session?.authProvider === "cognito"
    ? { bearerToken: cognitoAccessToken }
    : (authenticatedAdminCredentials ?? credentials);
  const isSuperAdmin = session?.role === "SUPER_ADMIN";
  const availableSections = useMemo(
    () => (isSuperAdmin ? sections : sections.filter((section) => section.id !== "tenant")),
    [isSuperAdmin],
  );

  const activeProperty = useMemo(
    () => tenantConfig?.properties.find((property) => property.propertyId === activePropertyId) ?? null,
    [tenantConfig, activePropertyId],
  );

  const activeSectionMeta = availableSections.find((section) => section.id === activeSection) ?? availableSections[0];
  const totalRooms = tenantConfig?.properties.reduce((sum, property) => sum + (property.roomCount ?? 0), 0) ?? 0;
  const totalGuestTypes = tenantConfig?.properties.reduce((sum, property) => sum + (property.guestTypes?.length ?? 0), 0) ?? 0;
  const loadedPriceValue = prices.reduce((sum, item) => sum + item.roomPrice * item.quantity, 0);

  const resolveTenantAdminRoute = (tenantName?: string | null) => {
    const normalizedTenantName = normalizeTenantName(tenantName);
    return normalizedTenantName ? `/${normalizedTenantName}/admin` : "/admin";
  };

  const resetTenantWorkspace = () => {
    setSelectedTenantId("");
    setTenantConfig(null);
    setActivePropertyId("");
    setActiveSection("overview");
    setRoomCatalog([]);
    setPrices([]);
    setPromotions([]);
    setFilters([]);
    setTenantForm(emptyTenantForm);
    setTenantAdminForm(emptyTenantAdminForm());
    setPropertyForm(toPropertyForm(null));
    setGuestForm(emptyGuestForm());
    setRoomForm(emptyRoomForm());
    setPriceForm({ roomTypeId: "", date: today, roomPrice: 0, quantity: 1 });
    setPromoForm(emptyPromoForm());
    setFilterForm(emptyFilterForm());
  };

  const signOut = async () => {
    if (session?.authProvider === "cognito") {
      storeLogoutReturnPath(currentPath);
      await auth.removeUser();
      window.location.assign(getCognitoLogoutUrl());
      return;
    }

    setSession(null);
    setAuthenticatedAdminCredentials(null);
    setTenants([]);
    resetTenantWorkspace();
    setError("");
    setMessage("");
    navigate(tenantRouteLabel ? `/${normalizedRouteTenantName}/admin` : "/admin", { replace: true });
  };

  const loadTenants = async (requestAuth: AdminRequestAuth) => {
    const tenantList = await fetchAdminTenants(requestAuth);
    setTenants(tenantList);
    return tenantList;
  };
  const loadPropertyData = async (propertyId: string, requestAuth: AdminRequestAuth) => {
    if (!propertyId) {
      setRoomCatalog([]);
      setPrices([]);
      setPromotions([]);
      setFilters([]);
      return;
    }

    setBusy("property-data");
    setError("");

    try {
      const [nextRoomTypes, nextPrices, nextPromotions, nextFilters] = await Promise.all([
        fetchAdminRoomTypes(propertyId, requestAuth),
        fetchAdminPrices(propertyId, priceRange.fromDate, priceRange.toDate, requestAuth),
        fetchAdminPromotions(propertyId, requestAuth),
        fetchAdminFilters(propertyId, requestAuth),
      ]);
      setRoomCatalog(nextRoomTypes);
      setPrices(nextPrices);
      setPromotions(nextPromotions);
      setFilters(nextFilters);
      setPriceForm((current) => ({
        ...current,
        roomTypeId: nextRoomTypes.some((room) => room.roomTypeId === current.roomTypeId)
          ? current.roomTypeId
          : nextRoomTypes[0]?.roomTypeId ?? "",
        roomPrice: current.roomPrice || nextRoomTypes[0]?.baseRate || 0,
      }));
      setPromoForm((current) => ({
        ...current,
        roomTypeIds: current.roomTypeIds.length ? current.roomTypeIds : nextRoomTypes.map((room) => room.roomTypeId),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load property data.");
    } finally {
      setBusy(null);
    }
  };

  const loadTenant = async (tenantId: string, requestAuth: AdminRequestAuth, preferredPropertyId?: string) => {
    setBusy("tenant-load");
    setError("");

    try {
      const config = await fetchAdminTenantConfig(tenantId, requestAuth);
      const nextPropertyId = config.properties.find((property) => property.propertyId === preferredPropertyId)?.propertyId
        ?? config.properties[0]?.propertyId
        ?? "";

      setTenantConfig(config);
      setSelectedTenantId(tenantId);
      setActivePropertyId(nextPropertyId);
      setTenantForm({
        tenantName: config.tenantName ?? "",
        tenantLogo: config.tenantLogo ?? "",
        tenantBanner: config.tenantBanner ?? "",
        tenantCopyright: config.tenantCopyright ?? "",
      });
      setTenantAdminForm(emptyTenantAdminForm());
      setMessage(`Loaded ${config.tenantName}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load tenant.");
    } finally {
      setBusy(null);
    }
  };

  useEffect(() => {
    setPropertyForm(toPropertyForm(activeProperty));
    setGuestForm(emptyGuestForm());
    setFilterForm(emptyFilterForm());
    setPromoForm((current) => ({
      ...emptyPromoForm(),
      roomTypeIds: current.roomTypeIds.length ? current.roomTypeIds : roomCatalog.map((room) => room.roomTypeId),
    }));
  }, [activeProperty]);

  useEffect(() => {
    if (!session || !activePropertyId) return;
    void loadPropertyData(activePropertyId, adminAuth);
  }, [session, activePropertyId, adminAuth.adminName, adminAuth.password, adminAuth.bearerToken, priceRange.fromDate, priceRange.toDate]);

  useEffect(() => {
    if (session || !canUseCognitoAdmin || auth.isLoading) {
      return;
    }

    let cancelled = false;

    const bootstrapCognitoAdmin = async () => {
      setBusy("login");
      setError("");

      try {
        const nextSession = buildCognitoAdminSession(auth.user?.profile as Record<string, unknown> | undefined);
        if (!nextSession || !cognitoAccessToken) {
          throw new Error("Unable to create a Cognito admin session.");
        }

        const requestAuth: AdminRequestAuth = { bearerToken: cognitoAccessToken };
        setSession(nextSession);
        setAuthenticatedAdminCredentials(null);
        resetTenantWorkspace();

        if (nextSession.role === SUPER_ADMIN_GROUP) {
          const tenantList = await fetchAdminTenants(requestAuth);
          if (cancelled) {
            return;
          }

          setTenants(tenantList);

          const matchedTenant = normalizedRouteTenantName
            ? tenantList.find((tenant) => normalizeTenantName(tenant.tenantName) === normalizedRouteTenantName)
            : null;

          if (matchedTenant) {
            const config = await fetchAdminTenantConfig(matchedTenant.tenantId, requestAuth);
            if (cancelled) {
              return;
            }

            const nextPropertyId = config.properties[0]?.propertyId ?? "";
            setTenantConfig(config);
            setSelectedTenantId(matchedTenant.tenantId);
            setActivePropertyId(nextPropertyId);
            setTenantForm({
              tenantName: config.tenantName ?? "",
              tenantLogo: config.tenantLogo ?? "",
              tenantBanner: config.tenantBanner ?? "",
              tenantCopyright: config.tenantCopyright ?? "",
            });
            setTenantAdminForm(emptyTenantAdminForm());
            setMessage(`Signed in with Cognito and opened ${matchedTenant.tenantName}.`);
          } else {
            setMessage("Signed in with Cognito as platform admin. Select a tenant or create a new one.");
          }

          navigate(tenantRouteLabel ? `/${normalizedRouteTenantName}/admin` : "/admin", { replace: true });
          return;
        }

        const config = await fetchAdminTenantConfig(nextSession.tenantId, requestAuth);
        if (cancelled) {
          return;
        }

        const nextPropertyId = config.properties[0]?.propertyId ?? "";
        setTenants([]);
        setTenantConfig(config);
        setSelectedTenantId(nextSession.tenantId);
        setActivePropertyId(nextPropertyId);
        setTenantForm({
          tenantName: config.tenantName ?? "",
          tenantLogo: config.tenantLogo ?? "",
          tenantBanner: config.tenantBanner ?? "",
          tenantCopyright: config.tenantCopyright ?? "",
        });
        setTenantAdminForm(emptyTenantAdminForm());
        setMessage(`Signed in with Cognito and opened ${nextSession.tenantName}.`);
        navigate(`/${normalizeTenantName(nextSession.tenantName)}/admin`, { replace: true });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to open the admin workspace.");
        }
      } finally {
        if (!cancelled) {
          setBusy(null);
        }
      }
    };

    void bootstrapCognitoAdmin();

    return () => {
      cancelled = true;
    };
  }, [
    session,
    canUseCognitoAdmin,
    auth.isLoading,
    auth.user?.profile,
    cognitoAccessToken,
    normalizedRouteTenantName,
    tenantRouteLabel,
    navigate,
  ]);

  useEffect(() => {
    if (!session || session.role === "SUPER_ADMIN") {
      return;
    }

    const authenticatedTenantRoute = resolveTenantAdminRoute(session.tenantName);
    if (tenantRouteLabel && normalizeTenantName(session.tenantName) !== normalizedRouteTenantName) {
      navigate(authenticatedTenantRoute, { replace: true });
      return;
    }

    if (!tenantRouteLabel && session.tenantName) {
      navigate(authenticatedTenantRoute, { replace: true });
    }
  }, [session, tenantRouteLabel, normalizedRouteTenantName, navigate]);

  useEffect(() => {
    if (!session || session.authProvider !== "cognito" || canUseCognitoAdmin) {
      return;
    }

    setSession(null);
    setAuthenticatedAdminCredentials(null);
    setTenants([]);
    resetTenantWorkspace();
    setError("Your Cognito admin session is no longer available. Sign in again.");
    setMessage("");
  }, [session, canUseCognitoAdmin]);


  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setBusy("login");
    setError("");

    try {
      const authSession = await adminLogin(credentials);
      if (!authSession.authenticated) {
        throw new Error(authSession.message || "Login failed.");
      }

      const authenticatedCredentials = {
        adminName: authSession.adminName?.trim() || credentials.adminName.trim(),
        password: credentials.password,
      };

      setSession({ ...authSession, authProvider: "basic" });
      setAuthenticatedAdminCredentials(authenticatedCredentials);
      setCredentials(authenticatedCredentials);
      resetTenantWorkspace();

      if (authSession.role === "SUPER_ADMIN") {
        const tenantList = await loadTenants(authenticatedCredentials);
        const matchedTenant = normalizedRouteTenantName
          ? tenantList.find((tenant) => normalizeTenantName(tenant.tenantName) === normalizedRouteTenantName)
          : null;

        if (matchedTenant) {
          await loadTenant(matchedTenant.tenantId, authenticatedCredentials);
          setMessage(`Signed in as platform admin and opened ${matchedTenant.tenantName}.`);
        } else {
          setMessage(authSession.message || "Signed in as platform admin. Select a tenant or create a new one.");
        }
        navigate(tenantRouteLabel ? `/${normalizedRouteTenantName}/admin` : "/admin", { replace: true });
        return;
      }

      if (!authSession.tenantId) {
        throw new Error("The backend did not return a tenant for this admin login.");
      }

      const authenticatedTenantRoute = resolveTenantAdminRoute(authSession.tenantName);
      if (tenantRouteLabel && normalizeTenantName(authSession.tenantName) !== normalizedRouteTenantName) {
        setSession(null);
        setAuthenticatedAdminCredentials(null);
        resetTenantWorkspace();
        throw new Error(`This admin belongs to ${authSession.tenantName}. Use ${authenticatedTenantRoute} to sign in.`);
      }

      await loadTenant(authSession.tenantId, authenticatedCredentials);
      navigate(authenticatedTenantRoute, { replace: true });
      setMessage(authSession.message || `Signed in as ${authSession.adminName}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setBusy(null);
    }
  };

  const handleTenantSelection = async (tenantId: string) => {
    await loadTenant(tenantId, adminAuth);
  };
  const handleCreateTenant = async (event: FormEvent) => {
    event.preventDefault();
    if (!session || !isSuperAdmin || !tenantCreateForm.tenantName.trim()) return;

    setBusy("tenant-create");
    setError("");

    try {
      const tenant = await upsertAdminTenant(
        {
          tenantName: tenantCreateForm.tenantName.trim(),
          tenantLogo: tenantCreateForm.tenantLogo.trim() || undefined,
          tenantBanner: tenantCreateForm.tenantBanner.trim() || undefined,
          tenantCopyright: tenantCreateForm.tenantCopyright.trim() || undefined,
        },
        adminAuth,
      );
      await loadTenants(adminAuth);
      setTenantCreateForm(emptyTenantForm);
      if (!tenant.tenantId) {
        throw new Error("Created tenant did not return a tenantId.");
      }
      await loadTenant(tenant.tenantId, adminAuth);
      setActiveSection("tenant");
      setMessage(`Created tenant ${tenant.tenantName}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create tenant.");
    } finally {
      setBusy(null);
    }
  };

  const handleTenantAdminSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!session || !isSuperAdmin || !selectedTenantId || !tenantAdminForm.adminName.trim()) return;

    setBusy("tenant-admin-save");
    setError("");

    try {
      const savedAdmin = await upsertAdminTenantAdmin(
        {
          tenantAdminId: tenantAdminForm.tenantAdminId || undefined,
          tenantId: selectedTenantId,
          adminName: tenantAdminForm.adminName.trim(),
          adminPassword: tenantAdminForm.adminPassword.trim() || undefined,
          active: tenantAdminForm.active,
        },
        adminAuth,
      );
      setTenantAdminForm({
        tenantAdminId: savedAdmin.tenantAdminId,
        adminName: savedAdmin.adminName,
        adminPassword: "",
        active: savedAdmin.active,
      });
      setMessage(`Tenant admin saved for ${savedAdmin.tenantName}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save tenant admin.");
    } finally {
      setBusy(null);
    }
  };

  const handleTenantSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!session || !isSuperAdmin || !tenantConfig?.tenantId) return;

    setBusy("tenant-save");
    setError("");

    try {
      await updateAdminTenant({ tenantId: tenantConfig.tenantId, ...tenantForm }, adminAuth);
      await loadTenants(adminAuth);
      await loadTenant(selectedTenantId, adminAuth, activePropertyId);
      setMessage("Tenant profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save tenant.");
    } finally {
      setBusy(null);
    }
  };

  const handlePropertySave = async (event: FormEvent) => {
    event.preventDefault();
    if (!session || !activeProperty || !tenantConfig || !propertyForm.propertyName.trim()) return;

    setBusy("property-save");
    setError("");

    try {
      await upsertAdminProperty(
        {
          tenantId: tenantConfig.tenantId!,
          propertyId: activeProperty.propertyId,
          propertyName: propertyForm.propertyName.trim(),
          guestAllowed: propertyForm.guestAllowed,
          roomCount: propertyForm.roomCount,
          lengthOfStay: propertyForm.lengthOfStay,
          guestFlag: propertyForm.guestFlag,
          roomFlag: propertyForm.roomFlag,
          accessibleFlag: propertyForm.accessibleFlag,
        },
        adminAuth,
      );
      await loadTenant(selectedTenantId, adminAuth, activeProperty.propertyId);
      setMessage("Property settings updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save property.");
    } finally {
      setBusy(null);
    }
  };

  const handleCreateProperty = async (event: FormEvent) => {
    event.preventDefault();
    if (!session || !tenantConfig?.tenantId || !newPropertyName.trim()) return;

    setBusy("property-create");
    setError("");

    try {
      const property = await createAdminProperty(
        {
          tenantId: tenantConfig.tenantId!,
          propertyName: newPropertyName.trim(),
          guestAllowed: 2,
          roomCount: 20,
          lengthOfStay: 7,
          guestFlag: true,
          roomFlag: true,
          accessibleFlag: true,
        },
        adminAuth,
      );
      setNewPropertyName("");
      await loadTenant(selectedTenantId, adminAuth, property.propertyId);
      setMessage("Property created.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create property.");
    } finally {
      setBusy(null);
    }
  };

  const handleDeleteProperty = async (propertyId: string, propertyName: string) => {
    if (!session || !window.confirm(`Delete property "${propertyName}"? This also removes room types, prices, promotions, and guest types.`)) {
      return;
    }

    setBusy("property-delete");
    setError("");

    try {
      await deleteAdminProperty(propertyId, adminAuth);
      await loadTenant(selectedTenantId, adminAuth);
      setMessage(`Deleted property ${propertyName}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete property.");
    } finally {
      setBusy(null);
    }
  };

  const handleGuestTypeSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!session || !activeProperty || !guestForm.guestTypeName.trim()) return;

    setBusy("guest-type-save");
    setError("");

    try {
      await upsertAdminGuestType(
        {
          propertyId: activeProperty.propertyId,
          guestTypeId: guestForm.guestTypeId || undefined,
          guestTypeName: guestForm.guestTypeName.trim(),
          minAge: guestForm.minAge,
          maxAge: guestForm.maxAge,
        },
        adminAuth,
      );
      await loadTenant(selectedTenantId, adminAuth, activeProperty.propertyId);
      setGuestForm(emptyGuestForm());
      setMessage(guestForm.guestTypeId ? "Guest type updated." : "Guest type created.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save guest type.");
    } finally {
      setBusy(null);
    }
  };

  const handleDeleteGuestType = async (guestTypeId: string, guestTypeName: string) => {
    if (!session || !activeProperty || !window.confirm(`Delete guest type "${guestTypeName}"?`)) return;

    setBusy("guest-type-delete");
    setError("");

    try {
      await deleteAdminGuestType(guestTypeId, adminAuth);
      await loadTenant(selectedTenantId, adminAuth, activeProperty.propertyId);
      setGuestForm((current) => (current.guestTypeId === guestTypeId ? emptyGuestForm() : current));
      setMessage(`Deleted guest type ${guestTypeName}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete guest type.");
    } finally {
      setBusy(null);
    }
  };

  const handleFilterSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!session || !activeProperty || !filterForm.filterName.trim() || !filterForm.sourceField.trim()) return;

    setBusy("filter-save");
    setError("");

    try {
      await upsertAdminFilter(
        {
          filterId: filterForm.filterId || undefined,
          propertyId: activeProperty.propertyId,
          filterName: filterForm.filterName.trim(),
          sourceField: filterForm.sourceField,
          filterType: filterForm.filterType,
          sortOrder: filterForm.sortOrder,
          active: filterForm.active,
        },
        adminAuth,
      );
      await loadPropertyData(activeProperty.propertyId, adminAuth);
      setFilterForm(emptyFilterForm());
      setMessage(filterForm.filterId ? "Filter updated." : "Filter created.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save filter.");
    } finally {
      setBusy(null);
    }
  };

  const handleDeleteFilter = async (filterId: string, filterName: string) => {
    if (!session || !activeProperty || !window.confirm(`Delete filter "${filterName}"?`)) return;

    setBusy("filter-delete");
    setError("");

    try {
      await deleteAdminFilter(filterId, adminAuth);
      await loadPropertyData(activeProperty.propertyId, adminAuth);
      setFilterForm((current) => (current.filterId === filterId ? emptyFilterForm() : current));
      setMessage(`Deleted filter ${filterName}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete filter.");
    } finally {
      setBusy(null);
    }
  };

  const handleRoomSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!session || !activeProperty || !roomForm.roomTypeName.trim()) return;

    setBusy("room-save");
    setError("");

    try {
      const payload: Record<string, unknown> = {
        propertyId: activeProperty.propertyId,
        roomTypeId: roomForm.roomTypeId || undefined,
        roomTypeName: roomForm.roomTypeName.trim(),
        description: roomForm.description.trim(),
        occupancy: roomForm.occupancy,
        baseRate: roomForm.baseRate,
        amenities: roomForm.amenities.split(",").map((item) => item.trim()).filter(Boolean),
        images: roomForm.image ? [roomForm.image.trim()] : [],
        roomSpec: {
          roomSpecId: roomForm.roomSpecId || undefined,
          bedType: roomForm.bedType.trim(),
          area: roomForm.area,
          minOcc: roomForm.minOcc,
          maxOcc: roomForm.maxOcc,
        },
      };

      if (!roomForm.roomTypeId) {
        payload.pricingUpdates = [
          {
            startDate: today,
            endDate: plusDays(3),
            roomPrice: roomForm.baseRate,
            quantity: 4,
          },
        ];
      }

      await upsertAdminRoomType(payload, adminAuth);
      await loadPropertyData(activeProperty.propertyId, adminAuth);
      setRoomForm(emptyRoomForm());
      setMessage(roomForm.roomTypeId ? "Room type updated." : "Room type created.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save room type.");
    } finally {
      setBusy(null);
    }
  };

  const handleDeleteRoomType = async (roomTypeId: string, roomTypeName: string) => {
    if (!session || !activeProperty || !window.confirm(`Delete room type "${roomTypeName}"? Related prices and promotion mappings will also be removed.`)) {
      return;
    }

    setBusy("room-delete");
    setError("");

    try {
      await deleteAdminRoomType(roomTypeId, adminAuth);
      await loadPropertyData(activeProperty.propertyId, adminAuth);
      setRoomForm((current) => (current.roomTypeId === roomTypeId ? emptyRoomForm() : current));
      setMessage(`Deleted room type ${roomTypeName}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete room type.");
    } finally {
      setBusy(null);
    }
  };

  const handlePriceSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!session || !activePropertyId || !priceForm.roomTypeId) return;

    setBusy("price-save");
    setError("");

    try {
      await upsertAdminRoomPrice(priceForm, adminAuth);
      await loadPropertyData(activePropertyId, adminAuth);
      setMessage("Price updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save price.");
    } finally {
      setBusy(null);
    }
  };

  const handleDeleteRoomPrice = async (priceId: string, roomTypeName: string, date: string) => {
    if (!session || !activePropertyId || !window.confirm(`Delete the price row for "${roomTypeName}" on ${date}?`)) return;

    setBusy("price-delete");
    setError("");

    try {
      await deleteAdminRoomPrice(priceId, adminAuth);
      await loadPropertyData(activePropertyId, adminAuth);
      setMessage(`Deleted the price row for ${roomTypeName} on ${date}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete price row.");
    } finally {
      setBusy(null);
    }
  };

  const handlePromotionSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!session || !activeProperty || !promoForm.promotionName.trim()) return;

    setBusy("promo-save");
    setError("");

    try {
      const payload: AdminPromotion = {
        promotionId: promoForm.promotionId || undefined,
        propertyId: activeProperty.propertyId,
        promotionName: promoForm.promotionName.trim(),
        description: promoForm.description.trim(),
        promotionKind: promoForm.promotionKind,
        active: promoForm.active,
        startDate: promoForm.startDate,
        endDate: promoForm.endDate,
        conditionType: promoForm.conditionType,
        conditionOperator: promoForm.conditionOperator,
        conditionValueNumber: promoForm.conditionValueNumber,
        conditionValueJson: promoForm.conditionValueJson || undefined,
        rewardType: promoForm.rewardType,
        applyTo: promoForm.applyTo,
        rewardAmount: promoForm.rewardType === "FLAT_DISCOUNT" ? promoForm.rewardAmount : undefined,
        rewardPercentage: promoForm.rewardType === "PERCENTAGE_DISCOUNT" ? promoForm.rewardPercentage : undefined,
        roomTypeIds: promoForm.roomTypeIds.length ? promoForm.roomTypeIds : roomCatalog.map((room) => room.roomTypeId),
        promoCodes: promoForm.promotionKind === "PROMO_CODE" && promoForm.promoCode
          ? [
              {
                promoCodeId: promoForm.promoCodeId || undefined,
                code: promoForm.promoCode.trim(),
                maxUsage: promoForm.maxUsage,
                perUserLimit: promoForm.perUserLimit,
                expiryDate: `${promoForm.endDate}T23:59:59`,
                active: promoForm.active,
              },
            ]
          : [],
      };

      await upsertAdminPromotion(payload, adminAuth);
      await loadPropertyData(activeProperty.propertyId, adminAuth);
      setPromoForm({ ...emptyPromoForm(), roomTypeIds: roomCatalog.map((room) => room.roomTypeId) });
      setMessage(payload.promotionId ? "Promotion updated." : "Promotion created.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save promotion.");
    } finally {
      setBusy(null);
    }
  };

  const handleDeletePromotion = async (promotionId: string, promotionName: string) => {
    if (!session || !activeProperty || !window.confirm(`Delete promotion "${promotionName}"?`)) return;

    setBusy("promo-delete");
    setError("");

    try {
      await deleteAdminPromotion(promotionId, adminAuth);
      await loadPropertyData(activeProperty.propertyId, adminAuth);
      setPromoForm((current) => (current.promotionId === promotionId ? { ...emptyPromoForm(), roomTypeIds: roomCatalog.map((room) => room.roomTypeId) } : current));
      setMessage(`Deleted promotion ${promotionName}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete promotion.");
    } finally {
      setBusy(null);
    }
  };

  const handleDeletePromoCode = async (promoCodeId: string, code: string) => {
    if (!session || !activeProperty || !window.confirm(`Delete promo code "${code}"?`)) return;

    setBusy("promo-code-delete");
    setError("");

    try {
      await deleteAdminPromoCode(promoCodeId, adminAuth);
      await loadPropertyData(activeProperty.propertyId, adminAuth);
      setMessage(`Deleted promo code ${code}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete promo code.");
    } finally {
      setBusy(null);
    }
  };

  const togglePromotionRoomType = (roomTypeId: string) => {
    setPromoForm((current) => ({
      ...current,
      roomTypeIds: current.roomTypeIds.includes(roomTypeId)
        ? current.roomTypeIds.filter((id) => id !== roomTypeId)
        : [...current.roomTypeIds, roomTypeId],
    }));
  };

  const renderPropertyScope = (title: string, hint: string) => (
    <AdminPropertyScope
      activePropertyId={activePropertyId}
      guestTypeCount={activeProperty?.guestTypes?.length ?? 0}
      hint={hint}
      onPropertyChange={setActivePropertyId}
      roomCatalog={roomCatalog}
      tenantConfig={tenantConfig}
      title={title}
    />
  );

  const renderPropertyCards = () => (
    <AdminPropertyCards
      activePropertyId={activePropertyId}
      busy={busy}
      onDeleteProperty={(propertyId, propertyName) => { void handleDeleteProperty(propertyId, propertyName); }}
      onSelectProperty={setActivePropertyId}
      tenantConfig={tenantConfig}
    />
  );

  if (!session) {
    return (
      <AdminAuthScreen
        busy={busy}
        credentials={credentials}
        error={error}
        onLogin={handleLogin}
        setCredentials={setCredentials}
        tenantLabel={tenantRouteLabel || undefined}
      />
    );
  }

  if (isSuperAdmin && !selectedTenantId) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <AdminTenantPicker
            error={error}
            message={message}
            onLoadTenant={(tenantId) => { void handleTenantSelection(tenantId); }}
            onSignOut={signOut}
            tenants={tenants}
          />

          <section className={styles.sectionPanel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Provisioning</p>
                <h2>Create a new tenant</h2>
              </div>
              <span className={styles.panelBadge}>{tenants.length} existing</span>
            </div>
            <div className={styles.workspaceGrid}>
              <div className={styles.summaryPanel}>
                <h3>Platform admin flow</h3>
                <div className={styles.summaryList}>
                  <div className={styles.summaryItem}>
                    <span>Step 1</span>
                    <strong>Create or select a tenant</strong>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Step 2</span>
                    <strong>Assign a tenant admin</strong>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Step 3</span>
                    <strong>Tenant admin logs in with admin name and password</strong>
                  </div>
                </div>
              </div>
              <form className={styles.formPanel} onSubmit={handleCreateTenant}>
                <h3>Create tenant</h3>
                <div className={styles.formGrid}>
                  <AdminField label="Tenant name" hint="Brand or hotel group name used in routes and management.">
                    <input
                      value={tenantCreateForm.tenantName}
                      onChange={(event) => setTenantCreateForm((current) => ({ ...current, tenantName: event.target.value }))}
                      placeholder="Hilton"
                    />
                  </AdminField>
                  <AdminField label="Logo URL">
                    <input
                      value={tenantCreateForm.tenantLogo}
                      onChange={(event) => setTenantCreateForm((current) => ({ ...current, tenantLogo: event.target.value }))}
                      placeholder="https://example.com/logo.png"
                    />
                  </AdminField>
                  <AdminField label="Banner URL">
                    <input
                      value={tenantCreateForm.tenantBanner}
                      onChange={(event) => setTenantCreateForm((current) => ({ ...current, tenantBanner: event.target.value }))}
                      placeholder="https://example.com/banner.png"
                    />
                  </AdminField>
                  <AdminField label="Footer text">
                    <input
                      value={tenantCreateForm.tenantCopyright}
                      onChange={(event) => setTenantCreateForm((current) => ({ ...current, tenantCopyright: event.target.value }))}
                      placeholder="Copyright text"
                    />
                  </AdminField>
                </div>
                <button type="submit" className={styles.primaryButton}>
                  {busy === "tenant-create" ? "Creating..." : "Create tenant"}
                </button>
              </form>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <p className={styles.sidebarEyebrow}>Admin Workspace</p>
          <h2>{tenantConfig?.tenantName ?? (isSuperAdmin ? "Platform Admin" : "Tenant")}</h2>
        </div>
        <div className={styles.sidebarBox}>
          <span className={styles.sidebarLabel}>Signed in as</span>
          <strong>{session.adminName}</strong>
          <span className={styles.sidebarLabel}>{session.role === "SUPER_ADMIN" ? "Platform admin" : "Tenant admin"}</span>
          {isSuperAdmin ? (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => {
                resetTenantWorkspace();
                setError("");
                setMessage("Choose another tenant or create a new one.");
              }}
            >
              Change tenant
            </button>
          ) : null}
          <button type="button" className={styles.secondaryButton} onClick={signOut}>
            Sign out
          </button>
        </div>
        <nav className={styles.sidebarNav}>
          {availableSections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={activeSection === section.id ? styles.navActive : styles.navButton}
              onClick={() => setActiveSection(section.id)}
            >
              <span>{section.label}</span>
              <small>{section.eyebrow}</small>
            </button>
          ))}
        </nav>
        <div className={styles.sidebarSummary}>
          <div className={styles.sidebarStat}>
            <span>Properties</span>
            <strong>{tenantConfig?.properties.length ?? 0}</strong>
          </div>
          <div className={styles.sidebarStat}>
            <span>Total rooms</span>
            <strong>{totalRooms}</strong>
          </div>
          <div className={styles.sidebarStat}>
            <span>Guest types</span>
            <strong>{totalGuestTypes}</strong>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <p className={styles.sectionEyebrow}>{activeSectionMeta.eyebrow}</p>
            <h1>{activeSectionMeta.label}</h1>
            <p className={styles.lead}>{activeSectionMeta.description}</p>
          </div>
          <div className={styles.topbarMeta}>
            <span>{session.adminName}</span>
            <small>{busy ? "Syncing data..." : activeProperty?.propertyName ?? tenantConfig?.tenantName ?? session.tenantName ?? "Platform admin"}</small>
          </div>
        </header>

        {message ? <p className={styles.message}>{message}</p> : null}
        {error ? <p className={styles.error}>{error}</p> : null}

        {activeSection === "overview" && (
          <AdminOverviewSection
            priceCount={prices.length}
            propertyCount={tenantConfig?.properties.length ?? 0}
            renderPropertyCards={renderPropertyCards}
            roomCount={roomCatalog.length}
          />
        )}

        {activeSection === "tenant" && isSuperAdmin && (
          <>
            <AdminTenantSection
              busy={busy}
              onSubmit={handleTenantSave}
              setTenantForm={setTenantForm}
              tenantForm={tenantForm}
            />
            <section className={styles.sectionPanel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Access control</p>
                  <h2>Assign tenant admin login</h2>
                </div>
                <span className={styles.panelBadge}>Tenant admin</span>
              </div>
              <div className={styles.workspaceGrid}>
                <div className={styles.summaryPanel}>
                  <h3>Tenant admin flow</h3>
                  <div className={styles.summaryList}>
                    <div className={styles.summaryItem}>
                      <span>Tenant</span>
                      <strong>{tenantConfig?.tenantName ?? "Not selected"}</strong>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>Route</span>
                      <strong>{tenantRouteLabel ? `/${tenantRouteLabel}/admin` : "/admin or /:tenantName/admin"}</strong>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>Note</span>
                      <strong>Leave password blank only when you do not want to change the current password.</strong>
                    </div>
                  </div>
                </div>
                <form className={styles.formPanel} onSubmit={handleTenantAdminSave}>
                  <h3>Create or update tenant admin</h3>
                  <div className={styles.formGrid}>
                    <AdminField label="Admin name" hint="Unique login name for this tenant admin.">
                      <input
                        value={tenantAdminForm.adminName}
                        onChange={(event) => setTenantAdminForm((current) => ({ ...current, adminName: event.target.value }))}
                        placeholder="hilton_admin"
                      />
                    </AdminField>
                    <AdminField label="Admin password" hint="Required when creating a tenant admin. Use a new value to reset the password.">
                      <input
                        type="password"
                        value={tenantAdminForm.adminPassword}
                        onChange={(event) => setTenantAdminForm((current) => ({ ...current, adminPassword: event.target.value }))}
                        placeholder="Password"
                      />
                    </AdminField>
                  </div>
                  <label className={styles.checkRow}>
                    <input
                      type="checkbox"
                      checked={tenantAdminForm.active}
                      onChange={(event) => setTenantAdminForm((current) => ({ ...current, active: event.target.checked }))}
                    />
                    <div>
                      <strong>Tenant admin is active</strong>
                      <span>Inactive tenant admins cannot sign in.</span>
                    </div>
                  </label>
                  <div className={styles.formActions}>
                    <button type="submit" className={styles.primaryButton}>
                      {busy === "tenant-admin-save" ? "Saving..." : "Save tenant admin"}
                    </button>
                    <button type="button" className={styles.secondaryButton} onClick={() => setTenantAdminForm(emptyTenantAdminForm())}>
                      Reset form
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </>
        )}

        {activeSection === "properties" && (
          <AdminPropertiesSection
            activeProperty={activeProperty}
            busy={busy}
            newPropertyName={newPropertyName}
            onCreateProperty={handleCreateProperty}
            onDeleteProperty={(propertyId, propertyName) => { void handleDeleteProperty(propertyId, propertyName); }}
            onSaveProperty={handlePropertySave}
            propertyCount={tenantConfig?.properties.length ?? 0}
            propertyForm={propertyForm}
            renderPropertyCards={renderPropertyCards}
            renderPropertyScope={renderPropertyScope}
            setNewPropertyName={setNewPropertyName}
            setPropertyForm={setPropertyForm}
          />
        )}

        {activeSection === "guestTypes" && (
          <AdminGuestTypesSection
            activeGuestTypeCount={activeProperty?.guestTypes?.length ?? 0}
            busy={busy}
            guestForm={guestForm}
            guestTypes={activeProperty?.guestTypes ?? []}
            onDeleteGuestType={(guestTypeId, guestTypeName) => { void handleDeleteGuestType(guestTypeId, guestTypeName); }}
            onSubmit={handleGuestTypeSave}
            renderPropertyScope={renderPropertyScope}
            setGuestForm={setGuestForm}
          />
        )}

        {activeSection === "filters" && (
          <AdminFiltersSection
            busy={busy}
            filters={filters}
            filterForm={filterForm}
            onDeleteFilter={(filterId, filterName) => { void handleDeleteFilter(filterId, filterName); }}
            onSubmit={handleFilterSave}
            renderPropertyScope={renderPropertyScope}
            setFilterForm={setFilterForm}
          />
        )}

        {activeSection === "rooms" && (
          <AdminRoomsSection
            busy={busy}
            onDeleteRoomType={(roomTypeId, roomTypeName) => { void handleDeleteRoomType(roomTypeId, roomTypeName); }}
            onSubmit={handleRoomSave}
            renderPropertyScope={renderPropertyScope}
            roomCatalog={roomCatalog}
            roomForm={roomForm}
            setRoomForm={setRoomForm}
          />
        )}

        {activeSection === "prices" && (
          <AdminPricesSection
            busy={busy}
            loadedPriceValue={loadedPriceValue}
            onDeleteRoomPrice={(priceId, roomTypeName, date) => { void handleDeleteRoomPrice(priceId, roomTypeName, date); }}
            onSubmit={handlePriceSave}
            priceForm={priceForm}
            priceRange={priceRange}
            prices={prices}
            renderPropertyScope={renderPropertyScope}
            roomCatalog={roomCatalog}
            setPriceForm={setPriceForm}
            setPriceRange={setPriceRange}
          />
        )}

        {activeSection === "promotions" && (
          <AdminPromotionsSection
            busy={busy}
            onDeletePromoCode={(promoCodeId, code) => { void handleDeletePromoCode(promoCodeId, code); }}
            onDeletePromotion={(promotionId, promotionName) => { void handleDeletePromotion(promotionId, promotionName); }}
            onSubmit={handlePromotionSave}
            promoForm={promoForm}
            promotions={promotions}
            renderPropertyScope={renderPropertyScope}
            roomCatalog={roomCatalog}
            setPromoForm={setPromoForm}
            togglePromotionRoomType={togglePromotionRoomType}
          />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;






















