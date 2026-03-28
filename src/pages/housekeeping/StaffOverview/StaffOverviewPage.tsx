import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useHousekeepingAuth } from '../../../features/housekeepingAuth/useHousekeepingAuth';
import { useTasks } from '../../../features/tasks/useTasks';
import { useAttendance } from '../../../features/attendance/useAttendance';
import SummaryChips from '../../../components/housekeeping/SummaryChips/SummaryChips';
import TaskCard from '../../../components/housekeeping/TaskCard/TaskCard';
import AttendanceLog from '../../../components/housekeeping/AttendanceLog/AttendanceLog';
import CircularProgressRing from '../../../components/housekeeping/CircularProgressRing/CircularProgressRing';
import TimeProgressBar from '../../../components/housekeeping/TimeProgressBar/TimeProgressBar';
import { getLocalIsoDate } from '../dateUtils';
import styles from './StaffOverview.module.scss';

export default function StaffOverviewPage() {
  const { staffId } = useHousekeepingAuth();
  const today = getLocalIsoDate();
  const {
    tasks,
    loading: tasksLoading,
    completedCount,
    inProgressCount,
    pendingCount,
    startTask,
    completeTask,
  } = useTasks(staffId, today);
  const {
    isClockedIn,
    todayLog,
    elapsedFormatted,
    elapsedSeconds,
    loading: attLoading,
    error,
    handleClockIn,
    handleClockOut,
  } = useAttendance(staffId);

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  const dateString = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const elapsedHours = elapsedSeconds / 3600;
  const hoursWorked = todayLog?.totalWorkedHours ?? elapsedHours;
  const shiftCompleted = Boolean(todayLog?.clockInTime && todayLog?.clockOutTime);

  return (
    <Box className={styles.page}>
      {/* Header */}
      <Box className={styles.header}>
        <Typography variant="h5" className={styles.title}>
          Staff Overview
        </Typography>
        <Box className={styles.headerMeta}>
          <Box className={styles.dateRow}>
            <CalendarTodayIcon sx={{ fontSize: 14, color: '#6B7280' }} />
            <Typography className={styles.dateText}>{dateString}</Typography>
          </Box>
          <Box className={styles.shiftBadge}>
            <Typography className={styles.shiftBadgeText}>MORNING 08:00–12:00</Typography>
          </Box>
        </Box>
      </Box>

      {/* Attendance */}
      <Box className={styles.section}>
        <Box className={`${styles.sectionHeading} ${styles.attendanceHeading}`}>
          <FingerprintIcon sx={{ fontSize: 18 }} />
          <Typography variant="h6" className={styles.sectionTitle}>Attendance</Typography>
        </Box>

        {error && (
          <Alert severity="error" className={styles.attendanceAlert}>
            {error}
          </Alert>
        )}

        <Card className={`${styles.card} ${styles.attendanceCard}`} elevation={0} variant="outlined">
          <CardContent className={styles.attendanceContent}>
            <Box className={styles.clockCenter}>
              <Typography className={styles.bigClock}>{timeString}</Typography>
              <Box className={styles.dateRow} sx={{ justifyContent: 'center', mt: 0.5 }}>
                <CalendarTodayIcon sx={{ fontSize: 14, color: '#6B7280' }} />
                <Typography className={styles.dateText}>{dateString}</Typography>
              </Box>
            </Box>

            {/* Clocked-in state */}
            {isClockedIn && (
              <>
                <Box className={styles.clockedBanner}>
                  <Typography className={styles.clockedBannerText}>
                    Clocked in at{' '}
                    {todayLog?.clockInTime
                      ? new Date(todayLog.clockInTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </Typography>
                </Box>
                <Box className={styles.elapsedBox}>
                  <Typography className={styles.elapsedLabel}>Time worked</Typography>
                  <Typography className={styles.elapsedTime}>{elapsedFormatted}</Typography>
                </Box>
              </>
            )}

            {!isClockedIn ? (
              <>
                <Button
                  variant="contained"
                  onClick={handleClockIn}
                  disabled={attLoading || shiftCompleted}
                  className={styles.clockBtn}
                  sx={{ backgroundColor: '#1B1F6B', '&:hover': { backgroundColor: '#14185A' } }}
                >
                  {attLoading ? <CircularProgress size={20} color="inherit" /> : 'CLOCK IN'}
                </Button>
                <Typography className={styles.shiftHint}>
                  {shiftCompleted ? 'Today’s shift is completed.' : 'Shift starts at 08:00'}
                </Typography>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={handleClockOut}
                disabled={attLoading}
                className={styles.clockBtn}
                sx={{ backgroundColor: '#DC2626', '&:hover': { backgroundColor: '#B91C1C' } }}
              >
                {attLoading ? <CircularProgress size={20} color="inherit" /> : 'CLOCK OUT'}
              </Button>
            )}

            <Box className={styles.logSection}>
              <Typography className={styles.logTitle}>Today's Attendance</Typography>
              <AttendanceLog
                clockInTime={todayLog?.clockInTime ?? null}
                clockOutTime={todayLog?.clockOutTime ?? null}
                totalWorkedHours={todayLog?.totalWorkedHours ?? null}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* My Tasks */}
      <Box className={styles.section}>
        <Box className={`${styles.sectionHeading} ${styles.tasksHeading}`}>
          <AccessTimeIcon sx={{ fontSize: 18 }} />
          <Typography variant="h6" className={styles.sectionTitle}>My Tasks — Today</Typography>
        </Box>

        <SummaryChips
          total={tasks.length}
          completed={completedCount}
          inProgress={inProgressCount}
          pending={pendingCount}
        />

        <Box className={styles.taskList}>
          {tasksLoading && <CircularProgress sx={{ mt: 2, display: 'block', mx: 'auto' }} />}
          {!tasksLoading && tasks.length === 0 && (
            <Typography color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
              No tasks assigned for today.
            </Typography>
          )}
          {tasks.map((task) => (
            <TaskCard key={task.taskId} task={task} onStart={startTask} onComplete={completeTask} />
          ))}
        </Box>
      </Box>

      {/* Shift Progress */}
      <Box className={styles.section}>
        <Box className={`${styles.sectionHeading} ${styles.progressHeading}`}>
          <TrendingUpIcon sx={{ fontSize: 18 }} />
          <Typography variant="h6" className={styles.sectionTitle}>Shift Status</Typography>
        </Box>

        <Box className={styles.progressGrid}>
          {/* Circular ring card */}
          <Card className={styles.card} elevation={0} variant="outlined" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <CircularProgressRing completed={completedCount} total={tasks.length} />
            <Typography className={styles.shiftLabel} sx={{ mt: 2 }}>
              Morning Shift · 08:00–12:00
            </Typography>
          </Card>

          {/* Right column */}
          <Box className={styles.progressRight}>
            {/* Time progress card */}
            <Card className={styles.card} elevation={0} variant="outlined">
              <CardContent>
                <Typography className={styles.cardSubtitle}>Time Progress</Typography>
                <TimeProgressBar elapsedHours={hoursWorked} totalHours={4} />
                <Typography className={styles.timeHint} sx={{ mt: 1.5 }}>
                  <strong>{hoursWorked.toFixed(2)}h</strong> elapsed of <strong>4h</strong>
                </Typography>
              </CardContent>
            </Card>

            {/* Tasks this shift */}
            <Card className={styles.card} elevation={0} variant="outlined">
              <CardContent>
                <Typography className={styles.cardSubtitle}>Tasks This Shift</Typography>
                <Box className={styles.shiftTaskList}>
                  {tasks.map((task) => {
                    const dotColor =
                      task.taskStatus === 'COMPLETED'
                        ? '#16A34A'
                        : task.taskStatus === 'IN_PROGRESS'
                          ? '#D97706'
                          : '#6B7280';
                    return (
                      <Box key={task.taskId} className={styles.shiftTaskRow}>
                        <Box className={styles.dot} sx={{ background: dotColor }} />
                        <Box className={styles.shiftTaskInfo}>
                          <Typography className={styles.shiftTaskRoom}>
                            Room {task.roomNumber}
                          </Typography>
                          <Typography className={styles.shiftTaskType}>
                            {task.taskType?.replace('_', ' ') ?? '—'}
                          </Typography>
                        </Box>
                        <Box className={styles.shiftTaskRight}>
                          {task.estimatedDurationHours != null && (
                            <Typography className={styles.shiftTaskDuration}>
                              {task.estimatedDurationHours}h
                            </Typography>
                          )}
                          <Typography className={styles.shiftTaskStatus} sx={{ color: dotColor }}>
                            {task.taskStatus.replace('_', ' ')}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                  {tasks.length === 0 && (
                    <Typography color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                      No tasks yet.
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
