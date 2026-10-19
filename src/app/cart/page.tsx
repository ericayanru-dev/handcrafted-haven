"use client";

import { CartItem, CartSummary, useCart } from "@/components/cart";
import styles from "@/components/cart/cart.module.css";
import { Loading } from "@/components/state/loading";
import { Button, Container } from "@/components/ui";

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    isLoading,
    isMutating,
    message,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  if (isLoading) {
    return <Loading message="Loading cart..." title="Shopping cart" />;
  }

  return (
    <main className={styles.page}>
      <Container>
        <section className={styles.layout}>
          <div className={styles.list}>
            <header className={styles.header}>
              <div>
                <p className={styles.summaryEyebrow}>Shopping cart</p>
                <h1 className={styles.title}>Your selected items</h1>
              </div>
              <p className={styles.lead}>Update quantities, remove items, and review your total before checkout.</p>
            </header>

            {message ? <p className={styles.infoBanner}>{message}</p> : null}

            {items.length === 0 ? (
              <div className={styles.status}>
                <p>Your cart is empty right now.</p>
                <div className={styles.summaryActions}>
                  <Button href="/marketplace">Browse marketplace</Button>
                  <Button href="/orders" variant="secondary">
                    View orders
                  </Button>
                </div>
              </div>
            ) : (
              items.map((item) => (
                <CartItem
                  isBusy={isMutating}
                  item={item}
                  key={item.productId}
                  onDecrease={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                  onIncrease={() => updateQuantity(item.productId, item.quantity + 1)}
                  onRemove={() => removeItem(item.productId)}
                />
              ))
            )}
          </div>

          <CartSummary
            isBusy={isMutating}
            itemCount={itemCount}
            onClearCart={clearCart}
            subtotal={subtotal}
          />
        </section>
      </Container>
    </main>
  );
}
