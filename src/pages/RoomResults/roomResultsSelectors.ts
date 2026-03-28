import { createSelector } from "@reduxjs/toolkit";
import bannerFallback from "../../assets/Hilton_Banner.jpeg";
import { selectRoomResults } from "../../features/roomCard/roomSelectors";

export const selectRoomGridItems = createSelector([selectRoomResults], (rooms) =>
  rooms.map((room) => ({
    id: room.roomTypeId,
    title: room.roomTypeName,
    inclusions: room.amenities?.join(" • ") || "Room Only",
    area: room.roomSpec?.area ? `${room.roomSpec.area} sq ft` : "Area unavailable",
    minGuests: room.roomSpec?.minOcc ?? 0,
    maxGuests: room.roomSpec?.maxOcc ?? 0,
    beds: room.roomSpec?.bedType ?? "Bed details unavailable",
    price: room.totalPrice,
    images: room.images?.length ? room.images : [bannerFallback],
  })),
);
