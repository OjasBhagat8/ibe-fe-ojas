import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useSupervisorDashboard } from '../../../features/supervisorDashboard/useSupervisorDashboard';
import { getLocalIsoDate } from '../dateUtils';
import DashboardHeader from '../../../components/housekeeping/SupervisorDashboard/DashboardHeader';
import DashboardMetrics from '../../../components/housekeeping/SupervisorDashboard/DashboardMetrics';
import NotificationModal from '../../../components/housekeeping/SupervisorDashboard/NotificationModal';
import StaffAvailabilityPanel from '../../../components/housekeeping/SupervisorDashboard/StaffAvailabilityPanel';
import TaskAllocationOverview from '../../../components/housekeeping/SupervisorDashboard/TaskAllocationOverview';
import styles from '../../../components/housekeeping/SupervisorDashboard/SupervisorDashboard.module.scss';

export default function SupervisorDashboardPage() {
  const [selectedDate, setSelectedDate] = useState(getLocalIsoDate());
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { overview, loading, error } = useSupervisorDashboard(selectedDate);

  return (
    <Box className={styles.page}>
      <DashboardHeader
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onOpenNotifications={() => setNotificationsOpen(true)}
      />

      {error && <Alert severity="error">{error}</Alert>}

      {loading && (
        <Box className={styles.loadingWrap}>
          <CircularProgress />
        </Box>
      )}

      {!loading && overview && (
        <>
          <DashboardMetrics overview={overview} />

          <div className={styles.bottomGrid}>
            <TaskAllocationOverview rows={overview.taskAllocation ?? []} />
            <StaffAvailabilityPanel staff={overview.staffAvailability ?? []} />
          </div>
        </>
      )}

      <NotificationModal open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </Box>
  );
}

