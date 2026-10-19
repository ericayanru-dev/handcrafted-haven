import { randomUUID } from "crypto";
import { prisma } from "@/back-end/database/db";
import type { UpdateOrderStatusInput } from "@/back-end/types/order-types";

type CheckoutSuccess = {
  success: true;
  order: any;
};

type CheckoutFailure = {
  success: false;
  code: "EMPTY_CART" | "INSUFFICIENT_STOCK" | "MISSING_PRODUCT";
  message: string;
};

export class OrderModel {
  /**
   * Atomic checkout:
   * lock cart + items + products → validate stock → create order → clear cart
   */
  async checkoutFromCart(userId: string): Promise<CheckoutSuccess | CheckoutFailure> {
    return prisma.$transaction(async (tx) => {
      // 1. Lock cart
      const carts = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM carts
      WHERE "userId" = ${userId}
      FOR UPDATE
    `;

      const cart = carts[0];
      if (!cart) {
        return {
          success: false as const,
          code: "EMPTY_CART" as const,
          message: "Your cart is empty",
        };
      }

      // 2. Load cart items (no join yet — so missing products are visible)
      const rawItems = await tx.$queryRaw<Array<{ productId: string; quantity: number }>>`
      SELECT "productId", quantity
      FROM cart_items
      WHERE "cartId" = ${cart.id}
      FOR UPDATE
    `;

      if (rawItems.length === 0) {
        return {
          success: false as const,
          code: "EMPTY_CART" as const,
          message: "Your cart is empty",
        };
      }

      const orderItems: Array<{
        productId: string;
        quantity: number;
        price: number;
        title: string;
      }> = [];

      // 3. Lock each product, validate existence + stock, decrement stock
      for (const item of rawItems) {
        const products = await tx.$queryRaw<
          Array<{
            id: string;
            title: string;
            price: any;
            stock: number;
          }>
        >`
        SELECT id, title, price, stock
        FROM products
        WHERE id = ${item.productId}
        FOR UPDATE
      `;

        const product = products[0];

        // Missing / deleted product
        if (!product) {
          return {
            success: false as const,
            code: "MISSING_PRODUCT" as const,
            message: "One or more products in your cart no longer exist",
          };
        }

        if (product.stock < item.quantity) {
          return {
            success: false as const,
            code: "INSUFFICIENT_STOCK" as const,
            message: `Not enough stock for "${product.title}". Only ${product.stock} left.`,
          };
        }

        // Atomic stock decrement
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: Number(product.price),
          title: product.title,
        });
      }

      const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const reference = `ORD-${randomUUID()}`;

      // 4. Create order
      const order = await tx.order.create({
        data: {
          userId,
          total,
          reference,
          status: "PENDING",
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });

      // 5. Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return {
        success: true as const,
        order,
      };
    });
  }

  async findByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                imageUrl: true,
                price: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findByReference(reference: string) {
    return prisma.order.findUnique({
      where: { reference },
      include: {
        items: true,
      },
    });
  }

  async updateStatus(id: string, status: UpdateOrderStatusInput["status"]) {
    return prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
      },
    });
  }
}

export const orderModel = new OrderModel();
