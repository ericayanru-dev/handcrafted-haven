import styles from "./marketplace.module.css";

type MarketplaceSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function MarketplaceSearchBar({ value, onChange }: MarketplaceSearchBarProps) {
  return (
    <label className={styles.filterField} htmlFor="marketplace-search">
      <span className={styles.filterLabel}>Search</span>
      <input
        className={styles.field}
        id="marketplace-search"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by title or description"
        value={value}
      />
    </label>
  );
}
