import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import type { SupervisorDashboardOverview } from '../../../types/housekeeping';
import styles from './SupervisorDashboard.module.scss';

interface DashboardMetricsProps {
  overview: SupervisorDashboardOverview;
}

export default function DashboardMetrics({ overview }: DashboardMetricsProps) {
  const hasShortfall = overview.capacityStatus.status === 'SHORTFALL';
  const hasNoShortfall = overview.capacityStatus.status === 'NO_DATA';

  return (
    <Box className={styles.metricsGrid}>
      <Card className={styles.metricCard}>
        <CardContent>
          <Typography className={styles.metricLabel}>Rooms Today</Typography>
          <Typography className={styles.metricValue}>{overview.roomsToday.total}</Typography>
          <Typography className={styles.metricHint}>
            {overview.roomsToday.checkingOut} checking out · {overview.roomsToday.occupied} occupied · {overview.roomsToday.vacant} vacant
          </Typography>
        </CardContent>
      </Card>

      <Card className={styles.metricCard}>
        <CardContent>
          <Typography className={styles.metricLabel}>Staff On Duty</Typography>
          <Typography className={styles.metricValue}>{overview.staffOnDuty.total}</Typography>
          <Typography className={styles.metricHint}>
            {overview.staffOnDuty.morning} morning · {overview.staffOnDuty.afternoon} afternoon
          </Typography>
        </CardContent>
      </Card>

      <Card className={styles.metricCard}>
        <CardContent>
          <Typography className={styles.metricLabel}>Tasks Completed</Typography>
          <Typography className={styles.metricValue}>
            {overview.tasksCompleted.completed}/{overview.tasksCompleted.total}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={overview.tasksCompleted.completionRate}
            className={styles.progressBar}
          />
          <Typography className={styles.metricHint}>
            {overview.tasksCompleted.completionRate}% completion rate
          </Typography>
        </CardContent>
      </Card>

      <Card className={`${styles.metricCard} ${hasNoShortfall ? styles.metricCardHealthy : ''}`}>
        <CardContent>
          <Box className={styles.metricHeader}>
            <Typography className={styles.metricLabel}>Capacity Status</Typography>
            {hasShortfall && <WarningAmberRoundedIcon className={styles.capacityWarningIcon} />}
          </Box>
          <Typography className={`${styles.metricValue} ${hasShortfall ? styles.metricValueDanger : styles.metricValueSuccess}`}>
            {hasShortfall ? `${overview.capacityStatus.deficitHours.toFixed(1)}h Shortfall` : '-'}
          </Typography>
          <Typography className={`${styles.metricHint} ${!hasShortfall ? styles.metricHintSuccess : ''}`}>
            {hasShortfall
              ? `Additional staff needed: ${overview.capacityStatus.additionalStaffNeeded}`
              : 'No shortfall detected'}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

