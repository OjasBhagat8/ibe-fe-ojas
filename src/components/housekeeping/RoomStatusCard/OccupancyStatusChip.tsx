import type { RoomStatusItem } from '../../../types/housekeeping';
import styles from './RoomStatusCard.module.scss';

interface Props {
  status: RoomStatusItem['occupancyStatus'];
}

const LABELS: Record<RoomStatusItem['occupancyStatus'], string> = {
  VACANT: 'VACANT',
  OCCUPIED: 'OCCUPIED',
  CHECKING_IN: 'CHECKING IN',
  CHECKING_OUT: 'CHECKING OUT',
};

export default function OccupancyStatusChip({ status }: Props) {
  const cls =
    status === 'OCCUPIED' ? styles.occupiedChip
    : status === 'CHECKING_IN' ? styles.checkingInChip
    : status === 'CHECKING_OUT' ? styles.checkingOutChip
    : styles.vacantChip;

  return <span className={`${styles.chip} ${cls}`}>{LABELS[status]}</span>;
}
