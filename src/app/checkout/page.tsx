"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart";
import { createOrder, formatCurrency, type PaymentMethod, type ShippingAddress } from "@/components/orders";
import { Button, Card, Container } from "@/components/ui";
import styles from "@/components/orders/orders.module.css";

type FieldErrors = Partial<Record<keyof ShippingAddress, string>>;

const defaultShipping: ShippingAddress = {
  fullName: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

function validateShipping(shipping: ShippingAddress): FieldErrors {
  const errors: FieldErrors = {};

  if (!shipping.fullName.trim()) {
    errors.fullName = "Full name is required.";
  }
  if (!shipping.email.trim() || !shipping.email.includes("@")) {
    errors.email = "A valid email is required.";
  }
  if (!shipping.addressLine1.trim()) {
    errors.addressLine1 = "Street address is required.";
  }
  if (!shipping.city.trim()) {
    errors.city = "City is required.";
  }
  if (!shipping.state.trim()) {
    errors.state = "State or province is required.";
  }
  if (!shipping.postalCode.trim()) {
    errors.postalCode = "Postal code is required.";
  }
  if (!shipping.country.trim()) {
    errors.country = "Country is required.";
  }

  return errors;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, itemCount, subtotal, clearCart, isMutating } = useCart();

  const [shipping, setShipping] = useState<ShippingAddress>(defaultShipping);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tax = useMemo(() => Math.round(subtotal * 0.07 * 100) / 100, [subtotal]);
  const total = useMemo(() => Math.round((subtotal + tax) * 100) / 100, [subtotal, tax]);

  function updateField(field: keyof ShippingAddress, value: string) {
    setShipping((current) => ({ ...current, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    }
    if (formError) {
      setFormError("");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (items.length === 0) {
      setFormError("Your cart is empty.");
      return;
    }

    const validationErrors = validateShipping(shipping);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setFieldErrors({});
    setFormError("");
    setFormMessage("");
    setIsSubmitting(true);

    try {
      const result = await createOrder({
        items,
        paymentMethod,
        shipping,
      });

      await clearCart();

      if (result.message) {
        setFormMessage(result.message);
      }

      router.push(`/orders/confirmation?orderId=${encodeURIComponent(result.order.id)}`);
    } catch {
      setFormError("Could not place your order right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className={styles.page}>
        <Container size="narrow">
          <Card className={styles.status}>
            <p>Your cart is empty. Add products before starting checkout.</p>
            <div className={styles.actions}>
              <Button href="/marketplace">Browse marketplace</Button>
              <Button href="/cart" variant="secondary">
                Back to cart
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
              <p className={styles.eyebrow}>Checkout</p>
              <h1 className={styles.title}>Place your order</h1>
            </div>
            <p className={styles.lead}>Fill in your shipping details and confirm the order summary.</p>
          </header>

          {formMessage ? <p className={styles.info}>{formMessage}</p> : null}

          <div className={styles.layout}>
            <Card className={styles.formCard}>
              <form className={styles.formGrid} noValidate onSubmit={handleSubmit}>
                <label className={styles.fieldGroup} htmlFor="fullName">
                  <span className={styles.fieldLabel}>Full name</span>
                  <input
                    className={styles.field}
                    id="fullName"
                    onChange={(event) => updateField("fullName", event.target.value)}
                    value={shipping.fullName}
                  />
                  {fieldErrors.fullName ? <p className={styles.error}>{fieldErrors.fullName}</p> : null}
                </label>

                <label className={styles.fieldGroup} htmlFor="email">
                  <span className={styles.fieldLabel}>Email</span>
                  <input
                    className={styles.field}
                    id="email"
                    onChange={(event) => updateField("email", event.target.value)}
                    type="email"
                    value={shipping.email}
                  />
                  {fieldErrors.email ? <p className={styles.error}>{fieldErrors.email}</p> : null}
                </label>

                <label className={`${styles.fieldGroup} ${styles.fieldGroupFull}`} htmlFor="addressLine1">
                  <span className={styles.fieldLabel}>Address line 1</span>
                  <input
                    className={styles.field}
                    id="addressLine1"
                    onChange={(event) => updateField("addressLine1", event.target.value)}
                    value={shipping.addressLine1}
                  />
                  {fieldErrors.addressLine1 ? <p className={styles.error}>{fieldErrors.addressLine1}</p> : null}
                </label>

                <label className={`${styles.fieldGroup} ${styles.fieldGroupFull}`} htmlFor="addressLine2">
                  <span className={styles.fieldLabel}>Address line 2 (optional)</span>
                  <input
                    className={styles.field}
                    id="addressLine2"
                    onChange={(event) => updateField("addressLine2", event.target.value)}
                    value={shipping.addressLine2}
                  />
                </label>

                <label className={styles.fieldGroup} htmlFor="city">
                  <span className={styles.fieldLabel}>City</span>
                  <input
                    className={styles.field}
                    id="city"
                    onChange={(event) => updateField("city", event.target.value)}
                    value={shipping.city}
                  />
                  {fieldErrors.city ? <p className={styles.error}>{fieldErrors.city}</p> : null}
                </label>

                <label className={styles.fieldGroup} htmlFor="state">
                  <span className={styles.fieldLabel}>State / Province</span>
                  <input
                    className={styles.field}
                    id="state"
                    onChange={(event) => updateField("state", event.target.value)}
                    value={shipping.state}
                  />
                  {fieldErrors.state ? <p className={styles.error}>{fieldErrors.state}</p> : null}
                </label>

                <label className={styles.fieldGroup} htmlFor="postalCode">
                  <span className={styles.fieldLabel}>Postal code</span>
                  <input
                    className={styles.field}
                    id="postalCode"
                    onChange={(event) => updateField("postalCode", event.target.value)}
                    value={shipping.postalCode}
                  />
                  {fieldErrors.postalCode ? <p className={styles.error}>{fieldErrors.postalCode}</p> : null}
                </label>

                <label className={styles.fieldGroup} htmlFor="country">
                  <span className={styles.fieldLabel}>Country</span>
                  <input
                    className={styles.field}
                    id="country"
                    onChange={(event) => updateField("country", event.target.value)}
                    value={shipping.country}
                  />
                  {fieldErrors.country ? <p className={styles.error}>{fieldErrors.country}</p> : null}
                </label>

                <label className={`${styles.fieldGroup} ${styles.fieldGroupFull}`} htmlFor="paymentMethod">
                  <span className={styles.fieldLabel}>Payment method</span>
                  <select
                    className={styles.select}
                    id="paymentMethod"
                    onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
                    value={paymentMethod}
                  >
                    <option value="CARD">Card</option>
                    <option value="PAYPAL">PayPal</option>
                    <option value="CASH_ON_DELIVERY">Cash on delivery</option>
                  </select>
                </label>

                {formError ? <p className={`${styles.error} ${styles.fieldGroupFull}`}>{formError}</p> : null}

                <div className={`${styles.actions} ${styles.fieldGroupFull}`}>
                  <Button disabled={isSubmitting || isMutating} type="submit">
                    {isSubmitting ? "Placing order..." : "Place order"}
                  </Button>
                  <Button href="/cart" variant="secondary">
                    Back to cart
                  </Button>
                </div>
              </form>
            </Card>

            <Card className={styles.summaryCard}>
              <p className={styles.eyebrow}>Order summary</p>
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
                  <dt>Tax</dt>
                  <dd>{formatCurrency(tax)}</dd>
                </div>
                <div className={styles.summaryRowTotal}>
                  <dt>Total</dt>
                  <dd>{formatCurrency(total)}</dd>
                </div>
              </dl>

              <div className={styles.stack}>
                {items.map((item) => (
                  <div className={styles.lineItem} key={item.productId}>
                    <span>
                      {item.title} x {item.quantity}
                    </span>
                    <strong>{formatCurrency(item.price * item.quantity)}</strong>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </Container>
    </main>
  );
}
