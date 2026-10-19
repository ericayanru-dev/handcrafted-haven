"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Container } from "@/components/ui";
import { Loading } from "@/components/state/loading";
import {
  formatCurrency,
  loadOrderById,
  paymentLabel,
  statusLabel,
  type OrderRecord,
} from "@/components/orders";
import styles from "@/components/payment/payment.module.css";

type InitPaymentResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  data?: {
    provider?: "PAYSTACK" | "PAYPAL" | "COD";
    paymentId?: string;
    providerRef?: string;
    orderId?: string;
    authorizationUrl?: string;
    accessCode?: string;
    approveUrl?: string;
    paypalOrderId?: string;
    next?: string;
  };
};

function getStatusTone(status?: OrderRecord["status"]) {
  if (status === "PAID" || status === "DELIVERED" || status === "COMPLETED") {
    return styles.statusPaid;
  }
  if (status === "FAILED") return styles.statusFailed;
  if (status === "CANCELLED") return styles.statusCancelled;
  if (status === "PROCESSING") return styles.statusProcessing;
  return styles.statusPending;
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const paymentMethodParam = searchParams.get("paymentMethod") as
    OrderRecord["paymentMethod"] | null;

  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
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
        if (!isMounted) return;

        if (!result.order) {
          setError("Order not found.");
          return;
        }

        setOrder(result.order);
      } catch {
        if (isMounted) setError("Could not load payment details right now.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const statusToneClass = useMemo(() => getStatusTone(order?.status), [order?.status]);
  const paymentMethod = paymentMethodParam ?? order?.paymentMethod ?? "CARD";

  async function handleStartPayment() {
    if (!order) return;

    // Already paid
    if (order.status === "PAID" || order.status === "COMPLETED") {
      router.push(
        `/payment/success?orderId=${encodeURIComponent(order.id)}&paymentMethod=${encodeURIComponent(
          paymentMethod,
        )}`,
      );
      return;
    }

    setIsStarting(true);
    setError("");
    setStatusMessage("");

    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          orderId: order.id,
          method: paymentMethod, // CARD | PAYPAL | CASH_ON_DELIVERY
        }),
      });

      const result = (await response.json()) as InitPaymentResponse;

      if (!response.ok || !result.success || !result.data) {
        setError(result.message ?? result.error ?? "Could not start payment.");
        return;
      }

      // COD → confirmation
      if (result.data.provider === "COD" || paymentMethod === "CASH_ON_DELIVERY") {
        router.push(
          `/payment/success?orderId=${encodeURIComponent(order.id)}&paymentMethod=CASH_ON_DELIVERY`,
        );
        return;
      }

      // Card → Paystack
      if (result.data.authorizationUrl) {
        setStatusMessage("Redirecting to secure card payment...");
        window.location.href = result.data.authorizationUrl;
        return;
      }

      // PayPal
      if (result.data.approveUrl) {
        // keep ids for return page if needed
        sessionStorage.setItem(
          "paypalCheckout",
          JSON.stringify({
            orderId: order.id,
            paypalOrderId: result.data.paypalOrderId,
            paymentId: result.data.paymentId,
          }),
        );
        setStatusMessage("Redirecting to PayPal...");
        window.location.href = result.data.approveUrl;
        return;
      }

      setError("Payment provider did not return a checkout URL.");
    } catch {
      setError("Could not start payment right now. Please try again.");
    } finally {
      setIsStarting(false);
    }
  }

  if (isLoading) {
    return <Loading message="Loading payment details..." title="Payment" />;
  }

  if (error && !order) {
    return (
      <main className={styles.page}>
        <Container size="narrow">
          <Card className={styles.statusCard}>
            <div>
              <p className={styles.eyebrow}>Payment</p>
              <h1 className={styles.statusTitle}>We couldn&apos;t load the payment page.</h1>
            </div>
            <p className={styles.error}>{error}</p>
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

  if (!order) return null;

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
              Confirm your order total, then continue to the selected payment method.
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

              <span className={`${styles.statusPill} ${statusToneClass}`}>
                {statusLabel(order.status)}
              </span>

              <dl className={styles.metaList}>
                <div className={styles.metaRow}>
                  <dt>Payment method</dt>
                  <dd>{paymentLabel(paymentMethod)}</dd>
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
                <Button disabled={isStarting} onClick={handleStartPayment}>
                  {isStarting
                    ? "Starting payment..."
                    : paymentMethod === "CASH_ON_DELIVERY"
                      ? "Confirm cash on delivery"
                      : paymentMethod === "PAYPAL"
                        ? "Pay with PayPal"
                        : "Pay with card"}
                </Button>
                <Button href="/checkout" variant="secondary">
                  Back to checkout
                </Button>
              </div>

              <p className={styles.statusText}>
                Card payments use Paystack. PayPal opens PayPal checkout. Cash on delivery confirms
                the order without online payment.
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
