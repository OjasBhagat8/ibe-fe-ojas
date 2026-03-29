import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useHousekeepingAuth } from '../../../features/housekeepingAuth/useHousekeepingAuth';
import { useAttendance } from '../../../features/attendance/useAttendance';
import AttendanceLog from '../../../components/housekeeping/AttendanceLog/AttendanceLog';
import { housekeepingClient } from '../../../api/housekeepingClient';
import type { AttendanceLogItem, AttendanceLogsResponse } from '../../../types/housekeeping';
import styles from './ClockInOut.module.scss';

export default function ClockInOutPage() {
  const { staffId } = useHousekeepingAuth();
  const { todayLog } = useAttendance(staffId);
  const [logs, setLogs] = useState<AttendanceLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const dateString = now.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    if (!staffId) return;

    let isMounted = true;
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await housekeepingClient.get<AttendanceLogsResponse>('/api/attendance/logs', {
          params: { staffId, page: 0, size: 30 },
        });
        if (isMounted) {
          setLogs(data.logs ?? []);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.response?.data?.message ?? err.message ?? 'Failed to load attendance logs');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLogs();
    return () => {
      isMounted = false;
    };
  }, [staffId]);

  const fmtDate = (value: string) =>
    new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const fmtTime = (value: string | null) =>
    value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';

  return (
    <Box className={styles.page}>
      <Typography variant="h5" className={styles.title}>
        Attendance Summary
      </Typography>
      <Typography variant="body2" className={styles.date}>
        {dateString}
      </Typography>

      <Card className={styles.card} elevation={1}>
        <CardContent className={styles.cardContent}>
          <Typography className={styles.infoTitle}>Today</Typography>
          <Box className={styles.todayWrap}>
            <AttendanceLog
              clockInTime={todayLog?.clockInTime ?? null}
              clockOutTime={todayLog?.clockOutTime ?? null}
              totalWorkedHours={todayLog?.totalWorkedHours ?? null}
            />
          </Box>
        </CardContent>
      </Card>

      <Box className={styles.logSection}>
        <Typography variant="subtitle1" className={styles.logTitle}>
          Attendance Logs
        </Typography>
        {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && logs.length === 0 && (
          <Typography color="text.secondary">No attendance logs found.</Typography>
        )}
        {!loading && !error && logs.length > 0 && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Clock In</TableCell>
                <TableCell>Clock Out</TableCell>
                <TableCell>Total Hours</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.attendanceLogId}>
                  <TableCell>{fmtDate(log.logDate)}</TableCell>
                  <TableCell>{fmtTime(log.clockInTime)}</TableCell>
                  <TableCell>{fmtTime(log.clockOutTime)}</TableCell>
                  <TableCell>
                    {log.totalWorkedHours != null ? `${Number(log.totalWorkedHours).toFixed(2)} hrs` : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
    </Box>
  );
}
