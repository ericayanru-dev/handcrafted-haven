import type { ComponentPropsWithoutRef, ElementType } from "react";
import styles from "./ui.module.css";

type CardProps<TTag extends ElementType = "div"> = {
  as?: TTag;
  padded?: boolean;
} & ComponentPropsWithoutRef<TTag>;

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function Card<TTag extends ElementType = "div">({
  as,
  className,
  padded = true,
  ...props
}: CardProps<TTag>) {
  const Component = as ?? "div";

  return (
    <Component
      className={joinClasses(styles.card, padded && styles.cardPadding, className)}
      {...props}
    />
  );
}