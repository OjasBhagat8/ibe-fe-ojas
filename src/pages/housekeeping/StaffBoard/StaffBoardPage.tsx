import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import StaffBoardStaffCard from '../../../components/housekeeping/StaffBoard/StaffBoardStaffCard';
import { useStaffBoard } from '../../../hooks/useStaffBoard';
import styles from './StaffBoard.module.scss';

export default function StaffBoardPage() {
  const {
    selectedDate,
    setSelectedDate,
    shiftGroups,
    loading,
    error,
  } = useStaffBoard();

  return (
    <Box className={styles.page}>
      <Box className={styles.header}>
        <Box>
          <Typography variant="h4" className={styles.title}>Staff Board</Typography>
          <Typography className={styles.breadcrumb}>Dashboard / Staff Board</Typography>
        </Box>

        <Box className={styles.headerActions}>
          <TextField
            type="date"
            size="small"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            inputProps={{ max: '2100-12-31' }}
            sx={{ background: '#fff', borderRadius: '10px' }}
          />
        </Box>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {loading && (
        <Box className={styles.loadingWrap}>
          <CircularProgress />
        </Box>
      )}

      {!loading && shiftGroups.length === 0 && (
        <Typography className={styles.empty}>No staff data available for this date.</Typography>
      )}

      {!loading && shiftGroups.length > 0 && (
        <Box className={styles.sectionList}>
          {shiftGroups.map((shift) => (
            <Box key={`${shift.shiftName}-${shift.startTime}`} className={styles.shiftSection}>
              <Typography className={styles.shiftTitle}>
                {shift.shiftName} Shift ({shift.startTime}-{shift.endTime})
              </Typography>
              <Typography className={styles.shiftMeta}>
                {shift.staffCount} staff {shift.staffCount === 1 ? 'member' : 'members'}
              </Typography>

              <Box className={styles.cardGrid}>
                {shift.staff.map((member) => (
                  <StaffBoardStaffCard
                    key={member.staffId}
                    staff={member}
                    shiftName={shift.shiftName}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
