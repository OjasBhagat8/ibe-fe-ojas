import { housekeepingClient } from '../../api/housekeepingClient';
import type { PerformancePreset, SupervisorPerformanceResponse } from '../../types/housekeeping';

interface GetSupervisorPerformanceParams {
  preset?: PerformancePreset;
  from?: string;
  to?: string;
}

export async function getSupervisorPerformance(params: GetSupervisorPerformanceParams) {
  const { data } = await housekeepingClient.get<SupervisorPerformanceResponse>(
    '/api/supervisor/performance',
    { params },
  );
  return data;
}
