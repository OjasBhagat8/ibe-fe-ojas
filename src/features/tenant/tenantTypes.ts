export interface GuestType {
  guestTypeId: string;
  guestTypeName: string;
  minAge: number;
  maxAge: number;
}

export interface Property {
  propertyId: string;
  propertyName: string;
  guestAllowed?: number;
  guestFlag?: boolean;
  roomCount?: number;
  lengthOfStay?: number;
  roomFlag?: boolean;
  accessibleFlag?: boolean;
  guestTypes?: GuestType[];
}

export interface TenantConfig {
  tenantId?: string;
  tenantName: string;
  tenantLogo?: string;
  tenantBanner?: string;
  tenantCopyright?: string;
  properties: Property[];
}

export interface BackendConfigResponse {
  data?: {
    config?: TenantConfig;
  };
}
