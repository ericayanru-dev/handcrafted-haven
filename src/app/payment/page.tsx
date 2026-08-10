"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Container } from "@/components/ui";
import { Loading } from "@/components/state/loading";
import { formatCurrency, loadOrderById, paymentLabel, statusLabel, type OrderRecord } from "@/components/orders";
import styles from "@/components/payment/payment.module.css";

type UpdateStatusResponse = {
  success?: boolean;
  data?: OrderRecord;
  message?: string;
  error?: string;
};

function getStatusTone(status?: OrderRecord["status"]) {
  if (status === "PAID" || status === "DELIVERED" || status === "COMPLETED") {
    return styles.statusPaid;
  }

  if (status === "FAILED") {
    return styles.statusFailed;
  }

  if (status === "CANCELLED") {
    return styles.statusCancelled;
  }

  if (status === "PROCESSING") {
    return styles.statusProcessing;
  }

  return styles.statusPending;
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const paymentMethodParam = searchParams.get("paymentMethod") as OrderRecord["paymentMethod"] | null;

  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

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
          setError("Could not load payment details right now.");
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

  const statusToneClass = useMemo(() => getStatusTone(order?.status), [order?.status]);
  const paymentMethod = paymentMethodParam ?? order?.paymentMethod;

  async function handleCompletePayment() {
    if (!order) {
      return;
    }

    setIsCompleting(true);
    setError("");
    setStatusMessage("");

    try {
      const response = await fetch(`/api/orders/update-status/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "PAID" }),
      });

      const result = (await response.json()) as UpdateStatusResponse;

      if (!response.ok || !result.success || !result.data) {
        setError(result.message ?? result.error ?? "Could not complete payment.");
        return;
      }

      const refreshed = await loadOrderById(order.id);
      if (refreshed.order) {
        setOrder({
          ...refreshed.order,
          paymentMethod: refreshed.order.paymentMethod ?? paymentMethod ?? order.paymentMethod,
        });
      }
      setStatusMessage("Payment completed successfully.");
      router.push(
        `/payment/success?orderId=${encodeURIComponent(order.id)}&paymentMethod=${encodeURIComponent(
          paymentMethod ?? order.paymentMethod ?? ""
        )}`
      );
    } catch {
      setError("Could not complete payment right now. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  }

  if (isLoading) {
    return <Loading message="Loading payment details..." title="Payment" />;
  }

  if (error || !order) {
    return (
      <main className={styles.page}>
        <Container size="narrow">
          <Card className={styles.statusCard}>
            <div>
              <p className={styles.eyebrow}>Payment</p>
              <h1 className={styles.statusTitle}>We couldn't load the payment page.</h1>
            </div>
            <p className={styles.error}>{error || "Please try again."}</p>
            <div className={styles.actions}>
              <Button href="/checkout">Back to checkout</Button>
              <Button href="/orders" variant="secondary">
                Order history
              </Button>
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
              <p className={styles.eyebrow}>Payment</p>
              <h1 className={styles.title}>Review and complete payment</h1>
            </div>
            <p className={styles.lead}>
              Confirm your order total, check the payment status, and finish the order when you're ready.
            </p>
          </header>

          {statusMessage ? <p className={styles.success}>{statusMessage}</p> : null}
          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.layout}>
            <Card className={styles.panel}>
              <div>
                <p className={styles.eyebrow}>Order details</p>
                <h2 className={styles.statusTitle}>Payment status: {statusLabel(order.status)}</h2>
              </div>

              <span className={`${styles.statusPill} ${statusToneClass}`}>{statusLabel(order.status)}</span>

              <dl className={styles.metaList}>
                <div className={styles.metaRow}>
                  <dt>Payment method</dt>
                  <dd>{paymentLabel(paymentMethod ?? order.paymentMethod)}</dd>
                </div>
                <div className={styles.metaRow}>
                  <dt>Items</dt>
                  <dd>{order.itemCount}</dd>
                </div>
                <div className={styles.metaRow}>
                  <dt>Order total</dt>
                  <dd>{formatCurrency(order.total)}</dd>
                </div>
              </dl>

              <div className={styles.paymentButtonRow}>
                <Button disabled={isCompleting} onClick={handleCompletePayment}>
                  {isCompleting ? "Completing payment..." : "Complete payment"}
                </Button>
                <Button href="/checkout" variant="secondary">
                  Back to checkout
                </Button>
              </div>

              <p className={styles.statusText}>
                This page uses the current order record and status endpoint so the payment flow can be tested
                before the gateway integration lands.
              </p>
            </Card>

            <Card className={styles.summaryCard}>
              <p className={styles.eyebrow}>Order summary</p>
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

              <div className={styles.actions}>
                <Button href={`/orders/${order.id}`} variant="secondary">
                  View order details
                </Button>
                <Button href="/orders" variant="ghost">
                  Order history
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </Container>
    </main>
  );
}