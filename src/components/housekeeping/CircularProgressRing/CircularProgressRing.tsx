import styles from './CircularProgressRing.module.scss';

interface CircularProgressRingProps {
  readonly completed: number;
  readonly total: number;
  readonly size?: number;
  readonly strokeWidth?: number;
}

export default function CircularProgressRing({
  completed,
  total,
  size = 176,
  strokeWidth = 16,
}: CircularProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = total > 0 ? completed / total : 0;
  const offset = circumference - percent * circumference;

  return (
    <div className={styles.wrapper} style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F4F5F7"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1B1F6B"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className={styles.center}>
        <span className={styles.fraction}>
          {completed} / {total}
        </span>
        <span className={styles.label}>Tasks Done</span>
      </div>
    </div>
  );
}
