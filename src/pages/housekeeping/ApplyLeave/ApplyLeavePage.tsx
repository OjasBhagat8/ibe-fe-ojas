import { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useHousekeepingAuth } from '../../../features/housekeepingAuth/useHousekeepingAuth';
import { useLeave } from '../../../features/leave/useLeave';
import type { LeaveType } from '../../../types/housekeeping';
import styles from './ApplyLeave.module.scss';

const STATUS_COLORS: Record<string, string> = {
  APPROVED: '#16A34A',
  PENDING: '#D97706',
  REJECTED: '#DC2626',
};

export default function ApplyLeavePage() {
  const { staffId } = useHousekeepingAuth();
  const { balance, activeLeaves, loading, error, submitSuccess, submitLeave, clearSuccess } =
    useLeave(staffId);

  const [leaveType, setLeaveType] = useState<LeaveType>('PLANNED');
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId || !startDate || !endDate) return;
    await submitLeave({
      staffId,
      leaveType,
      leaveStartDate: startDate.format('YYYY-MM-DD'),
      leaveEndDate: endDate.format('YYYY-MM-DD'),
      reason: reason || null,
    });
    setReason('');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className={styles.page}>
        <Typography variant="h5" className={styles.title}>
          Apply for Leave
        </Typography>

        {/* Balance chips */}
        {balance && (
          <Box className={styles.balanceRow}>
            <Box className={styles.balanceChip}>
              <Typography className={styles.balanceCount}>{balance.remainingPlannedLeaves}</Typography>
              <Typography className={styles.balanceLabel}>Planned Leaves Left</Typography>
            </Box>
            <Box className={styles.balanceChip}>
              <Typography className={styles.balanceCount}>{balance.remainingSickLeaves}</Typography>
              <Typography className={styles.balanceLabel}>Sick Leaves Left</Typography>
            </Box>
          </Box>
        )}

        {/* Form */}
        <Card className={styles.card} elevation={1}>
          <CardContent className={styles.cardContent}>
            {submitSuccess && (
              <Alert severity="success" onClose={clearSuccess} sx={{ mb: 2 }}>
                Leave request submitted successfully!
              </Alert>
            )}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} className={styles.form}>
              {/* Leave type toggle */}
              <Typography variant="body2" className={styles.fieldLabel}>
                Leave Type
              </Typography>
              <ToggleButtonGroup
                value={leaveType}
                exclusive
                onChange={(_, val) => val && setLeaveType(val)}
                sx={{ mb: 3 }}
                fullWidth
              >
                <ToggleButton
                  value="PLANNED"
                  sx={{
                    '&.Mui-selected': { backgroundColor: '#1B1F6B', color: '#fff', '&:hover': { backgroundColor: '#14185A' } },
                  }}
                >
                  Planned
                </ToggleButton>
                <ToggleButton
                  value="SICK"
                  sx={{
                    '&.Mui-selected': { backgroundColor: '#1B1F6B', color: '#fff', '&:hover': { backgroundColor: '#14185A' } },
                  }}
                >
                  Sick
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Date pickers */}
              <Box className={styles.dateRow}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  minDate={startDate ?? undefined}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Box>

              {/* Reason */}
              <TextField
                label="Reason (optional)"
                multiline
                rows={3}
                fullWidth
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                size="small"
                sx={{ mb: 3, mt: 2 }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || !startDate || !endDate}
                sx={{ backgroundColor: '#1B1F6B', '&:hover': { backgroundColor: '#14185A' }, height: 44 }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Submit Request'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Leave history */}
        {activeLeaves.length > 0 && (
          <Box className={styles.historySection}>
            <Typography variant="subtitle1" className={styles.historyTitle}>
              Leave History
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>End</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeLeaves.map((leave) => (
                  <TableRow key={leave.leaveRequestId}>
                    <TableCell>{leave.leaveType}</TableCell>
                    <TableCell>{leave.leaveStartDate}</TableCell>
                    <TableCell>{leave.leaveEndDate}</TableCell>
                    <TableCell>{leave.totalLeaveDays}</TableCell>
                    <TableCell>
                      <Chip
                        label={leave.status}
                        size="small"
                        sx={{
                          backgroundColor: `${STATUS_COLORS[leave.status] ?? '#6B7280'}18`,
                          color: STATUS_COLORS[leave.status] ?? '#6B7280',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
}
