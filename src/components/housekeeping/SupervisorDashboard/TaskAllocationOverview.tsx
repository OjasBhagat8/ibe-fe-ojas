import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import type { TaskAllocationRow } from '../../../types/housekeeping';
import styles from './SupervisorDashboard.module.scss';

interface TaskAllocationOverviewProps {
  rows?: TaskAllocationRow[];
}

function formatTime(value: string | null) {
  if (!value) return '--:--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function statusClass(status: TaskAllocationRow['taskStatus']) {
  if (status === 'COMPLETED') return styles.statusCompleted;
  if (status === 'IN_PROGRESS') return styles.statusInProgress;
  return styles.statusPending;
}

function formatStatus(status: TaskAllocationRow['taskStatus']) {
  return status.replace('_', ' ');
}

export default function TaskAllocationOverview({ rows }: TaskAllocationOverviewProps) {
  const safeRows = rows ?? [];

  return (
    <Card className={styles.tableCard}>
      <CardContent>
        <Typography variant="h6" className={styles.sectionTitle}>
          Task Allocation Overview
        </Typography>

        <div className={styles.allocationTable}>
          <div className={styles.allocationHeader}>
            <span>Room</span>
            <span>Type</span>
            <span>Assigned To</span>
            <span>Status</span>
            <span>Time</span>
            <span />
          </div>

          {safeRows.length === 0 && (
            <div className={styles.emptyRow}>No task allocations found for selected date.</div>
          )}

          {safeRows.map((row) => (
            <div key={row.taskId} className={styles.allocationRow}>
              <div className={styles.roomCell}>{row.roomNumber}</div>
              <div>{row.roomType ?? '-'}</div>
              <div>{row.assignedTo}</div>
              <div>
                <span className={`${styles.statusChip} ${statusClass(row.taskStatus)}`}>
                  {formatStatus(row.taskStatus)}
                </span>
              </div>
              <div className={styles.timeCell}>
                <AccessTimeOutlinedIcon fontSize="inherit" />
                <span>
                  {formatTime(row.startTime)} - {formatTime(row.endTime)}
                </span>
              </div>
              <div className={styles.moreCell}>
                <IconButton size="small" disabled>
                  <MoreHorizOutlinedIcon fontSize="small" />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

