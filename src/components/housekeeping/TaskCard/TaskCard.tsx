import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StatusChip from '../StatusChip/StatusChip';
import type { HousekeepingTask } from '../../../types/housekeeping';
import styles from './TaskCard.module.scss';

const STATUS_BORDER: Record<string, string> = {
  COMPLETED: '#16A34A',
  IN_PROGRESS: '#D97706',
  PENDING: '#9CA3AF',
};

interface TaskCardProps {
  readonly task: HousekeepingTask;
  readonly onStart: (id: string) => void;
  readonly onComplete: (id: string) => void;
}

export default function TaskCard({ task, onStart, onComplete }: TaskCardProps) {
  const borderColor = STATUS_BORDER[task.taskStatus] ?? '#9CA3AF';

  const endSuffix = task.expectedEndTime
    ? ` – ${new Date(task.expectedEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : '';
  const timeLabel = task.scheduledStartTime
    ? `${new Date(task.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${endSuffix}`
    : null;

  return (
    <Box
      className={styles.card}
      sx={{
        borderLeft: `4px solid ${borderColor}`,
        borderRight: '1px solid #E0E0E6',
        borderTop: '1px solid #E0E0E6',
        borderBottom: '1px solid #E0E0E6',
      }}
    >
      <Box className={styles.inner}>
        {/* Left: room info */}
        <Box className={styles.left}>
          <Typography className={styles.room}>Room {task.roomNumber}</Typography>
          {task.assignedByName && (
            <Typography className={styles.subtext}>Assigned by {task.assignedByName}</Typography>
          )}
          <Box className={styles.chips}>
            {task.taskType && <StatusChip type="taskType" value={task.taskType} />}
            <StatusChip type="taskStatus" value={task.taskStatus} />
          </Box>
          {task.notes && (
            <Box className={styles.noteBox}>
              <Typography className={styles.noteText}>
                <strong>Note:</strong> {task.notes}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Center: time info */}
        {timeLabel && (
          <Box className={styles.center}>
            <Box className={styles.timeRow}>
              <AccessTimeIcon sx={{ fontSize: 14, color: '#6B7280' }} />
              <Typography className={styles.timeText}>{timeLabel}</Typography>
            </Box>
            {task.estimatedDurationHours != null && (
              <Typography className={styles.duration}>
                Est. Duration: {task.estimatedDurationHours}h
              </Typography>
            )}
          </Box>
        )}

        {/* Right: action */}
        <Box className={styles.right}>
          {task.taskStatus === 'PENDING' && (
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={() => onStart(task.taskId)}
              sx={{
                borderColor: '#1B1F6B',
                color: '#1B1F6B',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#1B1F6B', color: '#fff' },
              }}
            >
              Start Task
            </Button>
          )}
          {task.taskStatus === 'IN_PROGRESS' && (
            <Button
              variant="contained"
              size="small"
              fullWidth
              onClick={() => onComplete(task.taskId)}
              sx={{
                backgroundColor: '#16A34A',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#15803D' },
              }}
            >
              Mark Complete
            </Button>
          )}
          {task.taskStatus === 'COMPLETED' && (
            <Box sx={{ textAlign: 'center' }}>
              <Box
                component="span"
                sx={{
                  px: 1.5,
                  py: 0.5,
                  backgroundColor: '#16A34A18',
                  color: '#16A34A',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  display: 'inline-block',
                }}
              >
                Done
              </Box>
              {task.completedAt && (
                <Typography sx={{ fontSize: '0.72rem', color: '#6B7280', mt: 0.5 }}>
                  Completed at{' '}
                  {new Date(task.completedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
