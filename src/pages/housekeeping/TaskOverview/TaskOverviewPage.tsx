import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { useSupervisorTasks } from '../../../features/supervisorTasks/useSupervisorTasks';
import { getLocalIsoDate } from '../dateUtils';
import TaskOverviewTable from '../../../components/housekeeping/TaskOverviewTable/TaskOverviewTable';
import styles from './TaskOverview.module.scss';

export default function TaskOverviewPage() {
  const [selectedDate, setSelectedDate] = useState(getLocalIsoDate());
  const [modalOpen, setModalOpen] = useState(false);
  const [absentStaffId, setAbsentStaffId] = useState('');

  const { tasks, loading, error, runAllocationLoading, runAllocationError, runAllocation, reallocateStaff } =
    useSupervisorTasks(selectedDate);

  const staffAvailability = useSelector(
    (state: RootState) => state.supervisorDashboard.overview?.staffAvailability ?? [],
  );

  const handleReallocate = () => {
    if (!absentStaffId) return;
    reallocateStaff(absentStaffId);
    setModalOpen(false);
    setAbsentStaffId('');
  };

  return (
    <Box className={styles.page}>
      {/* Header */}
      <Box className={styles.header}>
        <Box>
          <Typography variant="h4" className={styles.title}>Task Allocation Overview</Typography>
          <Typography className={styles.breadcrumb}>Dashboard / Task Overview</Typography>
        </Box>
        <Box className={styles.headerActions}>
          <TextField
            type="date"
            size="small"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            inputProps={{ max: '2100-12-31' }}
            sx={{ background: '#fff', borderRadius: '10px' }}
          />
          <Button
            variant="outlined"
            startIcon={<GroupsOutlinedIcon />}
            onClick={() => setModalOpen(true)}
            className={styles.headerBtn}
          >
            Re-allocate Staff
          </Button>
          <Button
            variant="contained"
            startIcon={runAllocationLoading ? <CircularProgress size={16} color="inherit" /> : <PlayArrowOutlinedIcon />}
            onClick={runAllocation}
            disabled={runAllocationLoading}
            className={styles.headerBtnPrimary}
          >
            Run Allocation
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      {runAllocationError && <Alert severity="error" sx={{ mb: 1 }}>{runAllocationError}</Alert>}

      <Card elevation={0} variant="outlined" className={styles.tableCard}>
        <CardContent>
          {loading ? (
            <Box className={styles.loadingWrap}>
              <CircularProgress />
            </Box>
          ) : (
            <TaskOverviewTable rows={tasks} />
          )}
        </CardContent>
      </Card>

      {/* Re-allocate Staff modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Re-allocate Staff</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select the absent staff member to redistribute their tasks to available staff.
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Absent Staff Member</InputLabel>
            <Select
              value={absentStaffId}
              label="Absent Staff Member"
              onChange={(e) => setAbsentStaffId(e.target.value)}
            >
              {staffAvailability.map((s) => (
                <MenuItem key={s.staffId} value={s.staffId}>
                  {s.staffName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setModalOpen(false)} variant="outlined">Cancel</Button>
          <Button
            onClick={handleReallocate}
            variant="contained"
            disabled={!absentStaffId}
            sx={{ backgroundColor: '#1B1F6B', '&:hover': { backgroundColor: '#14185A' } }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
