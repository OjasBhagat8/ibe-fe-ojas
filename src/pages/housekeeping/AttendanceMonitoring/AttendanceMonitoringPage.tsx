import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAttendanceMonitoring } from '../../../features/attendanceMonitoring/useAttendanceMonitoring';
import styles from './AttendanceMonitoring.module.scss';

function formatHours(hours: number) {
  return `${hours.toFixed(1)}h`;
}

function statusChipClass(status: string) {
  if (status === 'COMPLETE') return `${styles.statusChip} ${styles.statusComplete}`;
  if (status === 'IN_PROGRESS') return `${styles.statusChip} ${styles.statusInProgress}`;
  return `${styles.statusChip} ${styles.statusAbsent}`;
}

function statusLabel(status: string) {
  if (status === 'IN_PROGRESS') return 'IN PROGRESS';
  return status;
}

export default function AttendanceMonitoringPage() {
  const { selectedDate, setSelectedDate, propertyId, dashboard, loading, error } = useAttendanceMonitoring();

  return (
    <Box className={styles.page}>
      <Box className={styles.header}>
        <Box>
          <Typography variant="h4" className={styles.title}>Attendance Monitoring</Typography>
          <Typography className={styles.breadcrumb}>Dashboard / Attendance</Typography>
        </Box>

        <Box className={styles.headerActions}>
          <TextField
            type="date"
            size="small"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            inputProps={{ max: '2100-12-31' }}
            className={styles.dateField}
          />
        </Box>
      </Box>

      {!propertyId && (
        <Alert severity="warning">
          Property information is unavailable. Please login again.
        </Alert>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {loading && (
        <Box className={styles.loadingWrap}>
          <CircularProgress />
        </Box>
      )}

      {!loading && dashboard && (
        <>
          <Box className={styles.metricsWrap}>
            <Box className={styles.metricsGrid}>
              <Card elevation={0} variant="outlined" className={styles.metricCard}>
                <CardContent>
                  <Typography className={styles.metricLabel}>Total Clocked In</Typography>
                  <Typography className={styles.metricValue}>{dashboard.totalClockedIn}</Typography>
                  <Typography className={styles.metricHint}>
                    Out of {dashboard.totalStaff} staff
                  </Typography>
                </CardContent>
              </Card>

              <Card elevation={0} variant="outlined" className={styles.metricCard}>
                <CardContent>
                  <Typography className={styles.metricLabel}>Total Working Hours</Typography>
                  <Typography className={styles.metricValue}>{formatHours(dashboard.totalWorkingHours)}</Typography>
                  <Typography className={styles.metricHint}>Combined today</Typography>
                </CardContent>
              </Card>

              <Card elevation={0} variant="outlined" className={styles.metricCard}>
                <CardContent>
                  <Typography className={styles.metricLabel}>Average Hours</Typography>
                  <Typography className={styles.metricValue}>{formatHours(dashboard.averageAssignedHours)}</Typography>
                  <Typography className={styles.metricHint}>Per staff member</Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          <Card elevation={0} variant="outlined" className={styles.tableCard}>
            <CardContent className={styles.tableContent}>
              {dashboard.staff.length === 0 ? (
                <Typography className={styles.empty}>No attendance records for {selectedDate}.</Typography>
              ) : (
                <Box className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Staff Name</th>
                        <th>Shift</th>
                        <th>Clock In</th>
                        <th>Clock Out</th>
                        <th>Total Hours</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.staff.map((staff) => (
                        <tr key={staff.staffId}>
                          <td className={styles.staffName}>{staff.staffName}</td>
                          <td>{staff.shift}</td>
                          <td>{staff.clockIn}</td>
                          <td>{staff.clockOut}</td>
                          <td className={styles.totalHours}>{staff.totalWorkedHoursDisplay}</td>
                          <td>
                            <span className={statusChipClass(staff.status)}>
                              {statusLabel(staff.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
