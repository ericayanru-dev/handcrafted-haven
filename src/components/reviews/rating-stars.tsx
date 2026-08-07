import styles from "./reviews.module.css";

type RatingStarsProps = {
  value: number;
  onChange?: (value: number) => void;
  label?: string;
  compact?: boolean;
};

function StarIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden="true" className={active ? styles.starActive : styles.starInactive} viewBox="0 0 20 20">
      <path d="M10 1.5l2.53 5.13 5.66.82-4.09 3.99.97 5.63L10 14.4l-5.07 2.67.97-5.63-4.09-3.99 5.66-.82L10 1.5z" fill="currentColor" />
    </svg>
  );
}

export function RatingStars({ value, onChange, label = "Rating", compact = false }: RatingStarsProps) {
  const rounded = Math.min(5, Math.max(0, Math.round(value)));
  const interactive = typeof onChange === "function";

  return (
    <div className={compact ? styles.ratingRowCompact : styles.ratingRow}>
      <span className={styles.ratingLabel}>{label}</span>
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) =>
          interactive ? (
            <button
              aria-label={`${star} star${star === 1 ? "" : "s"}`}
              className={styles.starButton}
              key={star}
              onClick={() => onChange(star)}
              type="button"
            >
              <StarIcon active={star <= rounded} />
            </button>
          ) : (
            <span className={styles.starDisplay} key={star}>
              <StarIcon active={star <= rounded} />
            </span>
          )
        )}
      </div>
      <span className={styles.ratingValue}>{rounded.toFixed(1)}</span>
    </div>
  );
}