import { Button, Card, Container } from "@/components/ui";
import styles from "./state.module.css";

type ErrorStateProps = {
  title?: string;
  message: string;
  actionLabel?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Something went wrong",
  message,
  actionLabel = "Try again",
  onRetry,
}: ErrorStateProps) {
  return (
    <Container className={styles.frame} size="narrow">
      <div className={styles.shell}>
        <Card className={`${styles.errorCard} ${styles.errorTone}`}>
          <div>
            <p className={styles.errorTitle}>{title}</p>
            <p className={styles.errorText}>{message}</p>
          </div>
          {onRetry ? (
            <div className={styles.actions}>
              <Button onClick={onRetry}>{actionLabel}</Button>
            </div>
          ) : null}
        </Card>
      </div>
    </Container>
  );
}