export interface RoomSpec {
  roomSpecId: string | null;
  bedType: string | null;
  area: number | null;
  minOcc: number | null;
  maxOcc: number | null;
}

export interface SearchRoomItem {
  roomTypeId: string;
  roomTypeName: string;
  description: string;
  occupancy: number;
  amenities: string[];
  images:string[];
  baseRate: number | null;
  totalPrice: number;
  availableCount: number;
  roomSpec: RoomSpec | null;
}

export interface SearchRoomFilterOption {
  value: string;
  count: number;
}

export interface SearchRoomFilter {
  filterKey: string;
  filterType: "CHECKBOX" | "RANGE";
  options: SearchRoomFilterOption[];
  minValue: number | null;
  maxValue: number | null;
}

export interface SearchRoomsAppliedFilter {
  filterName: string;
  options?: string[];
  minValue?: number;
  maxValue?: number;
}

export interface SearchRoomsInput {
  tenantId: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  accessible?: boolean;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  filters?: SearchRoomsAppliedFilter[];
  page?: number;
  size?: number;
}

export interface SearchRoomsResponse {
  data?: {
    searchRooms?: {
      items: SearchRoomItem[];
      filters: SearchRoomFilter[];
      page: number;
      size: number;
      totalItems: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  };
  errors?: {
    message?: string;
  }[];
}
