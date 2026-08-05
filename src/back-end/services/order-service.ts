import { randomUUID } from "crypto";
import { orderModel } from "@/back-end/models/order-model";
import { cartModel } from "@/back-end/models/cart-model";
import { productModel } from "@/back-end/models/product-model";
import {
  orderIdParamSchema,
  updateOrderStatusSchema,
} from "@/back-end/lib/validation/order-validations";
import { formatZodError } from "@/back-end/lib/utils/helper";

export class OrderService {
  /**
   * Checkout — create order from current cart
   */
  async checkout(userId: string) {
    try {
      const cart = await cartModel.findByUserId(userId);

      if (!cart || cart.items.length === 0) {
        return {
          success: false,
          message: "Your cart is empty",
          status: 400,
        };
      }

      // Validate stock for every item
      for (const item of cart.items) {
        const product = await productModel.findById(item.productId);

        if (!product) {
          return {
            success: false,
            message: `Product "${item.product.title}" no longer exists`,
            status: 400,
          };
        }

        if (product.stock < item.quantity) {
          return {
            success: false,
            message: `Not enough stock for "${product.title}". Only ${product.stock} left.`,
            status: 400,
          };
        }
      }

      const items = cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.product.price),
        title: item.product.title,
      }));

      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const reference = `ORD-${randomUUID()}`;

      const order = await orderModel.create({
        userId,
        total,
        reference,
        items,
      });

      // Clear cart after successful order creation
      await cartModel.clearCart(cart.id);

      return {
        success: true,
        data: order,
        message: "Order created successfully",
        status: 201,
      };
    } catch (error) {
      console.error("[OrderService.checkout]", error);
      return {
        success: false,
        message: "Failed to create order",
        status: 500,
      };
    }
  }

  /**
   * Get my orders
   */
  async getMyOrders(userId: string) {
    try {
      const orders = await orderModel.findByUserId(userId);

      return {
        success: true,
        data: orders,
        status: 200,
      };
    } catch (error) {
      console.error("[OrderService.getMyOrders]", error);
      return {
        success: false,
        message: "Failed to fetch orders",
        status: 500,
      };
    }
  }

  /**
   * Get order by ID (owner only)
   */
  async getById(id: string, userId: string) {
    try {
      const validation = orderIdParamSchema.safeParse({ id });
      if (!validation.success) {
        return {
          success: false,
          message: formatZodError(validation.error),
          status: 400,
        };
      }

      const order = await orderModel.findById(validation.data.id);

      if (!order) {
        return {
          success: false,
          message: "Order not found",
          status: 404,
        };
      }

      if (order.userId !== userId) {
        return {
          success: false,
          message: "You are not authorized to view this order",
          status: 403,
        };
      }

      return {
        success: true,
        data: order,
        status: 200,
      };
    } catch (error) {
      console.error("[OrderService.getById]", error);
      return {
        success: false,
        message: "Failed to fetch order",
        status: 500,
      };
    }
  }

  /**
   * Update order status (for payment webhook / admin later)
   */
  async updateStatus(id: string, body: unknown) {
    try {
      const idValidation = orderIdParamSchema.safeParse({ id });
      if (!idValidation.success) {
        return {
          success: false,
          message: formatZodError(idValidation.error),
          status: 400,
        };
      }

      const bodyValidation = updateOrderStatusSchema.safeParse(body);
      if (!bodyValidation.success) {
        return {
          success: false,
          message: formatZodError(bodyValidation.error),
          status: 400,
        };
      }

      const order = await orderModel.findById(idValidation.data.id);
      if (!order) {
        return {
          success: false,
          message: "Order not found",
          status: 404,
        };
      }

      const updated = await orderModel.updateStatus(
        idValidation.data.id,
        bodyValidation.data.status
      );

      return {
        success: true,
        data: updated,
        message: "Order status updated",
        status: 200,
      };
    } catch (error) {
      console.error("[OrderService.updateStatus]", error);
      return {
        success: false,
        message: "Failed to update order status",
        status: 500,
      };
    }
  }
}

export const orderService = new OrderService();
