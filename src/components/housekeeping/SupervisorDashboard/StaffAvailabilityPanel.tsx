import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import type { StaffAvailabilityItem } from '../../../types/housekeeping';
import styles from './SupervisorDashboard.module.scss';

interface StaffAvailabilityPanelProps {
  staff?: StaffAvailabilityItem[];
}

function shiftLabel(value: StaffAvailabilityItem['preferredShift']) {
  if (!value) return 'UNASSIGNED';
  return value;
}

function availabilityClass(status: StaffAvailabilityItem['availabilityStatus']) {
  if (status === 'ON_DUTY') return styles.availabilityOnDuty;
  if (status === 'ON_LEAVE' || status === 'SICK') return styles.availabilityOnLeave;
  return styles.availabilityOffDuty;
}

export default function StaffAvailabilityPanel({ staff }: StaffAvailabilityPanelProps) {
  const safeStaff = staff ?? [];

  return (
    <Card className={styles.staffCard}>
      <CardContent>
        <Typography variant="h6" className={styles.sectionTitle}>
          Staff Availability
        </Typography>

        <div className={styles.staffList}>
          {safeStaff.length === 0 && <div className={styles.emptyRow}>No staff records found.</div>}

          {safeStaff.map((member) => (
            <div key={member.staffId} className={styles.staffRow}>
              <Avatar className={styles.staffAvatar}>{member.initials}</Avatar>
              <div className={styles.staffInfo}>
                <div className={styles.staffName}>{member.staffName}</div>
                <div className={styles.staffTags}>
                  <span className={styles.shiftTag}>{shiftLabel(member.preferredShift)}</span>
                  <span className={`${styles.availabilityTag} ${availabilityClass(member.availabilityStatus)}`}>
                    {member.availabilityStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

