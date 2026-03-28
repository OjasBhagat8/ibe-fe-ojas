import { housekeepingClient } from '../../api/housekeepingClient';
import type { SupervisorDashboardOverview } from '../../types/housekeeping';

export async function getSupervisorDashboardOverview(date: string) {
  const { data } = await housekeepingClient.get<SupervisorDashboardOverview>(
    '/api/supervisor/dashboard/overview',
    { params: { date } },
  );
  return data;
}
