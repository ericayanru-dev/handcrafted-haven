import { z } from "zod";

export const initializePaymentSchema = z.object({
  orderId: z.string().cuid("Invalid order ID"),
  method: z.enum(["CARD", "PAYPAL", "CASH_ON_DELIVERY"]),
});

export const paystackVerifySchema = z.object({
  reference: z.string().min(3),
});

export const paypalCaptureSchema = z.object({
  orderId: z.string().cuid("Invalid order ID"),
  paypalOrderId: z.string().min(3),
});
