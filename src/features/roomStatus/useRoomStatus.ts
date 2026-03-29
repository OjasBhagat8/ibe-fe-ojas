import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../app/store';
import type { RoomStatusItem } from '../../types/housekeeping';
import { fetchRoomStatus, checkInRoom, checkOutRoom } from './roomStatusThunks';

type OccupancyFilter = 'ALL' | RoomStatusItem['occupancyStatus'];

export function useRoomStatus(date: string) {
  const dispatch = useDispatch<AppDispatch>();
  const { rooms, loading, error, checkInLoading, checkOutLoading } = useSelector(
    (state: RootState) => state.roomStatus,
  );

  useEffect(() => {
    dispatch(fetchRoomStatus({ date }));
  }, [dispatch, date]);

  const checkIn = useCallback(
    (id: string) => dispatch(checkInRoom({ roomNightInventoryId: id })),
    [dispatch],
  );

  const checkOut = useCallback(
    (id: string) => dispatch(checkOutRoom({ roomNightInventoryId: id })),
    [dispatch],
  );

  const filteredRooms = useCallback(
    (filter: OccupancyFilter) =>
      filter === 'ALL' ? rooms : rooms.filter((r) => r.occupancyStatus === filter),
    [rooms],
  );

  return { rooms, loading, error, checkInLoading, checkOutLoading, checkIn, checkOut, filteredRooms };
}
