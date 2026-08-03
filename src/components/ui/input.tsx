import type { InputHTMLAttributes } from "react";
import styles from "./ui.module.css";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function Input({ label, hint, error, id, className, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const helperId = hint || error ? `${inputId}-helper` : undefined;

  return (
    <label className={styles.fieldGroup} htmlFor={inputId}>
      {label ? (
        <span className={styles.labelRow}>
          <span className={styles.label}>{label}</span>
        </span>
      ) : null}
      <input
        id={inputId}
        aria-describedby={helperId}
        aria-invalid={error ? "true" : undefined}
        className={joinClasses(
          styles.field,
          error && styles.fieldInvalid,
          props.disabled && styles.fieldDisabled,
          className,
        )}
        {...props}
      />
      {error ? (
        <span className={styles.error} id={helperId}>
          {error}
        </span>
      ) : hint ? (
        <span className={styles.hint} id={helperId}>
          {hint}
        </span>
      ) : null}
    </label>
  );
}