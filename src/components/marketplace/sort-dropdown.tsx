import styles from "./marketplace.module.css";

type SortValue = "newest" | "price-asc" | "price-desc" | "title";

type SortDropdownProps = {
  value: SortValue;
  onChange: (value: SortValue) => void;
};

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <label className={styles.filterField} htmlFor="marketplace-sort">
      <span className={styles.filterLabel}>Sort by</span>
      <select
        className={styles.select}
        id="marketplace-sort"
        onChange={(event) => onChange(event.target.value as SortValue)}
        value={value}
      >
        <option value="newest">Newest</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
        <option value="title">Title</option>
      </select>
    </label>
  );
}
