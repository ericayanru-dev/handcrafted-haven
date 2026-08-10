"use client";

import { use, useEffect, useState } from "react";
import { formatCurrency, formatDate, loadOrderById, orderNumberFromId, paymentLabel, statusLabel, type OrderRecord } from "@/components/orders";
import { Loading } from "@/components/state/loading";
import { Button, Card, Container } from "@/components/ui";
import styles from "@/components/orders/orders.module.css";

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const result = await loadOrderById(id);

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
          setError("Could not load order details right now.");
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
  }, [id]);

  if (isLoading) {
    return <Loading message="Loading order details..." title="Order details" />;
  }

  if (error || !order) {
    return (
      <main className={styles.page}>
        <Container size="narrow">
          <Card className={styles.status}>
            <p>{error || "Could not load order details."}</p>
            <div className={styles.actions}>
              <Button href="/orders">Back to order history</Button>
            </div>
          </Card>
        </Container>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Container>
        <section className={styles.section}>
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Order details</p>
              <h1 className={styles.title}>{orderNumberFromId(order.id)}</h1>
            </div>
            <p className={styles.lead}>Track the order summary, shipment status, and line items.</p>
          </header>

          <div className={styles.layout}>
            <Card className={styles.detailsCard}>
              <span className={styles.statusPill}>{statusLabel(order.status)}</span>

              <dl className={styles.metaList}>
                <div className={styles.metaRow}>
                  <dt>Placed on</dt>
                  <dd>{formatDate(order.createdAt)}</dd>
                </div>
                <div className={styles.metaRow}>
                  <dt>Payment</dt>
                  <dd>{paymentLabel(order.paymentMethod)}</dd>
                </div>
                <div className={styles.metaRow}>
                  <dt>Ship to</dt>
                  <dd>{order.shipping?.fullName || "Not provided"}</dd>
                </div>
                <div className={styles.metaRow}>
                  <dt>Address</dt>
                  <dd>
                    {order.shipping
                      ? `${order.shipping.addressLine1}, ${order.shipping.city}, ${order.shipping.state} ${order.shipping.postalCode}`
                      : "Not provided"}
                  </dd>
                </div>
                <div className={styles.metaRow}>
                  <dt>Country</dt>
                  <dd>{order.shipping?.country || "Not provided"}</dd>
                </div>
              </dl>

              <div className={styles.actions}>
                <Button href="/orders" variant="secondary">
                  Back to history
                </Button>
                <Button href="/marketplace" variant="ghost">
                  Continue shopping
                </Button>
              </div>
            </Card>

            <Card className={styles.summaryCard}>
              <p className={styles.eyebrow}>Line items</p>

              <div className={styles.lineItems}>
                {order.items.map((item) => (
                  <div className={styles.lineItem} key={item.productId}>
                    <span>
                      {item.title} x {item.quantity}
                    </span>
                    <strong>{formatCurrency(item.price * item.quantity)}</strong>
                  </div>
                ))}
              </div>

              <dl className={styles.summaryList}>
                <div className={styles.summaryRow}>
                  <dt>Subtotal</dt>
                  <dd>{formatCurrency(order.subtotal)}</dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt>Tax</dt>
                  <dd>{formatCurrency(order.tax)}</dd>
                </div>
                <div className={styles.summaryRowTotal}>
                  <dt>Total</dt>
                  <dd>{formatCurrency(order.total)}</dd>
                </div>
              </dl>
            </Card>
          </div>
        </section>
      </Container>
    </main>
  );
}
