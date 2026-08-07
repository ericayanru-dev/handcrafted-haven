import { prisma } from "@/back-end/database/db";

export class CartModel {
  /**
   * Get or create cart for a user
   */
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

  /**
   * Find cart by user ID
   */
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

  /**
   * Add item or increase quantity if it already exists
   */
  async addItem(cartId: string, productId: string, quantity: number) {
    return prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId, productId },
      },
      update: {
        quantity: { increment: quantity },
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
  }

  /**
   * Update item quantity
   */
  async updateItem(cartId: string, productId: string, quantity: number) {
    return prisma.cartItem.update({
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
  }

  /**
   * Remove one item
   */
  async removeItem(cartId: string, productId: string) {
    return prisma.cartItem.delete({
      where: {
        cartId_productId: { cartId, productId },
      },
    });
  }

  /**
   * Clear all items
   */
  async clearCart(cartId: string) {
    return prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }
}

export const cartModel = new CartModel();
