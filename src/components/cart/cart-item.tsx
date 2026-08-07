import { Button, Card } from "@/components/ui";
import styles from "./cart.module.css";
import type { CartItem as CartItemType } from "./cart-types";

type CartItemProps = {
  item: CartItemType;
  isBusy?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function CartItem({ item, isBusy, onDecrease, onIncrease, onRemove }: CartItemProps) {
  const lineTotal = item.price * item.quantity;

  return (
    <Card as="article" className={styles.cartItem}>
      {item.imageUrl ? (
        <img alt={item.title} className={styles.cartImage} src={item.imageUrl} />
      ) : (
        <div aria-hidden="true" className={styles.cartImagePlaceholder} />
      )}

      <div className={styles.cartBody}>
        <p className={styles.cartMeta}>{item.category ?? "General"}</p>
        <h3 className={styles.cartTitle}>{item.title}</h3>
        <p className={styles.cartMeta}>{item.storeName ? `Sold by ${item.storeName}` : "Seller unavailable"}</p>
      </div>

      <div className={styles.cartControls}>
        <p className={styles.cartPrice}>{formatCurrency(item.price)}</p>
        <div className={styles.quantityRow}>
          <Button disabled={isBusy || item.quantity <= 1} onClick={onDecrease} size="sm" variant="secondary">
            -
          </Button>
          <span className={styles.quantityValue}>{item.quantity}</span>
          <Button disabled={isBusy} onClick={onIncrease} size="sm" variant="secondary">
            +
          </Button>
        </div>
        <p className={styles.lineTotal}>Line total: {formatCurrency(lineTotal)}</p>
        <Button disabled={isBusy} onClick={onRemove} size="sm" variant="ghost">
          Remove
        </Button>
      </div>
    </Card>
  );
}
