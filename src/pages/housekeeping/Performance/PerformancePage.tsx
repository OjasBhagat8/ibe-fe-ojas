import { useMemo, type CSSProperties } from 'react';
import type { PerformanceTrendPoint } from '../../../types/housekeeping';
import { usePerformance } from '../../../features/performance/usePerformance';
import styles from './Performance.module.scss';

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function formatHours(value: number) {
  return `${value.toFixed(1)}h`;
}

function avgCompletionSeries(trend: PerformanceTrendPoint[]) {
  return trend.map((point) => point.avgCompletionTimeHours);
}

function buildSparklinePoints(values: number[], width = 220, height = 48) {
  if (values.length === 0) {
    return '';
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');
}

export default function PerformancePage() {
  const {
    data,
    loading,
    error,
    preset,
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    applyPreset,
    applyCustomRange,
    invalidCustomRange,
  } = usePerformance();

  const sparklinePoints = useMemo(
    () => buildSparklinePoints(avgCompletionSeries(data?.trend ?? [])),
    [data?.trend],
  );

  const utilization = Math.max(0, Math.min(100, data?.kpis.utilizationRate ?? 0));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Performance Metrics</h1>
          <p className={styles.breadcrumb}>Dashboard / Performance</p>
        </div>

        <div className={styles.filters}>
          <div className={styles.presetGroup}>
            <button
              type="button"
              className={`${styles.presetBtn} ${preset === 'LAST_7_DAYS' ? styles.presetActive : ''}`}
              onClick={() => applyPreset('LAST_7_DAYS')}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              className={`${styles.presetBtn} ${preset === 'LAST_30_DAYS' ? styles.presetActive : ''}`}
              onClick={() => applyPreset('LAST_30_DAYS')}
            >
              Last 30 Days
            </button>
          </div>

          <div className={styles.customRange}>
            <label className={styles.dateField}>
              <span>From</span>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </label>
            <label className={styles.dateField}>
              <span>To</span>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </label>
            <button type="button" className={styles.applyBtn} onClick={applyCustomRange}>
              Apply
            </button>
          </div>
        </div>
      </div>

      {invalidCustomRange && (
        <div className={styles.errorBox}>From date cannot be after To date.</div>
      )}

      {error && <div className={styles.errorBox}>{error}</div>}

      {loading && <div className={styles.loading}>Loading performance data...</div>}

      {!loading && data && (
        <>
          <section className={styles.metricsGrid}>
            <article className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Utilization Rate</h3>
              </div>
              <div className={styles.utilizationBody}>
                <p className={styles.metricValue}>{formatPercent(data.kpis.utilizationRate)}</p>
                <div
                  className={styles.utilRing}
                  style={{ '--util-value': `${utilization}%` } as CSSProperties}
                  aria-label={`Utilization ${formatPercent(data.kpis.utilizationRate)}`}
                />
              </div>
            </article>

            <article className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Task Completion Rate</h3>
              </div>
              <p className={styles.metricValue}>{formatPercent(data.kpis.taskCompletionRate)}</p>
              <p className={styles.metricHint}>On-time completion in selected range</p>
            </article>

            <article className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Avg Completion Time</h3>
              </div>
              <p className={styles.metricValue}>{formatHours(data.kpis.avgCompletionTimeHours)}</p>
              <div className={styles.sparklineWrap}>
                <svg viewBox="0 0 220 48" className={styles.sparkline} role="img" aria-label="Average completion trend">
                  <polyline points={sparklinePoints} />
                </svg>
              </div>
            </article>
          </section>

          <section className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h2>Per Staff Performance</h2>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>Assigned Tasks</th>
                    <th>Completed</th>
                    <th>Completion Rate</th>
                    <th>Avg Time</th>
                    <th>Utilization %</th>
                  </tr>
                </thead>
                <tbody>
                  {data.staffPerformance.map((row) => (
                    <tr key={row.staffId}>
                      <td className={styles.staffName}>{row.staffName}</td>
                      <td>{row.assignedTasks}</td>
                      <td>{row.completedTasks}</td>
                      <td>
                        <span className={styles.rateChip}>{formatPercent(row.completionRate)}</span>
                      </td>
                      <td>{formatHours(row.avgCompletionTimeHours)}</td>
                      <td>
                        <div className={styles.utilBarWrap}>
                          <span className={styles.utilBar}>
                            <span
                              className={styles.utilBarFill}
                              style={{ width: `${Math.max(0, Math.min(100, row.utilizationPercent))}%` }}
                            />
                          </span>
                          <strong>{formatPercent(row.utilizationPercent)}</strong>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
