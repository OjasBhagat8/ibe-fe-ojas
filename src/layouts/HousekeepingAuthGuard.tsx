import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';

export default function HousekeepingAuthGuard() {
  const { tenantName } = useParams<{ tenantName: string }>();
  const token = useSelector((state: RootState) => state.housekeepingAuth.token);

  if (!token) {
    return <Navigate to={`/${tenantName}/staff/login`} replace />;
  }

  return <Outlet />;
}
