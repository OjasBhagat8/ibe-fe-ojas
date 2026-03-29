import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../app/store';
import { logout, clearError } from './housekeepingAuthSlice';
import { loginStaff } from './housekeepingAuthThunks';

export function useHousekeepingAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { tenantName } = useParams<{ tenantName: string }>();

  const { token, staffId, staffName, employmentType, propertyId, loading, error } =
    useSelector((state: RootState) => state.housekeepingAuth);

  const login = useCallback(
    (email: string, password: string, selectedPropertyId: string) =>
      dispatch(loginStaff({ email, password, propertyId: selectedPropertyId })),
    [dispatch],
  );

  const logoutAndRedirect = useCallback(() => {
    dispatch(logout());
    navigate(`/${tenantName ?? ''}/staff/login`);
  }, [dispatch, navigate, tenantName]);

  const dismissError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    isAuthenticated: !!token,
    token,
    staffId,
    staffName,
    employmentType,
    propertyId,
    loading,
    error,
    login,
    logout: logoutAndRedirect,
    dismissError,
  };
}
