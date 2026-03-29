import { User, WebStorageStateStore } from "oidc-client-ts";
import type { AuthProviderProps } from "react-oidc-context";

const LOGIN_RETURN_PATH_KEY = "cognito:return-path";
const LOGOUT_RETURN_PATH_KEY = "cognito:logout-return-path";

const normalizeUrl = (value: string | undefined, fallback = "") => {
  if (!value) {
    return fallback;
  }

  return value.endsWith("/") ? value.slice(0, -1) : value;
};

const getRequiredEnv = (key: keyof ImportMetaEnv) => {
  const value = import.meta.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const siteUrl = normalizeUrl(import.meta.env.VITE_SITE_URL);
const redirectUri = normalizeUrl(
  import.meta.env.VITE_COGNITO_REDIRECT_URI,
  siteUrl ? `${siteUrl}/auth/callback` : ""
);
const logoutUri = normalizeUrl(
  import.meta.env.VITE_COGNITO_LOGOUT_URI,
  siteUrl ? `${siteUrl}/auth/signout` : redirectUri
);

const clientId = getRequiredEnv("VITE_COGNITO_CLIENT_ID");
const authority = getRequiredEnv("VITE_COGNITO_AUTHORITY");
const cognitoDomain = normalizeUrl(getRequiredEnv("VITE_COGNITO_DOMAIN"));
const apiBaseUrl = (() => {
  const configured = normalizeUrl(import.meta.env.VITE_API_BASE_URL, "http://localhost:8081/api/graphql");
  return configured.endsWith("/api/graphql") ? configured.slice(0, -"/api/graphql".length) : configured;
})();

const isSafeReturnPath = (value: unknown): value is string =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//");

const getStoredPath = (key: string) => {
  const value = window.localStorage.getItem(key);
  window.localStorage.removeItem(key);
  return isSafeReturnPath(value) ? value : "/";
};

const getReturnPathFromUser = (user: User | void) => {
  if (
    user?.state &&
    typeof user.state === "object" &&
    "returnTo" in user.state &&
    isSafeReturnPath((user.state as { returnTo?: unknown }).returnTo)
  ) {
    return (user.state as { returnTo: string }).returnTo;
  }

  return getStoredPath(LOGIN_RETURN_PATH_KEY);
};

const getTenantNameFromPath = (path: string) => {
  const sanitizedPath = path.split("?")[0]?.split("#")[0] ?? "";
  const segments = sanitizedPath.split("/").filter(Boolean);
  const tenantName = segments[0];

  if (!tenantName || tenantName === "auth" || tenantName === "admin") {
    return null;
  }

  return tenantName;
};

const syncCustomerAccount = async (user: User | void, returnPath: string) => {
  const tenantName = getTenantNameFromPath(returnPath);
  const idToken = user?.id_token;

  if (!tenantName || !idToken) {
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/api/customer-accounts/sync/${encodeURIComponent(tenantName)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Customer account sync failed with status ${response.status}`);
    }
  } catch (error) {
    console.error("Customer account sync failed", error);
  }
};

export const cognitoAuthConfig: AuthProviderProps = {
  authority,
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: "code",
  scope: import.meta.env.VITE_COGNITO_SCOPE || "openid profile email",
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  onSigninCallback: async (user: User | void) => {
    const returnPath = getReturnPathFromUser(user);
    await syncCustomerAccount(user, returnPath);
    window.location.replace(returnPath);
  },
};

export const storeLoginReturnPath = (returnPath: string) => {
  if (isSafeReturnPath(returnPath)) {
    window.localStorage.setItem(LOGIN_RETURN_PATH_KEY, returnPath);
  }
};

export const storeLogoutReturnPath = (returnPath: string) => {
  if (isSafeReturnPath(returnPath)) {
    window.localStorage.setItem(LOGOUT_RETURN_PATH_KEY, returnPath);
  }
};

export const consumeLogoutReturnPath = () => getStoredPath(LOGOUT_RETURN_PATH_KEY);

export const getCognitoLogoutUrl = () =>
  `${cognitoDomain}/logout?client_id=${encodeURIComponent(clientId)}&logout_uri=${encodeURIComponent(logoutUri)}`;
