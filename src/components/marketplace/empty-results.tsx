import { Button } from "@/components/ui";
import styles from "./marketplace.module.css";

type EmptyResultsProps = {
  onClear: () => void;
};

export function EmptyResults({ onClear }: EmptyResultsProps) {
  return (
    <div className={styles.emptyState}>
      <h2 className={styles.emptyTitle}>No products matched those filters.</h2>
      <p className={styles.emptyText}>Try removing a filter or widening the price range.</p>
      <Button onClick={onClear} type="button" variant="secondary">
        Clear filters
      </Button>
    </div>
  );
}
