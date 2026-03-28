import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useHousekeepingAuth } from '../../../features/housekeepingAuth/useHousekeepingAuth';
import { useTasks } from '../../../features/tasks/useTasks';
import { useAttendance } from '../../../features/attendance/useAttendance';
import CircularProgressRing from '../../../components/housekeeping/CircularProgressRing/CircularProgressRing';
import TimeProgressBar from '../../../components/housekeeping/TimeProgressBar/TimeProgressBar';
import StatusChip from '../../../components/housekeeping/StatusChip/StatusChip';
import { getLocalIsoDate } from '../dateUtils';
import styles from './ShiftProgress.module.scss';

export default function ShiftProgressPage() {
  const { staffId } = useHousekeepingAuth();
  const today = getLocalIsoDate();
  const { tasks, completedCount, inProgressCount, pendingCount } = useTasks(staffId, today);
  const { elapsedSeconds, todayLog } = useAttendance(staffId);

  const elapsedHours = elapsedSeconds / 3600;
  const hoursWorked = todayLog?.totalWorkedHours ?? elapsedHours;

  return (
    <Box className={styles.page}>
      <Typography variant="h5" className={styles.title}>
        Shift Progress
      </Typography>

      <Box className={styles.topRow}>
        {/* Task completion ring */}
        <Card className={styles.card} elevation={1}>
          <CardContent className={styles.cardContent}>
            <Typography variant="subtitle1" className={styles.cardTitle}>
              Task Completion
            </Typography>
            <Box className={styles.ringWrapper}>
              <CircularProgressRing completed={completedCount} total={tasks.length} />
            </Box>
            <Box className={styles.statRow}>
              <Box className={styles.stat}>
                <Typography className={styles.statCount} sx={{ color: '#D97706' }}>
                  {inProgressCount}
                </Typography>
                <Typography className={styles.statLabel}>In Progress</Typography>
              </Box>
              <Box className={styles.stat}>
                <Typography className={styles.statCount} sx={{ color: '#6B7280' }}>
                  {pendingCount}
                </Typography>
                <Typography className={styles.statLabel}>Pending</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Time progress */}
        <Card className={styles.card} elevation={1}>
          <CardContent className={`${styles.cardContent}`}>
            <Typography variant="subtitle1" className={`${styles.cardTitle}`}>
              Shift Time
            </Typography>
            <Typography className={styles.hoursDisplay}>
              {hoursWorked.toFixed(1)} <span className={styles.hoursUnit}>hrs</span>
            </Typography>
            <Box className={styles.timeBarWrap}>
              <TimeProgressBar elapsedHours={hoursWorked} totalHours={4} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Task list */}
      <Box className={styles.taskListSection}>
        <Typography variant="subtitle1" className={styles.sectionTitle}>
          All Tasks
        </Typography>
        {tasks.map((task) => (
          <Box key={task.taskId} className={styles.taskRow}>
            <Typography className={styles.taskRoom}>Room {task.roomNumber}</Typography>
            <Box className={styles.taskChips}>
              {task.taskType && <StatusChip type="taskType" value={task.taskType} />}
              <StatusChip type="taskStatus" value={task.taskStatus} />
            </Box>
          </Box>
        ))}
        {tasks.length === 0 && (
          <Typography color="text.secondary">No tasks for today.</Typography>
        )}
      </Box>
    </Box>
  );
}
