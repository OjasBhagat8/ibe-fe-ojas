import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';

export default function SupervisorAuthGuard() {
  const { tenantName } = useParams<{ tenantName: string }>();
  const { token, employmentType } = useSelector((state: RootState) => state.housekeepingAuth);

  if (!token) {
    return <Navigate to={`/${tenantName}/supervisor/login`} replace />;
  }

  if (employmentType !== 'SUPERVISOR') {
    return <Navigate to={`/${tenantName}/staff/overview`} replace />;
  }

  return <Outlet />;
}
