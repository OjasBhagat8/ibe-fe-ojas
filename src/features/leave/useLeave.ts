import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../app/store';
import { fetchLeaveBalance, fetchActiveLeaves, submitLeaveRequest } from './leaveThunks';
import { resetSubmitSuccess } from './leaveSlice';
import type { ApplyLeaveRequest } from '../../types/housekeeping';

export function useLeave(staffId: string | null) {
  const dispatch = useDispatch<AppDispatch>();
  const { balance, activeLeaves, loading, error, submitSuccess } = useSelector(
    (state: RootState) => state.leave,
  );

  useEffect(() => {
    if (staffId) {
      dispatch(fetchLeaveBalance(staffId));
      dispatch(fetchActiveLeaves(staffId));
    }
  }, [dispatch, staffId]);

  const submitLeave = useCallback(async (payload: ApplyLeaveRequest) => {
    const result = await dispatch(submitLeaveRequest(payload));
    if (submitLeaveRequest.fulfilled.match(result)) {
      await Promise.all([
        dispatch(fetchLeaveBalance(payload.staffId)),
        dispatch(fetchActiveLeaves(payload.staffId)),
      ]);
    }
    return result;
  }, [dispatch]);

  const clearSuccess = useCallback(() => dispatch(resetSubmitSuccess()), [dispatch]);

  return {
    balance,
    activeLeaves,
    loading,
    error,
    submitSuccess,
    submitLeave,
    clearSuccess,
  };
}
