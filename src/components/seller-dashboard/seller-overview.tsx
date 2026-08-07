import { Card } from "@/components/ui";
import styles from "./seller-dashboard.module.css";

type SellerOverviewProps = {
  storeName: string;
  ownerName: string;
  location: string;
  bio: string;
  rating: string;
  yearsSelling: number;
  productCount: number;
  totalStock: number;
};

export function SellerOverview({
  storeName,
  ownerName,
  location,
  bio,
  rating,
  yearsSelling,
  productCount,
  totalStock,
}: SellerOverviewProps) {
  return (
    <Card className={styles.overviewCard}>
      <div className={styles.overviewTop}>
        <div>
          <p className={styles.sectionEyebrow}>Seller overview</p>
          <h2 className={styles.sectionTitle}>{storeName}</h2>
          <p className={styles.sectionText}>Owner: {ownerName}</p>
        </div>

        <div className={styles.badges}>
          <span className={styles.badge}>Rating: {rating}</span>
          <span className={styles.badge}>{yearsSelling} year(s) selling</span>
        </div>
      </div>

      <p className={styles.sectionText}>{bio}</p>

      <div className={styles.overviewMetrics}>
        <div className={styles.metricTile}>
          <p className={styles.metricLabel}>Location</p>
          <p className={styles.metricValueSmall}>{location}</p>
        </div>
        <div className={styles.metricTile}>
          <p className={styles.metricLabel}>Listed products</p>
          <p className={styles.metricValueSmall}>{productCount}</p>
        </div>
        <div className={styles.metricTile}>
          <p className={styles.metricLabel}>Units in stock</p>
          <p className={styles.metricValueSmall}>{totalStock}</p>
        </div>
      </div>
    </Card>
  );
}
