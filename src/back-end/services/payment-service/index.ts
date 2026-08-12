import { paymentModel } from "@/back-end/models/payment-model";
import { orderModel } from "@/back-end/models/order-model";
import { prisma } from "@/back-end/database/db";
import {
  initializePaymentSchema,
  paystackVerifySchema,
  paypalCaptureSchema,
} from "@/back-end/lib/validation/payment-validations";
import { formatZodError } from "@/back-end/lib/utils/helper";
import { isDatabaseUnavailableError, databaseErrorResponse } from "@/back-end/lib/utils/db-error";
import { initializePaystackTransaction, verifyPaystackTransaction, toSubunit } from "./paystack";
import { initializePayPalTransaction, verifyPayPalTransaction } from "./paypal";
import type { InitializePaymentInput } from "@/back-end/types/payment-types";

export class PaymentService {
  async initialize(userId: string, body: InitializePaymentInput, idempotencyKey: string) {
    try {
      const validation = initializePaymentSchema.safeParse(body);
      if (!validation.success) {
        return {
          success: false,
          message: formatZodError(validation.error),
          status: 400,
        };
      }

      const { orderId, method } = validation.data;

      const existing = await paymentModel.findByIdempotencyKey(userId, idempotencyKey);
      if (existing) {
        return {
          success: true,
          data: {
            paymentId: existing.id,
            providerRef: existing.providerRef,
            method: existing.method,
            status: existing.status,
            replayed: true,
          },
          message: "Payment initialization already processed",
          status: 200,
        };
      }

      const order = await orderModel.findById(orderId);
      if (!order) {
        return { success: false, message: "Order not found", status: 404 };
      }
      if (order.userId !== userId) {
        return { success: false, message: "Unauthorized", status: 403 };
      }
      if (order.status !== "PENDING") {
        return {
          success: false,
          message: `Order with status ${order.status} cannot be paid, create a new order`,
          status: 400,
        };
      }

      const amount = Number(order.total);

      // ---------- COD ----------
      if (method === "CASH_ON_DELIVERY") {
        const payment = await paymentModel.createInitiated({
          orderId,
          userId,
          provider: "COD",
          method,
          amount,
          idempotencyKey,
        });

        return {
          success: true,
          data: {
            provider: "COD",
            paymentId: payment.id,
            providerRef: payment.providerRef,
            orderId,
            next: "confirmation",
          },
          message: "Order placed with cash on delivery",
          status: 200,
        };
      }

      // ---------- CARD / Paystack ----------
      if (method === "CARD") {
        const email = order.user?.email;
        if (!email) {
          return {
            success: false,
            message: "Customer email is required for card payment",
            status: 400,
          };
        }

        const init = await initializePaystackTransaction({
          email,
          amount,
          orderId: order.id,
          userId,
          orderReference: order.reference,
          method: "CARD",
          idempotencyKey,
        });

        if (!init.ok) {
          // no payment row, order stays PENDING
          return {
            success: false,
            message: init.message,
            status: 502,
          };
        }

        return {
          success: true,
          data: {
            provider: "PAYSTACK",
            paymentId: init.payment.id,
            providerRef: init.providerRef,
            orderId,
            authorizationUrl: init.authorizationUrl,
            accessCode: init.accessCode,
          },
          status: 200,
        };
      }

      // ---------- PAYPAL ----------
      if (method === "PAYPAL") {
        const init = await initializePayPalTransaction({
          amount,
          orderId: order.id,
          userId,
          orderReference: order.reference,
          method: "PAYPAL",
          idempotencyKey,
        });

        if (!init.ok) {
          // no payment row, order stays PENDING
          return {
            success: false,
            message: init.message,
            status: 502,
          };
        }

        return {
          success: true,
          data: {
            provider: "PAYPAL",
            paymentId: init.payment.id,
            providerRef: init.providerRef,
            orderId,
            paypalOrderId: init.paypalOrderId,
            approveUrl: init.approveUrl,
          },
          status: 200,
        };
      }

      return {
        success: false,
        message: "Unsupported payment method",
        status: 400,
      };
    } catch (error) {
      console.error("[PaymentService.initialize]", error);
      if (isDatabaseUnavailableError(error)) return databaseErrorResponse();
      return {
        success: false,
        message: "Failed to initialize payment",
        status: 500,
      };
    }
  }

  /**
   * Same role as verifyPayPal — confirm Paystack payment
   */
  async verifyPaystack(userId: string, referenceRaw: unknown) {
    try {
      const validation = paystackVerifySchema.safeParse({
        reference: referenceRaw,
      });
      if (!validation.success) {
        return {
          success: false,
          message: formatZodError(validation.error),
          status: 400,
        };
      }

      const { reference } = validation.data;
      const payment = await paymentModel.findByProviderRef(reference);

      if (!payment) {
        return { success: false, message: "Payment not found", status: 404 };
      }
      if (payment.userId !== userId) {
        return { success: false, message: "Unauthorized", status: 403 };
      }

      if (payment.status === "SUCCESS") {
        return {
          success: true,
          data: { payment, order: payment.order },
          message: "Payment already verified",
          status: 200,
        };
      }

      const verified = await verifyPaystackTransaction(reference);
      if (!verified.ok) {
        return {
          success: false,
          message: verified.message,
          status: 502,
        };
      }

      const tx = verified.tx;
      const expectedAmount = toSubunit(Number(payment.amount));

      const valid =
        tx?.status === "success" &&
        Number(tx.amount) === expectedAmount &&
        tx.reference === payment.providerRef;

      if (!valid) {
        const failed = await paymentModel.markFailedAndRestore({
          orderId: payment.orderId,
          userId,
          paymentId: payment.id,
          rawResponse: verified.data,
        });

        return {
          success: false,
          message: "Payment was not successful",
          data: {
            cartRestored: failed.cartRestored,
            orderStatus: failed.order.status,
          },
          status: 400,
        };
      }

      const result = await paymentModel.markSuccess(payment.id, payment.orderId, verified.data);

      return {
        success: true,
        data: result,
        message: "Payment verified successfully",
        status: 200,
      };
    } catch (error) {
      console.error("[PaymentService.verifyPaystack]", error);
      if (isDatabaseUnavailableError(error)) return databaseErrorResponse();
      return {
        success: false,
        message: "Failed to verify payment",
        status: 500,
      };
    }
  }

  /**
   * Same role as verifyPaystack — confirm PayPal payment
   */
  async verifyPayPal(userId: string, body: unknown) {
    try {
      const validation = paypalCaptureSchema.safeParse(body);
      if (!validation.success) {
        return {
          success: false,
          message: formatZodError(validation.error),
          status: 400,
        };
      }

      const { orderId, paypalOrderId } = validation.data;

      const order = await orderModel.findById(orderId);
      if (!order) {
        return { success: false, message: "Order not found", status: 404 };
      }
      if (order.userId !== userId) {
        return { success: false, message: "Unauthorized", status: 403 };
      }

      const payment = await paymentModel.findByProviderRef(paypalOrderId);
      if (!payment || payment.orderId !== orderId) {
        return { success: false, message: "Payment not found", status: 404 };
      }
      if (payment.userId !== userId) {
        return { success: false, message: "Unauthorized", status: 403 };
      }

      if (payment.status === "SUCCESS") {
        return {
          success: true,
          data: { payment, order },
          message: "Payment already verified",
          status: 200,
        };
      }

      const verified = await verifyPayPalTransaction(paypalOrderId);

      const amountOk =
        verified.capturedAmount !== null &&
        Math.abs((verified.capturedAmount || 0) - Number(payment.amount)) < 0.01;

      const currencyOk = !verified.currency || verified.currency === "USD";

      if (!verified.ok || !amountOk || !currencyOk) {
        const failed = await paymentModel.markFailedAndRestore({
          orderId,
          userId,
          paymentId: payment.id,
          rawResponse: verified.data,
        });

        return {
          success: false,
          message: verified.message || "PayPal payment was not successful",
          data: {
            cartRestored: failed.cartRestored,
            orderStatus: failed.order.status,
          },
          status: 400,
        };
      }

      if (verified.captureId) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            providerPaymentId: verified.captureId,
            type: "CAPTURE",
          },
        });
      }

      const result = await paymentModel.markSuccess(payment.id, orderId, verified.data);

      return {
        success: true,
        data: result,
        message: "PayPal payment verified successfully",
        status: 200,
      };
    } catch (error) {
      console.error("[PaymentService.verifyPayPal]", error);
      if (isDatabaseUnavailableError(error)) return databaseErrorResponse();
      return {
        success: false,
        message: "Failed to verify PayPal payment",
        status: 500,
      };
    }
  }

  async cancelPayment(userId: string, paymentId: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        return { success: false, message: "Payment not found", status: 404 };
      }
      if (payment.userId !== userId) {
        return { success: false, message: "Unauthorized", status: 403 };
      }

      const result = await paymentModel.markFailedAndRestore({
        orderId: payment.orderId,
        userId,
        paymentId: payment.id,
        rawResponse: { reason: "cancelled_by_user" },
      });

      return {
        success: true,
        data: {
          orderStatus: result.order.status,
          cartRestored: result.cartRestored,
        },
        message: result.cartRestored
          ? "Payment cancelled. Stock restored and cart repopulated."
          : "Payment cancelled. Stock restored.",
        status: 200,
      };
    } catch (error) {
      console.error("[PaymentService.cancelPayment]", error);
      if (isDatabaseUnavailableError(error)) return databaseErrorResponse();
      return {
        success: false,
        message: "Failed to cancel payment",
        status: 500,
      };
    }
  }
}

export const paymentService = new PaymentService();
