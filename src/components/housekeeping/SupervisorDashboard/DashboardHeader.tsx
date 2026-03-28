import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import styles from './SupervisorDashboard.module.scss';

interface DashboardHeaderProps {
  selectedDate: string;
  onDateChange: (nextDate: string) => void;
  onOpenNotifications: () => void;
}

export default function DashboardHeader({
  selectedDate,
  onDateChange,
  onOpenNotifications,
}: DashboardHeaderProps) {
  return (
    <Box className={styles.header}>
      <Box>
        <Typography variant="h4" className={styles.title}>
          Dashboard
        </Typography>
        <Typography className={styles.subtitle}>Supervisor Overview</Typography>
      </Box>

      <Box className={styles.headerActions}>
        <TextField
          type="date"
          size="small"
          value={selectedDate}
          onChange={(event) => onDateChange(event.target.value)}
          inputProps={{ max: '2100-12-31' }}
        />
        <IconButton
          aria-label="notifications"
          onClick={onOpenNotifications}
          className={styles.notifyButton}
        >
          <Badge badgeContent={0} color="error">
            <NotificationsNoneOutlinedIcon />
          </Badge>
        </IconButton>
      </Box>
    </Box>
  );
}

