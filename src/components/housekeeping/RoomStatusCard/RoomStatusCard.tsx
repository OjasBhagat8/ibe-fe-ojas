import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import type { RoomStatusItem } from '../../../types/housekeeping';
import OccupancyStatusChip from './OccupancyStatusChip';
import CleanedStatusChip from './CleanedStatusChip';
import styles from './RoomStatusCard.module.scss';

interface RoomStatusCardProps {
  room: RoomStatusItem;
  onCheckIn: (id: string) => void;
  onCheckOut: (id: string) => void;
}

export default function RoomStatusCard({ room, onCheckIn, onCheckOut }: RoomStatusCardProps) {
  return (
    <Card className={styles.card} elevation={0} variant="outlined">
      <CardContent className={styles.content}>
        <Typography className={styles.roomNumber}>{room.roomNumber}</Typography>
        <Typography className={styles.roomType}>{room.roomType ?? '—'}</Typography>
        <Box className={styles.chips}>
          <OccupancyStatusChip status={room.occupancyStatus} />
          <CleanedStatusChip status={room.cleanedStatus} />
        </Box>
        <Box className={styles.actions}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<LoginOutlinedIcon />}
            onClick={() => onCheckIn(room.roomNightInventoryId)}
            className={styles.actionBtn}
          >
            Check In
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<LogoutOutlinedIcon />}
            onClick={() => onCheckOut(room.roomNightInventoryId)}
            className={styles.actionBtn}
          >
            Check Out
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
