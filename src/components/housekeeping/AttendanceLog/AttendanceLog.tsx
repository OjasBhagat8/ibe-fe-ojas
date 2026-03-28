import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import styles from './AttendanceLog.module.scss';

interface AttendanceLogProps {
  clockInTime: string | null;
  clockOutTime: string | null;
  totalWorkedHours: number | null;
}

function fmt(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AttendanceLog({
  clockInTime,
  clockOutTime,
  totalWorkedHours,
}: AttendanceLogProps) {
  return (
    <Table size="small" className={styles.table}>
      <TableBody>
        <TableRow>
          <TableCell className={styles.label}>Clock In</TableCell>
          <TableCell className={styles.value}>{fmt(clockInTime)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={styles.label}>Clock Out</TableCell>
          <TableCell className={styles.value}>{fmt(clockOutTime)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={styles.label}>Total Hours</TableCell>
          <TableCell className={styles.value}>
            {totalWorkedHours != null ? `${totalWorkedHours.toFixed(2)} hrs` : '—'}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
