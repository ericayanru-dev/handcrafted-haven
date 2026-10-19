import styles from "./seller-dashboard.module.css";

type MetricBarItem = {
  id: string;
  label: string;
  value: number;
  description: string;
};

type MetricBarChartProps = {
  title: string;
  subtitle: string;
  items: MetricBarItem[];
};

function toPercent(value: number, max: number) {
  if (max <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, (value / max) * 100));
}

export function MetricBarChart({ title, subtitle, items }: MetricBarChartProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 0);

  return (
    <section className={styles.stack} aria-label={title}>
      <div>
        <p className={styles.sectionEyebrow}>{subtitle}</p>
        <h3 className={styles.sectionTitle}>{title}</h3>
      </div>

      {items.length === 0 ? (
        <p className={styles.sectionText}>No data available yet.</p>
      ) : (
        <div className={styles.chartList}>
          {items.map((item) => {
            const width = toPercent(item.value, maxValue);

            return (
              <article className={styles.chartItem} key={item.id}>
                <div className={styles.chartHeaderRow}>
                  <p className={styles.chartLabel}>{item.label}</p>
                  <p className={styles.chartValue}>{item.description}</p>
                </div>
                <div aria-hidden="true" className={styles.chartTrack}>
                  <span className={styles.chartFill} style={{ width: `${width}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
