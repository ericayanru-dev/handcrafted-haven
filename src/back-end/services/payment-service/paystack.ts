import "dotenv/config";
import { prisma } from "@/back-end/database/db";

export function toSubunit(amount: number) {
  return Math.round(Number(amount) * 100);
}

type InitializePaystackInput = {
  email: string;
  amount: number;
  orderId: string;
  userId: string;
  orderReference: string;
  method: "CARD";
  idempotencyKey: string;
};

export async function initializePaystackTransaction(input: InitializePaystackInput) {
  // Optional local reference hint for Paystack (they may return the same)
  const requestedRef = `PAY-${input.orderId.slice(-8)}-${Date.now()}`;

  // 1. Initialize with Paystack FIRST
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: toSubunit(input.amount),
      reference: requestedRef,
      callback_url: process.env.PAYSTACK_CALLBACK_URL,
      metadata: {
        orderId: input.orderId,
        userId: input.userId,
        orderReference: input.orderReference,
      },
    }),
  });

  const data = await res.json();

  // 2. If provider failed → do NOT create payment
  if (!res.ok || !data?.status || !data?.data?.authorization_url || !data?.data?.reference) {
    return {
      ok: false as const,
      data,
      message: data?.message || "Failed to initialize card payment",
      orderId: input.orderId,
    };
  }

  const providerRef = String(data.data.reference);
  const accessCode = String(data.data.access_code);
  const authorizationUrl = String(data.data.authorization_url);

  // 3. Only now create payment, using provider reference + status
  const payment = await prisma.payment.create({
    data: {
      orderId: input.orderId,
      userId: input.userId,
      provider: "PAYSTACK",
      method: input.method,
      providerRef, // from Paystack
      type: "CHARGE",
      providerPaymentId: accessCode, // useful provider id
      amount: input.amount,
      currency: "USD",
      status: "INITIATED", // our internal status after successful init
      idempotencyKey: input.idempotencyKey,
      rawResponse: data,
    },
  });

  return {
    ok: true as const,
    payment,
    providerRef,
    authorizationUrl,
    accessCode,
    orderId: input.orderId,
  };
}

export async function verifyPaystackTransaction(reference: string) {
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok || !data?.status) {
    return {
      ok: false as const,
      data,
      message: data?.message || "Payment verification failed",
    };
  }

  return {
    ok: true as const,
    data,
    tx: data.data,
  };
}
