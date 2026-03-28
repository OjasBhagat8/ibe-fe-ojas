import type { RootState } from "../../app/store";

export const selectTenantData = (state: RootState) => state.tenant.data;
