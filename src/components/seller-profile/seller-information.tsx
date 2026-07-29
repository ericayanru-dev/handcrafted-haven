import { Card } from "@/components/ui";
import styles from "./seller-profile.module.css";

export type SellerProfileSummary = {
  storeName: string;
  ownerName: string;
  rating: number | null;
  bio: string | null;
  location: string;
  productsCount: number;
  yearsSelling: number;
};

type SellerInformationProps = {
  seller: SellerProfileSummary;
};

function formatRating(rating: number | null) {
  return rating === null ? "No rating yet" : rating.toFixed(1);
}

export function SellerInformation({ seller }: SellerInformationProps) {
  return (
    <Card className={styles.infoCard}>
      <div className={styles.topRow}>
        <div>
          <p className={styles.productCategory}>Seller profile</p>
          <h1 className={styles.storeName}>{seller.storeName}</h1>
          <p className={styles.hint}>Run by {seller.ownerName}</p>
        </div>

        <div className={styles.meta}>
          <span className={styles.badge}>{formatRating(seller.rating)} rating</span>
          <span className={styles.badge}>{seller.location}</span>
        </div>
      </div>

      <p className={styles.bio}>{seller.bio ?? "This seller has not added a bio yet."}</p>

      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Products</span>
          <span className={styles.metricValue}>{seller.productsCount}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Years selling</span>
          <span className={styles.metricValue}>{seller.yearsSelling}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Status</span>
          <span className={styles.metricValue}>Active</span>
        </div>
      </div>
    </Card>
  );
}