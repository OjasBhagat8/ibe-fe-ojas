import Chip from '@mui/material/Chip';
import type { TaskStatus, TaskType } from '../../../types/housekeeping';

const TASK_TYPE_COLORS: Record<string, string> = {
  DEEP_CLEAN: '#1B1F6B',
  DAILY_CLEAN: '#0369A1',
  VACANT_CLEAN: '#6D28D9',
};

const TASK_STATUS_COLORS: Record<string, string> = {
  COMPLETED: '#16A34A',
  IN_PROGRESS: '#D97706',
  PENDING: '#6B7280',
};

const TASK_TYPE_LABELS: Record<string, string> = {
  DEEP_CLEAN: 'Deep Clean',
  DAILY_CLEAN: 'Daily Clean',
  VACANT_CLEAN: 'Vacant Clean',
};

const TASK_STATUS_LABELS: Record<string, string> = {
  COMPLETED: 'Completed',
  IN_PROGRESS: 'In Progress',
  PENDING: 'Pending',
};

interface StatusChipProps {
  type: 'taskType' | 'taskStatus';
  value: TaskType | TaskStatus | string;
}

export default function StatusChip({ type, value }: StatusChipProps) {
  const color =
    type === 'taskType'
      ? (TASK_TYPE_COLORS[value] ?? '#6B7280')
      : (TASK_STATUS_COLORS[value] ?? '#6B7280');

  const label =
    type === 'taskType'
      ? (TASK_TYPE_LABELS[value] ?? value)
      : (TASK_STATUS_LABELS[value] ?? value);

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        backgroundColor: `${color}18`,
        color,
        fontWeight: 600,
        fontSize: '0.7rem',
        border: `1px solid ${color}40`,
      }}
    />
  );
}
