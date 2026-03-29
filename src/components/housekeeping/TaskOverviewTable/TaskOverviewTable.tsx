import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import IconButton from '@mui/material/IconButton';
import type { TaskOverviewRow } from '../../../types/housekeeping';
import styles from './TaskOverviewTable.module.scss';

interface TaskOverviewTableProps {
  rows: TaskOverviewRow[];
}

function formatTime(value: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function taskTypeClass(type: TaskOverviewRow['taskType'], styles: Record<string, string>) {
  if (type === 'DEEP_CLEAN') return styles.taskTypeDeep;
  if (type === 'DAILY_CLEAN') return styles.taskTypeDaily;
  return styles.taskTypeVacant;
}

function taskTypeLabel(type: TaskOverviewRow['taskType']) {
  if (type === 'DEEP_CLEAN') return 'DEEP CLEAN';
  if (type === 'DAILY_CLEAN') return 'DAILY CLEAN';
  if (type === 'VACANT_CLEAN') return 'VACANT CLEAN';
  return '—';
}

function statusClass(status: TaskOverviewRow['taskStatus'], styles: Record<string, string>) {
  if (status === 'COMPLETED') return styles.statusCompleted;
  if (status === 'IN_PROGRESS') return styles.statusInProgress;
  return styles.statusPending;
}

function statusLabel(status: TaskOverviewRow['taskStatus']) {
  return status.replace('_', ' ');
}

export default function TaskOverviewTable({ rows }: TaskOverviewTableProps) {
  return (
    <div className={styles.tableWrap}>
      <div className={styles.header}>
        <span>Room</span>
        <span>Room Type</span>
        <span>Task Type</span>
        <span>Assigned Staff</span>
        <span>Shift</span>
        <span>Scheduled Start</span>
        <span>Expected End</span>
        <span>Duration</span>
        <span>Status</span>
        <span>Actions</span>
      </div>

      {rows.length === 0 && (
        <div className={styles.empty}>No tasks found for selected date.</div>
      )}

      {rows.map((row) => (
        <div key={row.taskId} className={styles.row}>
          <div className={styles.roomCell}>{row.roomNumber ?? '—'}</div>
          <div className={styles.mutedCell}>{row.roomType ?? '—'}</div>
          <div>
            {row.taskType ? (
              <span className={`${styles.taskTypeChip} ${taskTypeClass(row.taskType, styles)}`}>
                {taskTypeLabel(row.taskType)}
              </span>
            ) : '—'}
          </div>
          <div>{row.assignedTo}</div>
          <div className={styles.mutedCell}>{row.shiftName ?? '—'}</div>
          <div className={styles.timeCell}>
            <AccessTimeOutlinedIcon fontSize="inherit" />
            <span>{formatTime(row.scheduledStartTime)}</span>
          </div>
          <div className={styles.timeCell}>
            <AccessTimeOutlinedIcon fontSize="inherit" />
            <span>{formatTime(row.expectedEndTime)}</span>
          </div>
          <div className={styles.durationCell}>
            {row.estimatedDurationHours != null ? `${row.estimatedDurationHours}h` : '—'}
          </div>
          <div>
            <span className={`${styles.statusChip} ${statusClass(row.taskStatus, styles)}`}>
              {statusLabel(row.taskStatus)}
            </span>
          </div>
          <div className={styles.actionsCell}>
            <IconButton size="small" disabled>
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
          </div>
        </div>
      ))}
    </div>
  );
}
