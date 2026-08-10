"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Card, Container } from "@/components/ui";
import { Loading } from "@/components/state/loading";
import {
  formatCurrency,
  loadOrderById,
  paymentLabel,
  statusLabel,
  type OrderRecord,
  orderNumberFromId,
} from "@/components/orders";
import styles from "@/components/payment/payment.module.css";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const paymentMethodParam = searchParams.get("paymentMethod") as
    OrderRecord["paymentMethod"] | null;

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
          setError("Could not load payment success details right now.");
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
    return <Loading message="Loading payment confirmation..." title="Payment success" />;
  }

  if (error || !order) {
    return (
      <main className={styles.page}>
        <Container size="narrow">
          <Card className={styles.statusCard}>
            <div>
              <p className={styles.eyebrow}>Payment success</p>
              <h1 className={styles.statusTitle}>We couldn't load the success page.</h1>
            </div>
            <p className={styles.error}>{error || "Please try again."}</p>
            <div className={styles.actions}>
              <Button href="/orders">Order history</Button>
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
          <Card className={styles.successCard}>
            <p className={styles.eyebrow}>Payment complete</p>
            <h1 className={styles.title}>Your payment was successful.</h1>
            <p className={styles.success}>
              Order {orderNumberFromId(order.id)} is now marked as paid and ready for the next step.
            </p>

            <dl className={styles.metaList}>
              <div className={styles.metaRow}>
                <dt>Status</dt>
                <dd>{statusLabel(order.status)}</dd>
              </div>
              <div className={styles.metaRow}>
                <dt>Payment</dt>
                <dd>{paymentLabel(paymentMethodParam ?? order.paymentMethod)}</dd>
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
