import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import type { SupervisorDashboardOverview } from '../../../types/housekeeping';
import styles from './SupervisorDashboard.module.scss';

interface DashboardMetricsProps {
  overview: SupervisorDashboardOverview;
}

export default function DashboardMetrics({ overview }: DashboardMetricsProps) {
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
    </Box>
  );
}

