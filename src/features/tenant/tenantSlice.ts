import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  BackendConfigResponse,
  TenantConfig,
} from "./tenantTypes";

interface TenantState {
  data: TenantConfig | null;
  loading: boolean;
  error: string | null;
}

const initialState: TenantState = {
  data: null,
  loading: false,
  error: null
};

type GraphqlError = {
  message?: string;
};

type GraphqlConfigResponse = {
  data?: {
    config?: TenantConfig;
    configByTenantName?: TenantConfig;
  };
  errors?: GraphqlError[];
};

const CONFIG_BY_TENANT_NAME_QUERY = `
  query ConfigByTenantName($tenantName: String!) {
    configByTenantName(tenantName: $tenantName) {
      tenantId
      tenantName
      tenantLogo
      tenantBanner
      tenantCopyright
      properties {
        propertyId
        propertyName
        guestAllowed
        guestFlag
        roomCount
        lengthOfStay
        roomFlag
        accessibleFlag
        guestTypes {
          guestTypeId
          guestTypeName
          minAge
          maxAge
        }
      }
    }
  }
`;

const isTenantConfig = (value: unknown): value is TenantConfig => {
  if (!value || typeof value !== "object") return false;
  const config = value as Partial<TenantConfig>;
  return typeof config.tenantName === "string" && Array.isArray(config.properties);
};

const isGraphqlEndpoint = (url: string) => {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.pathname.toLowerCase().includes("graphql");
  } catch {
    return url.toLowerCase().includes("graphql");
  }
};

export const fetchTenantConfig = createAsyncThunk(
  "tenant/fetchTenantConfig",
  async (tenantName: string) => {
    const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();
    const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL?.trim() || configuredUrl;

    if (graphqlUrl && isGraphqlEndpoint(graphqlUrl)) {
      const response = await fetch(graphqlUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: CONFIG_BY_TENANT_NAME_QUERY,
          variables: {
            tenantName,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Tenant not found");
      }

      const payload = (await response.json()) as GraphqlConfigResponse;
      if (payload.errors?.length) {
        throw new Error(payload.errors[0]?.message ?? "Tenant not found");
      }

      const config = payload.data?.configByTenantName ?? payload.data?.config;
      if (!config) {
        throw new Error("Invalid backend response: missing config");
      }

      return config;
    }

    if (!configuredUrl) {
      throw new Error("Tenant config endpoint is not configured");
    }

    const encodedTenantName = encodeURIComponent(tenantName);
    const tenantConfigUrl = configuredUrl.includes("{tenantName}")
      ? configuredUrl.replaceAll("{tenantName}", encodedTenantName)
      : `${configuredUrl}${configuredUrl.includes("?") ? "&" : "?"}tenantName=${encodedTenantName}`;

    const response = await fetch(tenantConfigUrl);
    if (!response.ok) {
      throw new Error("Tenant not found");
    }

    const payload = (await response.json()) as BackendConfigResponse | TenantConfig;
    const config = isTenantConfig(payload) ? payload : payload.data?.config;
    if (!config) {
      throw new Error("Invalid backend response: missing config");
    }

    return config;
  }
);

const tenantSlice = createSlice({
  name: "tenant",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTenantConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTenantConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTenantConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Unknown error";
      });
  }
});

export default tenantSlice.reducer;
