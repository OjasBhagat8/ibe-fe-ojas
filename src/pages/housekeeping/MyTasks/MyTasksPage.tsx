import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useHousekeepingAuth } from '../../../features/housekeepingAuth/useHousekeepingAuth';
import { useTasks } from '../../../features/tasks/useTasks';
import SummaryChips from '../../../components/housekeeping/SummaryChips/SummaryChips';
import TaskCard from '../../../components/housekeeping/TaskCard/TaskCard';
import { getLocalIsoDate } from '../dateUtils';
import styles from './MyTasks.module.scss';

export default function MyTasksPage() {
  const { staffId } = useHousekeepingAuth();
  const today = getLocalIsoDate();
  const { tasks, loading, error, completedCount, inProgressCount, pendingCount, startTask, completeTask } =
    useTasks(staffId, today);

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Box className={styles.page}>
      <Box className={styles.header}>
        <Typography variant="h5" className={styles.title}>
          My Tasks
        </Typography>
        <Typography variant="body2" className={styles.date}>
          {dateLabel}
        </Typography>
      </Box>

      <SummaryChips
        total={tasks.length}
        completed={completedCount}
        inProgress={inProgressCount}
        pending={pendingCount}
      />

      <Box className={styles.taskList}>
        {loading && <CircularProgress sx={{ mt: 4, display: 'block', mx: 'auto' }} />}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && tasks.length === 0 && (
          <Typography color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
            No tasks assigned for today.
          </Typography>
        )}
        {tasks.map((task) => (
          <TaskCard
            key={task.taskId}
            task={task}
            onStart={startTask}
            onComplete={completeTask}
          />
        ))}
      </Box>
    </Box>
  );
}
