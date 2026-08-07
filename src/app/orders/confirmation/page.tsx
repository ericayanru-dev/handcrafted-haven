"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loadOrderById, formatCurrency, formatDate, orderNumberFromId, paymentLabel, statusLabel, type OrderRecord } from "@/components/orders";
import { Loading } from "@/components/state/loading";
import { Button, Card, Container } from "@/components/ui";
import styles from "@/components/orders/orders.module.css";

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!orderId) {
        setError("Order reference is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const result = await loadOrderById(orderId);

        if (!isMounted) {
          return;
        }

        if (!result.order) {
          setError("Order not found.");
          return;
        }

        setOrder(result.order);
      } catch {
        if (isMounted) {
          setError("Could not load order confirmation right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (isLoading) {
    return <Loading message="Loading confirmation..." title="Order confirmation" />;
  }

  if (error || !order) {
    return (
      <main className={styles.page}>
        <Container size="narrow">
          <Card className={styles.status}>
            <p>{error || "Could not load order confirmation."}</p>
            <div className={styles.actions}>
              <Button href="/orders">Go to order history</Button>
              <Button href="/marketplace" variant="secondary">
                Continue shopping
              </Button>
            </div>
          </Card>
        </Container>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Container size="narrow">
        <section className={styles.section}>
          <Card className={styles.confirmationCard}>
            <p className={styles.eyebrow}>Order confirmed</p>
            <h1 className={styles.title}>Thanks, your order has been placed.</h1>
            <p className={styles.success}>
              Your order number is {orderNumberFromId(order.id)}. A confirmation email can be added once backend messaging is connected.
            </p>

            <dl className={styles.metaList}>
              <div className={styles.metaRow}>
                <dt>Status</dt>
                <dd>{statusLabel(order.status)}</dd>
              </div>
              <div className={styles.metaRow}>
                <dt>Placed</dt>
                <dd>{formatDate(order.createdAt)}</dd>
              </div>
              <div className={styles.metaRow}>
                <dt>Payment</dt>
                <dd>{paymentLabel(order.paymentMethod)}</dd>
              </div>
              <div className={styles.metaRow}>
                <dt>Total</dt>
                <dd>{formatCurrency(order.total)}</dd>
              </div>
            </dl>

            <div className={styles.stack}>
              {order.items.map((item) => (
                <div className={styles.lineItem} key={item.productId}>
                  <span>
                    {item.title} x {item.quantity}
                  </span>
                  <strong>{formatCurrency(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>

            <div className={styles.actions}>
              <Button href={`/orders/${order.id}`}>View order details</Button>
              <Button href="/orders" variant="secondary">
                View order history
              </Button>
              <Button href="/marketplace" variant="ghost">
                Continue shopping
              </Button>
            </div>
          </Card>
        </section>
      </Container>
    </main>
  );
}
