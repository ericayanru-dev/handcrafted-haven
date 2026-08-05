import { Card } from "@/components/ui";
import styles from "./seller-dashboard.module.css";

type SummaryCard = {
  label: string;
  value: string;
  note: string;
};

type SalesSummaryCardsProps = {
  cards: SummaryCard[];
};

export function SalesSummaryCards({ cards }: SalesSummaryCardsProps) {
  return (
    <div className={styles.summaryGrid}>
      {cards.map((card) => (
        <Card className={styles.summaryCard} key={card.label}>
          <p className={styles.metricLabel}>{card.label}</p>
          <p className={styles.metricValue}>{card.value}</p>
          <p className={styles.metricNote}>{card.note}</p>
        </Card>
      ))}
    </div>
  );
}
