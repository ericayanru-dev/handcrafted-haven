import { prisma } from "@/back-end/database/db";

export async function getPayPalAccessToken() {
  const base =
    process.env.PAYPAL_MODE === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();

  if (!res.ok || !data.access_token) {
    throw new Error("Failed to get PayPal access token");
  }

  return { token: data.access_token as string, base };
}

type InitializePayPalInput = {
  amount: number;
  orderId: string;
  userId: string;
  orderReference: string;
  method: "PAYPAL";
  idempotencyKey: string;
};

/**
 * 1) Create PayPal order with provider
 * 2) Only if successful → create Payment in DB
 */
export async function initializePayPalTransaction(input: InitializePayPalInput) {
  const { token, base } = await getPayPalAccessToken();

  // 1. Provider first
  const res = await fetch(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.orderId,
          custom_id: input.orderReference,
          amount: {
            currency_code: "USD",
            value: Number(input.amount).toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: `${process.env.PAYPAL_RETURN_URL}?orderId=${input.orderId}`,
        cancel_url: `${process.env.PAYPAL_CANCEL_URL}?orderId=${input.orderId}`,
        brand_name: "Handcrafted Haven",
        user_action: "PAY_NOW",
      },
    }),
  });

  const data = await res.json();

  // 2. Provider failed → do NOT create payment
  if (!res.ok || !data?.id) {
    return {
      ok: false as const,
      data,
      message: data?.message || "Failed to initialize PayPal payment",
    };
  }

  const paypalOrderId = String(data.id);
  const approveUrl = (data.links || []).find((l: any) => l.rel === "approve")?.href;

  if (!approveUrl) {
    return {
      ok: false as const,
      data,
      message: "PayPal approval link not found",
    };
  }

  // 3. Only now create payment using provider values
  const payment = await prisma.payment.create({
    data: {
      orderId: input.orderId,
      userId: input.userId,
      provider: "PAYPAL",
      method: input.method,
      providerRef: paypalOrderId, // PayPal order id as provider reference
      type: "CHARGE",
      providerPaymentId: paypalOrderId,
      amount: input.amount,
      currency: "USD",
      status: "INITIATED",
      idempotencyKey: input.idempotencyKey,
      rawResponse: data,
    },
  });

  return {
    ok: true as const,
    payment,
    data,
    paypalOrderId,
    approveUrl: String(approveUrl),
    providerRef: paypalOrderId,
  };
}

/**
 * Confirm/finalize PayPal payment after customer approval
 * (same role as verifyPaystackTransaction)
 */
export async function verifyPayPalTransaction(paypalOrderId: string) {
  const { token, base } = await getPayPalAccessToken();

  const res = await fetch(`${base}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  const capture = data?.purchase_units?.[0]?.payments?.captures?.[0] ?? null;

  const capturedAmount = capture?.amount?.value ? Number(capture.amount.value) : null;

  const currency = capture?.amount?.currency_code ?? null;

  if (!res.ok || data.status !== "COMPLETED") {
    return {
      ok: false as const,
      data,
      message: data?.message || "PayPal payment verification failed",
      capturedAmount,
      currency,
      captureId: capture?.id ? String(capture.id) : null,
    };
  }

  return {
    ok: true as const,
    data,
    tx: data,
    capturedAmount,
    currency,
    captureId: capture?.id ? String(capture.id) : null,
  };
}
