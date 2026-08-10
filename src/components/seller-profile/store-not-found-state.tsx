import { Button, Card } from "@/components/ui";
import styles from "./seller-profile.module.css";

export function StoreNotFoundState() {
  return (
    <Card className={styles.statusCard}>
      <div>
        <p className={styles.productCategory}>Store not found</p>
        <h2 className={styles.statusTitle}>You don't have a seller profile yet.</h2>
      </div>

      <p className={styles.statusText}>
        You can continue shopping anytime. If you want to start selling,
        create your seller profile first.
      </p>

      <div className={styles.statusActions}>
        <Button href="/dashboard/seller-profile/create">Create seller profile</Button>
        <Button href="/" variant="secondary">
          Continue shopping
        </Button>
      </div>
    </Card>
  );
}