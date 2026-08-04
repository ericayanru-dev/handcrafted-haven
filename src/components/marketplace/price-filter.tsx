import styles from "./marketplace.module.css";

type PriceFilterProps = {
  minPrice: string;
  maxPrice: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
};

export function PriceFilter({ minPrice, maxPrice, onMinChange, onMaxChange }: PriceFilterProps) {
  return (
    <div className={styles.priceGroup}>
      <label className={styles.filterField} htmlFor="marketplace-min-price">
        <span className={styles.filterLabel}>Min price</span>
        <input
          className={styles.field}
          id="marketplace-min-price"
          inputMode="decimal"
          min="0"
          onChange={(event) => onMinChange(event.target.value)}
          placeholder="0"
          step="0.01"
          type="number"
          value={minPrice}
        />
      </label>

      <label className={styles.filterField} htmlFor="marketplace-max-price">
        <span className={styles.filterLabel}>Max price</span>
        <input
          className={styles.field}
          id="marketplace-max-price"
          inputMode="decimal"
          min="0"
          onChange={(event) => onMaxChange(event.target.value)}
          placeholder="500"
          step="0.01"
          type="number"
          value={maxPrice}
        />
      </label>
    </div>
  );
}
