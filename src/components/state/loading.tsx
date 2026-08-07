import { Card, Container } from "@/components/ui";
import styles from "./state.module.css";

type LoadingProps = {
  title?: string;
  message?: string;
};

export function Loading({
  title = "Loading",
  message = "We are preparing the latest content for you.",
}: LoadingProps) {
  return (
    <Container className={styles.frame} size="narrow">
      <div className={styles.shell}>
        <Card className={styles.loadingCard}>
          <div className={styles.loadingRow}>
            <span aria-hidden="true" className={styles.spinner} />
            <div>
              <p className={styles.loadingTitle}>{title}</p>
              <p className={styles.loadingText}>{message}</p>
            </div>
          </div>
        </Card>
      </div>
    </Container>
  );
}