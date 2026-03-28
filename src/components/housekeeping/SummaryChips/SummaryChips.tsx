import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import styles from './SummaryChips.module.scss';

interface SummaryChipsProps {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}

export default function SummaryChips({ total, completed, inProgress, pending }: SummaryChipsProps) {
  return (
    <Box className={styles.row}>
      <Box className={styles.chip}>
        <Typography component="span" className={styles.count} sx={{ color: '#1A1A2E' }}>
          {total}
        </Typography>{' '}
        <Typography component="span" className={styles.label}>
          Tasks Total
        </Typography>
      </Box>
      <Box className={styles.chip}>
        <Typography component="span" className={styles.count} sx={{ color: '#16A34A' }}>
          {completed}
        </Typography>{' '}
        <Typography component="span" className={styles.label}>
          Completed
        </Typography>
      </Box>
      <Box className={styles.chip}>
        <Typography component="span" className={styles.count} sx={{ color: '#D97706' }}>
          {inProgress}
        </Typography>{' '}
        <Typography component="span" className={styles.label}>
          In Progress
        </Typography>
      </Box>
      <Box className={styles.chip}>
        <Typography component="span" className={styles.count} sx={{ color: '#6B7280' }}>
          {pending}
        </Typography>{' '}
        <Typography component="span" className={styles.label}>
          Pending
        </Typography>
      </Box>
    </Box>
  );
}
