import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().cuid("Invalid product ID"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").default(1),
});

export const updateCartItemSchema = z.object({
  productId: z.string().cuid("Invalid product ID"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

export const removeCartItemSchema = z.object({
  productId: z.string().cuid("Invalid product ID"),
});
