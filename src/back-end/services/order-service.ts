import { orderModel } from "@/back-end/models/order-model";
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
      const result = await orderModel.checkoutFromCart(userId);

      if (!result.success) {
        return {
          success: false,
          message: result.message,
          status: 400,
        };
      }

      return {
        success: true,
        data: result.order,
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
   * Update order status (owner-restricted for now)
   */
  async updateStatus(id: string, userId: string, body: unknown) {
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

      if (order.userId !== userId) {
        return {
          success: false,
          message: "You are not authorized to update this order",
          status: 403,
        };
      }

      // Customer can only cancel pending orders for now
      const allowedForCustomer = ["CANCELLED"];
      if (!allowedForCustomer.includes(bodyValidation.data.status)) {
        return {
          success: false,
          message: "You are not allowed to set this status",
          status: 403,
        };
      }

      if (order.status !== "PENDING" && bodyValidation.data.status === "CANCELLED") {
        return {
          success: false,
          message: "Only pending orders can be cancelled",
          status: 400,
        };
      }

      const updated = await orderModel.updateStatus(
        idValidation.data.id,
        bodyValidation.data.status,
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
