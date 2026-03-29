import { housekeepingClient } from '../../api/housekeepingClient';
import type { StaffAttendanceMonitoringResponse } from '../../types/housekeeping';

interface AttendanceMonitoringParams {
  propertyId: string;
  date?: string;
}

export async function getAttendanceMonitoring({
  propertyId,
  date,
}: AttendanceMonitoringParams) {
  const { data } = await housekeepingClient.get<StaffAttendanceMonitoringResponse>(
    '/api/supervisor/staff-board/attendance-monitoring',
    { params: { propertyId, ...(date ? { date } : {}) } },
  );
  return data;
}
