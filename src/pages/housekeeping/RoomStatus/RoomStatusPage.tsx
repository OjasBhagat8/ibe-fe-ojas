import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useRoomStatus } from '../../../features/roomStatus/useRoomStatus';
import { getLocalIsoDate } from '../dateUtils';
import RoomStatusCard from '../../../components/housekeeping/RoomStatusCard/RoomStatusCard';
import type { RoomStatusItem } from '../../../types/housekeeping';
import styles from './RoomStatus.module.scss';

type OccupancyFilter = 'ALL' | RoomStatusItem['occupancyStatus'];

const FILTERS: { label: string; value: OccupancyFilter }[] = [
  { label: 'ALL', value: 'ALL' },
  { label: 'VACANT', value: 'VACANT' },
  { label: 'OCCUPIED', value: 'OCCUPIED' },
  { label: 'CHECKING IN', value: 'CHECKING_IN' },
  { label: 'CHECKING OUT', value: 'CHECKING_OUT' },
];

export default function RoomStatusPage() {
  const [selectedDate, setSelectedDate] = useState(getLocalIsoDate());
  const [activeFilter, setActiveFilter] = useState<OccupancyFilter>('ALL');
  const { loading, error, checkIn, checkOut, filteredRooms } = useRoomStatus(selectedDate);

  const rooms = filteredRooms(activeFilter);

  return (
    <Box className={styles.page}>
      {/* Header */}
      <Box className={styles.header}>
        <Box>
          <Typography variant="h4" className={styles.title}>Room Status</Typography>
          <Typography className={styles.breadcrumb}>Dashboard / Room Status</Typography>
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
          <Button variant="outlined" startIcon={<LoginOutlinedIcon />} className={styles.headerBtn}>
            Check-In Room
          </Button>
          <Button variant="contained" startIcon={<LogoutOutlinedIcon />} className={styles.headerBtnPrimary}>
            Check-Out Room
          </Button>
        </Box>
      </Box>

      {/* Filter tabs */}
      <Box className={styles.filterRow}>
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={activeFilter === f.value ? 'contained' : 'outlined'}
            onClick={() => setActiveFilter(f.value)}
            className={activeFilter === f.value ? styles.filterBtnActive : styles.filterBtn}
            size="small"
          >
            {f.label}
          </Button>
        ))}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading && (
        <Box className={styles.loadingWrap}>
          <CircularProgress />
        </Box>
      )}

      {!loading && rooms.length === 0 && (
        <Typography className={styles.empty}>No rooms found.</Typography>
      )}

      {!loading && rooms.length > 0 && (
        <Box className={styles.grid}>
          {rooms.map((room) => (
            <RoomStatusCard
              key={room.roomNightInventoryId}
              room={room}
              onCheckIn={checkIn}
              onCheckOut={checkOut}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
