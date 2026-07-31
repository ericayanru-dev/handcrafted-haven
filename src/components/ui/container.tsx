import type { ComponentPropsWithoutRef } from "react";
import styles from "./ui.module.css";

type ContainerProps = ComponentPropsWithoutRef<"div"> & {
  size?: "wide" | "narrow";
};

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function Container({
  className,
  size = "wide",
  ...props
}: ContainerProps) {
  return (
    <div
      className={joinClasses(
        styles.container,
        size === "narrow" ? styles.containerNarrow : styles.containerWide,
        className,
      )}
      {...props}
    />
  );
}