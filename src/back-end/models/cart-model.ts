import { prisma } from "@/back-end/database/db";

export class CartModel {
  async getOrCreateCart(userId: string) {
    const existing = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                stock: true,
                imageUrl: true,
                category: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (existing) return existing;

    return prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                stock: true,
                imageUrl: true,
                category: true,
              },
            },
          },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                stock: true,
                imageUrl: true,
                category: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async findCartItem(cartId: string, productId: string) {
    return prisma.cartItem.findUnique({
      where: {
        cartId_productId: { cartId, productId },
      },
    });
  }

  /**
   * Add/increment item inside a transaction with stock check
   */
  async addItemSafe(cartId: string, productId: string, quantity: number) {
    return prisma.$transaction(async (tx) => {
      // 1. Lock product row
      const lockedProducts = await tx.$queryRaw<
        Array<{
          id: string;
          title: string;
          price: any;
          stock: number;
          imageUrl: string | null;
          category: string;
        }>
      >`
      SELECT id, title, price, stock, "imageUrl", category
      FROM products
      WHERE id = ${productId}
      FOR UPDATE
    `;

      const product = lockedProducts[0];

      if (!product) {
        return { error: "NOT_FOUND" as const };
      }

      // 2. Lock existing cart item row (if any)
      const lockedItems = await tx.$queryRaw<Array<{ id: string; quantity: number }>>`
      SELECT id, quantity
      FROM cart_items
      WHERE "cartId" = ${cartId}
        AND "productId" = ${productId}
      FOR UPDATE
    `;

      const existing = lockedItems[0];
      const currentQty = existing?.quantity ?? 0;
      const nextQty = currentQty + quantity;

      // 3. Stock check against locked values
      if (product.stock < nextQty) {
        return {
          error: "INSUFFICIENT_STOCK" as const,
          available: product.stock,
          currentQty,
        };
      }

      // 4. Write safely
      const item = await tx.cartItem.upsert({
        where: {
          cartId_productId: { cartId, productId },
        },
        update: {
          quantity: nextQty,
        },
        create: {
          cartId,
          productId,
          quantity,
        },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              stock: true,
              imageUrl: true,
              category: true,
            },
          },
        },
      });

      return { item };
    });
  }

  /**
   * Set absolute quantity inside a transaction with stock check
   */
  async updateItemSafe(cartId: string, productId: string, quantity: number) {
    return prisma.$transaction(async (tx) => {
      const lockedProducts = await tx.$queryRaw<
        Array<{
          id: string;
          stock: number;
        }>
      >`
      SELECT id, stock
      FROM products
      WHERE id = ${productId}
      FOR UPDATE
    `;

      const product = lockedProducts[0];

      if (!product) {
        return { error: "NOT_FOUND" as const };
      }

      if (product.stock < quantity) {
        return {
          error: "INSUFFICIENT_STOCK" as const,
          available: product.stock,
        };
      }

      const lockedItems = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM cart_items
      WHERE "cartId" = ${cartId}
        AND "productId" = ${productId}
      FOR UPDATE
    `;

      if (!lockedItems[0]) {
        return { error: "ITEM_NOT_FOUND" as const };
      }

      const item = await tx.cartItem.update({
        where: {
          cartId_productId: { cartId, productId },
        },
        data: { quantity },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              stock: true,
              imageUrl: true,
              category: true,
            },
          },
        },
      });

      return { item };
    });
  }

  async removeItem(cartId: string, productId: string) {
    return prisma.cartItem.deleteMany({
      where: { cartId, productId },
    });
  }

  async clearCart(cartId: string) {
    return prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }
}

export const cartModel = new CartModel();
