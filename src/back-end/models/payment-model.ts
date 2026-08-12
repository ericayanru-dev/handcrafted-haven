import { randomUUID } from "crypto";
import { prisma } from "@/back-end/database/db";
import type { PaymentMethod } from "@/back-end/types/payment-types";

const CART_RESTORE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export class PaymentModel {
  async findByIdempotencyKey(userId: string, idempotencyKey: string) {
    return prisma.payment.findUnique({
      where: {
        userId_idempotencyKey: { userId, idempotencyKey },
      },
    });
  }

  async findByProviderRef(providerRef: string) {
    return prisma.payment.findUnique({
      where: { providerRef },
      include: {
        order: {
          include: { items: true },
        },
      },
    });
  }

  async findByOrderId(orderId: string) {
    return prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });
  }

  async createInitiated(data: {
    orderId: string;
    userId: string;
    provider: string;
    method: PaymentMethod;
    amount: number;
    currency?: string;
    idempotencyKey: string;
    providerPaymentId?: string;
  }) {
    return prisma.payment.create({
      data: {
        orderId: data.orderId,
        userId: data.userId,
        provider: data.provider,
        method: data.method,
        providerPaymentId: data.providerPaymentId,
        amount: data.amount,
        currency: data.currency ?? "USD",
        status: "INITIATED",
        idempotencyKey: data.idempotencyKey,
      },
    });
  }

  async markSuccess(paymentId: string, orderId: string, rawResponse?: unknown) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new Error("ORDER_NOT_FOUND");

      if (order.status === "PAID" || order.status === "COMPLETED") {
        const payment = await tx.payment.findUnique({ where: { id: paymentId } });
        return { order, payment, alreadyPaid: true };
      }

      const payment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: "SUCCESS",
          rawResponse: rawResponse as any,
        },
      });

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });

      return { order: updatedOrder, payment, alreadyPaid: false };
    });
  }

  /**
   * Mark payment/order FAILED once:
   * - restore stock
   * - repopulate cart if within 10 minutes of order creation
   */
  async markFailedAndRestore(params: {
    paymentId: string;
    orderId: string;
    userId: string;
    rawResponse?: unknown;
  }) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: params.orderId },
        include: { items: true },
      });

      if (!order) throw new Error("ORDER_NOT_FOUND");

      // Already final — do nothing (prevents double stock restore)
      if (order.status === "FAILED" || order.status === "PAID" || order.status === "COMPLETED") {
        const payment = await tx.payment.findUnique({ where: { id: params.paymentId } });
        return {
          order,
          payment,
          alreadyHandled: true,
          cartRestored: false,
        };
      }

      // Restore stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      const payment = await tx.payment.update({
        where: { id: params.paymentId },
        data: {
          status: "FAILED",
          rawResponse: params.rawResponse as any,
        },
      });

      const updatedOrder = await tx.order.update({
        where: { id: params.orderId },
        data: { status: "FAILED" },
      });

      // Cart restore only within 10 minutes
      const ageMs = Date.now() - new Date(order.createdAt).getTime();
      let cartRestored = false;

      if (ageMs <= CART_RESTORE_WINDOW_MS) {
        let cart = await tx.cart.findUnique({ where: { userId: params.userId } });

        if (!cart) {
          cart = await tx.cart.create({
            data: { userId: params.userId },
          });
        }

        for (const item of order.items) {
          // Skip if product no longer exists
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { id: true },
          });
          if (!product) continue;

          await tx.cartItem.upsert({
            where: {
              cartId_productId: {
                cartId: cart.id,
                productId: item.productId,
              },
            },
            update: {
              quantity: { increment: item.quantity },
            },
            create: {
              cartId: cart.id,
              productId: item.productId,
              quantity: item.quantity,
            },
          });
        }

        cartRestored = true;
      }

      return {
        order: updatedOrder,
        payment,
        alreadyHandled: false,
        cartRestored,
      };
    });
  }
}

export const paymentModel = new PaymentModel();
