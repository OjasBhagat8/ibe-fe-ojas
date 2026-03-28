import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import styles from './TimeProgressBar.module.scss';

interface TimeProgressBarProps {
  readonly elapsedHours: number;
  readonly totalHours?: number;
}

export default function TimeProgressBar({ elapsedHours, totalHours = 8 }: TimeProgressBarProps) {
  const percent = Math.min((elapsedHours / totalHours) * 100, 100);
  const markers = Array.from({ length: totalHours + 1 }, (_, i) => i);

  return (
    <Box className={styles.wrapper}>
      <Box className={styles.track}>
        <Box className={styles.fill} sx={{ width: `${percent}%` }} />
      </Box>
      <Box className={styles.markers}>
        {markers.map((h) => (
          <Typography key={h} className={styles.marker}>
            {h}h
          </Typography>
        ))}
      </Box>
    </Box>
  );
}
