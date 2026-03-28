import { Suspense, lazy, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BookingStepper from "../../components/Stepper/Stepper";
import RoomFiltersAccordion from "../../components/Filters/Filter";
import RoomGrid from "../../components/RoomGrid/RoomGrid";
const RoomDetailsModal = lazy(() => import("../../components/RoomDetailsModal/RoomDetailsModal"));
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { isBefore, startOfDay } from "date-fns";
import bannerFallback from "../../assets/Hilton_Banner.jpeg";
import {
  applyPromoCode,
  buildRoomDealsCacheKey,
  clearAppliedPromo,
  fetchRoomDeals,
  setPricingFromCache,
} from "../../features/Deals/dealSlice";
import { setActiveStep } from "../../features/roomCard/roomResultSlice";
import { createBookingSelection, setBookingSelection } from "../../features/booking/bookingSlice";
import {
  selectActiveStep,
  selectRoomResults,
  selectRoomsError,
  selectRoomsSize,
  selectRoomsTotalItems,
  selectRoomsTotalPages,
} from "../../features/roomCard/roomSelectors";
import { selectTenantData } from "../../features/tenant/tenantSelectors";
import { resolveMediaUrl } from "../../features/tenant/mediaUrl";
import styles from "./RoomResults.module.scss";
import RoomResultsSearchBar from "./RoomResultsSearchBar";
import { selectRoomGridItems } from "./roomResultsSelectors";
import RoomResultsToolbar from "./RoomResultsToolbar";
import { bookingSteps } from "./roomResultsUtils";
import { useRoomResultsPageState } from "./useRoomResultsPageState";

const RoomResults = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { tenantName } = useParams<{ tenantName: string }>();
  const activeStep = useAppSelector(selectActiveStep);
  const roomResults = useAppSelector(selectRoomResults);
  const tenantData = useAppSelector(selectTenantData);
  const roomsError = useAppSelector(selectRoomsError);
  const roomGridItems = useAppSelector(selectRoomGridItems);
  const roomsSize = useAppSelector(selectRoomsSize);
  const totalItems = useAppSelector(selectRoomsTotalItems);
  const pageCount = useAppSelector(selectRoomsTotalPages);
  const dealsState = useAppSelector((state) => state.deals);
  const dealsCache = useAppSelector((state) => state.deals.dealsCache);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const {
    calendarEntries,
    checkIn,
    checkOut,
    filterGroups,
    guestTypes,
    handleApplyFilters,
    handleDatesChange,
    handleGuestChange,
    handlePageChange,
    handleRoomChange,
    handleSortChange,
    handleSortDirectionToggle,
    maxGuests,
    page,
    parsedCheckIn,
    parsedCheckOut,
    propertyId,
    roomOptions,
    rooms,
    roomsLoading,
    runRoomSearch,
    selectedFilters,
    selectedProperty,
    sortDirection,
    sortField,
    tenantId,
  } = useRoomResultsPageState();

  const missingParams: string[] = [];
  if (!propertyId) missingParams.push("property");
  if (!parsedCheckIn) missingParams.push("check-in date");
  if (!parsedCheckOut) missingParams.push("check-out date");

  const today = startOfDay(new Date());
  const checkInPast = parsedCheckIn ? isBefore(startOfDay(parsedCheckIn), today) : false;
  const checkOutPast = parsedCheckOut ? isBefore(startOfDay(parsedCheckOut), today) : false;
  const checkOutBeforeCheckIn = (parsedCheckIn && parsedCheckOut)
    ? isBefore(startOfDay(parsedCheckOut), startOfDay(parsedCheckIn))
    : false;

  const hasMissingParams = missingParams.length > 0;
  const hasPastDates = !hasMissingParams && (checkInPast || checkOutPast);
  const hasInvalidOrder = !hasMissingParams && !hasPastDates && checkOutBeforeCheckIn;
  const showMissingParamsMessage = hasMissingParams && !roomsLoading;
  const showPastDatesMessage = hasPastDates && !roomsLoading;
  const showInvalidOrderMessage = hasInvalidOrder && !roomsLoading;
  const showNoResultsMessage = !hasMissingParams && !hasPastDates && !hasInvalidOrder
    && !roomsLoading && !roomsError && totalItems === 0;

  const selectedRoom =
    roomResults.find((room) => room.roomTypeId === selectedRoomId) ?? null;
  const bannerImage = resolveMediaUrl(tenantData?.tenantBanner) || resolveMediaUrl(tenantData?.tenantLogo) || bannerFallback;

  const handleOpenRoomModal = (roomId: string) => {
    setSelectedRoomId(roomId);
    dispatch(setActiveStep(1)); 
    const clickedRoom = roomResults.find((room) => room.roomTypeId === roomId); 
    if (!clickedRoom || !propertyId || !checkIn || !checkOut) return;
    const dealInput = {
      roomTypeId: clickedRoom.roomTypeId, 
      propertyId, 
      checkIn,
      checkOut, 
      rooms,
      guestSelections: guestTypes 
        .filter((guestType) => guestType.count > 0) 
        .map((guestType) => ({ 
          guestTypeName: guestType.type, 
          count: guestType.count, 
        })),
    };
    const cacheKey = buildRoomDealsCacheKey(dealInput);
    const cachedDeals = dealsCache[cacheKey];
    if (cachedDeals) {
      dispatch(setPricingFromCache(cachedDeals));
      return;
    }
    dispatch(fetchRoomDeals(dealInput));
  };

  const handleCloseRoomModal = () => {
    setSelectedRoomId(null);
    dispatch(setActiveStep(0)); 
    dispatch(clearAppliedPromo());
  };

  const handleApplyPromo = (promoCode: string) => {
    if (!promoCode || !selectedRoom || !propertyId || !checkIn || !checkOut) return;

    dispatch(
      applyPromoCode({
        roomTypeId: selectedRoom.roomTypeId,
        propertyId,
        checkIn,
        checkOut,
        rooms,
        guestSelections: guestTypes
          .filter((guestType) => guestType.count > 0)
          .map((guestType) => ({
            guestTypeName: guestType.type,
            count: guestType.count,
          })),
        promoCode,
      })
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.banner}>
        <img src={bannerImage} alt="banner" />
      </div>

      <BookingStepper steps={bookingSteps} activeStep={activeStep} />

      <RoomResultsSearchBar
        calendarEntries={calendarEntries}
        checkInDate={parsedCheckIn}
        checkOutDate={parsedCheckOut}
        guestTypes={guestTypes}
        isSearchDisabled={!tenantId || !propertyId || !checkIn || !checkOut}
        isSearching={roomsLoading}
        maxGuests={maxGuests}
        maxStay={selectedProperty?.lengthOfStay ?? 8}
        onDatesChange={handleDatesChange}
        onGuestChange={handleGuestChange}
        onRoomChange={handleRoomChange}
        onSearch={runRoomSearch}
        roomOptions={roomOptions}
        rooms={rooms}
      />

      <div className={styles.results}>
        <div className={styles.filterSideBar}>
          <RoomFiltersAccordion
            filters={filterGroups}
            value={selectedFilters}
            onApply={handleApplyFilters}
          />
        </div>

        <div className={styles.roomDiv}>
          <RoomResultsToolbar
            isLoading={roomsLoading}
            onPageChange={handlePageChange}
            onSortChange={handleSortChange}
            onSortDirectionToggle={handleSortDirectionToggle}
            page={page}
            pageCount={pageCount}
            roomsSize={roomsSize}
            sortDirection={sortDirection}
            sortField={sortField}
            totalItems={totalItems}
          />

          {roomsError && <div className={styles.error}>{roomsError}</div>}

          <div className={styles.RoomResults}>
            {showMissingParamsMessage && (
              <div className={styles.emptyState}>
                <div className={styles.emptyTitle}>Complete your search</div>
                <div className={styles.emptyBody}>
                  Missing {missingParams.join(", ")}. Please select the details and try again.
                </div>
              </div>
            )}

            {showInvalidOrderMessage && (
              <div className={styles.emptyState}>
                <div className={styles.emptyTitle}>Invalid date range</div>
                <div className={styles.emptyBody}>
                  Check-out must be after check-in. Please update your dates.
                </div>
              </div>
            )}

            {showPastDatesMessage && (
              <div className={styles.emptyState}>
                <div className={styles.emptyTitle}>Dates are in the past</div>
                <div className={styles.emptyBody}>
                  Please choose recent dates to see available rooms.
                </div>
              </div>
            )}

            {showNoResultsMessage && (
              <div className={styles.emptyState}>
                <div className={styles.emptyTitle}>No rooms found</div>
                <div className={styles.emptyBody}>
                  Try different dates, fewer filters, or a different room count.
                </div>
              </div>
            )}

            {!showMissingParamsMessage && !showPastDatesMessage && !showInvalidOrderMessage && !showNoResultsMessage && (
              <RoomGrid
                rooms={roomGridItems}
                columns={3}
                onSelectRoom={handleOpenRoomModal}
              />
            )}
          </div>
        </div>
      </div>

      {selectedRoom ? (
        <Suspense fallback={<div className={styles.loading}>Loading details...</div>}>
          <RoomDetailsModal
            isOpen={Boolean(selectedRoom)}
            room={{
              title: selectedRoom.roomTypeName,
              description: selectedRoom.description,
              occupancy: `${selectedRoom.roomSpec?.minOcc ?? 0}-${selectedRoom.roomSpec?.maxOcc ?? 0}`,
              beds: selectedRoom.roomSpec?.bedType ?? "Bed details unavailable",
              area: selectedRoom.roomSpec?.area ? `${selectedRoom.roomSpec.area} sq ft` : "Area unavailable",
              amenities: selectedRoom.amenities ?? [],
              images: selectedRoom.images?.length ? selectedRoom.images : [bannerFallback],
            }}
            standardRate={dealsState.pricing?.standardRate ?? null}

            deals={dealsState.pricing?.deals ?? []} 
            appliedPromo={dealsState.appliedPromo}
            onClose={handleCloseRoomModal}
            onSelectPackage={(packageItem) => {
              if (!selectedRoom || !tenantId || !tenantName || !propertyId || !checkIn || !checkOut) {
                return;
              }

              dispatch(
                setBookingSelection(
                  createBookingSelection({
                    room: selectedRoom,
                    packageItem,
                    search: {
                      tenantId,
                      tenantName,
                      propertyId,
                      propertyName: selectedProperty?.propertyName,
                      checkIn,
                      checkOut,
                      rooms,
                      guestSelections: guestTypes
                        .filter((guestType) => guestType.count > 0)
                        .map((guestType) => ({
                          guestTypeName: guestType.type,
                          count: guestType.count,
                        })),
                    },
                  })
                )
              );
              dispatch(setActiveStep(2));
              navigate(`/${tenantName}/checkout`);
            }}
            promoError={dealsState.promoError}
            promoLoading={dealsState.promoLoading}
            onApplyPromo={handleApplyPromo}
          />
        </Suspense>
      ) : null}
    </div>
  );
};

export default RoomResults;
