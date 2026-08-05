import { prisma } from "@/back-end/database/db";
import type { UpdateOrderStatusInput } from "@/back-end/types/order-types"; // adjust path if needed

export class OrderModel {
  /**
   * Create order with items
   */
  async create(data: {
    userId: string;
    total: number;
    reference: string;
    items: {
      productId: string;
      quantity: number;
      price: number;
      title: string;
    }[];
  }) {
    return prisma.order.create({
      data: {
        userId: data.userId,
        total: data.total,
        reference: data.reference,
        status: "PENDING",
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            title: item.title,
          })),
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
  }

  /**
   * Get all orders for a user
   */
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

  /**
   * Get order by ID
   */
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

  /**
   * Get order by payment reference
   */
  async findByReference(reference: string) {
    return prisma.order.findUnique({
      where: { reference },
      include: {
        items: true,
      },
    });
  }

  /**
   * Update order status
   */
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
