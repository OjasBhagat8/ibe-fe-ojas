import type { RoomStatusItem } from '../../../types/housekeeping';
import styles from './RoomStatusCard.module.scss';

interface Props {
  status: RoomStatusItem['cleanedStatus'];
}

const LABELS: Record<RoomStatusItem['cleanedStatus'], string> = {
  CLEAN: 'CLEAN',
  DIRTY: 'DIRTY',
  IN_PROGRESS: 'IN PROGRESS',
};

export default function CleanedStatusChip({ status }: Props) {
  const cls =
    status === 'CLEAN' ? styles.cleanChip
    : status === 'DIRTY' ? styles.dirtyChip
    : styles.inProgressChip;

  return <span className={`${styles.chip} ${cls}`}>{LABELS[status]}</span>;
}
