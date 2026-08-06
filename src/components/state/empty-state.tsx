import type { ReactNode } from "react";
import { Card, Container } from "@/components/ui";
import styles from "./state.module.css";

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  message: string;
  actions?: ReactNode;
  fullWidth?: boolean;
};

export function EmptyState({ eyebrow = "Nothing here yet", title, message, actions, fullWidth = false }: EmptyStateProps) {
  const card = (
    <Card className={`${styles.emptyCard} ${styles.emptyTone}`}>
      <div>
        <p className={styles.emptyEyebrow}>{eyebrow}</p>
        <h1 className={styles.emptyTitle}>{title}</h1>
        <p className={styles.emptyText}>{message}</p>
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </Card>
  );

  if (fullWidth) {
    return <div className={styles.frameFull}>{card}</div>;
  }

  return (
    <Container className={styles.frame} size="narrow">
      <div className={styles.shell}>{card}</div>
    </Container>
  );
}