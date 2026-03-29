import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { AvailabilityStatus, StaffBoardStaffItem } from '../../../types/housekeeping';
import styles from './StaffBoardStaffCard.module.scss';

interface StaffBoardStaffCardProps {
  staff: StaffBoardStaffItem;
  shiftName: string;
}

const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  ON_DUTY: 'On Duty',
  OFF_DUTY: 'Off Duty',
  ON_LEAVE: 'On Leave',
  SICK: 'Sick',
};

function getInitials(staff: StaffBoardStaffItem): string {
  if (staff.initials?.trim()) {
    return staff.initials.trim().toUpperCase();
  }

  const words = staff.staffName.split(' ').filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

function getAssignedPercentage(staff: StaffBoardStaffItem): number {
  if (staff.shiftCapacityHours <= 0) return 0;
  return Math.min((staff.assignedHours / staff.shiftCapacityHours) * 100, 100);
}

export default function StaffBoardStaffCard({ staff, shiftName }: StaffBoardStaffCardProps) {
  const assignedPercent = getAssignedPercentage(staff);

  return (
    <Box className={styles.card}>
      <Box className={styles.head}>
        <Box className={styles.avatar}>{getInitials(staff)}</Box>
        <Box>
          <Typography className={styles.staffName}>{staff.staffName}</Typography>
          <Typography className={styles.role}>{staff.role}</Typography>
        </Box>
        <Box className={`${styles.statusDot} ${styles[staff.availabilityStatus]}`} />
      </Box>

      <Box className={styles.badgeRow}>
        <span className={styles.shiftBadge}>{shiftName}</span>
        <span className={`${styles.availabilityBadge} ${styles[staff.availabilityStatus]}`}>
          {AVAILABILITY_LABELS[staff.availabilityStatus]}
        </span>
      </Box>

      <Box className={styles.hoursRow}>
        <Typography className={styles.caption}>Assigned Hours</Typography>
        <Typography className={styles.hoursValue}>
          {staff.assignedHours}h / {staff.shiftCapacityHours}h
        </Typography>
      </Box>
      <Box className={styles.progressTrack}>
        <Box className={styles.progressFill} sx={{ width: `${assignedPercent}%` }} />
      </Box>

      <Box className={styles.divider} />

      <Typography className={styles.caption}>Assigned Rooms</Typography>
      {staff.assignedRooms.length === 0 ? (
        <Typography className={styles.noRooms}>No rooms assigned</Typography>
      ) : (
        <Box className={styles.roomList}>
          {staff.assignedRooms.map((room) => (
            <span key={room} className={styles.roomChip}>
              {room}
            </span>
          ))}
        </Box>
      )}
    </Box>
  );
}
