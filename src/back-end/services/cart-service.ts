import { cartModel } from "@/back-end/models/cart-model";
import {
  addToCartSchema,
  updateCartItemSchema,
  removeCartItemSchema,
} from "@/back-end/lib/validation/cart-validations";
import { formatZodError } from "@/back-end/lib/utils/helper";
import type {
  AddToCartInput,
  RemoveCartItemInput,
  UpdateCartItemInput,
} from "@/back-end/types/cart-types";

export class CartService {
  async getCart(userId: string) {
    try {
      const cart = await cartModel.getOrCreateCart(userId);

      const items = cart.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: item.product,
        lineTotal: Number(item.product.price) * item.quantity,
      }));

      const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

      return {
        success: true,
        data: {
          id: cart.id,
          items,
          itemCount,
          subtotal,
        },
        status: 200,
      };
    } catch (error) {
      console.error("[CartService.getCart]", error);
      return {
        success: false,
        message: "Failed to fetch cart",
        status: 500,
      };
    }
  }

  /**
   * POST add to cart
   * Checks: existingQty + requestedQty <= stock
   * Uses transaction to reduce race conditions
   */
  async addToCart(userId: string, body: AddToCartInput) {
    try {
      const validation = addToCartSchema.safeParse(body);
      if (!validation.success) {
        return {
          success: false,
          message: formatZodError(validation.error),
          status: 400,
        };
      }

      const { productId, quantity } = validation.data;
      const cart = await cartModel.getOrCreateCart(userId);

      const result = await cartModel.addItemSafe(cart.id, productId, quantity);

      if ("error" in result) {
        if (result.error === "NOT_FOUND") {
          return {
            success: false,
            message: "Product not found",
            status: 404,
          };
        }

        if (result.error === "INSUFFICIENT_STOCK") {
          const remaining = Math.max(result.available - (result.currentQty ?? 0), 0);
          return {
            success: false,
            message:
              remaining > 0
                ? `Only ${remaining} more item(s) can be added (${result.available} in stock, ${result.currentQty} already in cart)`
                : `Only ${result.available} item(s) available in stock`,
            status: 400,
          };
        }
      }

      return {
        success: true,
        data: result.item,
        message: "Item added to cart",
        status: 201,
      };
    } catch (error) {
      console.error("[CartService.addToCart]", error);
      return {
        success: false,
        message: "Failed to add item to cart",
        status: 500,
      };
    }
  }

  /**
   * PATCH update quantity (absolute value)
   */
  async updateItem(userId: string, body: UpdateCartItemInput) {
    try {
      const validation = updateCartItemSchema.safeParse(body);
      if (!validation.success) {
        return {
          success: false,
          message: formatZodError(validation.error),
          status: 400,
        };
      }

      const { productId, quantity } = validation.data;

      const cart = await cartModel.findByUserId(userId);
      if (!cart) {
        return {
          success: false,
          message: "Cart not found",
          status: 404,
        };
      }

      const result = await cartModel.updateItemSafe(cart.id, productId, quantity);

      if ("error" in result) {
        if (result.error === "NOT_FOUND") {
          return {
            success: false,
            message: "Product not found",
            status: 404,
          };
        }

        if (result.error === "ITEM_NOT_FOUND") {
          return {
            success: false,
            message: "Item not found in cart",
            status: 404,
          };
        }

        if (result.error === "INSUFFICIENT_STOCK") {
          return {
            success: false,
            message: `Only ${result.available} item(s) available in stock`,
            status: 400,
          };
        }
      }

      return {
        success: true,
        data: result.item,
        message: "Cart updated",
        status: 200,
      };
    } catch (error) {
      console.error("[CartService.updateItem]", error);
      return {
        success: false,
        message: "Failed to update cart item",
        status: 500,
      };
    }
  }

  async removeItem(userId: string, body: RemoveCartItemInput) {
    try {
      const validation = removeCartItemSchema.safeParse(body);
      if (!validation.success) {
        return {
          success: false,
          message: formatZodError(validation.error),
          status: 400,
        };
      }

      const cart = await cartModel.findByUserId(userId);
      if (!cart) {
        return {
          success: false,
          message: "Cart not found",
          status: 404,
        };
      }

      const deleted = await cartModel.removeItem(cart.id, validation.data.productId);

      if (deleted.count === 0) {
        return {
          success: false,
          message: "Item not found in cart",
          status: 404,
        };
      }

      return {
        success: true,
        message: "Item removed from cart",
        status: 200,
      };
    } catch (error) {
      console.error("[CartService.removeItem]", error);
      return {
        success: false,
        message: "Failed to remove cart item",
        status: 500,
      };
    }
  }

  async clearCart(userId: string) {
    try {
      const cart = await cartModel.findByUserId(userId);
      if (!cart) {
        return {
          success: false,
          message: "Cart not found",
          status: 404,
        };
      }

      await cartModel.clearCart(cart.id);

      return {
        success: true,
        message: "Cart cleared",
        status: 200,
      };
    } catch (error) {
      console.error("[CartService.clearCart]", error);
      return {
        success: false,
        message: "Failed to clear cart",
        status: 500,
      };
    }
  }
}

export const cartService = new CartService();
