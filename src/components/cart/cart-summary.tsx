import { Button, Card } from "@/components/ui";
import styles from "./cart.module.css";

type CartSummaryProps = {
  itemCount: number;
  subtotal: number;
  isBusy?: boolean;
  onClearCart: () => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function CartSummary({ itemCount, subtotal, isBusy, onClearCart }: CartSummaryProps) {
  const estimatedTax = subtotal * 0.07;
  const total = subtotal + estimatedTax;

  return (
    <Card className={styles.summaryCard}>
      <p className={styles.summaryEyebrow}>Order summary</p>
      <h2 className={styles.summaryTitle}>Checkout preview</h2>

      <dl className={styles.summaryList}>
        <div className={styles.summaryRow}>
          <dt>Items</dt>
          <dd>{itemCount}</dd>
        </div>
        <div className={styles.summaryRow}>
          <dt>Subtotal</dt>
          <dd>{formatCurrency(subtotal)}</dd>
        </div>
        <div className={styles.summaryRow}>
          <dt>Est. tax</dt>
          <dd>{formatCurrency(estimatedTax)}</dd>
        </div>
        <div className={styles.summaryRowTotal}>
          <dt>Total</dt>
          <dd>{formatCurrency(total)}</dd>
        </div>
      </dl>

      <div className={styles.summaryActions}>
        {itemCount > 0 ? (
          <Button href="/checkout">Proceed to checkout</Button>
        ) : (
          <Button disabled type="button">
            Proceed to checkout
          </Button>
        )}
        <Button disabled={isBusy || itemCount === 0} onClick={onClearCart} type="button" variant="secondary">
          Clear cart
        </Button>
      </div>
    </Card>
  );
}
