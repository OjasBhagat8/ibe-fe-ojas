import { housekeepingClient } from '../../api/housekeepingClient';
import type { StaffBoardResponse } from '../../types/housekeeping';

export async function getStaffBoard(date?: string) {
  const { data } = await housekeepingClient.get<StaffBoardResponse>(
    '/api/supervisor/staff-board',
    { params: date ? { date } : undefined },
  );
  return data;
}
