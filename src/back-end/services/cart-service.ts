import { cartModel } from "@/back-end/models/cart-model";
import { productModel } from "@/back-end/models/product-model";
import {
  addToCartSchema,
  updateCartItemSchema,
  removeCartItemSchema,
} from "@/back-end/lib/validation/cart-validations";
import { formatZodError } from "@/back-end/lib/utils/helper";

export class CartService {
  /**
   * GET cart
   */
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
   */
  async addToCart(userId: string, body: unknown) {
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

      const product = await productModel.findById(productId);
      if (!product) {
        return {
          success: false,
          message: "Product not found",
          status: 404,
        };
      }

      if (product.stock < quantity) {
        return {
          success: false,
          message: `Only ${product.stock} item(s) available in stock`,
          status: 400,
        };
      }

      const cart = await cartModel.getOrCreateCart(userId);
      const item = await cartModel.addItem(cart.id, productId, quantity);

      return {
        success: true,
        data: item,
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
   * PATCH update quantity
   */
  async updateItem(userId: string, body: unknown) {
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

      const product = await productModel.findById(productId);
      if (!product) {
        return {
          success: false,
          message: "Product not found",
          status: 404,
        };
      }

      if (product.stock < quantity) {
        return {
          success: false,
          message: `Only ${product.stock} item(s) available in stock`,
          status: 400,
        };
      }

      const item = await cartModel.updateItem(cart.id, productId, quantity);

      return {
        success: true,
        data: item,
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

  /**
   * DELETE one item
   */
  async removeItem(userId: string, body: unknown) {
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
console.log("Removing item from cart:", cart);
      await cartModel.removeItem(cart.id, validation.data.productId);

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

  /**
   * DELETE clear entire cart
   */
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
