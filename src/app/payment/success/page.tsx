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

type VerifyResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  data?: {
    order?: { id?: string; status?: string };
    cartRestored?: boolean;
  };
};

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();

  // Paystack returns ?reference=...
  const reference = searchParams.get("reference");
  // Your app may also pass orderId/paymentMethod
  const orderIdParam = searchParams.get("orderId");
  const paymentMethodParam = searchParams.get("paymentMethod") as
    OrderRecord["paymentMethod"] | null;

  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function run() {
      setIsLoading(true);
      setError("");
      setInfo("");

      try {
        let resolvedOrderId = orderIdParam;

        // 1) Paystack verify
        if (reference) {
          const res = await fetch(
            `/api/payments/verify/paystack?reference=${encodeURIComponent(reference)}`,
          );
          const result = (await res.json()) as VerifyResponse;

          if (!res.ok || !result.success) {
            if (!isMounted) return;
            setError(result.message ?? result.error ?? "Payment verification failed.");
            if (result.data?.cartRestored) {
              setInfo("Your cart items were restored. You can try checkout again.");
            }
            setIsLoading(false);
            return;
          }

          resolvedOrderId = result.data?.order?.id ?? orderIdParam;
        }

        // 2) PayPal verify (if returned from PayPal with token/order ids)
        const paypalStored =
          typeof window !== "undefined" ? sessionStorage.getItem("paypalCheckout") : null;

        if (!reference && paypalStored) {
          const parsed = JSON.parse(paypalStored) as {
            orderId?: string;
            paypalOrderId?: string;
          };

          if (parsed.orderId && parsed.paypalOrderId) {
            const res = await fetch("/api/payments/verify/paypal", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: parsed.orderId,
                paypalOrderId: parsed.paypalOrderId,
              }),
            });
            const result = (await res.json()) as VerifyResponse;

            sessionStorage.removeItem("paypalCheckout");

            if (!res.ok || !result.success) {
              if (!isMounted) return;
              setError(result.message ?? result.error ?? "PayPal verification failed.");
              if (result.data?.cartRestored) {
                setInfo("Your cart items were restored. You can try checkout again.");
              }
              setIsLoading(false);
              return;
            }

            resolvedOrderId = result.data?.order?.id ?? parsed.orderId;
          }
        }

        // 3) COD / already verified → just load order
        if (!resolvedOrderId) {
          if (!isMounted) return;
          setError("Order reference is missing.");
          setIsLoading(false);
          return;
        }

        const loaded = await loadOrderById(resolvedOrderId);
        if (!isMounted) return;

        if (!loaded.order) {
          setError("Order not found.");
          return;
        }

        setOrder(loaded.order);
      } catch {
        if (isMounted) {
          setError("Could not load payment confirmation right now.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void run();

    return () => {
      isMounted = false;
    };
  }, [reference, orderIdParam]);

  if (isLoading) {
    return <Loading message="Confirming payment..." title="Payment" />;
  }

  if (error || !order) {
    return (
      <main className={styles.page}>
        <Container size="narrow">
          <Card className={styles.statusCard}>
            <div>
              <p className={styles.eyebrow}>Payment</p>
              <h1 className={styles.statusTitle}>Payment could not be confirmed.</h1>
            </div>
            <p className={styles.error}>{error || "Please try again."}</p>
            {info ? <p className={styles.success}>{info}</p> : null}
            <div className={styles.actions}>
              <Button href="/cart">Back to cart</Button>
              <Button href="/orders" variant="secondary">
                Order history
              </Button>
              <Button href="/marketplace" variant="ghost">
                Continue shopping
              </Button>
            </div>
          </Card>
        </Container>
      </main>
    );
  }

  const isPaid =
    order.status === "PAID" ||
    order.status === "COMPLETED" ||
    order.status === "PROCESSING" ||
    paymentMethodParam === "CASH_ON_DELIVERY";

  return (
    <main className={styles.page}>
      <Container size="narrow">
        <section className={styles.section}>
          <Card className={styles.successCard}>
            <p className={styles.eyebrow}>{isPaid ? "Payment complete" : "Order update"}</p>
            <h1 className={styles.title}>
              {paymentMethodParam === "CASH_ON_DELIVERY"
                ? "Cash on delivery confirmed."
                : isPaid
                  ? "Your payment was successful."
                  : "Your order status was updated."}
            </h1>
            <p className={styles.success}>
              Order {orderNumberFromId(order.id)} — {statusLabel(order.status)}
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
