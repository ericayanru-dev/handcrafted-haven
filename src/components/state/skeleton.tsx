import { Card, Container } from "@/components/ui";
import styles from "./state.module.css";

type SkeletonLine = {
  width?: string;
  height?: string;
};

type SkeletonLoaderProps = {
  title?: string;
  lines?: SkeletonLine[];
  useCard?: boolean;
};

const defaultLines: SkeletonLine[] = [
  { width: "35%", height: "1.1rem" },
  { width: "100%", height: "1rem" },
  { width: "82%", height: "1rem" },
  { width: "58%", height: "1rem" },
];

export function SkeletonLoader({ title = "Loading preview", lines = defaultLines, useCard = true }: SkeletonLoaderProps) {
  const content = (
    <div className={styles.skeletonStack} aria-hidden="true">
      <p className={styles.emptyEyebrow}>{title}</p>
      <div className={styles.skeletonRow}>
        {lines.map((line, index) => (
          <div
            className={styles.skeletonBlock}
            key={`${line.width ?? "line"}-${index}`}
            style={{ height: line.height ?? "1rem", width: line.width ?? "100%" }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <Container className={styles.frame} size="narrow">
      <div className={styles.shell}>
        {useCard ? <Card className={styles.skeletonCard}>{content}</Card> : content}
      </div>
    </Container>
  );
}