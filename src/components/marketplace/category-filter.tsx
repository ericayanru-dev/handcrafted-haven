import styles from "./marketplace.module.css";

type CategoryFilterProps = {
  value: string;
  onChange: (value: string) => void;
  options: string[];
};

export function CategoryFilter({ value, onChange, options }: CategoryFilterProps) {
  return (
    <label className={styles.filterField} htmlFor="marketplace-category">
      <span className={styles.filterLabel}>Category</span>
      <select
        className={styles.select}
        id="marketplace-category"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">All categories</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
