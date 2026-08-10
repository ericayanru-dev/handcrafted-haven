"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate, loadOrderHistory, orderNumberFromId, statusLabel, type OrderRecord } from "@/components/orders";
import { Loading } from "@/components/state/loading";
import { Button, Card, Container } from "@/components/ui";
import styles from "@/components/orders/orders.module.css";

export default function OrderHistoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const result = await loadOrderHistory();
        if (!isMounted) {
          return;
        }
        setOrders(result.orders);
      } catch {
        if (isMounted) {
          setError("Could not load order history right now.");
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
  }, []);

  if (isLoading) {
    return <Loading message="Loading order history..." title="Order history" />;
  }

  return (
    <main className={styles.page}>
      <Container>
        <section className={styles.section}>
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Orders</p>
              <h1 className={styles.title}>Order history</h1>
            </div>
            <p className={styles.lead}>Review your past orders and open any order for full details.</p>
          </header>

          {error ? <p className={styles.error}>{error}</p> : null}

          {!error && orders.length === 0 ? (
            <div className={styles.status}>
              <p>You have not placed any orders yet.</p>
              <div className={styles.actions}>
                <Button href="/marketplace">Browse marketplace</Button>
              </div>
            </div>
          ) : null}

          {!error && orders.length > 0 ? (
            <div className={styles.orderList}>
              {orders.map((order) => (
                <Card className={styles.orderCard} key={order.id}>
                  <div className={styles.orderTop}>
                    <div>
                      <p className={styles.orderTitle}>{orderNumberFromId(order.id)}</p>
                      <p className={styles.lead}>Placed {formatDate(order.createdAt)}</p>
                    </div>
                    <span className={styles.statusPill}>{statusLabel(order.status)}</span>
                  </div>

                  <dl className={styles.metaList}>
                    <div className={styles.metaRow}>
                      <dt>Items</dt>
                      <dd>{order.itemCount}</dd>
                    </div>
                    <div className={styles.metaRow}>
                      <dt>Total</dt>
                      <dd>{formatCurrency(order.total)}</dd>
                    </div>
                  </dl>

                  <div className={styles.actions}>
                    <Button href={`/orders/${order.id}`}>View details</Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : null}
        </section>
      </Container>
    </main>
  );
}
